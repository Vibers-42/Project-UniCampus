import { useState, useEffect, useCallback } from 'react';
import { Flame, TrendingUp, Activity, Trophy, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatCountdown(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return 'Ongoing';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CATEGORY_COLORS = {
  hackathon: 'text-orange-400 bg-orange-400/10',
  workshop: 'text-blue-400 bg-blue-400/10',
  seminar: 'text-purple-400 bg-purple-400/10',
  cultural: 'text-pink-400 bg-pink-400/10',
  sports: 'text-green-400 bg-green-400/10',
  club: 'text-yellow-400 bg-yellow-400/10',
  meetup: 'text-cyan-400 bg-cyan-400/10',
  other: 'text-dark-400 bg-dark-400/10',
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {category}
    </span>
  );
}

// ─── Stat Row ───────────────────────────────────────────────────────────────
function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-dark-400">{label}</span>
      <span className="text-xs font-semibold text-dark-100">{value}</span>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonBlock({ h = 'h-4', w = 'w-full', mb = '' }) {
  return <div className={`${h} ${w} ${mb} bg-dark-800/60 rounded animate-pulse`} />;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function EventSidebar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/events/sidebar-data');
      setData(res.data.data);
    } catch (err) {
      console.error('[EventSidebar] Failed to load sidebar data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Countdown tick — every 60s, only update state if component still mounted
  useEffect(() => {
    if (!data?.upcoming?.length) return;
    const tick = () => {
      const next = {};
      data.upcoming.forEach(({ event }) => {
        if (event?._id) next[event._id] = formatCountdown(event.startDate);
      });
      setCountdown(next);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [data]);

  const engagementBadgeColor = {
    Newcomer: 'text-dark-400',
    Explorer: 'text-blue-400',
    'Rising Star': 'text-yellow-400',
    'Active Participant': 'text-primary-400',
    'Campus Leader': 'text-orange-400',
  };

  return (
    <div className="space-y-4">
      {/* ── 1. Your Event Stats ── */}
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Trophy size={13} className="text-yellow-400" /> Your Event Stats
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-4" />)}
          </div>
        ) : (
          <div className="divide-y divide-dark-800/60">
            <StatRow label="Events Joined" value={data?.stats?.eventsJoined ?? 0} />
            <StatRow label="Workshops Attended" value={data?.stats?.workshopsAttended ?? 0} />
            <StatRow label="Hackathons" value={data?.stats?.hackathonsParticipated ?? 0} />
            <StatRow label="Certificates" value={data?.stats?.certificatesEarned ?? 0} />
          </div>
        )}
        {!loading && (
          <div className="mt-3 pt-2 border-t border-dark-800/60 flex items-center gap-2">
            <span className="text-[10px] text-dark-500">Engagement Level</span>
            <span className={`text-[11px] font-bold ${engagementBadgeColor[data?.stats?.engagementLevel] || 'text-dark-400'}`}>
              {data?.stats?.engagementLevel || 'Newcomer'}
            </span>
          </div>
        )}
      </div>

      {/* ── 2. Upcoming Events ── */}
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={13} className="text-primary-400" /> Upcoming Events
          </h3>
          <Link to="/events" className="text-[10px] text-primary-400 hover:text-primary-300 transition-colors">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonBlock h="h-3.5" w="w-3/4" />
                <SkeletonBlock h="h-3" w="w-1/2" />
              </div>
            ))}
          </div>
        ) : !data?.upcoming?.length ? (
          <p className="text-xs text-dark-500 py-2">No registered upcoming events.</p>
        ) : (
          <div className="space-y-3">
            {data.upcoming.map(({ event, status }) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="block group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <CategoryBadge category={event.category} />
                      <span className="text-[10px] text-dark-500 flex items-center gap-1">
                        <Users size={10} /> {event.registeredCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                      {countdown[event._id] || formatCountdown(event.startDate)}
                    </span>
                    <p className="text-[9px] text-dark-500 mt-1 capitalize">{status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Trending This Week ── */}
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={13} className="text-orange-400" /> Trending This Week
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonBlock h="h-3.5" w="w-3/4" />
                <SkeletonBlock h="h-3" w="w-2/5" />
              </div>
            ))}
          </div>
        ) : !data?.trending?.length ? (
          <p className="text-xs text-dark-500 py-2">No trending events yet.</p>
        ) : (
          <div className="space-y-3">
            {data.trending.map((item, idx) => (
              <Link key={item.eventId} to={`/events/${item.eventId}`} className="block group">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black w-5 text-center ${idx === 0 ? 'text-orange-400' : idx === 1 ? 'text-dark-400' : 'text-dark-600'}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={item.category} />
                      <span className="text-[10px] text-dark-500">
                        +{item.weeklyCount} this week
                      </span>
                    </div>
                  </div>
                  {idx === 0 && <Flame size={14} className="text-orange-400 flex-shrink-0" />}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Campus Pulse ── */}
      <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-4 backdrop-blur-sm">
        <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={13} className="text-green-400" /> Campus Pulse
        </h3>
        {loading ? (
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-3.5" />)}
          </div>
        ) : !data?.pulse?.length ? (
          <p className="text-xs text-dark-500 py-2">No recent campus activity.</p>
        ) : (
          <div className="space-y-2.5">
            {data.pulse.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                <p className="text-[11px] text-dark-400 leading-relaxed">
                  <span className="text-dark-200 font-medium">{item.user}</span>{' '}
                  {item.action}{' '}
                  <span className="text-primary-400">{item.event}</span>
                  <span className="text-dark-600 ml-1">· {timeAgo(item.time)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
