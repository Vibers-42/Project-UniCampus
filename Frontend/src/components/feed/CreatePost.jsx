import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../utils/upload';

export default function CreatePost({ onSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({ content, images, type: 'Discussion' });
      setContent('');
      setImages([]);
    } catch (err) {
      console.error('[CreatePost] submit error:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      setImages(prev => [...prev, url]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Failed to upload image. (Ensure Cloudinary preset is configured)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card mb-6 p-4 md:p-6">
      <div className="flex gap-4">
        <img src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'User') + '&background=random'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              className="input-field resize-none min-h-[100px] mb-4 bg-dark-900 border-dark-700"
              placeholder="Share a resource, post a doubt, or start a discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {images.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    {url.endsWith('.pdf') ? (
                      <div className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border border-dark-700 bg-dark-800 text-dark-400">
                        <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                        <span className="text-[10px] font-bold">PDF</span>
                      </div>
                    ) : (
                      <img src={url} alt="Uploaded preview" className="h-20 w-20 object-cover rounded-lg border border-dark-700" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-dark-400 hover:text-primary-400 p-2 rounded-lg hover:bg-dark-800 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Media / PDF</span>
                </button>
              </div>
              <button type="submit" disabled={(!content.trim() && images.length === 0) || loading} className="btn-primary w-auto px-6 py-2 text-sm">
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
