import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { format } from 'date-fns';
import api from '../../config/api';

export default function EventDetailPage() {
  const { id } = useParams();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState(null); // null, 'interested', 'registered'
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
        setRsvpStatus(res.data.data.userRegistrationStatus || null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRsvp = async (status) => {
    setIsSubmitting(true);
    try {
      const endpoint = status === 'registered' ? 'register' : 'interested';
      const res = await api.post(`/events/${id}/${endpoint}`);
      setEvent(res.data.data.event);
      setRsvpStatus(res.data.data.action === 'cancelled' ? null : res.data.data.event.userRegistrationStatus || status);
      // If it was cancelled, it sets to null. Otherwise, it uses the requested status.
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-48 bg-dark-800 rounded"></div><div className="h-4 bg-dark-800 rounded w-3/4"></div></div></div></DashboardLayout>;
  if (error || !event) return <DashboardLayout><div className="text-center text-dark-400 py-20">{error || 'Event not found.'}</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <Link to="/events" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden">
        {/* Banner */}
        <div className="h-64 md:h-96 w-full relative">
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        </div>

        <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="inline-flex px-3 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                {event.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-dark-100 mb-4">{event.title}</h1>
              <p className="text-dark-300 text-lg leading-relaxed">{event.description}</p>
            </div>

            <div className="space-y-6 pt-6 border-t border-dark-800">
              <h3 className="text-xl font-semibold text-dark-200">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {event.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-dark-800 text-dark-300 text-sm rounded-lg border border-dark-700/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Discussions / Resources Placeholder */}
            <div className="mt-10 p-6 bg-dark-800/50 rounded-2xl border border-dark-800 border-dashed">
              <div className="flex items-center gap-3 text-dark-400 mb-2">
                <Info size={20} />
                <h4 className="font-medium text-dark-200">Resources & Discussion</h4>
              </div>
              <p className="text-sm text-dark-400">This section will contain attachments and event discussions in the next update.</p>
            </div>
          </div>

          {/* Sidebar / Info Card */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-dark-950 p-6 rounded-2xl border border-dark-800 shadow-xl">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-dark-800 rounded-lg text-primary-400 shrink-0"><Calendar size={20} /></div>
                  <div>
                    <p className="text-sm text-dark-400 font-medium mb-0.5">Start Date</p>
                    <p className="text-dark-100 font-medium">{format(new Date(event.startDate), 'MMMM dd, yyyy')}</p>
                    <p className="text-dark-400 text-sm">{format(new Date(event.startDate), 'h:mm a')}</p>
                  </div>
                </div>

                {event.endDate && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-dark-800 rounded-lg text-primary-400 shrink-0"><Clock size={20} /></div>
                    <div>
                      <p className="text-sm text-dark-400 font-medium mb-0.5">End Date</p>
                      <p className="text-dark-100 font-medium">{format(new Date(event.endDate), 'MMMM dd, yyyy')}</p>
                      <p className="text-dark-400 text-sm">{format(new Date(event.endDate), 'h:mm a')}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-dark-800 rounded-lg text-primary-400 shrink-0"><MapPin size={20} /></div>
                  <div>
                    <p className="text-sm text-dark-400 font-medium mb-0.5">Venue</p>
                    <p className="text-dark-100 font-medium leading-snug">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-dark-800 rounded-lg text-primary-400 shrink-0"><Users size={20} /></div>
                  <div className="w-full">
                    <p className="text-sm text-dark-400 font-medium mb-1">Registration</p>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-dark-100 font-medium">{event.registeredCount} Registered</span>
                      <span className="text-dark-500">{event.maxParticipants > 0 ? `/ ${event.maxParticipants}` : ''}</span>
                    </div>
                    {event.maxParticipants > 0 && (
                      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full" 
                          style={{ width: `${Math.min(100, (event.registeredCount / event.maxParticipants) * 100)}%` }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button 
                  onClick={() => handleRsvp('registered')}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    rsvpStatus === 'registered' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                      : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/20'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : rsvpStatus === 'registered' ? <><CheckCircle size={18} /> Registered</> : 'Register Now'}
                </button>
                
                <button 
                  onClick={() => handleRsvp('interested')}
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    rsvpStatus === 'interested'
                      ? 'bg-dark-800 text-white border border-dark-700'
                      : 'bg-transparent text-dark-300 hover:bg-dark-800 border border-dark-700/50'
                  }`}
                >
                  {rsvpStatus === 'interested' ? '★ Interested' : 'Mark as Interested'}
                </button>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-dark-900 border border-dark-800 p-6 rounded-2xl">
              <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-4">Organized By</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl flex items-center justify-center text-dark-200 font-bold text-lg border border-dark-700">
                  {event.organizerId?.fullName?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-medium text-dark-100">{event.organizerId?.fullName || 'Organizer'}</p>
                  <p className="text-sm text-dark-400">Verified Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
