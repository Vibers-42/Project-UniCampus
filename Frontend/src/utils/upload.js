export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // Using a generic preset that usually works, or you'd need the specific one configured
  formData.append('upload_preset', 'unicampus_frontend');
  formData.append('folder', 'unicampus/posts');
  
  const cloudName = 'dd6etq1me';
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error('Image upload failed');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
