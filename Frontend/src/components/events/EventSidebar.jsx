import { useState, useEffect, useCallback } from 'react';
import { Flame, TrendingUp, Trophy, Calendar, Users, Sparkles, Plus, Check, ClipboardList } from 'lucide-react';
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

  const handleRSVP = async (e, eventId, status) => {
    e.preventDefault();
    try {
      await api.post(`/events/${eventId}/rsvp`, { status });
      fetchData(); // Refresh sidebar data immediately to show updated stats/lists
    } catch (err) {
      console.error('[EventSidebar] RSVP failed', err);
    }
  };

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
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto overflow-x-hidden hide-scrollbar">
      <div className="p-6">
        {/* ── 1. Your Event Stats ── */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.1)]">
            <Trophy size={14} className="text-yellow-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-200">Your Event Stats</h3>
        </div>
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
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400/20 to-primary-600/10 border border-primary-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(92,124,250,0.1)]">
              <Calendar size={14} className="text-primary-400" />
            </div>
            <h3 className="text-sm font-semibold text-dark-200">Upcoming Events</h3>
          </div>
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
          <div className="space-y-4">
            {data.upcoming.map(({ event, status }) => (
              <Link key={event._id} to={`/events/${event._id}`} className="flex gap-3 group cursor-pointer block">
                <div className="w-10 h-10 rounded-xl bg-dark-800 flex flex-col items-center justify-center border border-dark-700/50 group-hover:border-primary-500/30 transition-colors">
                  <span className="text-[10px] text-dark-400 font-medium uppercase">{countdown[event._id] || formatCountdown(event.startDate)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">{event.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                      <CategoryBadge category={event.category} />
                    </div>
                    <span className="text-[10px] text-dark-500 capitalize">{status}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Recommended For You ── */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-200">Recommended For You</h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonBlock h="h-10" w="w-full" />
              </div>
            ))}
          </div>
        ) : !data?.recommended?.length ? (
          <p className="text-xs text-dark-500 py-2">Keep exploring events for recommendations!</p>
        ) : (
          <div className="space-y-4">
            {data.recommended.map((event) => (
              <Link key={event._id} to={`/events/${event._id}`} className="block group bg-dark-800/40 rounded-xl p-3 border border-dark-700/50 hover:border-primary-500/30 transition-colors">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800">
                    <img src={event.bannerUrl || 'https://via.placeholder.com/150'} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">{event.title}</h4>
                    <p className="text-[10px] text-dark-500 truncate mb-2">{event.reason}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => handleRSVP(e, event._id, 'registered')} className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1">
                        <Check size={12} /> RSVP
                      </button>
                      <button onClick={(e) => handleRSVP(e, event._id, 'interested')} className="flex-1 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[10px] font-semibold rounded-md transition-colors flex items-center justify-center gap-1">
                        <Plus size={12} /> Interested
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Trending This Week ── */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <TrendingUp size={14} className="text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-200">Trending This Week</h3>
        </div>
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
          <div className="space-y-4">
            {data.trending.map((item, idx) => (
              <Link key={item.eventId} to={`/events/${item.eventId}`} className="flex gap-3 group cursor-pointer block">
                <div className={`w-10 h-10 rounded-xl bg-dark-800 flex flex-col items-center justify-center border border-dark-700/50 group-hover:border-primary-500/30 transition-colors ${idx === 0 ? 'text-orange-400' : idx === 1 ? 'text-dark-400' : 'text-dark-500'}`}>
                  <span className="text-sm font-bold">#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">{item.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-dark-500">+{item.weeklyCount} this week</span>
                    {idx === 0 && <Flame size={12} className="text-orange-400" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. Your Registrations ── */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400/20 to-green-600/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <ClipboardList size={14} className="text-green-400" />
          </div>
          <h3 className="text-sm font-semibold text-dark-200">Your Registrations</h3>
        </div>
        {loading ? (
          <div className="space-y-2.5">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} h="h-3.5" />)}
          </div>
        ) : !data?.yourRegistrations ? (
          <p className="text-xs text-dark-500 py-2">No registrations found.</p>
        ) : (
          <div>
            <div className="divide-y divide-dark-800/60 mb-4">
              <StatRow label="Total Registered" value={data.yourRegistrations.total} />
              <StatRow label="Upcoming This Week" value={data.yourRegistrations.upcomingThisWeek} />
              <StatRow label="Completed Events" value={data.yourRegistrations.completed} />
              <StatRow label="Pending Approvals" value={data.yourRegistrations.pending} />
            </div>
            
            {data.yourRegistrations.latestEvent && (
              <div>
                <h4 className="text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-2">Latest Registration</h4>
                <Link to={`/events/${data.yourRegistrations.latestEvent._id}`} className="block group bg-dark-800/40 rounded-xl p-3 border border-dark-700/50 hover:border-primary-500/30 transition-colors">
                  <div className="flex gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors truncate">{data.yourRegistrations.latestEvent.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <CategoryBadge category={data.yourRegistrations.latestEvent.category} />
                        </div>
                        <span className="text-primary-400 text-[10px] font-semibold hover:text-primary-300 transition-colors flex items-center gap-1">
                          View Event <Check size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </aside>
  );
}
