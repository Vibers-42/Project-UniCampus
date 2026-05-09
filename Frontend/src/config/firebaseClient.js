/**
 * @file Firebase Client SDK Configuration
 * @description Initializes Firebase app and Auth for the frontend.
 *
 * WHY THIS EXISTS:
 * - Firebase Client SDK must be initialized once before any auth call.
 * - Centralizing the config here means any component/hook that needs
 *   Firebase Auth just imports the pre-initialized `auth` instance.
 *
 * WHAT THIS PROVIDES:
 *   app  — The initialized Firebase app instance
 *   auth — The Firebase Auth instance (for signIn, onAuthStateChanged, etc.)
 *
 * PERSISTENCE:
 *   Explicitly set to browserLocalPersistence (localStorage-based).
 *   This ensures the Firebase session survives:
 *     - Tab switches (email verification link opens in new tab)
 *     - Browser restarts
 *     - Page reloads
 *
 *   Without explicit persistence, Firebase uses indexedDB which can fail
 *   to restore sessions reliably when the user navigates away (e.g., to
 *   click a verification link in Outlook) and returns.
 *
 * CONFIGURATION:
 *   All values come from Vite's import.meta.env (VITE_ prefix required).
 *   These are PUBLIC config values — safe to expose in client-side code.
 *
 * USAGE:
 *   import { auth } from '../config/firebaseClient';
 *   import { signInWithEmailAndPassword } from 'firebase/auth';
 */

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// ── Firebase Config from environment variables ──
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ── Initialize Firebase (once) ──
const app = initializeApp(firebaseConfig);

// ── Initialize Firebase Auth with explicit persistence ──
const auth = getAuth(app);

// Set persistence to localStorage so sessions survive tab switches
// and external redirects (e.g., clicking email verification link in Outlook).
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase] Failed to set persistence:', err.message);
});

export { app, auth };
