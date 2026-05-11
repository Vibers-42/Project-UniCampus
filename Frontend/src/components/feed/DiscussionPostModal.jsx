import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../utils/upload';
import { X, Image as ImageIcon, FileText, Send, MessageSquare } from 'lucide-react';

export default function DiscussionPostModal({ isOpen, onClose, onSubmit }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setImages([]);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({ content, images, type: 'Discussion' });
      onClose();
    } catch (err) {
      console.error('[DiscussionPostModal] submit error:', err?.message || err);
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
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/50">
          <h2 className="text-lg font-bold text-dark-100 flex items-center gap-2">
            <MessageSquare size={18} className="text-purple-400" /> General Discussion
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-4 mb-4">
            <img src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'User') + '&background=random'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-dark-800" />
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-200">{user?.fullName}</p>
              <p className="text-xs text-dark-500 mb-2">Posting to General Discussion</p>
            </div>
          </div>

          <textarea
            className="input-field resize-none min-h-[120px] mb-4 bg-dark-950 border-dark-800 text-sm"
            placeholder="Share your thoughts, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          {images.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative group shrink-0">
                  {url.endsWith('.pdf') ? (
                    <div className="h-20 w-20 flex flex-col items-center justify-center rounded-xl border border-dark-700 bg-dark-800 text-dark-400">
                      <FileText size={24} className="mb-1 text-red-400" />
                      <span className="text-[10px] font-bold">PDF</span>
                    </div>
                  ) : (
                    <img src={url} alt="Uploaded preview" className="h-20 w-20 object-cover rounded-xl border border-dark-700" />
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

          <div className="flex justify-between items-center mt-2">
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
                className="text-dark-400 hover:text-purple-400 p-2 rounded-xl hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                title="Add media or document"
              >
                <ImageIcon size={20} />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={(!content.trim() && images.length === 0) || loading} 
              className="btn-primary w-auto px-6 py-2.5 text-sm flex items-center gap-2"
            >
              {loading ? 'Posting...' : <><Send size={16} /> Post Discussion</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


