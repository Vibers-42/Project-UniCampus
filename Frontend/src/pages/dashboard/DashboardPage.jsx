import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../hooks/useFeed';
import CreatePost from '../../components/feed/CreatePost';
import PostCard from '../../components/feed/PostCard';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PlusCircle, UploadCloud, MessageSquare, ShoppingBag, CalendarPlus, Users } from 'lucide-react';

const FEED_TABS = [
  { id: 'For You', backendType: 'All' },
  { id: 'Trending', backendType: 'All' },
  { id: 'Campus Activity', backendType: 'All' },
  { id: 'Teams', backendType: 'Discussion' }, // Mapped for MVP
  { id: 'Opportunities', backendType: 'General' }, // Mapped for MVP
  { id: 'Marketplace Nearby', backendType: 'Marketplace' }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { posts, loading, fetchFeed, createPost, likePost } = useFeed();
  const [activeTab, setActiveTab] = useState(FEED_TABS[0]);

  useEffect(() => {
    // For MVP, we map the contextual frontend tabs to the existing backend feed types
    fetchFeed(activeTab.backendType);
  }, [activeTab, fetchFeed]);

  const quickActions = [
    { name: 'Find Team', icon: Users, path: '/teammates/create', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Add Resource', icon: UploadCloud, path: '/resources', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Ask Doubt', icon: MessageSquare, path: '/ai-solver', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Sell Item', icon: ShoppingBag, path: '/marketplace', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'New Event', icon: CalendarPlus, path: '/events/create', color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { name: 'Study Group', icon: PlusCircle, path: '/study-groups', color: 'text-primary-400', bg: 'bg-primary-500/10' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
          Dashboard <span className="text-dark-500 font-normal">/</span> <span className="text-primary-400">Home</span>
        </h2>
        <p className="text-dark-400 mt-1 font-medium">What's happening around you today, {user?.fullName?.split(' ')[0] || 'there'}?</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className="auth-card p-4 flex flex-col items-center justify-center text-center group hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer border border-dark-800 bg-dark-900/40"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <action.icon size={18} className={action.color} />
              </div>
              <span className="text-xs font-bold text-dark-200 group-hover:text-dark-100">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Post Creation */}
      <div className="mb-8">
        <CreatePost onSubmit={createPost} />
      </div>

      {/* Feed Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar border-b border-dark-800/50">
        {FEED_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all duration-200 ${
              activeTab.id === tab.id 
                ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-500/5' 
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-900/50 border-b-2 border-transparent'
            }`}
          >
            {tab.id}
          </button>
        ))}
      </div>

      {/* Feed Section */}
      {loading ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          <p className="text-dark-400 font-bold text-xs uppercase tracking-widest">Compiling your feed...</p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6 max-w-2xl">
          {posts.map(post => (
            <PostCard key={post._id} post={post} onLike={likePost} />
          ))}
          <div className="py-6 text-center">
            <p className="text-dark-500 text-xs font-bold uppercase tracking-widest">You've caught up for now!</p>
          </div>
        </div>
      ) : (
        <div className="auth-card py-20 text-center border-dashed border-dark-700 bg-dark-900/30 max-w-2xl">
          <div className="text-5xl mb-5 opacity-50">🧭</div>
          <h3 className="text-dark-100 font-bold text-lg mb-2">No activity in this view</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto leading-relaxed">
            There doesn't seem to be anything matching your "{activeTab.id}" context right now.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
