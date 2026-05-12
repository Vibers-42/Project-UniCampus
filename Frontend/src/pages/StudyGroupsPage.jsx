import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Loader2, Users, Compass, Star, TrendingUp, BookOpen } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import JoinPrivateGroupModal from '../components/groups/JoinPrivateGroupModal';
import GroupRightPanel from '../components/groups/GroupRightPanel';
import { useAuth } from '../contexts/AuthContext';
import { getGroups, joinGroup, leaveGroup } from '../api/group.api';
import toast from 'react-hot-toast';



const CATEGORIES = ['all', 'study', 'project', 'hackathon', 'research', 'general'];
const TABS = [
  { key: 'all', label: 'All Groups', icon: Compass },
  { key: 'my-groups', label: 'My Groups', icon: Star },
  { key: 'joined', label: 'Joined Groups', icon: Users },
];

export default function StudyGroupsPage() {
  const { user } = useAuth();
  
  /* ── State ── */
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef(null);
  
  /* ── Modals ── */
  const [createOpen, setCreateOpen] = useState(false);
  const [joinPrivateGroup, setJoinPrivateGroup] = useState(null);

  /* ── Fetching ── */
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGroups({
        search: debouncedSearch,
        category: activeCategory,
        tab: activeTab
      });
      setGroups(res.data?.data?.items || []);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategory, activeTab]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Debounce search input — wait 400ms after user stops typing
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  };

  /* ── Handlers ── */
  const handleJoinClick = async (group) => {
    if (group.isPrivate) {
      setJoinPrivateGroup(group);
      return;
    }

    try {
      await joinGroup(group._id);
      toast.success(`Joined ${group.name}!`);
      fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to join group');
    }
  };

  const handleLeaveClick = async (group) => {
    if (!window.confirm(`Are you sure you want to leave ${group.name}?`)) return;
    
    try {
      await leaveGroup(group._id);
      toast.success(`Left ${group.name}`);
      fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to leave group');
    }
  };

  const handleJoinPrivate = async (groupId, code) => {
    // In real app, call joinGroup(groupId, code)
    toast.success('Successfully joined private group!');
    fetchGroups();
  };

  const rightPanel = <GroupRightPanel />;

  return (
    <DashboardLayout rightContent={rightPanel}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '28px', borderRadius: '3px', background: 'linear-gradient(180deg, #6c63ff, #5a52d5)', flexShrink: 0 }} />
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--color-dark-100))', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Study Groups
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', marginLeft: '13px' }}>
            Collaborate, share resources, and learn together with your peers
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            background: '#6c63ff', color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108,99,255,0.25)', transition: 'all 0.2s ease'
          }}
          className="hover:scale-105"
        >
          <Plus size={16} strokeWidth={2.5} /> Create New Group
        </button>
      </div>

      {/* Search + Filter Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgb(var(--color-dark-500))' }} size={20} />
          <input 
            value={search}
            onChange={handleSearchChange}
            placeholder="Search groups by name, subject, or tags..."
            style={{ 
              width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px', 
              background: 'rgb(var(--color-dark-900) / 0.5)', border: '1px solid rgb(var(--color-dark-800))',
              color: '#fff', outline: 'none'
            }}
          />
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                background: activeCategory === cat ? 'rgba(108,99,255,0.1)' : 'transparent',
                color: activeCategory === cat ? '#6c63ff' : 'rgb(var(--color-dark-400))',
                border: activeCategory === cat ? '1px solid #6c63ff' : '1px solid rgb(var(--color-dark-700))',
                cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', borderBottom: '1px solid rgb(var(--color-dark-800))', paddingBottom: '12px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '4px 8px', position: 'relative', background: 'none', border: 'none',
                color: active ? '#6c63ff' : 'rgb(var(--color-dark-500))',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: '0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
              {active && <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: '#6c63ff', borderRadius: '2px' }} />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <Loader2 size={32} style={{ color: '#6c63ff' }} className="animate-spin" />
          <p style={{ color: 'rgb(var(--color-dark-400))', fontSize: '14px' }}>Finding amazing groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {groups.map(g => {
            const isMember = g.members.some(m => m._id === user?._id);
            const isAdmin = g.admin?._id === user?._id;
            return (
              <GroupCard 
                key={g._id} 
                group={g} 
                isMember={isMember}
                isAdmin={isAdmin}
                onJoin={handleJoinClick}
                onLeave={handleLeaveClick}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          padding: '80px 24px', textAlign: 'center', background: 'rgb(var(--color-dark-900) / 0.3)',
          borderRadius: '24px', border: '1px dashed rgb(var(--color-dark-800))'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <BookOpen size={30} style={{ color: 'rgb(var(--color-dark-500))' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgb(var(--color-dark-200))', marginBottom: '8px' }}>No groups found</h3>
          <p style={{ fontSize: '14px', color: 'rgb(var(--color-dark-500))', maxWidth: '300px', lineHeight: '1.6' }}>
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal 
        isOpen={createOpen} 
        onClose={() => setCreateOpen(false)} 
        onSuccess={() => { setCreateOpen(false); fetchGroups(); }}
      />
      <JoinPrivateGroupModal 
        isOpen={!!joinPrivateGroup} 
        group={joinPrivateGroup}
        onClose={() => setJoinPrivateGroup(null)}
        onJoin={handleJoinPrivate}
      />
    </DashboardLayout>
  );
}
