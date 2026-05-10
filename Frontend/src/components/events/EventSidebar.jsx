import { useState, useEffect } from 'react';
import {
  Flame, TrendingUp, Trophy, Sparkles,
  Calendar, MapPin, ChevronRight, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../config/api';

// ─── Category Color Map ──────────────────────────────────────────────────────
const CAT = {
  hackathon:  { bg: 'bg-orange-500/15', text: 'text-orange-400',  border: 'border-orange-500/20' },
  workshop:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',    border: 'border-blue-500/20'   },
  seminar:    { bg: 'bg-purple-500/15', text: 'text-purple-400',  border: 'border-purple-500/20' },
  cultural:   { bg: 'bg-pink-500/15',   text: 'text-pink-400',    border: 'border-pink-500/20'   },
  sports:     { bg: 'bg-green-500/15',  text: 'text-green-400',   border: 'border-green-500/20'  },
  club:       { bg: 'bg-yellow-500/15', text: 'text-yellow-400',  border: 'border-yellow-500/20' },
  meetup:     { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',    border: 'border-cyan-500/20'   },
  other:      { bg: 'bg-dark-700/40',   text: 'text-dark-400',    border: 'border-dark-600/30'   },
};
const catStyle = (cat) => CAT[cat] || CAT.other;

// ─── Category Chip ───────────────────────────────────────────────────────────
function CategoryChip({ category }) {
  const s = catStyle(category);
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${s.bg} ${s.text} ${s.border}`}>
      {category}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ h = 'h-4', w = 'w-full' }) {
  return <div className={`${h} ${w} bg-dark-800/60 rounded-lg animate-pulse`} />;
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, iconBg, iconText, iconGlow, label }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center border ${iconBg} ${iconText}`}
        style={{ boxShadow: iconGlow }}
      >
        <Icon size={14} />
      </div>
      <h3 className="text-sm font-semibold text-dark-200">{label}</h3>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EventSidebar() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/events/sidebar-data')
      .then(res => { if (active) setData(res.data.data); })
      .catch(err => console.error('[EventSidebar]', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const ENGAGEMENT_COLORS = {
    'Newcomer Organizer': 'text-dark-400',
    'Event Creator':      'text-blue-400',
    'Active Organizer':   'text-primary-400',
    'Campus Leader':      'text-orange-400',
  };

  const RANK_STYLES = [
    { num: 'text-orange-400', ring: 'border-orange-500/40', bg: 'bg-orange-500/10' },
    { num: 'text-slate-400',  ring: 'border-slate-500/30',  bg: 'bg-slate-500/10'  },
    { num: 'text-amber-700',  ring: 'border-amber-700/30',  bg: 'bg-amber-700/10'  },
  ];

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800/80 hidden xl:flex flex-col overflow-hidden">
      {/* Scrollable content area — padded to sit below the fixed top navbar */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-[68px] pb-6 px-5 space-y-5 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">

        {/* ═══════════════════════════════════════
            1. YOUR EVENT STATS
        ════════════════════════════════════════ */}
        <div className="bg-dark-900/60 rounded-2xl p-5 border border-dark-800/80 shadow-sm">
          <SectionHeader
            icon={Trophy}
            iconBg="bg-gradient-to-br from-yellow-400/20 to-yellow-600/5 border-yellow-500/20"
            iconText="text-yellow-400"
            iconGlow="0 0 18px rgba(250,204,21,0.12)"
            label="Your Event Stats"
          />

          {loading ? (
            <div className="space-y-2.5">
              <Skeleton h="h-3.5" />
              <Skeleton h="h-3.5" w="w-4/5" />
              <Skeleton h="h-3.5" w="w-3/5" />
            </div>
          ) : (
            <>
              {/* Stat rows */}
              <div className="space-y-0 divide-y divide-dark-800/50">
                {[
                  { label: 'Events Organized',   value: data?.stats?.eventsOrganized  ?? 0 },
                  { label: 'Total Campus Events', value: data?.stats?.totalCampusEvents ?? 0 },
                  { label: 'Happening This Week', value: data?.stats?.upcomingThisWeek  ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <span className="text-xs text-dark-400">{label}</span>
                    <span className="text-xs font-bold text-dark-100 tabular-nums">{value}</span>
                  </div>
                ))}
              </div>

              {/* Engagement badge */}
              <div className="mt-3 pt-2.5 border-t border-dark-800/50 flex items-center justify-between">
                <span className="text-[10px] text-dark-500 uppercase tracking-wider">Level</span>
                <div className="flex items-center gap-1.5">
                  <Star size={10} className={ENGAGEMENT_COLORS[data?.stats?.engagementLevel] || 'text-dark-400'} />
                  <span className={`text-[11px] font-bold ${ENGAGEMENT_COLORS[data?.stats?.engagementLevel] || 'text-dark-400'}`}>
                    {data?.stats?.engagementLevel || 'Newcomer Organizer'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════
            2. RECOMMENDED FOR YOU
        ════════════════════════════════════════ */}
        <div className="bg-dark-900/60 rounded-2xl p-5 border border-dark-800/80 shadow-sm">
          <SectionHeader
            icon={Sparkles}
            iconBg="bg-gradient-to-br from-purple-400/20 to-purple-600/5 border-purple-500/20"
            iconText="text-purple-400"
            iconGlow="0 0 18px rgba(168,85,247,0.12)"
            label="Recommended For You"
          />

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton h="h-14" w="w-14" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton h="h-3" />
                    <Skeleton h="h-3" w="w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.recommended?.length ? (
            <p className="text-xs text-dark-500 text-center py-4">No recommendations yet — check back soon!</p>
          ) : (
            <div className="space-y-3">
              {data.recommended.map((event) => (
                <Link
                  key={String(event._id)}
                  to={`/events/${event._id}`}
                  className="group flex items-start gap-3 p-2.5 rounded-xl bg-dark-800/30 border border-dark-700/40 hover:border-primary-500/30 hover:bg-dark-800/60 transition-all duration-200"
                >
                  {/* Thumbnail: Aligned Top-Left */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800 border border-dark-700/50">
                    {event.bannerUrl ? (
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-lg ${catStyle(event.category).text}`}>
                        {event.category?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  {/* Content Stack: Vertically Balanced */}
                  <div className="flex-1 flex flex-col h-14 justify-between min-w-0 py-0.5">
                    <h4 className="text-[12px] font-bold text-dark-100 group-hover:text-primary-400 transition-colors leading-tight line-clamp-1">
                      {event.title}
                    </h4>

                    <div className="flex items-center gap-2 overflow-hidden">
                      <CategoryChip category={event.category} />
                      {event.startDate && (
                        <div className="flex items-center gap-1.5 text-[10px] text-dark-500 whitespace-nowrap min-w-0">
                          <span className="text-dark-700 font-bold">·</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{format(new Date(event.startDate), 'MMM d')}</span>
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-dark-700 font-bold">·</span>
                              <MapPin size={10} />
                              <span className="truncate max-w-[70px]">{event.venue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Icon: Vertically Centered */}
                  <div className="h-14 flex items-center">
                    <ChevronRight 
                      size={16} 
                      className="text-dark-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" 
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            3. TRENDING THIS WEEK
        ════════════════════════════════════════ */}
        <div className="bg-dark-900/60 rounded-2xl p-5 border border-dark-800/80 shadow-sm">
          <SectionHeader
            icon={TrendingUp}
            iconBg="bg-gradient-to-br from-orange-400/20 to-orange-600/5 border-orange-500/20"
            iconText="text-orange-400"
            iconGlow="0 0 18px rgba(249,115,22,0.12)"
            label="Trending This Week"
          />

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton h="h-9" w="w-9" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton h="h-3" />
                    <Skeleton h="h-3" w="w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.trending?.length ? (
            <p className="text-xs text-dark-500 text-center py-4">No trending events yet.</p>
          ) : (
            <div className="space-y-3">
              {data.trending.map((item, idx) => {
                const rs = RANK_STYLES[idx] || RANK_STYLES[2];
                return (
                  <Link
                    key={String(item._id)}
                    to={`/events/${item._id}`}
                    className="group flex gap-3 items-start p-2 rounded-xl hover:bg-dark-800/40 transition-colors duration-150"
                  >
                    {/* Rank badge */}
                    <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center border ${rs.bg} ${rs.ring} flex-shrink-0`}>
                      <span className={`text-xs font-black ${rs.num}`}>#{idx + 1}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-dark-200 group-hover:text-primary-300 transition-colors leading-snug line-clamp-2 mb-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <CategoryChip category={item.category} />
                        <span className="text-[10px] text-dark-500 flex items-center gap-1">
                          <TrendingUp size={9} className="text-orange-500" />
                          {item.weeklyCount} views
                        </span>
                      </div>
                      {item.startDate && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-dark-500">
                          <Calendar size={9} />
                          <span>{format(new Date(item.startDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Flame for #1 */}
                    {idx === 0 && (
                      <Flame size={14} className="text-orange-400 flex-shrink-0 mt-0.5 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
