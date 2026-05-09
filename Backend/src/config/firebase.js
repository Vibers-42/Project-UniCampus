/**
 * @file Firebase Admin SDK Configuration
 * @description Initializes Firebase Admin SDK for server-side operations.
 *
 * WHY THIS EXISTS:
 * - Firebase Admin SDK verifies Firebase Auth ID tokens sent by the frontend
 *   after email/password authentication (or any future Firebase auth provider).
 * - Centralizing the config here means any service that needs Firebase Admin
 *   just imports this pre-initialized instance — no duplicate initialization.
 * - Follows the same pattern as cloudinary.js — configure once, import anywhere.
 *
 * ISOLATION STRATEGY:
 *   This is the ONLY file in the entire codebase that imports 'firebase-admin'.
 *   All other files import from here. If Firebase is ever replaced with another
 *   identity provider (Auth0, Supabase, etc.), only this file changes.
 *
 * WHAT THIS PROVIDES:
 *   firebaseAdmin   — The initialized admin SDK instance (escape hatch)
 *   verifyToken     — Verifies a Firebase ID token and returns decoded payload
 *   getFirebaseUser — Fetches full Firebase user record by UID
 *
 * CREDENTIALS:
 *   Read from env.js (which reads process.env). The private key requires
 *   special handling because .env files store it with literal \n characters
 *   that must be converted to actual newlines at runtime.
 *
 * SECURITY:
 *   - Credentials are NEVER logged (not even in debug mode)
 *   - Firebase Admin credentials are backend-only — NEVER exposed to frontend
 *   - The frontend uses the Firebase Client SDK (different, public config)
 *
 * USAGE:
 *   const { verifyToken, getFirebaseUser } = require('./config/firebase');
 *   const decoded = await verifyToken(idToken);
 *   const firebaseUser = await getFirebaseUser(uid);
 */

const admin = require('firebase-admin');
const env = require('./env');
const logger = require('../shared/utils/logger');

// ── Initialize Firebase Admin (once) ──
// admin.apps is an array of initialized apps. If empty, initialize.
// This guard prevents re-initialization if this file is required multiple times.

if (!admin.apps.length) {
  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    logger.warn(
      'Firebase Admin SDK not initialized — missing FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env. ' +
      'Firebase-dependent features will not work.'
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        // .env stores the key with literal \n — replace with actual newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    logger.info('Firebase Admin SDK initialized');
  }
}

// ──────────────────────────────────────────
// REUSABLE HELPERS
// ──────────────────────────────────────────

/**
 * Verify a Firebase ID token.
 *
 * Called by future auth middleware to validate tokens sent from the frontend
 * after Firebase authentication (Google Sign-In, etc.).
 *
 * @param {string} idToken — The Firebase ID token from the client
 * @returns {Promise<Object>} Decoded token payload (uid, email, name, etc.)
 * @throws {Error} If the token is invalid, expired, or revoked
 */
const verifyToken = async (idToken) => {
  return admin.auth().verifyIdToken(idToken);
};

/**
 * Get a Firebase user record by UID.
 *
 * Useful for fetching additional user details (display name, photo URL,
 * provider data, etc.) that aren't included in the ID token.
 *
 * @param {string} uid — Firebase user UID
 * @returns {Promise<Object>} Firebase UserRecord
 * @throws {Error} If the user doesn't exist
 */
const getFirebaseUser = async (uid) => {
  return admin.auth().getUser(uid);
};

module.exports = {
  firebaseAdmin: admin,
  verifyToken,
  getFirebaseUser,
};
