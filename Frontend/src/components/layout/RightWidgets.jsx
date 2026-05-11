import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, CheckCircle, Clock, Bookmark, Activity, ArrowRight, Users, Target, Wrench, Briefcase, TrendingUp, FileText } from 'lucide-react';
import api from '../../config/api';
import OpportunitiesSidebar from '../opportunities/OpportunitiesSidebar';
import MarketplaceSidebar from '../marketplace/MarketplaceSidebar';
import PortfolioSidebar from '../portfolio/PortfolioSidebar';

// ---------------------------------------------------------
// TEAMMATES SIDEBAR — fully dynamic
// ---------------------------------------------------------
function TeammatesSidebar({ user }) {
  const [stats, setStats] = useState({ myPosts: 0, totalProjects: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all open projects
        const res = await api.get('/teammates?status=open&limit=100');
        const projects = res.data?.data?.projects || [];
        const myPosts = projects.filter(p => p.creatorId?._id === user?._id).length;
        setStats({ myPosts, totalProjects: projects.length });
        setRecentProjects(projects.slice(0, 3));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [user?._id]);

  // Extract trending tech from recent projects
  const trendingTech = {};
  recentProjects.forEach(p => {
    (p.techStack || []).forEach(t => { trendingTech[t] = (trendingTech[t] || 0) + 1; });
    (p.requiredRoles || []).forEach(r => { trendingTech[r] = (trendingTech[r] || 0) + 1; });
  });
  const topSkills = Object.entries(trendingTech).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);

  const trendingCategories = ['Hackathon', 'Open Source', 'Startup', 'Research'];

  return (
    <div className="p-6 space-y-6">
      
      {/* SECTION 1 — DISCOVERY STATS */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <Activity size={14} /> Discovery Stats
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Target size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">{loading ? '–' : stats.totalProjects}</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Open Projects</span>
          </div>
          <div className="bg-dark-900/40 border border-dark-800 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-primary-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle size={18} />
            </div>
            <span className="text-xl font-black text-dark-100">{loading ? '–' : stats.myPosts}</span>
            <span className="text-[10px] text-dark-500 font-bold uppercase mt-1">Your Posts</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — LATEST PROJECTS */}
      {recentProjects.length > 0 && (
        <div className="bg-dark-900/40 rounded-2xl p-5 border border-dark-800/60 shadow-sm relative overflow-hidden">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={14} className="text-primary-400" /> Latest Posts
          </h3>
          <div className="space-y-3">
            {recentProjects.map(p => (
              <Link
                key={p._id}
                to={`/teammates/${p._id}`}
                className="block group"
              >
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors leading-tight line-clamp-1">{p.title}</h4>
                <p className="text-[10px] text-dark-500 capitalize mt-0.5">{p.category} · {p.requiredRoles?.slice(0, 2).join(', ')}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {/* SECTION 4 — IN DEMAND SKILLS (from real data) */}
      {topSkills.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1">In-Demand Skills</h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map(skill => (
              <span key={skill} className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// HOME SIDEBAR — fully dynamic
// ---------------------------------------------------------
function HomeSidebar({ user }) {
  const [stats, setStats] = useState({ myTeamPosts: 0, myListings: 0, totalResources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [teamRes, marketRes] = await Promise.allSettled([
          api.get('/teammates?status=open&limit=100'),
          api.get('/marketplace?limit=100'),
        ]);

        const teamProjects = teamRes.status === 'fulfilled' ? (teamRes.value.data?.data?.projects || []) : [];
        const marketItems = marketRes.status === 'fulfilled' ? (marketRes.value.data?.data?.items || []) : [];

        setStats({
          myTeamPosts: teamProjects.filter(p => p.creatorId?._id === user?._id).length,
          myListings: marketItems.filter(i => i.sellerId?._id === user?._id).length,
          totalResources: 0, // Will be fetched from resources if needed
        });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [user?._id]);

  return (
    <div className="p-6 space-y-6">
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
          <Link to="/profile" className="text-xs text-dark-400 hover:text-primary-400 transition-colors flex items-center gap-1 font-medium">
            <User size={12} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* SECTION 2 — YOUR ACTIVITY (real counts) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider">Your Activity</h3>
        </div>
        <div className="space-y-2">
          <Link to="/teammates" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform"><Users size={16} /></div>
              <span className="text-sm font-medium text-dark-200">Your Team Posts</span>
            </div>
            <span className="text-xs font-bold text-dark-100 bg-dark-800 px-2 py-1 rounded-md">{loading ? '–' : stats.myTeamPosts}</span>
          </Link>
          <Link to="/marketplace" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform"><CheckCircle size={16} /></div>
              <span className="text-sm font-medium text-dark-200">Active Listings</span>
            </div>
            <span className="text-xs font-bold text-dark-100 bg-dark-800 px-2 py-1 rounded-md">{loading ? '–' : stats.myListings}</span>
          </Link>
        </div>
      </div>

      {/* SECTION 3 — QUICK LINKS */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <ArrowRight size={14} /> Quick Links
        </h3>
        <div className="space-y-2">
          <Link to="/teammates/create" className="flex items-center justify-between p-3 rounded-xl bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/10 hover:border-primary-500/20 transition-all group text-sm font-medium text-primary-400">
            <span>Post a Team Requirement</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/opportunities" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group text-sm font-medium text-dark-300">
            <span>Browse Opportunities</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-dark-500" />
          </Link>
          <Link to="/resources" className="flex items-center justify-between p-3 rounded-xl bg-dark-900/20 hover:bg-dark-800/50 border border-transparent hover:border-dark-700/50 transition-all group text-sm font-medium text-dark-300">
            <span>Study Resources</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-dark-500" />
          </Link>
        </div>
      </div>

      {/* SECTION 4 — CAMPUS PULSE */}
      <div>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
          <Activity size={14} /> Campus
        </h3>
        <div className="bg-dark-900/30 border border-dark-800 p-4 rounded-xl text-center">
          <p className="text-xs text-dark-400">Welcome to UniCampus! Explore modules from the sidebar to get started.</p>
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
        <p className="text-dark-400 text-sm">Contextual sidebar for this module.</p>
      </div>
    );
  };

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:flex flex-col h-screen overflow-y-auto hide-scrollbar z-30">
      {renderContent()}
    </aside>
  );
}
