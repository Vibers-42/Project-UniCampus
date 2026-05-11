import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useMarketplace } from '../../hooks/useMarketplace';
import MarketplaceCard from '../../components/marketplace/MarketplaceCard';
import PostItemModal from './PostItemModal';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Plus, Package, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { MOCK_MARKETPLACE_ITEMS } from '../../data/mockMarketplace';

const CATEGORIES = [
  'All', 'Electronics', 'Books', 'Lab Equipment', 'Stationery', 
  'Hostel Essentials', 'Gadgets', 'Cycles', 'Furniture', 
  'Study Materials', 'Event Passes', 'Calculators', 'Other'
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const { items, loading, fetchItems } = useMarketplace();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  const scrollContainerRef = useRef(null);

  const refetchItems = () => {
    fetchItems({ 
      category: activeCategory === 'All' ? '' : activeCategory, 
      search: searchQuery,
      sellerId: showMyPosts ? user?.id : undefined
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refetchItems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery, showMyPosts, fetchItems, user?.id]);

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getFilteredMockItems = () => {
    return MOCK_MARKETPLACE_ITEMS.filter(item => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (showMyPosts && item.sellerId._id !== user?.id) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }
      return true;
    });
  };

  const filteredMocks = getFilteredMockItems();
  const displayItems = items.length > 0 ? items : filteredMocks;

  const handleOpenCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    refetchItems();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
            <span className="p-2 bg-primary-500/10 rounded-2xl text-2xl border border-primary-500/20">🛒</span>
            Campus Marketplace
          </h1>
          <p className="text-dark-400 mt-2 font-medium">Buy and sell items securely within the campus community.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} strokeWidth={2.5} />
          Post Listing
        </button>
      </div>

      {/* Filter Bar */}
      <div className="auth-card p-4 mb-8 sticky top-[72px] z-40 shadow-xl border-dark-800 bg-dark-950/95 backdrop-blur-xl space-y-4">
        
        {/* Top Row: Search and Toggles */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-500" />
            </div>
            <input
              type="text"
              placeholder="Search items, tags, or categories..."
              className="input-field pl-11 bg-dark-900 border-dark-700/50 hover:border-dark-600 transition-colors placeholder:text-dark-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-auto flex items-center bg-dark-900 p-1 rounded-xl border border-dark-800">
            <button
              onClick={() => setShowMyPosts(false)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                !showMyPosts ? 'bg-dark-800 text-dark-100 shadow-sm' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setShowMyPosts(true)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                showMyPosts ? 'bg-primary-500/20 text-primary-400 shadow-sm border border-primary-500/20' : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <User size={16} /> My Posts
            </button>
          </div>
        </div>
        
        {/* Bottom Row: Horizontal Category Scroll */}
        <div className="relative flex items-center border-t border-dark-800 pt-4">
          <button 
            onClick={() => scrollCategories('left')}
            className="absolute left-0 z-10 p-1 bg-gradient-to-r from-dark-950 via-dark-950 to-transparent pr-4 text-dark-400 hover:text-primary-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto hide-scrollbar px-8"
          >
            <div className="flex gap-2 min-w-max pb-1">
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

          <button 
            onClick={() => scrollCategories('right')}
            className="absolute right-0 z-10 p-1 bg-gradient-to-l from-dark-950 via-dark-950 to-transparent pl-4 text-dark-400 hover:text-primary-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-bold tracking-widest uppercase text-xs">Syncing Listings...</p>
        </div>
      ) : displayItems.length > 0 ? (
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {items.length === 0 && (
            <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm flex items-start gap-3">
              <Filter className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Demo Mode Active:</strong> We couldn't find live listings matching your criteria in the database. Showing fully-fleshed placeholder examples for demonstration purposes. Once real data is populated, these placeholders will automatically disappear.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayItems.map(item => (
              <MarketplaceCard 
                key={item._id} 
                item={item} 
                isOwner={user?.id === item.sellerId?._id}
                onEdit={() => handleOpenEdit(item)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="auth-card py-24 flex flex-col items-center justify-center text-center border-dashed border-dark-700 bg-dark-900/40 backdrop-blur-sm">
          <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-dark-700">
            <Package size={40} className="text-dark-500" />
          </div>
          <h3 className="text-dark-100 font-bold text-xl mb-2">No items found</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto leading-relaxed">
            We couldn't find any listings matching your current filters. Try searching for something else or be the first to post!
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); setShowMyPosts(false); }}
            className="mt-6 text-primary-400 font-bold text-sm hover:text-primary-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Modal (create + edit) */}
      <PostItemModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleModalSuccess}
        editItem={editItem}
      />
    </DashboardLayout>
  );
}
