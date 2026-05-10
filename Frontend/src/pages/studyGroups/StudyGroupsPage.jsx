import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: '' });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      let query = '?';
      if (search) query += `search=${search}&`;
      if (category) query += `category=${category}`;
      const res = await api.get(`/studyGroups${query}`);
      setGroups(res.data.data);
    } catch (err) {
      console.error('Failed to fetch study groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGroups();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, search]); // re-fetch on category or search change with debounce

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/studyGroups', newGroup);
      setShowModal(false);
      setNewGroup({ name: '', description: '', category: '' });
      fetchGroups();
    } catch (err) {
      console.error('Failed to create group', err);
      alert('Error creating group');
    }
  };

  const categories = ['All', 'DSA', 'Math', 'AI/ML', 'General', 'DBMS', 'Web Dev'];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <span className="text-3xl">👥</span> Study Groups
          </h2>
          <p className="text-dark-400 mt-1">Join study groups and collaborate with peers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary w-auto whitespace-nowrap shadow-lg shadow-primary-500/20"
        >
          + Create Group
        </button>
      </div>

      {/* Filters & Search */}
      <div className="auth-card p-4 mb-8 sticky top-[72px] z-40 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              className="input-field pl-10 bg-dark-950 border-dark-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="w-full overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === 'All' ? '' : cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    (category === cat || (category === '' && cat === 'All'))
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                      : 'bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400 font-medium">Loading study groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="auth-card py-24 text-center border-dashed border-dark-700 bg-dark-900/40">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-dark-200 font-semibold text-lg mb-2">No study groups found</h3>
          <p className="text-dark-400 text-sm max-w-md mx-auto">
            Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="auth-card p-6 flex flex-col group hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-dark-100 group-hover:text-primary-400 transition-colors">{group.name}</h3>
                <span className="bg-primary-500/10 text-primary-400 text-xs px-2.5 py-1 rounded-full font-medium border border-primary-500/20">
                  {group.category}
                </span>
              </div>
              <p className="text-dark-400 text-sm mb-4 flex-grow line-clamp-2">
                {group.description || 'No description provided.'}
              </p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-800">
                <div className="flex items-center text-dark-400 text-sm">
                  <span className="mr-1">👥</span> {group.memberCount} Members
                </div>
                <Link 
                  to={`/study-groups/${group._id}`}
                  className="text-primary-400 hover:text-primary-300 font-medium text-sm flex items-center gap-1 group/link"
                >
                  View Group <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="auth-card p-8 max-w-md w-full shadow-2xl border border-dark-700 animate-slide-up">
            <h2 className="text-2xl font-bold text-dark-100 mb-6">Create Study Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-dark-300 text-sm font-medium mb-2">Group Name</label>
                <input 
                  type="text" 
                  required
                  maxLength={100}
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Algorithms Prep"
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-300 text-sm font-medium mb-2">Category</label>
                <select 
                  required
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({...newGroup, category: e.target.value})}
                  className="input-field"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-dark-300 text-sm font-medium mb-2">Description</label>
                <textarea 
                  maxLength={500}
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="input-field h-24 resize-none"
                  placeholder="What is this group about?"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-dark-300 hover:text-dark-100 hover:bg-dark-800 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
