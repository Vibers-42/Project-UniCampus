import { useState } from 'react';
import { X, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinPrivateGroupModal({ isOpen, onClose, group, onJoin }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !group) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error('Join code must be 6 characters');

    setLoading(true);
    try {
      await onJoin(group._id, code.toUpperCase());
      onClose();
    } catch (err) {
      toast.error(err.message || 'Invalid join code');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().slice(0, 6);
    setCode(val);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgb(var(--color-dark-900))',
        border: '1px solid rgb(var(--color-dark-800))',
        borderRadius: '24px',
        padding: '32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={32} style={{ color: '#fb923c' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Private Group</h2>
          <p style={{ fontSize: '14px', color: 'rgb(var(--color-dark-400))', lineHeight: '1.5' }}>
            Enter the 6-character join code provided by the admin of <span style={{ color: '#fff', fontWeight: 600 }}>{group.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            value={code}
            onChange={handleInputChange}
            placeholder="ENTER CODE"
            style={{ 
              width: '100%', padding: '16px', borderRadius: '16px', 
              background: 'rgb(var(--color-dark-800) / 0.5)', border: '2px solid rgb(var(--color-dark-700))',
              color: '#fff', fontSize: '24px', fontWeight: 800, textAlign: 'center', letterSpacing: '8px',
              outline: 'none', transition: 'border-color 0.2s'
            }}
            className="focus:border-primary-500"
            autoFocus
          />

          <button 
            type="submit"
            disabled={loading || code.length !== 6}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '16px', 
              background: '#6c63ff', color: '#fff', border: 'none', 
              fontSize: '16px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: (loading || code.length !== 6) ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Join Group <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
