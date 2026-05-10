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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
console.log('[API] Initializing Axios with baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Attach Firebase ID token ──
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // getIdToken(true) forces a refresh — critical after email verification
      // to ensure the token contains the updated email_verified claim
      const token = await user.getIdToken(true);
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
