import api from '../config/api';

export const uploadImage = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.url;
  } catch (error) {
    console.error('Secure upload failed:', error);
    throw error;
  }
};
