const socketIo = require("socket.io");

let io;

module.exports = {
  init: (httpServer, options = {}) => {
    io = socketIo(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingTimeout: 30000,
      pingInterval: 25000,
      ...options,
    });

    // Add error handling
    io.on("connect_error", (err) => {
      console.log(`Connection error: ${err.message}`);
    });

    io.on("connect_timeout", () => {
      console.log("Connection timeout");
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
