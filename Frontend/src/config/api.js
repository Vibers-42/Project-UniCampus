/**
 * @file api.js — Axios instance with Firebase token injection & retry safety
 *
 * ARCHITECTURE:
 *   Every request to the backend automatically includes the Firebase
 *   ID token in the Authorization header. Components never need to
 *   manually get or attach tokens.
 *
 * TOKEN CACHING:
 *   Firebase's getIdToken() is called ONCE and cached for 5 minutes.
 *   This prevents a network round-trip to Firebase on EVERY API call.
 *   Firebase SDK internally caches tokens (1 hour), but getIdToken()
 *   can still trigger async work — our cache shortcuts this entirely.
 *
 * 429 HANDLING:
 *   If the backend returns 429 (rate limited), the interceptor prevents
 *   automatic retry storms. The error propagates with a clear message.
 *
 * USAGE:
 *   import api from '../config/api';
 *   const { data } = await api.get('/users/profile');
 *   const { data } = await api.post('/auth/sync', { fullName: '...' });
 */

import axios from 'axios';
import { auth } from './firebaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
// API URL configured via environment variable

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token Cache ──────────────────────────────────────────────
// Avoids calling getIdToken() on every single request.
// Firebase tokens last 1 hour; we cache for 5 minutes as a safe window.
let _cachedToken = null;
let _tokenExpiry = 0;
const TOKEN_CACHE_MS = 5 * 60 * 1000; // 5 minutes

// Singleton promise to prevent parallel getIdToken() calls
let _tokenPromise = null;

async function getCachedToken() {
  const now = Date.now();

  // Return cached token if still valid
  if (_cachedToken && now < _tokenExpiry) {
    return _cachedToken;
  }

  // If another request is already fetching the token, reuse its promise
  if (_tokenPromise) {
    return _tokenPromise;
  }

  const user = auth.currentUser;
  if (!user) return null;

  // Single promise for concurrent callers
  _tokenPromise = user.getIdToken().then((token) => {
    _cachedToken = token;
    _tokenExpiry = Date.now() + TOKEN_CACHE_MS;
    _tokenPromise = null;
    return token;
  }).catch((err) => {
    _tokenPromise = null;
    console.error('[API] Token fetch failed:', err.message);
    return null;
  });

  return _tokenPromise;
}

/**
 * Force-clear the token cache.
 * Call this after login/logout to ensure fresh tokens.
 */
export function clearTokenCache() {
  _cachedToken = null;
  _tokenExpiry = 0;
  _tokenPromise = null;
}

// ── Request Interceptor: Attach Firebase ID token ──
api.interceptors.request.use(
  async (config) => {
    const token = await getCachedToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle errors & 429 gracefully ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // 429 — Rate limited: do NOT retry, show clear message
    if (status === 429) {
      console.warn('[API] Rate limited (429). Backing off.');
      // Clear token cache in case token refresh was contributing to spam
      clearTokenCache();
      return Promise.reject({
        ...error,
        message: 'Too many requests. Please wait a moment and try again.',
        isRateLimited: true,
      });
    }

    // 401 — Token expired: clear cache so next request gets fresh token
    if (status === 401) {
      clearTokenCache();
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
