import { ShieldAlert, TrendingUp, Search, Clock, BarChart2, ChevronRight } from 'lucide-react';

export default function MarketplaceSidebar() {
  const fastSelling = [
    { id: 1, name: 'Calculators', count: '12 listed this week' },
    { id: 2, name: 'Engineering Drawing Kits', count: 'High demand' },
    { id: 3, name: 'Hostel Coolers', count: 'Selling fast' }
  ];

  const recentlyAdded = [
    { id: 1, title: 'Arduino Uno R3 Kit', price: '₹1,200', time: '2h ago' },
    { id: 2, title: 'Desk Lamp (LED)', price: '₹300', time: '5h ago' },
    { id: 3, title: 'DSA Textbook', price: '₹350', time: '1d ago' }
  ];

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:block overflow-y-auto hide-scrollbar">
      <div className="p-6 h-full space-y-6">
        
        {/* Safety Widget */}
        <div className="bg-orange-500/10 rounded-2xl p-5 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="text-orange-400 w-5 h-5" />
            <h3 className="text-sm font-semibold text-orange-400">Stay Safe</h3>
          </div>
          <ul className="text-xs text-orange-300/80 leading-relaxed space-y-2 list-disc pl-4">
            <li>Meet in public campus areas (e.g., Food Court, Library).</li>
            <li>Verify items before paying.</li>
            <li>Don't share sensitive personal info.</li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary-400/80" />
            Marketplace Pulse
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/50">
              <p className="text-xl font-black text-primary-400">48</p>
              <p className="text-[9px] text-dark-400 font-bold uppercase tracking-wider mt-1">Active Listings</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-3 text-center border border-dark-700/50">
              <p className="text-xl font-black text-green-400">12</p>
              <p className="text-[9px] text-dark-400 font-bold uppercase tracking-wider mt-1">Sold This Week</p>
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400/80" />
              Recently Added
            </h3>
          </div>
          
          <div className="space-y-4">
            {recentlyAdded.map(item => (
              <div key={item.id} className="flex items-center justify-between group cursor-pointer border-b border-dark-800/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-medium text-dark-200 group-hover:text-primary-300 transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-dark-500">{item.time}</p>
                </div>
                <span className="text-xs font-bold text-primary-400">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Categories */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400/80" />
              Fast Selling
            </h3>
          </div>
          
          <div className="space-y-4">
            {fastSelling.map(item => (
              <div key={item.id} className="flex flex-col gap-1 group cursor-pointer border-b border-dark-800/50 pb-3 last:border-0 last:pb-0">
                <h4 className="text-sm font-medium text-dark-200 group-hover:text-green-400 transition-colors flex justify-between">
                  {item.name}
                  <ChevronRight className="w-4 h-4 text-dark-500 group-hover:text-green-400 transition-colors" />
                </h4>
                <p className="text-[10px] text-dark-400">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-dark-400" />
              Popular Searches
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Scientific Calculator', 'Mini Drafter', 'Study Table', 'Bicycle', 'Lab Coat', 'Arduino', 'Textbooks'].map(tag => (
              <span key={tag} className="text-[10px] text-dark-300 bg-dark-800 hover:bg-dark-700 hover:text-dark-100 cursor-pointer px-2 py-1 rounded border border-dark-700 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
      </div>
    </aside>
  );
}
