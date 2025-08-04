// middlewares/socketAuth.js
const jwt = require('jsonwebtoken');
const onlineUsers = require('../services/onlineUsers'); // A new service to manage users map

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
    next(new Error('Authentication error'));
  }
}