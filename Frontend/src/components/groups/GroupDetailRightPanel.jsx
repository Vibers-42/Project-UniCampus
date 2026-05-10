import { useState } from 'react';
import { Users, BookOpen, Hash, Info, Copy, Pin, ExternalLink, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { USE_MOCK_DATA } from '../../mocks/groupsMockData';

const MOCK_CURRENT_USER_ID = 'user_001';

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  '#6c63ff','#f59e0b','#10b981','#3b82f6','#ec4899',
  '#8b5cf6','#14b8a6','#f97316','#06b6d4','#84cc16',
];
function avatarColor(id = '') {
  const sum = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Widget({ title, icon: Icon, children, action }) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      background: 'rgb(var(--color-dark-900) / 0.5)',
      border: '1px solid rgb(var(--color-dark-800))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} style={{ color: '#6c63ff' }} />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'rgb(var(--color-dark-200))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GroupDetailRightPanel({ group, threads = [], onSwitchTab }) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!group) return null;

  const isAdmin = group.admin?._id === MOCK_CURRENT_USER_ID;
  const onlineMembers = USE_MOCK_DATA ? group.members : [];
  const recentThreads = threads.slice(0, 3);

  // ── Copy join code ──
  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.joinCode || '');
    setCopiedCode(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* WIDGET 1 — Online Members */}
      <Widget
        title={`Online Members (${onlineMembers.length})`}
        icon={Users}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {onlineMembers.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-500))', textAlign: 'center', padding: '8px 0' }}>
              No members online
            </p>
          ) : onlineMembers.map(member => (
            <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: avatarColor(member._id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff',
                }}>
                  {initials(member.fullName)}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '9px', height: '9px', borderRadius: '50%',
                  background: '#00d4aa', border: '2px solid rgb(var(--color-dark-950))',
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '13px', fontWeight: 600,
                  color: member._id === MOCK_CURRENT_USER_ID ? '#6c63ff' : 'rgb(var(--color-dark-200))',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {member.fullName}{member._id === MOCK_CURRENT_USER_ID ? ' (You)' : ''}
                </p>
                {member._id === group.admin?._id && (
                  <p style={{ fontSize: '10px', color: '#6c63ff', fontWeight: 600 }}>Admin</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {/* WIDGET 2 — Pinned Resources */}
      <Widget
        title="Pinned Resources"
        icon={BookOpen}
        action={
          isAdmin ? (
            <button
              onClick={() => onSwitchTab && onSwitchTab('resources')}
              style={{
                fontSize: '11px', color: '#6c63ff', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: 600,
              }}
            >
              + Pin
            </button>
          ) : null
        }
      >
        {(!group.pinnedResources || group.pinnedResources.length === 0) ? (
          <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-500))', textAlign: 'center', padding: '8px 0' }}>
            No pinned resources yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {group.pinnedResources.map((res, i) => {
              const r = typeof res === 'object' ? res : { _id: res, title: 'Resource', subject: group.subject };
              return (
                <div key={r._id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-200))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.title}
                    </p>
                    <span style={{
                      fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                      background: 'rgba(108,99,255,0.1)', color: '#6c63ff',
                    }}>
                      {r.subject || group.subject}
                    </span>
                  </div>
                  {r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: '11px', color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }}>
                      Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Widget>

      {/* WIDGET 3 — Recent Threads */}
      <Widget
        title="Recent Threads"
        icon={Hash}
        action={
          <button
            onClick={() => onSwitchTab && onSwitchTab('threads')}
            style={{ fontSize: '11px', color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            View All
          </button>
        }
      >
        {recentThreads.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-500))', textAlign: 'center', padding: '8px 0' }}>
            No threads yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentThreads.map(thr => (
              <div
                key={thr._id}
                onClick={() => onSwitchTab && onSwitchTab('threads')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '8px', cursor: 'pointer', padding: '4px 0',
                  borderBottom: '1px solid rgb(var(--color-dark-800))',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {thr.isPinned && <Pin size={10} style={{ color: '#6c63ff', flexShrink: 0 }} />}
                    <p style={{
                      fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-200))',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {thr.title}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
                  background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-400))',
                  flexShrink: 0,
                }}>
                  {thr.messageCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {/* WIDGET 4 — Group Info */}
      <Widget title="Group Info" icon={Info}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Department', value: group.department },
            { label: 'Subject', value: group.subject },
            { label: 'Year / Sem', value: `Year ${group.year} · Sem ${group.semester}` },
            { label: 'Created', value: new Date(group.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-200))', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
            </div>
          ))}

          {/* Admin row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>Admin</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: avatarColor(group.admin?._id || ''),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 700, color: '#fff',
              }}>
                {initials(group.admin?.fullName || '')}
              </div>
              <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-200))', fontWeight: 600 }}>
                {group.admin?.fullName}
              </span>
            </div>
          </div>

          {/* Join Code (admin + private) */}
          {isAdmin && group.isPrivate && group.joinCode && (
            <div style={{
              marginTop: '4px', padding: '10px 12px', borderRadius: '10px',
              background: 'rgb(var(--color-dark-800) / 0.6)',
              border: '1px solid rgba(108,99,255,0.2)',
            }}>
              <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-500))', marginBottom: '6px' }}>Join Code</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: '18px', fontWeight: 800,
                  letterSpacing: '4px', color: '#6c63ff',
                }}>
                  {group.joinCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px',
                    background: copiedCode ? '#10b981' : 'rgba(108,99,255,0.15)',
                    color: copiedCode ? '#fff' : '#6c63ff',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px', transition: '0.2s',
                  }}
                >
                  <Copy size={12} />
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Widget>

    </div>
  );
}
