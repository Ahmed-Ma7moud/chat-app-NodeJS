const {readFileSync} = require('fs');
const script = readFileSync("./fixed_window.lua", "utf8");
const {getRedis} = require('../config/redis');

exports.rateLimiter = ({ key = "api" , limit = 5, window = 10 * 60 }) => {
  return async (req, res, next) => {
    try {
      const redisKey = key + `:${req.ip}`;
      const allowed = await getRedis().eval(script, {
              keys: [redisKey],
              arguments: [limit.toString(), window.toString()],
            });
            
      if (allowed === 1) {
        return next(); 
      } else {
        return res.status(429).json({ message: "Too many requests, try again later." });
      }
    } catch (err) {
      console.error("Rate limit error:", err);
      return next();
    }
  };
}
