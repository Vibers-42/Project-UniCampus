/**
 * @file api.js — Axios instance with Firebase token injection
 *
 * Every request to the backend automatically includes the Firebase
 * ID token in the Authorization header. Components never need to
 * manually get or attach tokens.
 *
 * USAGE:
 *   import api from '../config/api';
 *   const { data } = await api.get('/users/profile');
 *   const { data } = await api.post('/auth/sync', { fullName: '...' });
 */

import axios from 'axios';
import { auth } from './firebaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Attach Firebase ID token ──
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // getIdToken() uses the cached token and auto-refreshes near expiry.
      // Force-refresh (true) is only needed after email verification, which is
      // already handled in AuthContext.verifyAndSync via getIdToken(true).
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Unwrap standard response ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the backend error message if available
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    return Promise.reject({ ...error, message });
  }
);

export default api;
