import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Target, UserPlus, Layers, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['all', 'hackathon', 'project', 'startup', 'competition', 'open source', 'research', 'freelance', 'college project', 'other'];

// Realistic demo placeholders — shown ONLY when the DB returns zero real posts
const DEMO_PROJECTS = [
  {
    _id: 'demo-1',
    title: 'AI Study Assistant — Looking for Frontend Dev',
    category: 'project',
    shortDescription: 'Building an AI-powered study planner that adapts to student schedules. Need a React developer for the dashboard UI.',
    currentTeamSize: 2,
    requiredTeamSize: 4,
    requiredRoles: ['Frontend', 'UI/UX'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    creatorId: { _id: 'demo-user-1', fullName: 'Aarav Sharma', rollNumber: '21P31A0501' },
    status: 'open',
    _isDemo: true
  },
  {
    _id: 'demo-2',
    title: 'Hackathon Squad — SIH 2026',
    category: 'hackathon',
    shortDescription: 'Recruiting backend and ML engineers for Smart India Hackathon. Problem statement: Rural Healthcare Access.',
    currentTeamSize: 3,
    requiredTeamSize: 6,
    requiredRoles: ['Backend', 'Machine Learning', 'DevOps'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    creatorId: { _id: 'demo-user-2', fullName: 'Priya Reddy', rollNumber: '22P35A0412' },
    status: 'open',
    _isDemo: true
  },
  {
    _id: 'demo-3',
    title: 'Campus Marketplace — Startup Idea',
    category: 'startup',
    shortDescription: 'A buy/sell/rent marketplace exclusively for university students. Need mobile app devs and a designer.',
    currentTeamSize: 1,
    requiredTeamSize: 4,
    requiredRoles: ['Flutter', 'React Native', 'UI Designer'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    creatorId: { _id: 'demo-user-3', fullName: 'Vikram Patel', rollNumber: '23P31A0203' },
    status: 'open',
    _isDemo: true
  },
  {
    _id: 'demo-4',
    title: 'Open Source Contribution — UniCampus Modules',
    category: 'open source',
    shortDescription: 'Contribute to UniCampus platform development. All skill levels welcome. Great for building your GitHub profile.',
    currentTeamSize: 4,
    requiredTeamSize: 10,
    requiredRoles: ['Frontend', 'Backend', 'Tester', 'Documentation'],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    creatorId: { _id: 'demo-user-4', fullName: 'Sneha Iyer', rollNumber: '21P31A0518' },
    status: 'open',
    _isDemo: true
  },
  {
    _id: 'demo-5',
    title: 'DBMS Mini Project — Team of 3 Needed',
    category: 'college project',
    shortDescription: 'Looking for 2 teammates to build a Library Management System for the 5th sem DBMS lab project.',
    currentTeamSize: 1,
    requiredTeamSize: 3,
    requiredRoles: ['SQL', 'Backend'],
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    creatorId: { _id: 'demo-user-5', fullName: 'Rahul Verma', rollNumber: '22P31A0507' },
    status: 'open',
    _isDemo: true
  },
  {
    _id: 'demo-6',
    title: 'Research Paper — NLP for Regional Languages',
    category: 'research',
    shortDescription: 'Working on a research paper on NLP techniques for Telugu and Hindi text classification. Need collaborators with Python/ML background.',
    currentTeamSize: 2,
    requiredTeamSize: 4,
    requiredRoles: ['ML Engineer', 'Data Analyst'],
    createdAt: new Date(Date.now() - 518400000).toISOString(),
    creatorId: { _id: 'demo-user-6', fullName: 'Ananya Gupta', rollNumber: '21P31A0520' },
    status: 'open',
    _isDemo: true
  }
];

export default function TeammatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'mine'
  const [usingDemo, setUsingDemo] = useState(false); // tracks whether we are showing placeholder data

  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const url = `/teammates?status=open${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`;
      const res = await api.get(url);
      
      let fetchedProjects = res.data.data.projects;
      
      if (viewMode === 'mine') {
        fetchedProjects = fetchedProjects.filter(p => p.creatorId?._id === user?._id);
      }

      // If DB returned real posts → use them; otherwise show demo placeholders
      if (fetchedProjects.length > 0 || viewMode === 'mine') {
        setProjects(fetchedProjects);
        setUsingDemo(false);
      } else {
        // Apply client-side category/search filtering on demo data
        let demoFiltered = [...DEMO_PROJECTS];
        if (categoryFilter !== 'all') {
          demoFiltered = demoFiltered.filter(p => p.category === categoryFilter);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          demoFiltered = demoFiltered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          );
        }
        setProjects(demoFiltered);
        setUsingDemo(true);
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
      // On network error, show demo data as fallback
      setProjects(DEMO_PROJECTS);
      setUsingDemo(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, viewMode, searchQuery]);

  const handleDelete = async (e, projectId) => {
    e.preventDefault(); // Prevent navigating to detail page
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await api.delete(`/teammates/${projectId}`);
      // Remove from UI immediately
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (error) {
      console.error('Failed to delete project', error);
      alert('Failed to delete project.');
    }
  };

  const handleEdit = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/teammates/edit/${projectId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
              <UserPlus className="text-primary-500" size={32} />
              Find Teammates
            </h1>
            <p className="text-dark-400 mt-1">Join a project or recruit for your next big idea.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setViewMode('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-dark-800 text-dark-100 shadow-sm border border-dark-700' : 'text-dark-400 hover:bg-dark-900 border border-transparent'}`}
            >
              All Projects
            </button>
            <button
              onClick={() => setViewMode('mine')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'mine' ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20' : 'bg-dark-900 text-dark-400 hover:text-dark-200 border border-dark-800'}`}
            >
              <Layers size={16} /> My Posts
            </button>
            <Link
              to="/teammates/create"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 font-bold text-sm"
            >
              <Plus size={18} />
              Post Requirement
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-900 border border-dark-800 p-6 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
              <input
                type="text"
                placeholder="Search projects, roles, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-950 border border-dark-800 rounded-xl py-3.5 pl-12 pr-4 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={scrollLeft} className="p-2 bg-dark-950 border border-dark-800 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors shrink-0 hidden md:block">
              <ChevronLeft size={20} />
            </button>
            <div ref={scrollRef} className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-2 scroll-smooth flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-all font-medium text-sm ${
                    categoryFilter === cat
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                      : 'bg-dark-950 text-dark-400 border border-dark-800 hover:text-dark-200 hover:border-dark-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={scrollRight} className="p-2 bg-dark-950 border border-dark-800 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors shrink-0 hidden md:block">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Demo data banner */}
        {usingDemo && (
          <div className="bg-primary-500/5 border border-primary-500/20 rounded-2xl px-6 py-4 flex items-center gap-3">
            <Target size={20} className="text-primary-400 shrink-0" />
            <p className="text-sm text-dark-300">
              <span className="font-bold text-primary-400">Showing demo projects.</span> Be the first to{' '}
              <Link to="/teammates/create" className="text-primary-400 underline hover:text-primary-300">post a real requirement</Link>{' '}
              and recruit teammates!
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-dark-900 border border-dark-800 rounded-3xl">
            <Target className="mx-auto h-16 w-16 text-dark-600 mb-4" />
            <h3 className="text-xl font-bold text-dark-100">{viewMode === 'mine' ? 'You have no active posts' : 'No projects found'}</h3>
            <p className="text-dark-400 mt-2 mb-6">
              {viewMode === 'mine' ? 'Post a requirement to find teammates for your next project.' : 'Try adjusting your filters or post a new requirement.'}
            </p>
            <Link
              to="/teammates/create"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 font-bold text-sm"
            >
              <Plus size={18} />
              Post Requirement
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const spotsFilled = project.currentTeamSize;
              const spotsTotal = project.requiredTeamSize;
              const isFull = spotsFilled >= spotsTotal;
              const isCreator = user?._id === project.creatorId?._id;
              const isDemo = project._isDemo;

              return (
                <div
                  key={project._id}
                  onClick={() => {
                    if (isDemo) return; // Demo posts don't navigate
                    navigate(`/teammates/${project._id}`);
                  }}
                  className={`bg-dark-900 border border-dark-800 hover:border-primary-500/30 rounded-2xl p-6 transition-all group flex flex-col relative overflow-hidden shadow-lg hover:shadow-primary-500/5 ${isDemo ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Demo badge */}
                  {isDemo && (
                    <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest text-dark-500 bg-dark-800 px-2 py-0.5 rounded-full border border-dark-700">
                      Demo
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-dark-800 text-dark-300 rounded-full border border-dark-700">
                      {project.category}
                    </span>
                    {!isDemo && (
                      <span className="text-xs text-dark-500">
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold text-dark-100 mb-2 transition-colors line-clamp-1 ${!isDemo ? 'group-hover:text-primary-400' : ''}`}>
                    {project.title}
                  </h3>
                  <p className="text-sm text-dark-400 mb-6 line-clamp-2 flex-1">
                    {project.shortDescription || project.description}
                  </p>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-dark-500" />
                      <div className="flex-1 bg-dark-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isFull ? 'bg-green-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min((spotsFilled / spotsTotal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-dark-300">
                        {spotsFilled}/{spotsTotal}
                      </span>
                    </div>
                    {project.requiredRoles && project.requiredRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.requiredRoles.slice(0, 2).map((role, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-primary-900/30 text-primary-300 px-2 py-1 rounded border border-primary-800/50">
                            {role}
                          </span>
                        ))}
                        {project.requiredRoles.length > 2 && (
                          <span className="text-[10px] font-medium bg-dark-800 text-dark-400 px-2 py-1 rounded border border-dark-700">
                            +{project.requiredRoles.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dark-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-800 overflow-hidden shrink-0 border border-dark-700">
                        {project.creatorId?.avatar ? (
                          <img src={project.creatorId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-dark-400">
                            {project.creatorId?.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-dark-200 truncate">{project.creatorId?.fullName || 'Student'}</p>
                        <p className="text-xs text-dark-500 truncate">{project.creatorId?.rollNumber || ''}</p>
                      </div>
                    </div>

                    {isCreator && !isDemo && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleEdit(e, project._id)}
                          className="p-2 bg-dark-800 hover:bg-primary-600 text-dark-300 hover:text-white rounded-lg transition-colors border border-dark-700"
                          title="Edit post"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, project._id)}
                          className="p-2 bg-dark-800 hover:bg-red-500/20 text-dark-300 hover:text-red-400 rounded-lg transition-colors border border-dark-700"
                          title="Delete post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
