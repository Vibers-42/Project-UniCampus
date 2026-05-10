import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, Plus, Users, ArrowRight, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'DSA', 'Math', 'AI/ML', 'General', 'DBMS', 'Web Dev'];

export default function StudyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'General' });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      
      const res = await api.get('/studyGroups', { params });
      setGroups(res.data.data);
    } catch (err) {
      console.error('Failed to fetch study groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/studyGroups', newGroup);
      setShowModal(false);
      setNewGroup({ name: '', description: '', category: 'General' });
      fetchGroups();
    } catch (err) {
      console.error('Failed to create group', err);
      alert('Error creating group');
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
            <span className="p-2 bg-primary-500/10 rounded-2xl text-2xl border border-primary-500/20">👥</span>
            Study Groups
          </h1>
          <p className="text-dark-400 mt-2 font-medium">Collaborate with peers on various subjects.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} strokeWidth={2.5} />
          Create New Group
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
              placeholder="Search groups..."
              className="input-field pl-11 bg-dark-900 border-dark-700/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          <div className="w-full flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 text-dark-500">
              <Filter size={18} />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    category === cat 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.02]' 
                      : 'bg-dark-900 border border-dark-800 text-dark-400 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-bold tracking-widest uppercase text-xs">Loading Groups...</p>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="auth-card p-6 border-dark-800 hover:border-primary-500/30 transition-all duration-300 group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary-500/10 text-primary-400 text-[10px] font-bold px-2 py-1 rounded-md border border-primary-500/20 uppercase tracking-tighter">
                  {group.category}
                </span>
                <div className="flex items-center text-[10px] text-dark-500 font-bold uppercase tracking-widest">
                  <Users size={12} className="mr-1" /> {group.memberCount} Members
                </div>
              </div>
              <h3 className="text-xl font-bold text-dark-100 group-hover:text-primary-300 transition-colors mb-2 line-clamp-1">
                {group.name}
              </h3>
              <p className="text-dark-400 text-sm mb-6 flex-grow line-clamp-2 leading-relaxed">
                {group.description || 'No description provided.'}
              </p>
              <div className="pt-4 border-t border-dark-800 flex justify-between items-center">
                <p className="text-[10px] text-dark-500 font-medium">By {group.createdBy}</p>
                <Link 
                  to={`/study-groups/${group._id}`}
                  className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 group/link"
                >
                  Enter Lounge
                  <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="auth-card py-24 flex flex-col items-center justify-center text-center border-dashed border-dark-700 bg-dark-900/40">
          <Users size={48} className="text-dark-500 mb-4" />
          <h3 className="text-dark-100 font-bold text-xl mb-2">No groups found</h3>
          <p className="text-dark-400 text-sm max-w-sm mx-auto">
            Try adjusting your search or category filters to find what you're looking for.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="auth-card w-full max-w-md relative z-10 p-8 shadow-2xl border-dark-800">
            <h2 className="text-2xl font-bold text-dark-100 mb-6 flex items-center gap-2">
              <Plus className="text-primary-500" /> Create Study Group
            </h2>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Group Name</label>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Category</label>
                <select 
                  required
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({...newGroup, category: e.target.value})}
                  className="input-field bg-dark-950"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-400 uppercase tracking-widest px-1">Description</label>
                <textarea 
                  maxLength={500}
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="input-field h-24 resize-none"
                  placeholder="What is this group about?"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
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
