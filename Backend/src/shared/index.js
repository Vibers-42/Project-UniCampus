/**
 * @file shared/index.js — Barrel Export for Shared Infrastructure
 *
 * SINGLE RESPONSIBILITY:
 *   Central re-export of all shared utilities and services.
 *   Modules CAN import from here for convenience, or require
 *   individual files directly — both patterns are valid.
 *
 * WHY THIS EXISTS:
 *   Discoverability. A new developer can read this one file to
 *   understand everything the shared layer offers, without
 *   browsing 10+ files across subdirectories.
 *
 * USAGE (either style works):
 *   // Style A — barrel import:
 *   const { AppError, logger, sendSuccess } = require('../../shared');
 *
 *   // Style B — direct import (preferred for clarity):
 *   const AppError = require('../../shared/utils/AppError');
 *   const logger = require('../../shared/utils/logger');
 *
 * CONTENTS:
 *   ── Utils ──────────────────────────────────────
 *   AppError              — Lightweight Error subclass with statusCode
 *   logger                — Timestamped, level-based console logger
 *   pagination            — parsePagination() + buildPaginationResult()
 *   token                 — JWT generate/verify for access + refresh
 *   otp                   — CSPRNG OTP generate + bcrypt hash/verify
 *   hash                  — Password hashing (bcrypt)
 *
 *   ── Response Helpers ───────────────────────────
 *   sendSuccess           — Standardized success response
 *   sendError             — Standardized error response
 *
 *   ── Services ───────────────────────────────────
 *   uploadService         — Cloudinary upload/delete/extractPublicId
 *   notificationService   — Email + in-app notification dispatch
 *   aiService             — Provider-agnostic LLM API wrapper
 */

// ── Utils ──
const AppError = require('./utils/AppError');
const logger = require('./utils/logger');
const { parsePagination, buildPaginationResult } = require('./utils/pagination');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('./utils/token');
const { generateOTP, hashOTP, verifyOTP } = require('./utils/otp');
const { hashPassword, comparePassword } = require('./utils/hash');

// ── Response Helpers ──
const { sendSuccess, sendError } = require('./responses/apiResponse');

// ── Services ──
const uploadService = require('./uploadService');
const notificationService = require('./notificationService');
const aiService = require('./aiService');

module.exports = {
  // Utils
  AppError,
  logger,
  parsePagination,
  buildPaginationResult,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  hashOTP,
  verifyOTP,
  hashPassword,
  comparePassword,

  // Response helpers
  sendSuccess,
  sendError,

  // Services
  uploadService,
  notificationService,
  aiService,
};
