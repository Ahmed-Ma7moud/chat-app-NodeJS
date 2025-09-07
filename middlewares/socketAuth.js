// middlewares/socketAuth.js
const jwt = require('jsonwebtoken');
const onlineUsers = require('../services/onlineUsers'); // A new service to manage users map
const {readFileSync} = require('fs');
const script = readFileSync("./token_bucket.lua", "utf8");
const {getRedis} = require('../config/redis');
exports.socketAuth = (socket, next) => {
  const token = socket.handshake.headers.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) 
        return next(new Error('Authentication error'));
      socket.user = user;
      onlineUsers.set(user.id, socket.id);
      next();
    });
  } else {
      return next(new Error('Authentication error no token provided'));
  }
}

exports.socketBucketLimiter = async (key , capacity , refillRate) => {
    try {
      const now = Date.now().toString();
      const result = await getRedis().eval(script, {
        keys: [key],
        arguments: [capacity.toString(), refillRate.toString(), now],
      });

      if (result !== 1) {
        return 0;
      }
      return 1;
    } catch (err) {
      console.error('Rate limiting error:', err);
      socket.emit("err", "Internal server error");
      return -1;
    }
};
