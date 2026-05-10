import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EventSidebar from '../../components/events/EventSidebar';
import { format } from 'date-fns';

export default function EventsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', 'hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'club', 'other'];
  
  // Dummy data for now - would fetch from API
  const [events] = useState([
    {
      _id: '1',
      title: 'Global Hackathon 2026',
      category: 'hackathon',
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      venue: 'Main Campus / Online',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80',
      registeredCount: 156,
      organizerId: { fullName: 'Tech Club' }
    },
    {
      _id: '2',
      title: 'React Performance Workshop',
      category: 'workshop',
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      venue: 'Lab 4, CS Block',
      bannerUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80',
      registeredCount: 42,
      organizerId: { fullName: 'Web Dev Society' }
    },
    {
      _id: '3',
      title: 'Annual Cultural Fest',
      category: 'cultural',
      startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      venue: 'Open Air Theatre',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80',
      registeredCount: 450,
      organizerId: { fullName: 'Student Council' }
    }
  ]);

  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(e => e.category === activeCategory);

  const canCreateEvent = ['admin', 'clubAdmin', 'organizer', 'coordinator', 'club_lead'].includes(user?.role);

  return (
    // hideWidgets=true removes the default RightWidgets panel so we can render our own
    <DashboardLayout hideWidgets>
      <div className="flex gap-6 items-start">
        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-100">Campus Events</h1>
              <p className="text-dark-400 mt-1">Discover and join upcoming events at UniCampus.</p>
            </div>
            {canCreateEvent && (
              <Link to="/events/create" className="btn-primary inline-flex items-center gap-2 w-auto py-2.5">
                <Plus size={18} />
                <span>Create Event</span>
              </Link>
            )}
          </div>

          {/* Featured Events (Hero Cards) */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-dark-200 mb-4">Featured Event</h2>
            {events.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[3/1] bg-dark-800 group">
                <img 
                  src={events[0].bannerUrl} 
                  alt={events[0].title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-900/60 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <div className="inline-flex px-3 py-1 bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 w-max backdrop-blur-md">
                    {events[0].category}
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">{events[0].title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-dark-300 text-sm mb-6">
                    <div className="flex items-center gap-1.5"><Calendar size={16} /> {format(new Date(events[0].startDate), 'MMM dd, yyyy h:mm a')}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={16} /> {events[0].venue}</div>
                  </div>
                  <div>
                    <Link to={`/events/${events[0]._id}`} className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-dark-950 font-semibold rounded-xl hover:bg-dark-100 transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-dark-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map(event => (
              <Link key={event._id} to={`/events/${event._id}`} className="group bg-dark-900 border border-dark-800 hover:border-dark-700 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="h-48 relative overflow-hidden bg-dark-800">
                  <img 
                    src={event.bannerUrl || 'https://via.placeholder.com/600x400/16191d/5c7cfa?text=Event'} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-dark-950/80 backdrop-blur-md text-white text-xs font-medium rounded-full uppercase tracking-wide">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-dark-100 mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">{event.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-dark-400 text-sm">
                      <Calendar size={15} className="text-primary-500/70" />
                      <span>{format(new Date(event.startDate), 'MMM dd, h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-dark-400 text-sm">
                      <MapPin size={15} className="text-primary-500/70" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                    <div className="flex items-center gap-2 text-dark-500 text-xs">
                      <Users size={14} />
                      <span>{event.registeredCount} Registered</span>
                    </div>
                    <span className="text-primary-400 flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Details <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-20 bg-dark-900/50 rounded-2xl border border-dark-800">
              <Calendar size={48} className="mx-auto text-dark-600 mb-4" />
              <h3 className="text-xl font-semibold text-dark-200">No events found</h3>
              <p className="text-dark-400 mt-2">Try selecting a different category or check back later.</p>
            </div>
          )}
        </div>

        {/* ── Event Sidebar (right column, visible on xl+) ── */}
        <aside className="w-80 flex-shrink-0 hidden xl:block sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto hide-scrollbar -mr-4 lg:-mr-8">
          <div className="bg-dark-950 border-l border-dark-800 min-h-full">
             <EventSidebar />
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

