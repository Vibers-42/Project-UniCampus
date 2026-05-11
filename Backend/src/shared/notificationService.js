/**
 * @file notificationService.js — Notification Dispatcher
 *
 * SINGLE RESPONSIBILITY:
 *   Sends in-app notifications and email notifications.
 *   Knows nothing about any specific module's logic.
 *   Modules call this service to notify users — this service handles the HOW.
 *
 * EXPORTS:
 *   sendInAppNotification(userId, type, message, metadata)
 *   sendEmailNotification(to, subject, html)
 *
 * LOOSE COUPLING RULE:
 *   This service does NOT import from any module. Modules import THIS.
 *   If you switch from Nodemailer to SendGrid, or add push notifications,
 *   only this file changes. No module code is affected.
 *
 * USAGE:
 *   const { sendInAppNotification, sendEmailNotification } = require('../shared/notificationService');
 *
 *   // In-app notification (e.g., from events module):
 *   await sendInAppNotification(userId, 'event_reminder', 'Event starts in 1 hour', { eventId });
 *
 *   // Email notification (e.g., OTP delivery):
 *   await sendEmailNotification('user@university.edu', 'Your OTP', '<h1>123456</h1>');
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./utils/logger');

// ──────────────────────────────────────────
// EMAIL TRANSPORT (Nodemailer)
// ──────────────────────────────────────────

/**
 * Lazily create the Nodemailer transporter.
 * Created on first sendEmailNotification call, not at import time.
 * This prevents startup errors if email credentials aren't configured yet.
 */
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
      throw new Error(
        'Email is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env'
      );
    }

    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: Number(env.EMAIL_PORT),
      secure: Number(env.EMAIL_PORT) === 465, // true for port 465, false for others
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Send an email notification.
 *
 * @param {string} to      — Recipient email address
 * @param {string} subject — Email subject line
 * @param {string} html    — Email body as HTML
 * @returns {Promise<Object>} Nodemailer send result
 */
const sendEmailNotification = async (to, subject, html) => {
  try {
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: `"UniCampus" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

// ──────────────────────────────────────────
// IN-APP NOTIFICATIONS
// ──────────────────────────────────────────

/**
 * Send an in-app notification.
 *
 * Persists the notification to the Notification collection and emits
 * via Socket.IO if available.
 *
 * @param {string} recipientId — The user's MongoDB _id to notify
 * @param {string} type     — Notification type (e.g., 'event_reminder', 'teammate_apply')
 * @param {string} title    — Short notification title
 * @param {string} body     — Notification body text
 * @param {Object} [relatedEntity] — { entityType, entityId } for deep-linking
 * @param {Object} [metadata={}] — Additional context
 * @returns {Promise<Object>} The created notification document
 */
const sendInAppNotification = async (recipientId, type, title, body = '', relatedEntity = null, metadata = {}) => {
  try {
    // Lazy-require to avoid circular dependency at module load time
    const notificationsService = require('../modules/notifications/notifications.service');

    const data = {
      recipient: recipientId,
      type,
      title,
      body,
      metadata,
    };

    if (relatedEntity) {
      data.relatedEntity = relatedEntity;
    }

    const notification = await notificationsService.create(data);
    logger.debug(`In-app notification: [${type}] for user ${recipientId} — "${title}"`);

    // Emit via Socket.IO if available
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to(`user:${recipientId}`).emit('notification', notification);
    } catch {
      // Socket not initialized — skip real-time delivery, DB record is enough
    }

    return notification;
  } catch (error) {
    // Never let notification failures crash the calling operation
    logger.error(`Failed to send in-app notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendInAppNotification,
  sendEmailNotification,
};
