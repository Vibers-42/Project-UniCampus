import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Target, UserPlus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { formatDistanceToNow } from 'date-fns';

export default function TeammatesPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `/teammates?status=open${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`;
      const res = await api.get(url);
      setProjects(res.data.data.projects);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 0);
    return () => clearTimeout(timer);
  }, [categoryFilter, fetchProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark-100 flex items-center gap-3">
              <UserPlus className="text-primary-500" size={32} />
              Find Teammates
            </h1>
            <p className="text-dark-400 mt-1">Join a project or recruit for your next big idea.</p>
          </div>
          <Link
            to="/teammates/create"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 font-medium"
          >
            <Plus size={20} />
            Post Requirement
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-dark-900 border border-dark-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
            <input
              type="text"
              placeholder="Search projects, skills, or ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 rounded-xl py-3 pl-12 pr-4 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all outline-none"
            />
          </form>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
            {['all', 'hackathon', 'project', 'startup', 'competition'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2.5 rounded-xl capitalize whitespace-nowrap transition-all font-medium ${
                  categoryFilter === cat
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'bg-dark-950 text-dark-400 border border-dark-800 hover:text-dark-200 hover:border-dark-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

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
            <h3 className="text-xl font-bold text-dark-100">No projects found</h3>
            <p className="text-dark-400 mt-2">Try adjusting your filters or post a new requirement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const spotsFilled = project.currentTeamSize;
              const spotsTotal = project.requiredTeamSize;
              const isFull = spotsFilled >= spotsTotal;

              return (
                <Link
                  key={project._id}
                  to={`/teammates/${project._id}`}
                  className="bg-dark-900 border border-dark-800 hover:border-primary-500/30 rounded-2xl p-6 transition-all group flex flex-col relative overflow-hidden shadow-lg hover:shadow-primary-500/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-3 py-1 bg-dark-800 text-dark-300 rounded-full capitalize border border-dark-700">
                      {project.category}
                    </span>
                    <span className="text-xs text-dark-500">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-dark-100 mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-dark-400 mb-6 line-clamp-2 flex-1">
                    {project.description}
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

                  <div className="flex items-center gap-3 pt-4 border-t border-dark-800">
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
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
