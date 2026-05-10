import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Lock, Globe, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['study', 'project', 'hackathon', 'research', 'general'];
const EMOJIS = ['🧠', '🤖', '🚀', '📊', '💻', '📖', '🧪', '🎨'];

export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'study',
    avatar: '🎓',
    department: user?.department || '',
    year: user?.yearOfStudy || 1,
    semester: 1,
    subject: '',
    tags: [],
    maxMembers: 30,
    isPrivate: false
  });

  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.subject) {
      return toast.error('Please fill required fields');
    }

    setLoading(true);
    try {
      // In real implementation: await createGroup(formData);
      toast.success('Group created successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const ModalTitle = () => {
    if (step === 1) return 'Basic Information';
    if (step === 2) return 'Academic Details';
    return 'Privacy & Confirm';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '500px',
        background: 'rgb(var(--color-dark-900))',
        border: '1px solid rgb(var(--color-dark-800))',
        borderRadius: '24px',
        display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'rgb(var(--color-dark-100))' }}>Create Study Group</h2>
            <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', marginTop: '4px' }}>Step {step} of 3: {ModalTitle()}</p>
          </div>
          <button onClick={onClose} style={{ color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', width: '100%', background: 'rgb(var(--color-dark-800))' }}>
          <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: '#6c63ff', transition: 'width 0.3s ease' }} />
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Group Name *</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. DSA Mastery Squad"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this group about?"
                  rows={3}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EMOJIS.map(e => (
                      <button 
                        key={e}
                        onClick={() => setFormData({ ...formData, avatar: e })}
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '8px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: formData.avatar === e ? 'rgba(108,99,255,0.2)' : 'rgb(var(--color-dark-800))',
                          border: formData.avatar === e ? '1px solid #6c63ff' : '1px solid rgb(var(--color-dark-700))',
                          cursor: 'pointer', fontSize: '18px'
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Year</label>
                  <select 
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                  >
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Semester</label>
                  <select 
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Subject *</label>
                <input 
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', color: '#6c63ff', fontSize: '12px' }}>
                      #{tag} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                </div>
                <input 
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press Enter to add tag"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none', fontSize: '13px' }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {formData.isPrivate ? <Lock style={{ color: '#fb923c' }} /> : <Globe style={{ color: '#4ade80' }} />}
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgb(var(--color-dark-100))' }}>{formData.isPrivate ? 'Private Group' : 'Public Group'}</p>
                      <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>{formData.isPrivate ? 'Members need a code to join' : 'Anyone can discover and join'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                    style={{
                      width: '44px', height: '24px', borderRadius: '20px', position: 'relative',
                      background: formData.isPrivate ? '#6c63ff' : 'rgb(var(--color-dark-700))',
                      border: 'none', cursor: 'pointer', transition: '0.3s'
                    }}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '50%', background: '#fff', 
                      position: 'absolute', top: '3px', left: formData.isPrivate ? '23px' : '3px',
                      transition: '0.3s'
                    }} />
                  </button>
                </div>

                {formData.isPrivate && (
                  <div style={{ borderTop: '1px solid rgb(var(--color-dark-700))', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))' }}>Join Code Preview:</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '4px', color: '#6c63ff' }}>A1B2C3</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--color-dark-300))' }}>Maximum Members</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <input 
                    type="range" min="5" max="100" step="5"
                    value={formData.maxMembers}
                    onChange={e => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                    style={{ flex: 1, accentColor: '#6c63ff' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#6c63ff', width: '40px' }}>{formData.maxMembers}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '24px', borderTop: '1px solid rgb(var(--color-dark-800))', display: 'flex', gap: '12px' }}>
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-300))', cursor: 'pointer', fontWeight: 600 }}
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          
          <button 
            onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
            disabled={loading}
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              padding: '12px 20px', borderRadius: '12px', background: '#6c63ff', color: '#fff', 
              border: 'none', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(108,99,255,0.3)'
            }}
          >
            {step === 3 ? (loading ? 'Creating...' : 'Confirm & Create') : 'Next'}
            {step < 3 && <ChevronRight size={18} />}
            {step === 3 && !loading && <Check size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
