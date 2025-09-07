// redis.js
const { createClient } = require("redis");

let redisClient;

async function initRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });

    redisClient.on("ready", () => {
      console.log("Redis connection established and ready to use");
    });

    try {
        await redisClient.connect();
        console.log("Redis client connected successfully");

    } catch (error) {
        console.error("Error connecting to Redis:", error);
    }
  }
}

// Getter so other files can use the already-connected client
function getRedis() {
  if (!redisClient) {
    throw new Error("Redis not initialized!");
  }
  return redisClient;
}

module.exports = { initRedis, getRedis };