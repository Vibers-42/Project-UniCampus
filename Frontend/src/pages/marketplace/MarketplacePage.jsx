import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useMarketplace } from '../../hooks/useMarketplace';
import MarketplaceCard from '../../components/marketplace/MarketplaceCard';
import PostItemModal from './PostItemModal';
import { Search, Filter, Plus, PackageSearch } from 'lucide-react';

const CATEGORIES = ['All', 'Books', 'Calculators', 'Lab Equipment', 'Hostel Items', 'Gadgets', 'Cycles', 'Study Materials', 'Event Passes', 'Other'];

export default function MarketplacePage() {
  const { items, loading, fetchItems } = useMarketplace();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems({ 
        category: activeCategory === 'All' ? '' : activeCategory, 
        search: searchQuery 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery, fetchItems]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
            <span className="p-2 bg-primary-500/10 rounded-2xl text-2xl border border-primary-500/20">🛒</span>
            Campus Marketplace
          </h1>
          <p className="text-dark-400 mt-2 font-medium">Buy and sell items within the campus community.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} strokeWidth={2.5} />
          Post New Item
        </button>
      </div>

      {/* Filter Bar */}
      <div className="auth-card p-4 mb-8 sticky top-[72px] z-40 shadow-xl border-dark-800 bg-dark-950/80 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-500" />
            </div>
            <input
              type="text"
              placeholder="What are you looking for?"
              className="input-field pl-11 bg-dark-900 border-dark-700/50 hover:border-dark-600 transition-colors placeholder:text-dark-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          <div className="w-full flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 text-dark-500">
              <Filter size={18} />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.02]' 
                      : 'bg-dark-900 border border-dark-800 text-dark-400 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-bold tracking-widest uppercase text-xs">Syncing Listings...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <MarketplaceCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="auth-card py-24 flex flex-col items-center justify-center text-center border-dashed border-dark-700 bg-dark-900/40 backdrop-blur-sm">
          <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-dark-700">
            <PackageSearch size={40} className="text-dark-500" />
          </div>
          <h3 className="text-dark-100 font-bold text-xl mb-2">No items found</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto leading-relaxed">
            We couldn't find any listings matching your current filters. Try searching for something else or be the first to post!
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-6 text-primary-400 font-bold text-sm hover:text-primary-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Modal */}
      <PostItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchItems();
        }}
      />
    </DashboardLayout>
  );
}
