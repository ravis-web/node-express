/* --- Web-Socket : Socket.io --- */

let io = {};

module.exports = {
  init: httpServer => {
    io = require('socket.io')(httpServer); // fx-wrapper
    return io;
  },
  getIO: () => {
    if (!io) throw new Error('socket-init failed!');
    return io;
  }
};
