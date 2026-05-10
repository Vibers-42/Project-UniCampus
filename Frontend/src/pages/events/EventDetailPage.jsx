import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Info, Tag } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EventSidebar from '../../components/events/EventSidebar';
import { format } from 'date-fns';
import api from '../../config/api';

const CAT_STYLE = {
  hackathon: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  workshop:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  seminar:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cultural:  'bg-pink-500/10   text-pink-400   border-pink-500/20',
  sports:    'bg-green-500/10  text-green-400  border-green-500/20',
  club:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  meetup:    'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
  other:     'bg-dark-700/40   text-dark-400   border-dark-600/20',
};

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-dark-800 rounded-lg text-primary-400 shrink-0 mt-0.5">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-dark-500 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
        <div className="text-sm text-dark-100 font-medium leading-snug">{children}</div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams();

  const [event,   setEvent]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <DashboardLayout hideWidgets rightSidebar={<EventSidebar />}>
      <div className="animate-pulse space-y-6">
        <div className="h-64 bg-dark-800 rounded-3xl" />
        <div className="h-6 bg-dark-800 rounded w-2/3" />
        <div className="h-4 bg-dark-800 rounded w-1/2" />
      </div>
    </DashboardLayout>
  );

  if (error || !event) return (
    <DashboardLayout hideWidgets rightSidebar={<EventSidebar />}>
      <div className="text-center text-dark-400 py-20">{error || 'Event not found.'}</div>
    </DashboardLayout>
  );

  const catClass = CAT_STYLE[event.category] || CAT_STYLE.other;

  return (
    <DashboardLayout hideWidgets rightSidebar={<EventSidebar />}>
      {/* Back nav */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden">

        {/* Banner */}
        <div className="h-64 md:h-96 w-full relative">
          <img
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/30 to-transparent" />
          {/* Category badge overlaid on banner */}
          <div className="absolute bottom-6 left-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${catClass}`}>
              {event.category}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-dark-100 mb-3 leading-tight">
                {event.title}
              </h1>
              <p className="text-dark-300 text-base leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-dark-800">
                <div className="flex items-center gap-2 text-dark-400">
                  <Tag size={14} />
                  <h3 className="text-sm font-semibold text-dark-300">Tags</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {event.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-dark-800 text-dark-300 text-xs rounded-lg border border-dark-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources placeholder */}
            <div className="mt-8 p-5 bg-dark-800/40 rounded-2xl border border-dark-700/50 border-dashed">
              <div className="flex items-center gap-2 text-dark-400 mb-2">
                <Info size={16} />
                <h4 className="text-sm font-medium text-dark-300">Resources & Discussion</h4>
              </div>
              <p className="text-xs text-dark-500 leading-relaxed">
                This section will contain attachments and event discussions in the next update.
              </p>
            </div>
          </div>

          {/* ── Info Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 space-y-4 flex-shrink-0">

            {/* Event Info Card */}
            <div className="bg-dark-950 p-5 rounded-2xl border border-dark-800 shadow-xl space-y-4">
              <p className="text-[10px] font-semibold text-dark-500 uppercase tracking-widest">
                Event Details
              </p>

              <InfoRow icon={Calendar} label="Start Date">
                {format(new Date(event.startDate), 'MMMM dd, yyyy')}
                <span className="block text-xs text-dark-400 font-normal mt-0.5">
                  {format(new Date(event.startDate), 'EEEE · h:mm a')}
                </span>
              </InfoRow>

              {event.endDate && (
                <InfoRow icon={Clock} label="End Date">
                  {format(new Date(event.endDate), 'MMMM dd, yyyy')}
                  <span className="block text-xs text-dark-400 font-normal mt-0.5">
                    {format(new Date(event.endDate), 'EEEE · h:mm a')}
                  </span>
                </InfoRow>
              )}

              {event.venue && (
                <InfoRow icon={MapPin} label="Venue">
                  {event.venue}
                </InfoRow>
              )}
            </div>

            {/* Organizer Card */}
            <div className="bg-dark-900 border border-dark-800 p-5 rounded-2xl">
              <p className="text-[10px] font-semibold text-dark-500 uppercase tracking-widest mb-3">
                Organized By
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500/30 to-dark-800 rounded-xl flex items-center justify-center text-dark-100 font-bold text-base border border-primary-500/20 flex-shrink-0">
                  {event.organizerId?.fullName?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-dark-100 text-sm truncate">
                    {event.organizerId?.fullName || 'Organizer'}
                  </p>
                  <p className="text-xs text-dark-400 truncate">
                    {event.organizerId?.role ? (
                      <span className="capitalize">{event.organizerId.role.replace('_', ' ')}</span>
                    ) : 'Verified Organizer'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
