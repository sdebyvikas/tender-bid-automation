import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// In-memory fallback store
const memoryStore = new Map();
const memoryExpiries = new Map();

function isExpired(key) {
  const exp = memoryExpiries.get(key);
  if (exp && Date.now() > exp) {
    memoryStore.delete(key);
    memoryExpiries.delete(key);
    return true;
  }
  return false;
}

let redisClient = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // stop reconnect spam if Redis is not running
      }
      return Math.min(times * 100, 2000);
    },
    lazyConnect: false,
    enableOfflineQueue: false
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("✅ Redis Connected");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    // Suppress unhandled error crash when redis is offline
  });
} catch (e) {
  console.warn("⚠️ Redis initialization warning, using in-memory store fallback:", e.message);
}

const fallbackRedis = {
  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        // fallback to memory
      }
    }
    if (isExpired(key)) return null;
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },

  async set(key, value, ...args) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.set(key, value, ...args);
      } catch (err) {
        // fallback to memory
      }
    }
    memoryStore.set(key, String(value));
    if (args.length >= 2 && String(args[0]).toUpperCase() === "EX") {
      const seconds = Number(args[1]);
      if (!isNaN(seconds)) {
        memoryExpiries.set(key, Date.now() + seconds * 1000);
      }
    }
    return "OK";
  },

  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.del(key);
      } catch (err) {
        // fallback to memory
      }
    }
    memoryStore.delete(key);
    memoryExpiries.delete(key);
    return 1;
  },

  async incr(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.incr(key);
      } catch (err) {
        // fallback to memory
      }
    }
    if (isExpired(key)) {
      memoryStore.set(key, "0");
    }
    const current = parseInt(memoryStore.get(key) || "0", 10);
    const next = current + 1;
    memoryStore.set(key, String(next));
    return next;
  },

  async expire(key, seconds) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.expire(key, seconds);
      } catch (err) {
        // fallback to memory
      }
    }
    if (memoryStore.has(key)) {
      memoryExpiries.set(key, Date.now() + Number(seconds) * 1000);
      return 1;
    }
    return 0;
  },

  async ttl(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.ttl(key);
      } catch (err) {
        // fallback to memory
      }
    }
    const exp = memoryExpiries.get(key);
    if (!exp) return -1;
    const diff = Math.ceil((exp - Date.now()) / 1000);
    return diff > 0 ? diff : -2;
  },

  on(event, handler) {
    if (redisClient) {
      redisClient.on(event, handler);
    }
  }
};

export default fallbackRedis;