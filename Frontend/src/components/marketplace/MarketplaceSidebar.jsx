import { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Search, Clock, BarChart2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

export default function MarketplaceSidebar() {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ active: 0, sold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/marketplace?limit=20&sort=-createdAt&includeSold=true');
        const items = res.data?.data?.items || [];
        
        const active = items.filter(i => !i.isSold).length;
        const sold = items.filter(i => i.isSold).length;
        setStats({ active, sold });
        
        // Show 3 most recent non-sold items
        setRecentItems(items.filter(i => !i.isSold).slice(0, 3));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Extract popular categories from real data
  const categoryCounts = {};
  recentItems.forEach(item => {
    const cat = item.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-6">
      
      {/* Safety Widget (static — safety tips are informational, not data) */}
      <div className="bg-orange-500/10 rounded-2xl p-5 border border-orange-500/20">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="text-orange-400 w-5 h-5" />
          <h3 className="text-sm font-semibold text-orange-400">Stay Safe</h3>
        </div>
        <ul className="text-xs text-orange-300/80 leading-relaxed space-y-2 list-disc pl-4">
          <li>Meet in public campus areas (e.g., Food Court, Library).</li>
          <li>Verify items before paying.</li>
          <li>Don&apos;t share sensitive personal info.</li>
        </ul>
      </div>

      {/* Quick Stats (real data) */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
        <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-primary-400/80" />
          Marketplace Pulse
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/50">
            <p className="text-xl font-black text-primary-400">{loading ? '–' : stats.active}</p>
            <p className="text-[9px] text-dark-400 font-bold uppercase tracking-wider mt-1">Active Listings</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/50">
            <p className="text-xl font-black text-green-400">{loading ? '–' : stats.sold}</p>
            <p className="text-[9px] text-dark-400 font-bold uppercase tracking-wider mt-1">Sold Items</p>
          </div>
        </div>
      </div>

      {/* Recently Added (real data) */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400/80" />
            Recently Added
          </h3>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-dark-800 rounded-lg animate-pulse" />)}
          </div>
        ) : recentItems.length === 0 ? (
          <p className="text-xs text-dark-500 text-center py-4">No items listed yet</p>
        ) : (
          <div className="space-y-4">
            {recentItems.map(item => (
              <Link key={item._id} to={`/marketplace/${item._id}`} className="flex items-center justify-between group cursor-pointer border-b border-dark-800/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-dark-500">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                </div>
                <span className="text-xs font-bold text-primary-400 shrink-0 ml-2">₹{item.price?.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Searches (static navigation aids — not pretending to be data) */}
      <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-dark-400" />
            Popular Categories
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['Electronics', 'Books', 'Stationery', 'Accessories', 'Lab Equipment', 'Furniture'].map(tag => (
            <span key={tag} className="text-[10px] text-dark-300 bg-dark-800 hover:bg-dark-700 hover:text-dark-100 cursor-pointer px-2 py-1 rounded border border-dark-700 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
    </div>
  );
}
