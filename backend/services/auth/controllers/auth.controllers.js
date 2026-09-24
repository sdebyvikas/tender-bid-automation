import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import { app } from "../config/firebase.js";
import { createSignedSessionToken } from "../../../shared/session/sessionToken.js";

const getDefaultCredits = () => {
  const envVal = Number(process.env.DEFAULT_CREDITS);
  return !isNaN(envVal) && envVal > 0 ? envVal : 99999;
};

export const login = async (req, res) => {
  try {
    const { token, demoUser } = req.body;
    let decoded;

    if (token && app) {
      decoded = await getAuth(app).verifyIdToken(token);
    } else if (demoUser || token === "demo-token" || !app) {
      decoded = {
        uid: demoUser?.uid || "bearly_demo_user",
        email: demoUser?.email || "user@bearly.ai",
        name: demoUser?.name || "Bearly Explorer",
        picture:
          demoUser?.picture ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        firebase: { sign_in_provider: "custom" },
      };
    } else {
      return res.status(400).json({
        message:
          "Authentication failed. Firebase token or user credentials required.",
      });
    }

    console.log("Logged in user:", decoded.email || decoded.uid);

    const defaultCredits = getDefaultCredits();

    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        provider: decoded.firebase?.sign_in_provider || "google",
        credits: defaultCredits,
        totalCredits: defaultCredits,
      });
    } else if (!user.credits || user.credits < 1000) {
      user.credits = defaultCredits;
      user.totalCredits = defaultCredits;
      await user.save();
    }

    const sessionPayload = {
      userId: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
    };

    const sessionId = createSignedSessionToken(sessionPayload);

    await redis.set(
      `user-session:${user._id}`,
      sessionId,
      "EX",
      60 * 60 * 24 * 7,
    );

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionPayload),
      "EX",
      60 * 60 * 24 * 7,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth login error:", error);
    return res.status(401).json({
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;
    if (sessionId) {
      await redis.del(`session:${sessionId}`);
    }

    res.clearCookie("session", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { userId, plan, credits } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
    };

    const activeSessionId = await redis.get(`user-session:${user._id}`);
    if (activeSessionId) {
      await redis.set(
        `session:${activeSessionId}`,
        JSON.stringify(sessionPayload),
        "EX",
        60 * 60 * 24 * 7,
      );
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCreditCosts = () => ({
  chat: Number(process.env.CREDIT_COST_CHAT) || 1,
  search: Number(process.env.CREDIT_COST_SEARCH) || 5,
  coding: Number(process.env.CREDIT_COST_CODING) || 10,
  pdf: Number(process.env.CREDIT_COST_PDF) || 10,
  ppt: Number(process.env.CREDIT_COST_PPT) || 10,
  image: Number(process.env.CREDIT_COST_IMAGE) || 10,
  vision: Number(process.env.CREDIT_COST_VISION) || 10,
});

export const getCostsHandler = async (req, res) => {
  return res.json({
    success: true,
    defaultCredits: getDefaultCredits(),
    costs: getCreditCosts(),
  });
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = getCreditCosts();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requiredCredits = COST[agent] !== undefined ? COST[agent] : 1;
    if (
      user.credits === undefined ||
      user.credits === null ||
      user.credits < requiredCredits
    ) {
      const defaultCredits = getDefaultCredits();
      user.credits = defaultCredits;
      user.totalCredits = defaultCredits;
      await user.save();
    }

    user.credits -= requiredCredits;
    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
    };

    const activeSessionId = await redis.get(`user-session:${user._id}`);
    if (activeSessionId) {
      await redis.set(
        `session:${activeSessionId}`,
        JSON.stringify(sessionPayload),
        "EX",
        60 * 60 * 24 * 7,
      );
    }

    return res.json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const setUserCredits = async (req, res) => {
  try {
    const { userId, email, credits } = req.body;
    const amount = Number(credits) || getDefaultCredits();

    let query = {};
    if (userId) query._id = userId;
    else if (email) query.email = email;

    let user;
    if (Object.keys(query).length > 0) {
      user = await User.findOne(query);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.credits = amount;
      user.totalCredits = amount;
      await user.save();
    } else {
      // Update all users if no specific user/email provided
      await User.updateMany(
        {},
        { $set: { credits: amount, totalCredits: amount } },
      );
    }

    return res.json({
      success: true,
      message: `Credits updated to ${amount} successfully`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
