import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGroups } from '../../api/group.api';

export default function GroupRightPanel() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await getGroups({ sort: 'popular', limit: 3 });
        setTrending(res.data?.data?.items || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    loadTrending();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Quick Stats */}
      <div style={{ 
        padding: '20px', borderRadius: '20px', 
        background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)',
        color: '#fff', boxShadow: '0 8px 24px rgba(108,99,255,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldCheck size={20} />
          <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Group Activity</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>
            <p style={{ fontSize: '20px', fontWeight: 800 }}>{trending.length}</p>
            <p style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>Active Groups</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}>
            <p style={{ fontSize: '20px', fontWeight: 800 }}>{trending.reduce((s, g) => s + (g.members?.length || 0), 0)}</p>
            <p style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>Total Members</p>
          </div>
        </div>
      </div>

      {/* Trending Groups */}
      <div style={{ 
        padding: '20px', borderRadius: '20px', 
        background: 'rgb(var(--color-dark-900) / 0.5)',
        border: '1px solid rgb(var(--color-dark-800))'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <TrendingUp size={18} style={{ color: '#6c63ff' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'rgb(var(--color-dark-100))' }}>Trending Groups</h3>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '48px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trending.map(group => (
              <Link key={group._id} to={`/study-groups/${group._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '10px', 
                  background: 'rgb(var(--color-dark-800))', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                }}>
                  {group.avatar || '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: '13px', fontWeight: 600, color: 'rgb(var(--color-dark-200))',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {group.name}
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-500))' }}>
                    {group.members?.length || 0} members • {group.category || 'study'}
                  </p>
                </div>
                <Zap size={14} style={{ color: '#fb923c', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>No groups yet. Create one!</p>
        )}
      </div>

      {/* Suggested Topics */}
      <div style={{ 
        padding: '20px', borderRadius: '20px', 
        background: 'rgb(var(--color-dark-900) / 0.5)',
        border: '1px solid rgb(var(--color-dark-800))'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'rgb(var(--color-dark-100))', marginBottom: '12px' }}>Popular Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['dsa', 'machine-learning', 'react', 'exams', 'hackathon', 'python'].map(tag => (
            <span key={tag} style={{ 
              fontSize: '11px', padding: '4px 10px', borderRadius: '20px', 
              background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-400))',
              border: '1px solid rgb(var(--color-dark-700))', cursor: 'pointer'
            }} className="hover:border-primary-500/50 hover:text-primary-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
