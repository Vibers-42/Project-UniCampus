import { Link } from 'react-router-dom';
import { Users, Lock, MoreVertical, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function GroupCard({ group, onJoin, onLeave, isMember, isAdmin }) {
  const { user } = useAuth();

  const handleJoin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onJoin(group);
  };

  const handleLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLeave(group);
  };

  // Avatar component - emoji or initial in colored circle
  const GroupAvatar = () => (
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: 'rgb(var(--color-dark-800))', border: '1px solid rgb(var(--color-dark-700))',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0
    }}>
      {group.avatar || '🎓'}
    </div>
  );

  return (
    <div 
      style={{
        background: 'rgb(var(--color-dark-900) / 0.6)',
        border: '0.5px solid rgb(var(--color-dark-700) / 0.5)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      className="group hover:border-primary-500/30 hover:translate-y-[-2px]"
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <GroupAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(var(--color-dark-100))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.name}
            </h3>
            {group.isPrivate && <Lock size={12} style={{ color: 'rgb(var(--color-dark-500))' }} />}
            <span style={{ 
              fontSize: '10px', padding: '2px 8px', borderRadius: '20px', 
              background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '0.5px solid rgba(108,99,255,0.2)',
              textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.3px'
            }}>
              {group.category}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>
            {group.subject} • {group.department}
          </p>
        </div>
      </div>

      {/* Description */}
      <p style={{ 
        fontSize: '13px', color: 'rgb(var(--color-dark-300))', lineHeight: '1.5',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', height: '39px'
      }}>
        {group.description || 'No description provided.'}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-400))' }}>
          Year {group.year} • Sem {group.semester}
        </span>
        {group.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-500))' }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer: Member stats + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid rgb(var(--color-dark-800))', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {group.members?.slice(0, 3).map((m, i) => (
              <div key={m._id} style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'rgb(var(--color-dark-700))', border: '2px solid rgb(var(--color-dark-950))',
                marginLeft: i === 0 ? 0 : '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#fff', fontWeight: 600, overflow: 'hidden'
              }}>
                {m.avatar ? <img src={m.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (m.fullName?.charAt(0) || '?')}
              </div>
            ))}
            {group.members?.length > 3 && (
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'rgb(var(--color-dark-800))', border: '2px solid rgb(var(--color-dark-950))',
                marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', color: 'rgb(var(--color-dark-400))', fontWeight: 600
              }}>
                +{group.members.length - 3}
              </div>
            )}
          </div>
          <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))', fontWeight: 500 }}>
            {group.members?.length || 0}/{group.maxMembers}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isMember ? (
            <>
              <Link 
                to={`/groups/${group._id}`}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: '#6c63ff', color: '#fff', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                className="hover:bg-primary-600"
              >
                Open
              </Link>
              {!isAdmin && (
                <button 
                  onClick={handleLeave}
                  style={{
                    padding: '6px', borderRadius: '8px', background: 'transparent', 
                    border: '1px solid rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-400))',
                    cursor: 'pointer'
                  }}
                  title="Leave Group"
                >
                  <LogOut size={16} />
                </button>
              )}
              {isAdmin && (
                <button 
                  style={{
                    padding: '6px', borderRadius: '8px', background: 'transparent', 
                    border: '1px solid rgb(var(--color-dark-700))', color: 'rgb(var(--color-dark-400))',
                    cursor: 'pointer'
                  }}
                  title="Manage Group"
                >
                  <Settings size={16} />
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={handleJoin}
              style={{
                padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'transparent', color: '#6c63ff', border: '1.5px solid #6c63ff',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              className="hover:bg-primary-500 hover:text-white"
            >
              Join Group
            </button>
          )}
        </div>
      </div>

      {/* Overlay link for clicking body */}
      <Link 
        to={`/groups/${group._id}`} 
        style={{ position: 'absolute', inset: 0, zIndex: 0 }} 
        aria-hidden="true" 
      />
    </div>
  );
}
