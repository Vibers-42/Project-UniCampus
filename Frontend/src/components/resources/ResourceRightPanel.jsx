import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, TrendingUp, Bookmark, Users, Filter, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';
import ResourceCard from './ResourceCard';

const QUICK_FILTERS = [
  { label: 'My Department', key: 'department', getValue: (user) => user?.department || '' },
  { label: 'My Semester', key: 'semester', getValue: (user) => user?.yearOfStudy ? String((user.yearOfStudy - 1) * 2 + 1) : '' },
  { label: 'PYQ Only', key: 'category', getValue: () => 'pyq' },
  { label: 'Lab Manuals', key: 'category', getValue: () => 'lab-manual' },
];

export default function ResourceRightPanel({ onQuickFilter, activeFilters = {} }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [myStats, setMyStats] = useState({ uploads: 0, downloads: 0 });

  useEffect(() => {
    // Fetch trending resources
    const loadTrending = async () => {
      setTrendingLoading(true);
      try {
        const res = await getResources({ sort: 'most-downloaded', limit: 3 });
        setTrending(res.data?.data?.items || []);
      } catch { /* silent */ }
      finally { setTrendingLoading(false); }
    };

    // Fetch user stats
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
    <div className="space-y-4">
      {/* Your Activity */}
      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-bold text-sm mb-4 flex items-center gap-2">
          <Star size={14} className="text-primary-400" />Your Activity
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-100 font-bold text-xl">{myStats.uploads}</p>
            <p className="text-dark-500 text-xs mt-0.5">Uploads</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-3 text-center">
            <p className="text-dark-100 font-bold text-xl">{myStats.downloads}</p>
            <p className="text-dark-500 text-xs mt-0.5">Downloads</p>
          </div>
        </div>
        <Link to="/resources?tab=my-uploads"
          className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1">
          View my uploads →
        </Link>
      </div>

      {/* Quick Filters */}
      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-bold text-sm mb-3 flex items-center gap-2">
          <Filter size={14} className="text-primary-400" />Quick Filters
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(qf => {
            const value = qf.getValue(user);
            const active = isFilterActive(qf.key, value);
            return (
              <button key={qf.label}
                onClick={() => onQuickFilter && onQuickFilter(qf.key, active ? '' : value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  active
                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                    : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-600'
                }`}>
                {qf.label}
              </button>
            );
          })}
          <button
            onClick={() => onQuickFilter && onQuickFilter('tab', 'bookmarked')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeFilters.tab === 'bookmarked'
                ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-300'
                : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-dark-200 hover:border-dark-600'
            }`}>
            <Bookmark size={10} className="inline mr-1" />Bookmarked
          </button>
        </div>
      </div>

      {/* Trending This Week */}
      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-primary-400" />Trending This Week
        </h3>
        {trendingLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 bg-dark-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : trending.length > 0 ? (
          <div className="space-y-2">
            {trending.map(r => (
              <ResourceCard key={r._id} resource={r} compact />
            ))}
          </div>
        ) : (
          <p className="text-dark-500 text-xs">No trending resources yet.</p>
        )}
      </div>
    </div>
  );
}
