import { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Pin, Trash2, Eye, Search, X, Upload, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';

const CATEGORY_CHIPS = ['All', 'notes', 'pyq', 'lab-manual', 'assignment', 'reference'];

const CAT_COLORS = {
  notes: { bg: 'rgba(108,99,255,0.1)', color: '#6c63ff' },
  pyq: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  'lab-manual': { bg: 'rgba(20,184,166,0.1)', color: '#14b8a6' },
  assignment: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c' },
  reference: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  other: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
};

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: 'rgb(var(--color-dark-900))',
        border: '1px solid rgb(var(--color-dark-700))',
        borderRadius: '20px', padding: '28px', maxWidth: '400px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <p style={{ fontSize: '15px', color: 'rgb(var(--color-dark-100))', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', borderRadius: '10px', background: 'transparent',
            border: '1px solid rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-300))',
            cursor: 'pointer', fontWeight: 600,
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', borderRadius: '10px', background: '#ef4444',
            border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700,
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Resource Picker Modal ─────────────────────────────────────────────────────
function ResourcePickerModal({ group, onAdd, onClose }) {
  const [tab, setTab] = useState('existing'); // 'existing' | 'upload'
  const [searchQ, setSearchQ] = useState('');
  const [form, setForm] = useState({ title: '', category: 'notes', subject: group.subject });
  const [addedIds, setAddedIds] = useState(new Set());

  const [existingResults, setExistingResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      setLoadingResults(true);
      try {
        const res = await getResources({ search: searchQ || undefined, limit: 20 });
        setExistingResults(res.data?.data?.items || []);
      } catch { /* silent */ }
      finally { setLoadingResults(false); }
    };
    const timer = setTimeout(loadResources, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const handleAddExisting = (res) => {
    if (addedIds.has(res._id)) return;
    setAddedIds(prev => new Set([...prev, res._id]));
    onAdd(res);
    toast.success('Added to group resources');
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title is required');
    const newRes = {
      _id: `res_mock_${Date.now()}`,
      title: form.title,
      subject: form.subject,
      category: form.category,
      fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1',
      fileType: 'pdf',
      uploadedBy: { _id: 'upload', fullName: 'You' },
      upvotes: [],
      downloadCount: 0,
      qualityRating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };
    onAdd(newRes);
    toast.success('Resource uploaded and added!');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '560px',
        background: 'rgb(var(--color-dark-900))',
        border: '1px solid rgb(var(--color-dark-800))',
        borderRadius: '24px', display: 'flex', flexDirection: 'column',
        maxHeight: '85vh',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Add Resource to Group</h2>
          <button onClick={onClose} style={{ color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgb(var(--color-dark-800))' }}>
          {[{ key: 'existing', label: 'Add Existing' }, { key: 'upload', label: 'Upload New' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600,
                color: tab === t.key ? '#6c63ff' : 'rgb(var(--color-dark-400))',
                borderBottom: tab === t.key ? '2px solid #6c63ff' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {tab === 'existing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--color-dark-500))' }} />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search resources..."
                  style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                />
              </div>
              {existingResults.map(res => {
                const catStyle = CAT_COLORS[res.category] || CAT_COLORS.other;
                const added = addedIds.has(res._id);
                return (
                  <div key={res._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.4)', border: '1px solid rgb(var(--color-dark-700))' }}>
                    <span style={{ fontSize: '22px' }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.title}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', ...catStyle }}>{res.category}</span>
                        <span style={{ fontSize: '10px', color: 'rgb(var(--color-dark-500))' }}>{res.subject}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddExisting(res)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                        background: added ? 'rgba(16,185,129,0.15)' : 'rgba(108,99,255,0.15)',
                        color: added ? '#10b981' : '#6c63ff',
                        border: 'none', cursor: added ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                      }}
                    >
                      {added ? <><Check size={12} /> Added</> : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'upload' && (
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-300))', marginBottom: '6px' }}>Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Resource title"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-300))', marginBottom: '6px' }}>Subject</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-300))', marginBottom: '6px' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgb(var(--color-dark-800))', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none' }}
                  >
                    {['notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', border: '2px dashed rgb(var(--color-dark-700))', textAlign: 'center', color: 'rgb(var(--color-dark-500))' }}>
                <Upload size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px' }}>File upload simulated in mock mode</p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>PDF, DOC, DOCX up to 50MB</p>
              </div>
              <button type="submit" style={{ padding: '12px', borderRadius: '12px', background: '#6c63ff', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.3)' }}>
                Upload & Add to Group
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GroupResourcesTab({ group, onGroupChange }) {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [resources, setResources] = useState(group?.resources || []);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [pinnedIds, setPinnedIds] = useState(new Set((group?.pinnedResources || []).map(r => r?._id || r)));

  const isAdmin = user && group?.admin?._id === user._id;

  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return resources;
    return resources.filter(r => r.category === categoryFilter.toLowerCase());
  }, [resources, categoryFilter]);

  const handleAddResource = (res) => {
    setResources(prev => {
      if (prev.find(r => r._id === res._id)) return prev;
      return [res, ...prev];
    });
  };

  const handlePin = (res) => {
    const isPinned = pinnedIds.has(res._id);
    const newPinned = new Set(pinnedIds);
    if (isPinned) {
      newPinned.delete(res._id);
      toast('Resource unpinned');
    } else {
      if (newPinned.size >= 10) return toast.error('Max 10 pinned resources');
      newPinned.add(res._id);
      toast.success('Resource pinned!');
    }
    setPinnedIds(newPinned);
    const updatedGroup = {
      ...group,
      pinnedResources: resources.filter(r => newPinned.has(r._id)),
    };
    onGroupChange(updatedGroup);
  };

  const handleRemove = (res) => {
    setResources(prev => prev.filter(r => r._id !== res._id));
    setPinnedIds(prev => { const n = new Set(prev); n.delete(res._id); return n; });
    onGroupChange({ ...group, pinnedResources: group.pinnedResources?.filter(r => (r?._id || r) !== res._id) });
    toast.success('Resource removed from group');
    setConfirmRemove(null);
  };

  const catStyle = (cat) => CAT_COLORS[cat] || CAT_COLORS.other;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {pickerOpen && (
        <ResourcePickerModal
          group={group}
          onAdd={handleAddResource}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {confirmRemove && (
        <ConfirmDialog
          message={`Remove "${confirmRemove.title}" from this group?`}
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>Group Resources</h3>
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))', marginTop: '2px' }}>{resources.length} resource{resources.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', background: '#6c63ff', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,99,255,0.25)' }}
        >
          <Plus size={15} /> Add Resource
        </button>
      </div>

      {/* Category Chips */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid rgb(var(--color-dark-800))' }}>
        {CATEGORY_CHIPS.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
              background: categoryFilter === c ? 'rgba(108,99,255,0.12)' : 'transparent',
              color: categoryFilter === c ? '#6c63ff' : 'rgb(var(--color-dark-400))',
              border: categoryFilter === c ? '1px solid #6c63ff' : '1px solid rgb(var(--color-dark-700))',
              cursor: 'pointer', textTransform: 'capitalize', transition: '0.15s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Resource List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgb(var(--color-dark-500))' }}>
            <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px' }}>No resources in this category</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Add resources to help your group members</p>
          </div>
        ) : filtered.map(res => {
          const cs = catStyle(res.category);
          const isPinned = pinnedIds.has(res._id);
          return (
            <div
              key={res._id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '14px',
                background: 'rgb(var(--color-dark-800) / 0.4)',
                border: isPinned ? '1px solid rgba(108,99,255,0.3)' : '1px solid rgb(var(--color-dark-700))',
                transition: '0.15s',
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                    {res.title}
                  </p>
                  {isPinned && <Pin size={11} style={{ color: '#6c63ff' }} />}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', ...cs, textTransform: 'capitalize' }}>{res.category}</span>
                  <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>
                    by {res.uploadedBy?.fullName} · ⬇ {res.downloadCount} · ▲ {res.upvotes?.length}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Preview"
                  style={{ padding: '5px', borderRadius: '7px', background: 'rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-300))', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Eye size={14} />
                </a>
                <a
                  href={res.fileUrl}
                  target="_blank"
                  download
                  rel="noreferrer"
                  title="Download"
                  style={{ padding: '5px', borderRadius: '7px', background: 'rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-300))', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Download size={14} />
                </a>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handlePin(res)}
                      title={isPinned ? 'Unpin' : 'Pin'}
                      style={{ padding: '5px', borderRadius: '7px', background: isPinned ? 'rgba(108,99,255,0.15)' : 'rgb(var(--color-dark-700))', color: isPinned ? '#6c63ff' : 'rgb(var(--color-dark-300))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmRemove(res)}
                      title="Remove from group"
                      style={{ padding: '5px', borderRadius: '7px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
