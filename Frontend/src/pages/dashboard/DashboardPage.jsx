import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../hooks/useFeed';
import CreatePost from '../../components/feed/CreatePost';
import PostCard from '../../components/feed/PostCard';
import RightSidebar from '../../components/feed/RightSidebar';

const TABS = ['All', 'Resource', 'Discussion', 'Event', 'Marketplace'];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { posts, loading, fetchFeed, createPost, likePost } = useFeed();
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab, fetchFeed]);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Top bar */}
      <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-[90rem] mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent tracking-tight">
            UniCampus
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-dark-200 text-sm font-medium">{user?.fullName || 'Student'}</p>
              <p className="text-dark-500 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-dark-200 border border-dark-700/50 rounded-lg hover:bg-dark-800 transition-all"
              id="logout-btn"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-[90rem] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Profile summary & Navigation) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="auth-card p-6 text-center">
              <img 
                src={user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'User') + '&background=random'} 
                alt="Profile" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-dark-800 shadow-xl" 
              />
              <h2 className="text-dark-100 font-bold text-lg mb-1">{user?.fullName}</h2>
              <p className="text-dark-400 text-sm mb-4">@{user?.email?.split('@')[0]}</p>
              {user?.badges?.length > 0 && (
                <div className="mb-4">
                  <span className="chip bg-primary-500/10 text-primary-400 border-primary-500/30">{user.badges[0]}</span>
                </div>
              )}
              <div className="border-t border-dark-800/80 pt-4 mt-2 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Department</span>
                  <span className="text-dark-200 font-medium">{user?.department || 'Not set'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Role</span>
                  <span className="text-dark-200 font-medium capitalize">{user?.role || 'Student'}</span>
                </div>
              </div>
            </div>

            <nav className="auth-card p-3">
              <ul className="space-y-1">
                <li>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-dark-100 bg-dark-800/80 rounded-xl font-medium shadow-sm border border-dark-700/50">
                    <span className="text-xl">🏠</span> Home Feed
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-xl transition-all">
                    <span className="text-xl">📚</span> Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-xl transition-all">
                    <span className="text-xl">📅</span> Events
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 rounded-xl transition-all">
                    <span className="text-xl">🤝</span> Matching
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Center Feed */}
          <div className="col-span-1 lg:col-span-2">
            
            {/* Profile completion prompt (Mobile only or keep at top?) */}
            {user?.profileCompletionPercent < 100 && (
              <div className="mb-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-dark-200 font-medium text-sm">Complete your profile</p>
                  <p className="text-dark-400 text-xs mt-0.5">
                    Your profile is {user?.profileCompletionPercent || 0}% complete.
                  </p>
                </div>
                <div className="w-20 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                    style={{ width: `${user?.profileCompletionPercent || 0}%` }}
                  />
                </div>
              </div>
            )}

            <CreatePost onSubmit={createPost} />

            {/* Feed Tabs */}
            <div className="flex overflow-x-auto gap-3 mb-6 pb-2 hide-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                    activeTab === tab 
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30' 
                      : 'bg-dark-900 border border-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                  }`}
                >
                  {tab === 'All' ? 'All Posts' : `${tab}s`}
                </button>
              ))}
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="text-center py-12 text-dark-400 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                Loading your feed...
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard key={post._id} post={post} onLike={likePost} />
                ))}
              </div>
            ) : (
              <div className="auth-card py-16 text-center border-dashed border-dark-700 bg-dark-900/40">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-dark-200 font-medium mb-1">No posts yet</h3>
                <p className="text-dark-500 text-sm">Be the first to share something in this category!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block col-span-1">
            <RightSidebar />
          </div>

        </div>
      </main>
    </div>
  );
}
