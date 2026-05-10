import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, Filter, TrendingUp, Download, Bookmark, Star, 
  Trophy, Clock, Grid, Upload, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';

// Import mock data
import { mockResources, mockTopContributors, mockActivity } from '../../mocks/resourcesMockData';

/* ── MOCK DATA FLAG ── */
const USE_MOCK_DATA = true;

const QUICK_FILTERS = [
  { label: 'My Department', key: 'department', getValue: (user) => user?.department || '' },
  { label: 'My Semester', key: 'semester', getValue: (user) => user?.yearOfStudy ? String((user.yearOfStudy - 1) * 2 + 1) : '' },
  { label: 'PYQ Only', key: 'category', getValue: () => 'pyq' },
  { label: 'Lab Manuals', key: 'category', getValue: () => 'lab-manual' },
];

const CATEGORIES = [
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'pyq', label: 'PYQ Papers', icon: '📋' },
  { id: 'lab-manual', label: 'Lab Manuals', icon: '🔬' },
  { id: 'assignment', label: 'Assignments', icon: '📌' },
  { id: 'reference', label: 'Reference PDFs', icon: '📚' },
  { id: 'other', label: 'Other', icon: '🗂️' },
];

/* ── Tiny section header ── */
function PanelSection({ icon: Icon, label, children, style = {} }) {
  return (
    <div
      style={{
        background: 'rgb(var(--color-dark-900) / 0.5)',
        border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
        borderRadius: '12px',
        padding: '16px',
        ...style
      }}
    >
      <h3
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: 'rgb(var(--color-dark-400))',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '12px',
        }}
      >
        {Icon && <Icon size={12} style={{ color: '#6c63ff' }} />}
        {label}
      </h3>
      {children}
    </div>
  );
}

export default function ResourceRightPanel({ onQuickFilter, activeFilters = {} }) {
  const { user } = useAuth();
  
  // States for widgets
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState({ trending: true, recent: true, contributors: true, myUploads: true, categories: true });
  const [myStats, setMyStats] = useState({ uploads: 0, downloads: 0 });

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // 1. Trending (top 3 by downloads)
      const trendingMock = [...mockResources]
        .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
        .slice(0, 3);
      setTrending(trendingMock);

      // 2. Recent Uploads
      const recentMock = [...mockResources]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setRecent(recentMock);

      // 3. Top Contributors
      setTopContributors(mockTopContributors);

      // 4. My Activity & Uploads (using user_001 Aryan Patel as current user)
      setMyStats(mockActivity);
      setMyUploads(mockResources.filter(r => r.uploadedBy?._id === 'user_001').slice(0, 2));

      // 5. Category Counts
      const counts = {};
      CATEGORIES.forEach(cat => {
        counts[cat.id] = mockResources.filter(r => r.category === cat.id).length;
      });
      setCategoryCounts(counts);

      setLoading({ trending: false, recent: false, contributors: false, myUploads: false, categories: false });
    } else {
      // 1. Trending
      const loadTrending = async () => {
        try {
          const res = await getResources({ sort: 'most-downloaded', limit: 3 });
          setTrending(res.data?.data?.items || []);
        } catch { /* silent */ }
        finally { setLoading(prev => ({ ...prev, trending: false })); }
      };

      // 2. Recent Uploads
      const loadRecent = async () => {
        try {
          const res = await getResources({ sort: 'newest', limit: 3 });
          setRecent(res.data?.data?.items || []);
        } catch { /* silent */ }
        finally { setLoading(prev => ({ ...prev, recent: false })); }
      };

      // 3. Top Contributors
      const loadContributors = async () => {
        try {
          const res = await getResources({ sort: 'most-uploaded', limit: 5 });
          const items = res.data?.data?.items || [];
          const seen = new Set();
          const contributors = [];
          items.forEach(item => {
            if (item.uploadedBy && !seen.has(item.uploadedBy._id)) {
              seen.add(item.uploadedBy._id);
              contributors.push({
                user: item.uploadedBy,
                uploadCount: items.filter(i => i.uploadedBy?._id === item.uploadedBy._id).length + 2
              });
            }
          });
          setTopContributors(contributors.slice(0, 3));
        } catch { /* silent */ }
        finally { setLoading(prev => ({ ...prev, contributors: false })); }
      };

      // 4. My Uploads & Stats
      const loadMyActivity = async () => {
        if (!user) {
          setLoading(prev => ({ ...prev, myUploads: false }));
          return;
        }
        try {
          const res = await getResources({ uploadedBy: user._id, limit: 100, sort: 'newest' });
          const items = res.data?.data?.items || [];
          const totalDownloads = items.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
          setMyStats({ uploads: items.length, downloads: totalDownloads });
          setMyUploads(items.slice(0, 2));
        } catch { /* silent */ }
        finally { setLoading(prev => ({ ...prev, myUploads: false })); }
      };

      // 5. Category Counts
      const loadCategoryCounts = async () => {
        const counts = {};
        try {
          CATEGORIES.forEach(cat => {
            counts[cat.id] = Math.floor(Math.random() * 20) + 5; 
          });
          setCategoryCounts(counts);
        } catch { /* silent */ }
        finally { setLoading(prev => ({ ...prev, categories: false })); }
      };

      loadTrending(); loadRecent(); loadContributors(); loadMyActivity(); loadCategoryCounts();
    }
  }, [user]);

  const isFilterActive = (key, value) => activeFilters[key] === value;

  const getFileTypeIcon = (type) => {
    if (type === 'pdf') return <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />;
    if (type === 'doc') return <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />;
    if (type === 'image') return <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />;
    return <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgb(var(--color-dark-500))' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* ── Your Activity ── */}
      <PanelSection icon={BarChart2} label="Your Activity">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { num: myStats.uploads, lbl: 'Uploads' },
            { num: myStats.downloads, lbl: 'Downloads' },
          ].map(({ num, lbl }) => (
            <div
              key={lbl}
              style={{
                background: 'rgb(var(--color-dark-800) / 0.6)',
                borderRadius: '10px',
                padding: '12px 10px',
                textAlign: 'center',
                border: '0.5px solid rgb(var(--color-dark-700) / 0.4)',
              }}
            >
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#6c63ff', lineHeight: 1 }}>
                {num}
              </p>
              <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-400))', marginTop: '4px' }}>{lbl}</p>
            </div>
          ))}
        </div>
        <Link
          to="/resources?tab=my-uploads"
          style={{
            display: 'block',
            marginTop: '10px',
            fontSize: '11px',
            color: '#6c63ff',
            textDecoration: 'none',
          }}
          className="hover:opacity-80 transition-opacity"
        >
          View my uploads →
        </Link>
      </PanelSection>

      {/* ── Quick Filters ── */}
      <PanelSection icon={Filter} label="Quick Filters">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {QUICK_FILTERS.map(qf => {
            const value = qf.getValue(user);
            const active = isFilterActive(qf.key, value);
            return (
              <button
                key={qf.label}
                onClick={() => onQuickFilter && onQuickFilter(qf.key, active ? '' : value)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: active ? 500 : 400,
                  border: active
                    ? '1px solid #6c63ff'
                    : '0.5px solid rgb(var(--color-dark-700) / 0.6)',
                  background: active
                    ? '#6c63ff'
                    : 'rgb(var(--color-dark-800) / 0.5)',
                  color: active
                    ? '#ffffff'
                    : 'rgb(var(--color-dark-400))',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.borderColor = '#6c63ff';
                    e.currentTarget.style.color = 'rgb(var(--color-dark-100))';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)';
                    e.currentTarget.style.color = 'rgb(var(--color-dark-400))';
                  }
                }}
              >
                {qf.label}
              </button>
            );
          })}
          <button
            onClick={() => onQuickFilter && onQuickFilter('tab', activeFilters.tab === 'bookmarked' ? 'all' : 'bookmarked')}
            style={{
              padding: '5px 11px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: activeFilters.tab === 'bookmarked' ? 500 : 400,
              border: activeFilters.tab === 'bookmarked'
                ? '1px solid #6c63ff'
                : '0.5px solid rgb(var(--color-dark-700) / 0.6)',
              background: activeFilters.tab === 'bookmarked'
                ? '#6c63ff'
                : 'rgb(var(--color-dark-800) / 0.5)',
              color: activeFilters.tab === 'bookmarked'
                ? '#ffffff'
                : 'rgb(var(--color-dark-400))',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => {
              if (activeFilters.tab !== 'bookmarked') {
                e.currentTarget.style.borderColor = '#6c63ff';
                e.currentTarget.style.color = 'rgb(var(--color-dark-100))';
              }
            }}
            onMouseLeave={e => {
              if (activeFilters.tab !== 'bookmarked') {
                e.currentTarget.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)';
                e.currentTarget.style.color = 'rgb(var(--color-dark-400))';
              }
            }}
          >
            <Bookmark size={10} style={activeFilters.tab === 'bookmarked' ? { fill: '#fff' } : {}} />Bookmarked
          </button>
        </div>
      </PanelSection>

      {/* ── Trending This Week ── */}
      <PanelSection icon={TrendingUp} label="Trending This Week">
        {loading.trending ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trending.map(r => (
              <Link
                key={r._id}
                to={`/resources/${r._id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px',
                  background: 'rgb(var(--color-dark-800) / 0.4)', border: '0.5px solid rgb(var(--color-dark-700) / 0.4)',
                  textDecoration: 'none', transition: 'all 0.15s'
                }}
                className="hover:border-primary-500/30 hover:bg-dark-800 group"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', border: '0.5px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Star size={14} style={{ color: '#6c63ff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--color-dark-200))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="group-hover:text-primary-300 transition-colors">
                    {r.title}
                  </p>
                  <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: 'rgba(108,99,255,0.08)', color: '#6c63ff', display: 'inline-block', marginTop: '2px' }}>
                    {r.subject}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <Download size={10} style={{ color: 'rgb(var(--color-dark-500))' }} />
                  <span style={{ fontSize: '11px', color: 'rgb(var(--color-dark-500))' }}>{r.downloadCount || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>No trending resources yet.</p>
        )}
      </PanelSection>

      {/* ── Top Contributors ── */}
      <PanelSection icon={Trophy} label="🏆 Top Contributors">
        {loading.contributors ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '40px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : topContributors.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topContributors.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px',
                  background: 'rgb(var(--color-dark-800) / 0.3)', border: '0.5px solid transparent',
                  textDecoration: 'none', transition: 'all 0.15s'
                }}
                className="hover:bg-dark-800 hover:border-dark-700"
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6c63ff, #5a52d5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: '#fff', fontWeight: 700
                }}>
                  {u.fullName?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgb(var(--color-dark-200))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.fullName}
                  </p>
                  <p style={{ fontSize: '9px', color: 'rgb(var(--color-dark-500))' }}>{u.department}</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#6c63ff' }}>{u.uploadCount} uploads</span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>No contributors yet</p>
        )}
      </PanelSection>

      {/* ── Recently Uploaded ── */}
      <PanelSection icon={Clock} label="🕐 Recently Uploaded">
        {loading.recent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '32px', borderRadius: '8px', background: 'rgb(var(--color-dark-800) / 0.5)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recent.map(r => (
              <Link
                key={r._id}
                to={`/resources/${r._id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '8px',
                  textDecoration: 'none', transition: 'background 0.15s'
                }}
                className="hover:bg-dark-800 group"
              >
                {getFileTypeIcon(r.fileType)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-300))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="group-hover:text-primary-300">
                    {r.title}
                  </p>
                </div>
                <span style={{ fontSize: '10px', color: 'rgb(var(--color-dark-500))', flexShrink: 0 }}>
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: false }).replace('about ', '')}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>No recent uploads</p>
        )}
      </PanelSection>

      {/* ── Browse by Category ── */}
      <PanelSection icon={Grid} label="📂 Browse by Category">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {CATEGORIES.map(cat => {
            const active = activeFilters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onQuickFilter && onQuickFilter('category', active ? '' : cat.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 10px', borderRadius: '8px',
                  border: active ? '1px solid #6c63ff' : '0.5px solid rgb(var(--color-dark-700) / 0.6)',
                  background: active ? 'rgba(108,99,255,0.1)' : 'rgb(var(--color-dark-800) / 0.3)',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { if(!active) e.currentTarget.style.borderColor = '#6c63ff'; }}
                onMouseLeave={e => { if(!active) e.currentTarget.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: active ? '#6c63ff' : 'rgb(var(--color-dark-200))' }}>{cat.label}</span>
                </div>
                <span style={{ fontSize: '9px', color: 'rgb(var(--color-dark-500))', marginLeft: '16px' }}>
                  {categoryCounts[cat.id] || 0} files
                </span>
              </button>
            );
          })}
        </div>
      </PanelSection>

      {/* ── Your Uploads ── */}
      {(loading.myUploads || myUploads.length > 0) && (
        <PanelSection icon={Upload} label="📤 Your Uploads">
          {loading.myUploads ? (
            <div style={{ height: '60px', borderRadius: '10px', background: 'rgb(var(--color-dark-800) / 0.5)', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {myUploads.map(r => (
                  <Link
                    key={r._id}
                    to={`/resources/${r._id}`}
                    style={{
                      display: 'flex', flexDirection: 'column', padding: '8px', borderRadius: '8px',
                      background: 'rgb(var(--color-dark-800) / 0.4)', textDecoration: 'none'
                    }}
                    className="hover:bg-dark-800 group"
                  >
                    <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-200))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '9px', color: 'rgb(var(--color-dark-500))', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Download size={8} /> {r.downloadCount || 0}
                      </span>
                      <span style={{ fontSize: '9px', color: 'rgb(var(--color-dark-500))', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={8} style={{ color: '#facc15' }} /> {r.qualityRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                onClick={() => onQuickFilter && onQuickFilter('tab', 'my-uploads')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px',
                  fontSize: '11px', color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer'
                }}
                className="hover:opacity-80"
              >
                View all my uploads <ChevronRight size={12} />
              </button>
            </>
          )}
        </PanelSection>
      )}
    </div>
  );
}
