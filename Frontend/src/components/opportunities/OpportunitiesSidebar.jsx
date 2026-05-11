import { useState, useEffect } from 'react';
import { Briefcase, Calendar, FileText, Clock, ChevronRight, GraduationCap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

export default function OpportunitiesSidebar() {
  const [recentOpps, setRecentOpps] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/opportunities?limit=10&sort=-createdAt');
        const opps = res.data?.data?.items || res.data?.data?.opportunities || [];
        
        // Recent = latest 3
        setRecentOpps(opps.slice(0, 3));
        
        // Closing soon = opportunities with deadline within next 7 days
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const closing = opps
          .filter(o => o.deadline && new Date(o.deadline) > now && new Date(o.deadline) <= weekFromNow)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 3);
        setClosingSoon(closing);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      
      {/* Trending Opportunities Widget (real data) */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-400/80" />
            Latest Opportunities
          </h3>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-dark-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentOpps.length === 0 ? (
          <p className="text-xs text-dark-500 text-center py-4">No opportunities posted yet</p>
        ) : (
          <div className="space-y-4">
            {recentOpps.map(opp => (
              <Link key={opp._id} to={`/opportunities/${opp._id}`} className="group block">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors line-clamp-1">{opp.title}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-dark-400 bg-dark-800 px-2 py-0.5 rounded-md border border-dark-700 capitalize">
                    {opp.category || opp.type || 'General'}
                  </span>
                  <span className="text-[10px] text-dark-500">
                    {formatDistanceToNow(new Date(opp.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Closing Soon Widget (real data) */}
      {closingSoon.length > 0 && (
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400/80" />
              Closing Soon
            </h3>
          </div>
          
          <div className="space-y-4">
            {closingSoon.map(opp => (
              <Link key={opp._id} to={`/opportunities/${opp._id}`} className="flex items-center justify-between group cursor-pointer border-l-2 border-red-500/50 pl-3">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-red-400 transition-colors line-clamp-1">{opp.title}</h4>
                <span className="text-xs font-semibold text-red-400 shrink-0 ml-2">
                  {formatDistanceToNow(new Date(opp.deadline), { addSuffix: false })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Career Resources Widget (static links — these are navigation, not data) */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
        <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4 text-primary-400/80" />
          Career Resources
        </h3>
        <div className="space-y-2">
          <Link to="/portfolio/me" className="btn-secondary w-full text-xs py-2 flex justify-between items-center group">
            Update Portfolio
            <ChevronRight className="w-3 h-3 text-dark-500 group-hover:text-primary-400 transition-colors" />
          </Link>
          <Link to="/resources" className="btn-secondary w-full text-xs py-2 flex justify-between items-center group">
            Browse Resources
            <ChevronRight className="w-3 h-3 text-dark-500 group-hover:text-primary-400 transition-colors" />
          </Link>
        </div>
      </div>

    </div>
  );
}
