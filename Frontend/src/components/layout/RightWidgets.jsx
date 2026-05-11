import { useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OpportunitiesSidebar from '../opportunities/OpportunitiesSidebar';
import MarketplaceSidebar from '../marketplace/MarketplaceSidebar';

function HomeSidebar() {
  const upcomingEvents = [
    { id: 1, title: 'Hack the Future', date: 'Oct 24', venue: 'Main Auditorium' },
    { id: 2, title: 'React Workshop', date: 'Oct 26', venue: 'Lab 3' },
  ];

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto">
      <div className="p-6 h-full mt-16">
        {/* Profile Completion Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 mb-6">
          <h3 className="text-sm font-semibold text-dark-200 mb-3">Profile Status</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dark-400">Completion</span>
            <span className="text-xs font-medium text-primary-400">85%</span>
          </div>
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 w-[85%] rounded-full" />
          </div>
        </div>

        {/* Upcoming Events Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200">Up Next</h3>
            <span className="text-xs text-primary-400 cursor-pointer hover:text-primary-300">View all</span>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="flex gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-dark-800 flex flex-col items-center justify-center border border-dark-700/50 group-hover:border-primary-500/30 transition-colors">
                  <span className="text-[10px] text-dark-400 font-medium uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-sm font-bold text-dark-100">{event.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-1 mt-1 text-dark-500">
                    <MapPin size={12} />
                    <span className="text-xs">{event.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function WIPSidebar({ moduleName }) {
  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto">
      <div className="p-6 h-full flex flex-col items-center justify-center text-center opacity-60">
        <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-dark-200 mb-1">{moduleName} Sidebar</h3>
        <p className="text-xs text-dark-400">Work in Progress</p>
      </div>
    </aside>
  );
}

export default function RightWidgets() {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith('/opportunities')) {
    return <OpportunitiesSidebar />;
  }
  
  if (path.startsWith('/marketplace')) {
    return <MarketplaceSidebar />;
  }
  
  if (path === '/' || path === '/home' || path.startsWith('/dashboard')) {
    return <HomeSidebar />;
  }

  // Determine module name for WIP
  const moduleName = path.split('/')[1] || 'Module';
  const formattedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return <WIPSidebar moduleName={formattedName} />;
}
