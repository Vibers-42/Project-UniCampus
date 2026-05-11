import { useState, useEffect } from 'react';
import { X, Upload, IndianRupee, Phone, Info, CheckCircle2, MapPin, Building, Tag, Paperclip, Edit3 } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { uploadImage } from '../../utils/upload';

const CATEGORIES = [
  'Electronics', 'Books', 'Lab Equipment', 'Stationery', 
  'Hostel Essentials', 'Gadgets', 'Cycles', 'Furniture', 
  'Study Materials', 'Event Passes', 'Calculators', 'Other'
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

/**
 * Reusable modal for both creating and editing listings.
 * Pass `editItem` prop to enter edit mode.
 */
export default function PostItemModal({ isOpen, onClose, onSuccess, editItem = null }) {
  const { createListing, updateListing } = useMarketplace();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  
  const isEditMode = !!editItem;

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Other',
    condition: 'Good',
    contactInfo: '',
    department: '',
    location: '',
    negotiable: false,
    tags: ''
  });

  // When editItem changes (modal opens in edit mode), preload form
  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title || '',
        description: editItem.description || '',
        price: editItem.price?.toString() || '',
        category: editItem.category || 'Other',
        condition: editItem.condition || 'Good',
        contactInfo: editItem.contactInfo || '',
        department: editItem.department || '',
        location: editItem.location || '',
        negotiable: editItem.negotiable || false,
        tags: editItem.tags?.join(', ') || ''
      });
      setImagePreview(editItem.image || null);
      setImageFile(null); // No new file yet
      setAttachmentFiles([]);
    } else {
      // Reset for create mode
      setForm({
        title: '', description: '', price: '', category: 'Other', condition: 'Good',
        contactInfo: '', department: '', location: '', negotiable: false, tags: ''
      });
      setImagePreview(null);
      setImageFile(null);
      setAttachmentFiles([]);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files) {
      setAttachmentFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For create mode, image is required; for edit mode, existing image is fine
    if (!isEditMode && !imageFile) return alert('Please upload an image');

    setLoading(true);
    try {
      let imageUrl = editItem?.image || '';

      // Upload new image if user selected one
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'marketplace');
      }

      // Upload attachments if any
      let attachments = editItem?.attachments || [];
      if (attachmentFiles.length > 0) {
        attachments = [];
        for (const file of attachmentFiles) {
          const url = await uploadImage(file, 'marketplace');
          attachments.push(url);
        }
      }

      const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(Boolean);

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        contactInfo: form.contactInfo,
        department: form.department,
        location: form.location,
        negotiable: form.negotiable,
        tags: tagsArray,
        image: imageUrl,
        attachments
      };

      if (isEditMode) {
        await updateListing(editItem._id, payload);
      } else {
        await createListing(payload);
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert(error.message || `Failed to ${isEditMode ? 'update' : 'post'} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="auth-card w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 p-0 shadow-2xl border-dark-800">
        {/* Header */}
        <div className="sticky top-0 bg-dark-950 border-b border-dark-800 p-6 flex justify-between items-center z-20">
          <div>
            <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
              {isEditMode ? (
                <><Edit3 className="text-primary-500" size={22} /> Edit Listing</>
              ) : (
                <><PlusCircle className="text-primary-500" /> Post Item for Sale</>
              )}
            </h2>
            <p className="text-dark-400 text-sm mt-1">
              {isEditMode ? 'Update your listing details below.' : 'Fill in the details to list your item.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-xl transition-colors text-dark-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Media Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
                <Upload size={16} /> Main Image {!isEditMode && '*'}
              </label>
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary-500/30">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); }}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-dark-800 bg-dark-900/50 hover:bg-dark-800/50 hover:border-primary-500/30 transition-all cursor-pointer group">
                    <div className="p-4 bg-dark-800 rounded-2xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-colors mb-3">
                      <Upload size={32} />
                    </div>
                    <span className="text-dark-200 font-bold">{isEditMode ? 'Replace image' : 'Click to upload image'}</span>
                    <span className="text-dark-500 text-sm mt-1">High quality photos sell faster</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
                <Paperclip size={16} /> Documents / PDFs (Optional)
              </label>
              <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-dark-800 bg-dark-900/50 hover:bg-dark-800/50 hover:border-primary-500/30 transition-all cursor-pointer group">
                <div className="p-4 bg-dark-800 rounded-2xl group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-colors mb-3">
                  <Paperclip size={32} />
                </div>
                <span className="text-dark-200 font-bold">{isEditMode ? 'Replace attachments' : 'Upload PDFs'}</span>
                <span className="text-dark-500 text-sm mt-1">
                  {attachmentFiles.length > 0 
                    ? `${attachmentFiles.length} new file(s) selected` 
                    : (editItem?.attachments?.length ? `${editItem.attachments.length} existing attachment(s)` : '0 files selected')
                  }
                </span>
                <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" onChange={handleAttachmentChange} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Item Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Scientific Calculator FX-991EX"
                className="input-field"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Category *</label>
              <select 
                className="input-field bg-dark-950 appearance-none"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Price *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400">
                  <IndianRupee size={16} />
                </div>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  className="input-field pl-10"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                />
              </div>
            </div>

            {/* Condition & Negotiable */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Condition *</label>
              <div className="flex gap-4">
                <select 
                  className="input-field bg-dark-950 appearance-none flex-1"
                  value={form.condition}
                  onChange={e => setForm({...form, condition: e.target.value})}
                >
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-2 px-4 bg-dark-900 border border-dark-800 rounded-xl cursor-pointer hover:border-primary-500/50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-dark-700 text-primary-500 focus:ring-primary-500/30"
                    checked={form.negotiable}
                    onChange={e => setForm({...form, negotiable: e.target.checked})}
                  />
                  <span className="text-sm font-bold text-dark-200">Negotiable</span>
                </label>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Building size={14}/> Target Department</label>
              <input
                type="text"
                placeholder="e.g. CSE, ECE, or All"
                className="input-field"
                value={form.department}
                onChange={e => setForm({...form, department: e.target.value})}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><MapPin size={14}/> Location on Campus</label>
              <input
                type="text"
                placeholder="e.g. Library, Food Court, C-Block"
                className="input-field"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>
            
            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1 flex items-center gap-1.5"><Tag size={14}/> Tags</label>
              <input
                type="text"
                placeholder="Comma separated tags (e.g. electronics, project, cheap)"
                className="input-field"
                value={form.tags}
                onChange={e => setForm({...form, tags: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Info size={14} /> Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell buyers more about the item (age, defects, features)..."
              className="input-field resize-none py-4"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Phone size={14} /> Contact Information *
            </label>
            <input
              type="text"
              required
              placeholder="WhatsApp number, Phone, or Telegram handle"
              className="input-field"
              value={form.contactInfo}
              onChange={e => setForm({...form, contactInfo: e.target.value})}
            />
            <p className="text-[10px] text-dark-500 font-medium italic">
              * This will be visible to students interested in your item.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-dark-800 flex flex-col md:flex-row gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-4 font-bold"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary flex-1 py-4 font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? 'Saving Changes...' : 'Listing Item...'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  {isEditMode ? 'Save Changes' : 'Post Listing'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent for better icon usage
function PlusCircle({ className }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  );
}
