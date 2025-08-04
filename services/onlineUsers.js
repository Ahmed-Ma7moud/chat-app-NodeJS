let onlineUsers = new Map();

exports.set = (userId, socketId) => {
  onlineUsers.set(userId, socketId);
}

exports.delete = (userId) => {
  onlineUsers.delete(userId);
}

exports.getSocketId = (userId) => {
  return onlineUsers.get(userId);
}

exports.isUserOnline = (userId) => {
  return onlineUsers.has(userId);
}
