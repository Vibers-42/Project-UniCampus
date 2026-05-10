import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Filter, TrendingUp, Download, Bookmark, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';
import ResourceCard from './ResourceCard';

const QUICK_FILTERS = [
  { label: 'My Department', key: 'department', getValue: (user) => user?.department || '' },
  { label: 'My Semester', key: 'semester', getValue: (user) => user?.yearOfStudy ? String((user.yearOfStudy - 1) * 2 + 1) : '' },
  { label: 'PYQ Only', key: 'category', getValue: () => 'pyq' },
  { label: 'Lab Manuals', key: 'category', getValue: () => 'lab-manual' },
];

/* ── Tiny section header ── */
function PanelSection({ icon: Icon, label, children }) {
  return (
    <div
      style={{
        background: 'rgb(var(--color-dark-900) / 0.5)',
        border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3
        style={{
          fontSize: '10px',
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
        {Icon && <Icon size={12} style={{ color: 'rgb(var(--color-primary-400))' }} />}
        {label}
      </h3>
      {children}
    </div>
  );
}

export default function ResourceRightPanel({ onQuickFilter, activeFilters = {} }) {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [myStats, setMyStats] = useState({ uploads: 0, downloads: 0 });

  useEffect(() => {
    const loadTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await getResources({ sort: 'most-downloaded', limit: 3 });
        setTrending(res.data?.data?.items || []);
      } catch { /* silent */ }
      finally { setTrendingLoading(false); }
    };

    const loadMyStats = async () => {
      if (!user) return;
      try {
        const res = await getResources({ uploadedBy: user._id, limit: 100 });
        const items = res.data?.data?.items || [];
        const totalDownloads = items.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
        setMyStats({ uploads: items.length, downloads: totalDownloads });
      } catch { /* silent */ }
    };

    loadTrending();
    loadMyStats();
  }, [user]);

  const isFilterActive = (key, value) => activeFilters[key] === value;

  return (
    <>
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
              <p style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--color-primary-400))', lineHeight: 1 }}>
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
            color: 'rgb(var(--color-primary-400))',
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
                  fontWeight: 500,
                  border: active
                    ? '0.5px solid rgb(var(--color-primary-500) / 0.5)'
                    : '0.5px solid rgb(var(--color-dark-700) / 0.6)',
                  background: active
                    ? 'rgb(var(--color-primary-500) / 0.15)'
                    : 'rgb(var(--color-dark-800) / 0.5)',
                  color: active
                    ? 'rgb(var(--color-primary-300))'
                    : 'rgb(var(--color-dark-400))',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                className="hover:border-primary-500/40 hover:text-dark-200"
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
              fontWeight: 500,
              border: activeFilters.tab === 'bookmarked'
                ? '0.5px solid rgb(234 179 8 / 0.4)'
                : '0.5px solid rgb(var(--color-dark-700) / 0.6)',
              background: activeFilters.tab === 'bookmarked'
                ? 'rgb(234 179 8 / 0.1)'
                : 'rgb(var(--color-dark-800) / 0.5)',
              color: activeFilters.tab === 'bookmarked'
                ? 'rgb(253 224 71)'
                : 'rgb(var(--color-dark-400))',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Bookmark size={10} />Bookmarked
          </button>
        </div>
      </PanelSection>

      {/* ── Trending This Week ── */}
      <PanelSection icon={TrendingUp} label="Trending This Week">
        {trendingLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  height: '52px',
                  borderRadius: '10px',
                  background: 'rgb(var(--color-dark-800) / 0.5)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trending.map(r => (
              <Link
                key={r._id}
                to={`/resources/${r._id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: 'rgb(var(--color-dark-800) / 0.4)',
                  border: '0.5px solid rgb(var(--color-dark-700) / 0.4)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                className="hover:border-primary-500/30 hover:bg-dark-800 group"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgb(var(--color-primary-500) / 0.1)',
                    border: '0.5px solid rgb(var(--color-primary-500) / 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Star size={14} style={{ color: 'rgb(var(--color-primary-400))' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'rgb(var(--color-dark-200))',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    className="group-hover:text-primary-300 transition-colors"
                  >
                    {r.title}
                  </p>
                  {r.subject && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '20px',
                        background: 'rgb(var(--color-primary-500) / 0.08)',
                        color: 'rgb(var(--color-primary-400))',
                        display: 'inline-block',
                        marginTop: '2px',
                      }}
                    >
                      {r.subject}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <Download size={10} style={{ color: 'rgb(var(--color-dark-500))' }} />
                  <span style={{ fontSize: '11px', color: 'rgb(var(--color-dark-500))' }}>
                    {r.downloadCount || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-500))' }}>No trending resources yet.</p>
        )}
      </PanelSection>
    </>
  );
}
