const { Server } = require('socket.io');
const StudyGroup = require('../models/StudyGroup');
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

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join Group Room
    socket.on('joinGroupRoom', async (groupId) => {
      // In production, verify user is a member here using socket.request.user or similar
      socket.join(`group:${groupId}`);
      logger.debug(`Socket ${socket.id} joined group room: ${groupId}`);
      
      // Emit userOnline to room (dummy data for user since we don't have auth on socket yet)
      // socket.to(`group:${groupId}`).emit('userOnline', { userId: socket.userId, name: socket.userName });
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

    // Typing Indicators
    socket.on('typing', (groupId, threadId) => {
      const room = threadId ? `thread:${threadId}` : `group:${groupId}`;
      socket.to(room).emit('userTyping', { 
        userId: socket.userId, // Assigned by middleware if implemented
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
