/**
 * @file resource.api.js — Academic Resources API Layer
 *
 * All functions use the existing axios instance (with Firebase token injection).
 * Never create a new axios instance — always import from '../config/api'.
 */

import api from '../config/api';

/** GET /resources — list with filters/sort/pagination */
export const getResources = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined))
  ).toString();
  return api.get(`/resources${query ? `?${query}` : ''}`);
};

/** GET /resources/subjects — autocomplete for a dept+semester combo */
export const getSubjectSuggestions = (department, semester) =>
  api.get(`/resources/subjects?department=${encodeURIComponent(department)}&semester=${semester}`);

/** POST /resources — multipart/form-data file upload with progress */
export const uploadResource = (formData, onUploadProgress) =>
  api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

/** GET /resources/:id — single resource with populated uploader */
export const getResourceById = (id) => api.get(`/resources/${id}`);

/** POST /resources/:id/vote — toggle upvote */
export const voteResource = (id) => api.post(`/resources/${id}/vote`);

/** POST /resources/:id/rate — submit rating 1-5 */
export const rateResource = (id, rating) => api.post(`/resources/${id}/rate`, { rating });

/** POST /resources/:id/download — increment count + get download URL */
export const downloadResource = (id) => api.post(`/resources/${id}/download`);

/** DELETE /resources/:id — owner or admin only */
export const deleteResource = (id) => api.delete(`/resources/${id}`);
