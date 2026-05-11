import { Bell, Briefcase, Calendar, AlertCircle, FileText, CheckCircle, Clock, ChevronRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OpportunitiesSidebar() {
  const trendingOpportunities = [
    { id: 1, title: 'Google SWE Intern 2027', category: 'Internship', tags: ['CSE', 'IT'] },
    { id: 2, title: 'TechNova Hackathon', category: 'Hackathons', tags: ['All Branches'] },
    { id: 3, title: 'AWS Cloud Workshop', category: 'Workshops', tags: ['CSE', 'ECE'] },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'SIH Registration', deadline: 'Tomorrow' },
    { id: 2, title: 'TCS Ninja Placement', deadline: 'In 3 days' },
  ];

  const activeApplications = [
    { id: 1, company: 'Microsoft', role: 'SDE Intern', status: 'Under Review', statusColor: 'text-yellow-400' },
    { id: 2, company: 'Infosys', role: 'System Engineer', status: 'Shortlisted', statusColor: 'text-green-400' },
  ];

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto hide-scrollbar">
      <div className="p-6 h-full space-y-6">
        
        {/* Department Alerts Widget */}
        <div className="bg-primary-500/10 rounded-2xl p-5 border border-primary-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-primary-400 w-5 h-5" />
            <h3 className="text-sm font-semibold text-primary-400">Department Alerts</h3>
          </div>
          <p className="text-xs text-primary-300/80 leading-relaxed">
            3 new placement drives have been announced for CSE & AIML students this week.
          </p>
        </div>

        {/* Your Applications Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary-400/80" />
              Your Applications
            </h3>
            <span className="text-[10px] text-primary-400 cursor-pointer hover:text-primary-300">View all</span>
          </div>
          
          <div className="space-y-4">
            {activeApplications.map(app => (
              <div key={app.id} className="flex flex-col gap-1 group cursor-pointer border-b border-dark-800/50 pb-3 last:border-0 last:pb-0">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors flex justify-between">
                  {app.company}
                  <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" />
                </h4>
                <p className="text-xs text-dark-400">{app.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {app.status === 'Shortlisted' ? (
                    <CheckCircle className={`w-3 h-3 ${app.statusColor}`} />
                  ) : (
                    <Clock className={`w-3 h-3 ${app.statusColor}`} />
                  )}
                  <span className={`text-[10px] font-medium ${app.statusColor}`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Opportunities Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-dark-400" />
              Trending Now
            </h3>
            <span className="text-[10px] text-primary-400 cursor-pointer hover:text-primary-300">View all</span>
          </div>
          
          <div className="space-y-4">
            {trendingOpportunities.map(opp => (
              <div key={opp.id} className="group cursor-pointer">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors">{opp.title}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-dark-400 bg-dark-800 px-2 py-0.5 rounded-md border border-dark-700">
                    {opp.category}
                  </span>
                  <span className="text-[10px] text-dark-500">
                    {opp.tags.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400/80" />
              Closing Soon
            </h3>
          </div>
          
          <div className="space-y-4">
            {upcomingDeadlines.map(deadline => (
              <div key={deadline.id} className="flex items-center justify-between group cursor-pointer border-l-2 border-red-500/50 pl-3">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-red-400 transition-colors">{deadline.title}</h4>
                <span className="text-xs font-semibold text-red-400">{deadline.deadline}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Career Resources Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-primary-400/80" />
            Career Resources
          </h3>
          <div className="space-y-2">
            <Link to="/portfolio" className="btn-secondary w-full text-xs py-2 flex justify-between items-center group">
              Update Portfolio
              <ChevronRight className="w-3 h-3 text-dark-500 group-hover:text-primary-400 transition-colors" />
            </Link>
            <button onClick={() => alert('Resume Builder feature coming soon!')} className="btn-secondary w-full text-xs py-2 flex justify-between items-center group">
              Resume Builder
              <ChevronRight className="w-3 h-3 text-dark-500 group-hover:text-primary-400 transition-colors" />
            </button>
            <button onClick={() => alert('Interview Prep resources coming soon!')} className="btn-secondary w-full text-xs py-2 flex justify-between items-center group">
              Interview Prep
              <ChevronRight className="w-3 h-3 text-dark-500 group-hover:text-primary-400 transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
