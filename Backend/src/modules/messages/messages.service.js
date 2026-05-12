/**
 * @file messages.service.js — Messages Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   Handles all direct messaging business logic including searching users by roll number,
 *   initiating conversations, and sending messages.
 *
 * SCOPE:
 *   Internal to messages/ module.
 */

const Conversation = require('./conversation.model');
const Message = require('./message.model');
const User = require('../users/users.model');
const AppError = require('../../shared/utils/AppError');
const logger = require('../../shared/utils/logger');

/**
 * Search students by roll number.
 * Returns safe profile fields.
 *
 * @param {string} rollNumber - The roll number to search for
 * @returns {Promise<Array>} List of matched users
 */
const searchUsers = async (rollNumber) => {
  if (!rollNumber) return [];

  // Use regex for partial matching, case-insensitive
  const users = await User.find({
    rollNumber: { $regex: rollNumber, $options: 'i' },
    isActive: true
  })
    .select('fullName rollNumber avatar department yearOfStudy badges role')
    .limit(10); // Limit results for MVP

  return users;
};

/**
 * Get all conversations for a user.
 *
 * @param {string} userId - Current user's ID
 * @returns {Promise<Array>} List of conversations sorted by latest activity
 */
const getConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'fullName avatar rollNumber')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  return conversations;
};

/**
 * Get or create a 1-on-1 conversation between two users.
 *
 * @param {string} userId - The initiator's user ID
 * @param {string} receiverId - The target's user ID
 * @returns {Promise<Object>} The conversation document
 */
const getOrCreateConversation = async (userId, receiverId) => {
  if (userId.toString() === receiverId.toString()) {
    throw new AppError('You cannot start a conversation with yourself', 400);
  }

  // Ensure receiver exists
  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
    throw new AppError('Target user not found', 404);
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [userId, receiverId] }
  });

  // Create new if not found
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, receiverId]
    });
  }

  // Populate participants for frontend
  return await Conversation.findById(conversation._id).populate('participants', 'fullName avatar rollNumber');
};

/**
 * Get messages for a specific conversation.
 * Validates that the requesting user is a participant.
 *
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The requesting user ID
 * @returns {Promise<Array>} List of messages
 */
const getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.some(p => p.toString() === userId.toString())) {
    throw new AppError('You do not have access to this conversation', 403);
  }

  // Mark unread messages as read
  await Message.updateMany(
    { conversationId, receiverId: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return await Message.find({ conversationId }).sort({ createdAt: 1 });
};

/**
 * Send a message in a conversation.
 *
 * @param {string} conversationId - The conversation ID
 * @param {string} senderId - The sender's user ID
 * @param {string} content - The message content
 * @returns {Promise<Object>} The created message
 */
const sendMessage = async (conversationId, senderId, content) => {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  if (!conversation.participants.some(p => p.toString() === senderId.toString())) {
    throw new AppError('You do not have access to this conversation', 403);
  }

  // Determine receiver
  const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());

  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    content
  });

  // Update conversation last message pointer
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  try {
    const { getIO } = require('../../config/socket');
    const io = getIO();
    io.to(`user:${receiverId}`).emit('newMessage', message);
    io.to(`user:${senderId}`).emit('newMessage', message);
  } catch (err) {
    logger.error('Socket error in sendMessage:', err);
  }

  return message;
};

module.exports = {
  searchUsers,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage
};
