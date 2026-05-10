import { useState, useRef } from 'react';
import { X, Settings, Users, AlertTriangle, Save, Loader2, RefreshCw, UserMinus, Crown, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_CURRENT_USER_ID = 'user_001';
const CATEGORIES = ['study', 'project', 'hackathon', 'research', 'general'];

const AVATAR_COLORS = ['#6c63ff','#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316'];
function avatarColor(id = '') {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
function initials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Tag Input ─────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {tags.map(tag => (
          <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', color: '#6c63ff', fontSize: '12px' }}>
            #{tag}
            <X size={11} style={{ cursor: 'pointer' }} onClick={() => onChange(tags.filter(t => t !== tag))} />
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Press Enter to add tag"
        style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none', fontSize: '13px' }}
      />
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-300))' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: '10px 14px', borderRadius: '10px',
  background: 'rgb(var(--color-dark-800) / 0.5)',
  border: '1px solid rgb(var(--color-dark-700))',
  color: '#fff', outline: 'none', fontSize: '14px',
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AdminPanelModal({ group, onClose, onGroupChange, onNavigateBack }) {
  const [tab, setTab] = useState('edit');
  const [form, setForm] = useState({
    name: group.name,
    description: group.description || '',
    maxMembers: group.maxMembers,
    category: group.category,
    tags: [...(group.tags || [])],
    isPrivate: group.isPrivate,
    joinCode: group.joinCode || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [hoveredMemberId, setHoveredMemberId] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    setTimeout(() => {
      onGroupChange({ ...group, ...form });
      toast.success('Group updated!');
      setSaving(false);
    }, 600);
  };

  const handleRegenCode = () => {
    const code = genCode();
    setForm(p => ({ ...p, joinCode: code }));
    onGroupChange({ ...group, joinCode: code });
    toast.success('New join code generated');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(form.joinCode);
    toast.success('Copied!');
  };

  const handleMakeAdmin = (member) => {
    onGroupChange({ ...group, admin: { _id: member._id, fullName: member.fullName, avatar: member.avatar } });
    toast.success(`${member.fullName} is now admin`);
  };

  const handleKick = (member) => {
    onGroupChange({ ...group, members: group.members.filter(m => m._id !== member._id) });
    toast.success(`${member.fullName} removed`);
  };

  const handleDeleteGroup = () => {
    if (deleteInput !== group.name) return toast.error('Group name does not match');
    toast.success('Group deleted');
    onNavigateBack();
  };

  const TABS = [
    { key: 'edit', label: 'Edit Group', icon: Settings },
    { key: 'members', label: 'Manage Members', icon: Users },
    { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '580px',
        background: 'rgb(var(--color-dark-900))',
        border: '1px solid rgb(var(--color-dark-800))',
        borderRadius: '24px', display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Admin Panel</h2>
            <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', marginTop: '2px' }}>{group.name}</p>
          </div>
          <button onClick={onClose} style={{ color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgb(var(--color-dark-800))' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '12px 8px', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 600,
                  color: active ? (t.key === 'danger' ? '#ef4444' : '#6c63ff') : 'rgb(var(--color-dark-400))',
                  borderBottom: active ? `2px solid ${t.key === 'danger' ? '#ef4444' : '#6c63ff'}` : '2px solid transparent',
                  transition: '0.15s',
                }}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* ── TAB 1: Edit Group ── */}
          {tab === 'edit' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Field label="Group Name *">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </Field>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Field label="Category">
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, background: 'rgb(var(--color-dark-800))' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Max Members">
                  <input type="number" min={group.members?.length || 1} max={200} value={form.maxMembers} onChange={e => setForm(p => ({ ...p, maxMembers: +e.target.value }))} style={inputStyle} />
                </Field>
              </div>
              <Field label="Tags">
                <TagInput tags={form.tags} onChange={tags => setForm(p => ({ ...p, tags }))} />
              </Field>
              <Field label="Privacy">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))' }}>
                  <span style={{ fontSize: '14px', color: form.isPrivate ? '#fb923c' : '#4ade80', fontWeight: 600 }}>
                    {form.isPrivate ? '🔒 Private Group' : '🌐 Public Group'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, isPrivate: !p.isPrivate }))}
                    style={{
                      width: '44px', height: '24px', borderRadius: '20px', position: 'relative',
                      background: form.isPrivate ? '#6c63ff' : 'rgb(var(--color-dark-600))',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: form.isPrivate ? '23px' : '3px', transition: '0.3s' }} />
                  </button>
                </div>
              </Field>
              {form.isPrivate && (
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgba(108,99,255,0.2)' }}>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))', marginBottom: '8px' }}>Join Code</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, letterSpacing: '4px', color: '#6c63ff' }}>{form.joinCode || 'N/A'}</span>
                    <button type="button" onClick={handleCopyCode} style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Copy size={12} /> Copy
                    </button>
                    <button type="button" onClick={handleRegenCode} style={{ padding: '5px 10px', borderRadius: '8px', background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                </div>
              )}
              <button type="submit" disabled={saving} style={{ padding: '12px', borderRadius: '12px', background: '#6c63ff', color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(108,99,255,0.3)' }}>
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* ── TAB 2: Manage Members ── */}
          {tab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', marginBottom: '12px' }}>
                {group.members?.length || 0} / {group.maxMembers} members
              </p>
              {(group.members || []).map(member => {
                const isMemberAdmin = member._id === group.admin?._id;
                const isMe = member._id === MOCK_CURRENT_USER_ID;
                return (
                  <div
                    key={member._id}
                    onMouseEnter={() => setHoveredMemberId(member._id)}
                    onMouseLeave={() => setHoveredMemberId(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px',
                      background: hoveredMemberId === member._id ? 'rgb(var(--color-dark-800) / 0.6)' : 'rgb(var(--color-dark-800) / 0.3)',
                      transition: '0.15s',
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: avatarColor(member._id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials(member.fullName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{member.fullName}{isMe ? ' (You)' : ''}</span>
                        {isMemberAdmin && <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '6px', background: 'rgba(108,99,255,0.15)', color: '#6c63ff', fontWeight: 700 }}>Admin</span>}
                      </div>
                    </div>
                    {!isMemberAdmin && !isMe && (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => handleMakeAdmin(member)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={12} /> Admin
                        </button>
                        <button onClick={() => handleKick(member)} style={{ padding: '5px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <UserMinus size={12} /> Kick
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB 3: Danger Zone ── */}
          {tab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>Delete Group</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', lineHeight: 1.6, marginBottom: '16px' }}>
                  This will permanently delete <strong style={{ color: '#fff' }}>{group.name}</strong> and all its messages, threads, and resources. This action cannot be undone.
                </p>
                <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-300))', marginBottom: '8px' }}>
                  Type <strong style={{ color: '#fff' }}>{group.name}</strong> to confirm:
                </p>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder={group.name}
                  style={{ ...inputStyle, width: '100%', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.3)' }}
                />
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleteInput !== group.name}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    background: deleteInput === group.name ? '#ef4444' : 'rgba(239,68,68,0.1)',
                    color: deleteInput === group.name ? '#fff' : '#ef4444',
                    border: 'none', fontSize: '14px', fontWeight: 700,
                    cursor: deleteInput === group.name ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: '0.2s',
                  }}
                >
                  <Trash2 size={16} /> Delete Group Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
