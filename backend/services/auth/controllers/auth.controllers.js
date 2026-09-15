import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";
import { app } from "../config/firebase.js";
import { createSignedSessionToken } from "../../../shared/session/sessionToken.js";

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
        picture: demoUser?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        firebase: { sign_in_provider: "custom" }
      };
    } else {
      return res.status(400).json({
        message: "Authentication failed. Firebase token or user credentials required."
      });
    }

    console.log("Logged in user:", decoded.email || decoded.uid);

    let user = await User.findOne({
      firebaseUid: decoded.uid
    });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture,
        provider: decoded.firebase?.sign_in_provider || "google",
      });
    }

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits
    };

    const sessionId = createSignedSessionToken(sessionPayload);

    await redis.set(
      `user-session:${user._id}`,
      sessionId,
      "EX",
      60 * 60 * 24 * 7
    );

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionPayload),
      "EX",
      60 * 60 * 24 * 7
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Auth login error:", error);
    return res.status(401).json({
      message: error.message
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
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
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
        message: "User not found"
      });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits
    };

    const newSessionId = createSignedSessionToken(sessionPayload);

    await redis.set(`user-session:${user._id}`, newSessionId, "EX", 60 * 60 * 24 * 7);
    await redis.set(`session:${newSessionId}`, JSON.stringify(sessionPayload), "EX", 60 * 60 * 24 * 7);

    return res.json({
      success: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const { userId, agent } = req.body;
    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10
    };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const requiredCredits = COST[agent] || 1;
    if (user.credits < requiredCredits) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits."
      });
    }

    user.credits -= requiredCredits;
    await user.save();

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      avatar: user.avatar,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits
    };

    const newSessionId = createSignedSessionToken(sessionPayload);
    await redis.set(`user-session:${user._id}`, newSessionId, "EX", 60 * 60 * 24 * 7);
    await redis.set(`session:${newSessionId}`, JSON.stringify(sessionPayload), "EX", 60 * 60 * 24 * 7);

    return res.json({
      success: true,
      credits: user.credits
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};