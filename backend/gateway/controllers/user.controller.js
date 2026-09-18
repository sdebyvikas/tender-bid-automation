import redis from "../../shared/redis/redis.js";

export const getCurrentUser = async (req, res) => {
  try {
    const sessionId = req?.cookies?.session;
    let user = req.user;

    if (sessionId) {
      const sessionStr = await redis.get(`session:${sessionId}`);
      if (sessionStr) {
        user = JSON.parse(sessionStr);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        _id: user?.userId || user?._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
