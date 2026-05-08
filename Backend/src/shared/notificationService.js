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
 * Currently logs the notification. When the notifications module is built
 * (Part 5+), this function will save to the Notification collection.
 *
 * @param {string} userId   — The user to notify
 * @param {string} type     — Notification type (e.g., 'event_reminder', 'new_match')
 * @param {string} message  — Human-readable notification message
 * @param {Object} [metadata={}] — Additional context (e.g., { eventId, listingId })
 * @returns {Promise<Object>} The notification object
 */
const sendInAppNotification = async (userId, type, message, metadata = {}) => {
  // TODO: When notifications module is fully implemented, replace with:
  //   const notificationsService = require('../modules/notifications/notifications.service');
  //   return notificationsService.create({ userId, type, message, metadata });
  // IMPORTANT: Call the module's SERVICE (public interface), never import the model directly.

  const notification = { userId, type, message, metadata, isRead: false, createdAt: new Date() };
  logger.debug(`In-app notification: [${type}] for user ${userId} — "${message}"`);
  return notification;
};

module.exports = {
  sendInAppNotification,
  sendEmailNotification,
};
