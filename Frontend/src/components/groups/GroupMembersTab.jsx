import { useState, useMemo } from 'react';
import { Search, Shield, UserMinus, Crown, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_CURRENT_USER_ID = 'user_001';

const AVATAR_COLORS = [
  '#6c63ff','#f59e0b','#10b981','#3b82f6','#ec4899',
  '#8b5cf6','#14b8a6','#f97316','#06b6d4','#84cc16',
];
function avatarColor(id = '') {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}
function initials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Inline confirm dialog ─────────────────────────────────────────────────────
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
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', borderRadius: '10px', background: '#ef4444',
            border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700,
          }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GroupMembersTab({ group, onGroupChange, useMockData }) {
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'kick'|'admin', member }

  const isAdmin = group?.admin?._id === MOCK_CURRENT_USER_ID;
  const members = group?.members || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(m => m.fullName?.toLowerCase().includes(q));
  }, [members, search]);

  const handleMakeAdmin = (member) => {
    setConfirm({
      type: 'admin',
      member,
      message: `Transfer admin role to ${member.fullName}? You will become a regular member.`,
    });
  };

  const handleKick = (member) => {
    setConfirm({
      type: 'kick',
      member,
      message: `Remove ${member.fullName} from the group? They can rejoin if the group is public.`,
    });
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const { type, member } = confirm;

    if (type === 'admin') {
      const updated = {
        ...group,
        admin: { _id: member._id, fullName: member.fullName, avatar: member.avatar },
      };
      onGroupChange(updated);
      toast.success(`${member.fullName} is now the admin`);
    } else if (type === 'kick') {
      const updated = {
        ...group,
        members: group.members.filter(m => m._id !== member._id),
      };
      onGroupChange(updated);
      toast.success(`${member.fullName} removed from group`);
    }

    setConfirm(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgb(var(--color-dark-800))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>
            Members ({members.length})
          </h3>
          <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>
            {members.length}/{group?.maxMembers || 30} slots
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgb(var(--color-dark-500))',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px',
              background: 'rgb(var(--color-dark-800) / 0.6)',
              border: '1px solid rgb(var(--color-dark-700))',
              color: '#fff', outline: 'none', fontSize: '13px',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: '14px', color: 'rgb(var(--color-dark-500))', textAlign: 'center', padding: '40px 0' }}>
            No members match your search
          </p>
        )}

        {filtered.map(member => {
          const isMemberAdmin = member._id === group.admin?._id;
          const isMe = member._id === MOCK_CURRENT_USER_ID;
          const isHovered = hoveredId === member._id;

          return (
            <div
              key={member._id}
              onMouseEnter={() => setHoveredId(member._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '14px',
                background: isHovered ? 'rgb(var(--color-dark-800) / 0.6)' : 'transparent',
                transition: '0.15s',
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: avatarColor(member._id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, color: '#fff',
                }}>
                  {initials(member.fullName)}
                </div>
                {/* Online dot (all online in mock) */}
                {useMockData && (
                  <div style={{
                    position: 'absolute', bottom: '-1px', right: '-1px',
                    width: '11px', height: '11px', borderRadius: '50%',
                    background: '#00d4aa', border: '2px solid rgb(var(--color-dark-950))',
                  }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: isMe ? '#6c63ff' : 'rgb(var(--color-dark-100))' }}>
                    {member.fullName}{isMe ? ' (You)' : ''}
                  </span>
                  {isMemberAdmin && (
                    <span style={{
                      fontSize: '10px', padding: '1px 7px', borderRadius: '8px',
                      background: 'rgba(108,99,255,0.15)', color: '#6c63ff', fontWeight: 700,
                    }}>
                      Admin
                    </span>
                  )}
                  {!isMemberAdmin && (
                    <span style={{
                      fontSize: '10px', padding: '1px 7px', borderRadius: '8px',
                      background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-400))',
                    }}>
                      Member
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))', marginTop: '2px' }}>
                  {member.department || 'AI & Machine Learning'} {member.yearOfStudy ? `· Year ${member.yearOfStudy}` : ''}
                </p>
              </div>

              {/* Admin controls — visible on hover, only for non-admin non-self members */}
              {isAdmin && !isMemberAdmin && !isMe && isHovered && (
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleMakeAdmin(member)}
                    title="Make Admin"
                    style={{
                      padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      background: 'rgba(108,99,255,0.1)', color: '#6c63ff',
                      border: '1px solid rgba(108,99,255,0.2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <Crown size={12} /> Admin
                  </button>
                  <button
                    onClick={() => handleKick(member)}
                    title="Remove Member"
                    style={{
                      padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <UserMinus size={12} /> Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
