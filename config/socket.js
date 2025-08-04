// initialize socket.io server Singleton pattern for only one instance
const { Server } = require('socket.io');

let io;

exports.initIo = (httpServer) => {
  io = new Server(httpServer);
  return io;
}
exports.getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
