import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api'; // Assuming api utility exists, else will fix

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
    fetchGroups();
  }, [category]); // re-fetch on category change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGroups();
  };

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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Study Groups</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded shadow-lg transition"
          >
            + Create Group
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800 p-4 rounded-lg mb-8 shadow">
          <div className="flex space-x-2 overflow-x-auto w-full md:w-auto mb-4 md:mb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-1 rounded-full whitespace-nowrap transition ${
                  (category === cat || (category === '' && cat === 'All'))
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full md:w-64 flex">
            <input 
              type="text" 
              placeholder="Search groups..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-l focus:outline-none focus:border-indigo-500 text-white"
            />
            <button type="submit" className="bg-gray-600 px-4 rounded-r hover:bg-gray-500">
              Search
            </button>
          </form>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading study groups...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-gray-800 rounded-lg">
            No study groups found. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-indigo-500 transition group flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">{group.name}</h3>
                  <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded-full">
                    {group.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">
                  {group.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center text-gray-400 text-sm">
                    <span className="mr-1">👥</span> {group.memberCount} Members
                  </div>
                  <Link 
                    to={`/study-groups/${group._id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                  >
                    View Group &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Create Study Group</h2>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Group Name</label>
                  <input 
                    type="text" 
                    required
                    maxLength={100}
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white"
                    placeholder="e.g. Algorithms Prep"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-400 text-sm mb-2">Category</label>
                  <select 
                    required
                    value={newGroup.category}
                    onChange={(e) => setNewGroup({...newGroup, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">Description</label>
                  <textarea 
                    maxLength={500}
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-indigo-500 text-white h-24 resize-none"
                    placeholder="What is this group about?"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded shadow transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
