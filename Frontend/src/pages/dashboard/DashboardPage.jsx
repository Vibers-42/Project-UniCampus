import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../hooks/useFeed';
import CreatePost from '../../components/feed/CreatePost';
import PostCard from '../../components/feed/PostCard';
import DashboardLayout from '../../components/layout/DashboardLayout';

const TABS = ['All', 'Resource', 'Discussion', 'Event', 'Marketplace'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { posts, loading, fetchFeed, createPost, likePost } = useFeed();
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchFeed(activeTab);
  }, [activeTab, fetchFeed]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark-100">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-dark-400 mt-1">Here&apos;s what&apos;s happening on campus today.</p>
      </div>

      {/* Profile completion prompt */}
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

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Role</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1 capitalize">{user?.role || 'Student'}</p>
        </div>
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Department</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1">{user?.department || 'Not set'}</p>
        </div>
        <div className="auth-card p-6">
          <h3 className="text-dark-400 text-sm font-medium">Year</h3>
          <p className="text-dark-100 text-lg font-semibold mt-1">
            {user?.yearOfStudy ? `${user.yearOfStudy}${['st', 'nd', 'rd', 'th'][user.yearOfStudy - 1] || 'th'} Year` : 'Not set'}
          </p>
        </div>
      </div>

      {/* Feed Section */}
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
    </DashboardLayout>
  );
}
