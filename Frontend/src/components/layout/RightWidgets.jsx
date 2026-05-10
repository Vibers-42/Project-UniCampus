import { MapPin } from 'lucide-react';

export default function RightWidgets() {
  const upcomingEvents = [
    { id: 1, title: 'Hack the Future', date: 'Oct 24', venue: 'Main Auditorium' },
    { id: 2, title: 'React Workshop', date: 'Oct 26', venue: 'Lab 3' },
  ];

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto">
      <div className="p-6 h-full">
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
