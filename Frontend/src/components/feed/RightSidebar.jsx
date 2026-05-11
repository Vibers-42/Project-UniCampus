import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { format } from 'date-fns';

export default function RightSidebar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/events?limit=3&sort=startDate');
        const items = res.data?.data?.events || [];
        // Only show future or ongoing events
        const now = new Date();
        setEvents(items.filter(e => new Date(e.startDate) >= now).slice(0, 2));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="hidden lg:block space-y-6">
      <Link to="/ai-solver" className="block auth-card p-5 border border-primary-500/10 bg-gradient-to-b from-dark-900 to-dark-900/80 hover:border-primary-500/30 transition-all">
        <h3 className="text-dark-100 font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">🤖</span> AI Doubt Solver
        </h3>
        <p className="text-dark-400 text-xs mb-4 leading-relaxed">Ask any academic question and get instant AI-powered answers.</p>
        <div className="text-xs text-primary-400 font-bold">Open AI Solver →</div>
      </Link>

      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-semibold mb-4 text-sm uppercase tracking-wider text-primary-400">📅 Upcoming Events</h3>
        {loading ? (
          <div className="space-y-3">
            <div className="h-14 bg-dark-800 rounded-xl animate-pulse" />
            <div className="h-14 bg-dark-800 rounded-xl animate-pulse" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-xs text-dark-500 text-center py-4">No upcoming events</p>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <Link key={event._id} to={`/events/${event._id}`} className="flex gap-3 items-center group cursor-pointer">
                <div className="bg-dark-950 border border-dark-800 rounded-xl p-2 text-center min-w-[3.5rem] group-hover:border-primary-500/50 transition-colors">
                  <div className="text-primary-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                    {format(new Date(event.startDate), 'MMM')}
                  </div>
                  <div className="text-dark-100 font-bold text-lg leading-none">
                    {format(new Date(event.startDate), 'd')}
                  </div>
                </div>
                <div>
                  <h4 className="text-dark-200 text-sm font-medium group-hover:text-primary-400 transition-colors line-clamp-1">{event.title}</h4>
                  <p className="text-dark-500 text-xs mt-0.5">{event.venue || event.location || 'Campus'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="auth-card p-5">
        <h3 className="text-dark-100 font-semibold mb-4 text-sm uppercase tracking-wider text-primary-400">🔗 Quick Access</h3>
        <div className="space-y-2">
          <Link to="/resources" className="block text-xs text-dark-300 hover:text-primary-400 transition-colors py-1">📚 Study Resources</Link>
          <Link to="/teammates" className="block text-xs text-dark-300 hover:text-primary-400 transition-colors py-1">👥 Find Teammates</Link>
          <Link to="/opportunities" className="block text-xs text-dark-300 hover:text-primary-400 transition-colors py-1">💼 Opportunities</Link>
          <Link to="/marketplace" className="block text-xs text-dark-300 hover:text-primary-400 transition-colors py-1">🛒 Marketplace</Link>
        </div>
      </div>
    </div>
  );
}
