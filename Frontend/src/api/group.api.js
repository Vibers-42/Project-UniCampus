import axios from 'axios';
import api from '../config/api';

// Since the user requested /api/groups instead of /api/v1/groups, 
// we might need to handle the baseURL difference if it's not v1.
// However, the api.js instance uses /api/v1. 
// We will use the existing api instance for consistency with token injection.

const BASE = '/study-groups';

export const getGroups = (params) => api.get(BASE, { params });
export const createGroup = (data) => api.post(BASE, data);
export const getGroupById = (id) => api.get(`${BASE}/${id}`);
export const joinGroup = (id, joinCode) => api.post(`${BASE}/${id}/join`, { joinCode });
export const leaveGroup = (id) => api.post(`${BASE}/${id}/leave`);
export const deleteGroup = (id) => api.delete(`${BASE}/${id}`);
export const updateGroup = (id, data) => api.patch(`${BASE}/${id}`, data);

export const getMembers = (id) => api.get(`${BASE}/${id}/members`);
export const kickMember = (id, userId) => api.delete(`${BASE}/${id}/members/${userId}`);

export const pinResource = (id, resourceId) => api.post(`${BASE}/${id}/pin-resource`, { resourceId });
export const unpinResource = (id, resourceId) => api.delete(`${BASE}/${id}/pin-resource/${resourceId}`);

export const getThreads = (id) => api.get(`${BASE}/${id}/threads`);
export const createThread = (id, data) => api.post(`${BASE}/${id}/threads`, data);
export const togglePinThread = (id, threadId) => api.patch(`${BASE}/${id}/threads/${threadId}`);
export const deleteThread = (id, threadId) => api.delete(`${BASE}/${id}/threads/${threadId}`);

export const getMessages = (id, params) => api.get(`${BASE}/${id}/messages`, { params });

export const sendMessage = (id, data) => {
  // Check if data is FormData (for attachments)
  const isFormData = data instanceof FormData;
  return api.post(`${BASE}/${id}/message`, data, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
    }
  });
};

export const deleteMessage = (id, messageId) => api.delete(`${BASE}/${id}/messages/${messageId}`);
export const markMessagesRead = (id, messageIds) => api.post(`${BASE}/${id}/messages/read`, { messageIds });
