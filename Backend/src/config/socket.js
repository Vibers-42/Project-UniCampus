const { Server } = require('socket.io');
const logger = require('../shared/utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // ── Socket Authentication Middleware ──
  // Verify Firebase token before allowing connection.
  // Unauthenticated sockets are rejected immediately.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const { verifyToken } = require('./firebase');
      const decoded = await verifyToken(token);

      if (!decoded.email_verified) {
        return next(new Error('Email not verified'));
      }

      // Attach user identity to socket for downstream use
      socket.userId = decoded.uid;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      logger.error(`Socket auth failed: ${err.message}`);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (user: ${socket.userEmail})`);

    // Register error handler on every socket instance
    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
    });

    // Join Group Room
    socket.on('joinGroupRoom', async (groupId) => {
      socket.join(`group:${groupId}`);
      logger.debug(`Socket ${socket.id} joined group room: ${groupId}`);
    });

    // Leave Group Room
    socket.on('leaveGroupRoom', (groupId) => {
      socket.leave(`group:${groupId}`);
      logger.debug(`Socket ${socket.id} left group room: ${groupId}`);
    });

    // Thread Rooms
    socket.on('joinThreadRoom', (threadId) => {
      socket.join(`thread:${threadId}`);
    });

    socket.on('leaveThreadRoom', (threadId) => {
      socket.leave(`thread:${threadId}`);
    });

    // Direct Messaging User Rooms
    socket.on('joinUserRoom', (userId) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined user room: ${userId}`);
    });

    socket.on('leaveUserRoom', (userId) => {
      socket.leave(`user:${userId}`);
    });

    // Typing Indicators
    socket.on('typing', (groupId, threadId) => {
      const room = threadId ? `thread:${threadId}` : `group:${groupId}`;
      socket.to(room).emit('userTyping', { 
        userId: socket.userId,
        name: socket.userName,
        threadId 
      });
    });

    socket.on('stopTyping', (groupId, threadId) => {
      const room = threadId ? `thread:${threadId}` : `group:${groupId}`;
      socket.to(room).emit('userStopTyping', { 
        userId: socket.userId,
        threadId 
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { initSocket, getIO };
