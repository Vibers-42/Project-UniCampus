/**
 * @file Central Configuration Re-exporter
 * @description Re-exports all configuration modules from a single entry point.
 *
 * WHY THIS EXISTS:
 * - Consumers can import everything from one place:
 *     const { env, cloudinary, connectDB, firebase } = require('./config');
 * - Keeps imports clean and discoverable.
 * - This file does NOT read process.env — that's env.js's job.
 *
 * USAGE:
 *   const { env } = require('./config');
 *   console.log(env.PORT);
 */

const env = require('./env');
const cloudinary = require('./cloudinary');
const connectDB = require('./db');
const firebase = require('./firebase');

module.exports = {
  env,
  cloudinary,
  connectDB,
  firebase,
};
