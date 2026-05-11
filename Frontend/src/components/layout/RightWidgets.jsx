import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, User, CheckCircle, Clock, Calendar, Bookmark, Activity, Hash, ArrowRight, Users, Target, Search, AlertCircle, Wrench, Send, Briefcase } from 'lucide-react';
import OpportunitiesSidebar from '../opportunities/OpportunitiesSidebar';
import MarketplaceSidebar from '../marketplace/MarketplaceSidebar';
import PortfolioSidebar from '../portfolio/PortfolioSidebar';

// ---------------------------------------------------------
// TEAMMATES SIDEBAR
// ---------------------------------------------------------
function TeammatesSidebar({ user }) {
  // Placeholder Data for Teammates Context
  const trendingCategories = ['Hackathon', 'Open Source', 'Startup', 'Research'];
  const recommendedSkills = ['React', 'Node.js', 'Python', 'Figma', 'UI/UX'];

  return (
    <div className="p-6 space-y-6">
      
      {/* SECTION 1 — RECRUITMENT STATS */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <Activity size={14} /> Collaboration Stats
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">2</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Joined Teams</span>
          </div>
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">1</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Active Posts</span>
          </div>
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Send size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">3</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Pending Invites</span>
          </div>
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bookmark size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">5</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Saved Projects</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — UPCOMING HACKATHONS/DEADLINES */}
      <div className="bg-dark-900/40 rounded-2xl p-5 border border-dark-800/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} className="text-primary-400" /> Action Needed
          </h3>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="flex gap-3 group cursor-pointer">
            <div className="mt-0.5"><div className="w-2 h-2 rounded-full mt-1.5 bg-red-400" /></div>
            <div>
              <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors leading-tight mb-1">SIH 2026 Team Formation</h4>
              <p className="text-xs text-dark-500">Deadline in 2 days</p>
            </div>
          </div>
          <div className="flex gap-3 group cursor-pointer">
            <div className="mt-0.5"><div className="w-2 h-2 rounded-full mt-1.5 bg-amber-400" /></div>
            <div>
              <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors leading-tight mb-1">Respond to John's invite</h4>
              <p className="text-xs text-dark-500">Pending for 12 hrs</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 — TRENDING CATEGORIES */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1">Trending Categories</h3>
        <div className="flex flex-wrap gap-2">
          {trendingCategories.map(tag => (
            <span key={tag} className="text-xs font-medium text-dark-300 bg-dark-900/60 border border-dark-800 px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 4 — IN DEMAND SKILLS */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1">In-Demand Skills</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedSkills.map(skill => (
            <span key={skill} className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// HOME SIDEBAR
// ---------------------------------------------------------
function HomeSidebar({ user }) {
  const upcomingDeadlines = [
    { id: 1, title: 'SIH 2026 Registration', time: 'Closes tomorrow', type: 'opportunity' },
    { id: 2, title: 'React Workshop', time: 'Starts in 2 hours', type: 'event' },
    { id: 3, title: 'Project Team Invite', time: 'Pending response', type: 'team' },
  ];
  // eslint-disable-next-line no-unused-vars
  const trendingTags = ['#SIH2026', '#Hackathon', '#React', '#MLProjects', '#DBMS'];

  return (
    <div className="p-6 space-y-6 mt-16">
      {/* SECTION 1 — PROFILE SNAPSHOT */}
      <div className="bg-dark-900/40 rounded-2xl p-4 border border-dark-800/60 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-500/20 shrink-0 border-2 border-dark-950">
          {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : (user?.fullName?.charAt(0) || 'U')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-dark-100 truncate">{user?.fullName || 'Student'}</h3>
            <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">{user?.profileCompletionPercent || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: `${user?.profileCompletionPercent || 0}%` }} />
          </div>
          <Link to="/settings" className="text-xs text-dark-400 hover:text-primary-400 transition-colors flex items-center gap-1 font-medium">
            <User size={12} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* SECTION 2 — YOUR ACTIVITY */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider">Your Activity</h3>
        </div>
        <div className="space-y-2">
          <Link to="/teammates" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><Users size={16} /></div>
              <span className="text-sm font-medium text-dark-200">Joined Teams</span>
            </div>
            <span className="text-xs font-bold text-dark-100 bg-dark-800 px-2 py-1 rounded-md">2</span>
          </Link>
          <Link to="/opportunities" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform"><Bookmark size={16} /></div>
              <span className="text-sm font-medium text-dark-200">Saved Opportunities</span>
            </div>
            <span className="text-xs font-bold text-dark-100 bg-dark-800 px-2 py-1 rounded-md">5</span>
          </Link>
          <Link to="/marketplace" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><CheckCircle size={16} /></div>
              <span className="text-sm font-medium text-dark-200">Active Listings</span>
            </div>
            <span className="text-xs font-bold text-dark-100 bg-dark-800 px-2 py-1 rounded-md">1</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3 — UPCOMING / DEADLINES */}
      <div className="bg-dark-900/40 rounded-2xl p-5 border border-dark-800/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} className="text-primary-400" /> Action Needed
          </h3>
        </div>
        <div className="space-y-4 relative z-10">
          {upcomingDeadlines.map(item => (
            <div key={item.id} className="flex gap-3 group cursor-pointer">
              <div className="mt-0.5">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${item.type === 'opportunity' ? 'bg-amber-400' : item.type === 'event' ? 'bg-primary-400' : 'bg-blue-400'}`} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors leading-tight mb-1">{item.title}</h4>
                <p className="text-xs text-dark-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4 — CAMPUS PULSE MINI WIDGET */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <Activity size={14} /> Campus Pulse
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-900/30 border border-dark-800 p-3 rounded-xl flex flex-col justify-center items-center text-center">
            <span className="text-lg font-black text-dark-100">8</span>
            <span className="text-[10px] text-dark-500 font-medium uppercase mt-0.5">Team Reqs</span>
          </div>
          <div className="bg-dark-900/30 border border-dark-800 p-3 rounded-xl flex flex-col justify-center items-center text-center">
            <span className="text-lg font-black text-dark-100">12</span>
            <span className="text-[10px] text-dark-500 font-medium uppercase mt-0.5">Resources</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RightWidgets() {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  // Render module-specific sidebar content
  const renderContent = () => {
    if (path.startsWith('/teammates')) {
      return <TeammatesSidebar user={user} />;
    }
    
    if (path.startsWith('/opportunities')) {
      return <OpportunitiesSidebar />;
    }
    
    if (path.startsWith('/marketplace')) {
      return <MarketplaceSidebar />;
    }
    
    if (path.startsWith('/portfolio')) {
      return <PortfolioSidebar />;
    }

    if (path === '/dashboard' || path === '/' || path === '/home') {
      return <HomeSidebar user={user} />;
    }

    // Default "Work in Progress" for other modules
    const moduleName = path.split('/')[1] || 'Module';
    const formattedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-dark-900/30 rounded-2xl border border-dark-800/50 border-dashed m-6">
        <Wrench size={48} className="text-dark-600 mb-4" />
        <h3 className="text-dark-100 font-bold mb-2">{formattedName} Sidebar</h3>
        <p className="text-dark-400 text-sm">Work in progress for this module. The contextual sidebar will be implemented soon.</p>
      </div>
    );
  };

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:flex flex-col h-screen overflow-y-auto hide-scrollbar">
      {renderContent()}
    </aside>
  );
}
