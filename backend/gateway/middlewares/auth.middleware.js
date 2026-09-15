import redis from "../../shared/redis/redis.js";
import { verifySignedSessionToken } from "../../shared/session/sessionToken.js";

export const protect = async (req, res, next) => {
  try {
    const sessionId = req?.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 1. Try fetching from Redis first
    const sessionStr = await redis.get(`session:${sessionId}`);
    if (sessionStr) {
      try {
        req.user = JSON.parse(sessionStr);
        return next();
      } catch (e) {
        // fallback
      }
    }

    // 2. Decode signed session token if Redis is offline / cross-process
    const decoded = verifySignedSessionToken(sessionId);
    if (decoded) {
      req.user = decoded;
      return next();
    }

    return res.status(401).json({
      message: "Session Expired",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
