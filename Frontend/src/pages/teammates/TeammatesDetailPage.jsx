import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Target, Code2, Briefcase, Trash2, ShieldCheck, FileText, Link as LinkIcon, Calendar, Wrench, Edit } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

export default function TeammatesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/teammates/${id}`);
      setProject(res.data.data.project);
    } catch (error) {
      console.error('Failed to fetch project details', error);
      navigate('/teammates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/teammates/${id}`);
      navigate('/teammates');
    } catch (error) {
      console.error('Failed to delete project', error);
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/teammates/${id}`, { status: newStatus });
      fetchProject();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-8 w-24 bg-dark-800 rounded"></div>
          <div className="h-64 bg-dark-900 rounded-3xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) return null;

  const isCreator = user?._id === project.creatorId?._id;
  const spotsFilled = project.currentTeamSize;
  const spotsTotal = project.requiredTeamSize;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Link to="/teammates" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors">
          <ArrowLeft size={20} />
          Back to Teammates
        </Link>

        {/* Main Content Card */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="h-32 bg-gradient-to-r from-primary-900/40 to-dark-900 relative border-b border-dark-800">
            <div className="absolute top-6 right-6 flex gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                project.status === 'open' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {project.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-10 -mt-16 relative z-10">
            {/* Title & Category */}
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-sm font-bold uppercase tracking-wider mb-4 shadow-lg shadow-primary-500/10">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-dark-100 leading-tight mb-2">
                {project.title}
              </h1>
              <p className="text-dark-300 text-lg mb-4">{project.shortDescription || project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1 text-red-400 font-medium bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    <Calendar size={16} /> Deadline: {format(new Date(project.deadline), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Left Column - Details */}
              <div className="md:col-span-2 space-y-10">
                
                {/* Problem Statement */}
                {project.problemStatement && (
                  <section>
                    <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-2">
                      <Target size={22} className="text-primary-500" />
                      Problem Statement
                    </h2>
                    <div className="p-5 bg-dark-950 border border-dark-800 rounded-2xl text-dark-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {project.problemStatement}
                    </div>
                  </section>
                )}

                {/* Detailed Description */}
                <section>
                  <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-2">
                    <FileText size={22} className="text-primary-500" />
                    Project Details
                  </h2>
                  <div className="text-dark-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {project.detailedDescription || project.description}
                  </div>
                </section>

                {/* Required Roles & Skills */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {project.requiredRoles && project.requiredRoles.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                        <Briefcase size={20} className="text-primary-500" />
                        Looking For
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredRoles.map((role, idx) => (
                          <span key={idx} className="bg-dark-800 text-dark-200 px-3 py-1.5 rounded-lg border border-dark-700 text-sm font-medium">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.requiredSkills && project.requiredSkills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-dark-100 mb-3 flex items-center gap-2">
                        <Wrench size={20} className="text-primary-500" />
                        Required Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="bg-dark-800 text-dark-200 px-3 py-1.5 rounded-lg border border-dark-700 text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-2">
                      <Code2 size={22} className="text-primary-500" />
                      Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, idx) => (
                        <span key={idx} className="bg-primary-900/20 text-primary-300 px-3 py-1.5 rounded-lg border border-primary-800/30 text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Attachments & Links */}
                {(project.githubLink || project.figmaLink || (project.referenceLinks && project.referenceLinks.length > 0) || (project.attachments && project.attachments.length > 0)) && (
                  <section>
                    <h2 className="text-xl font-bold text-dark-100 mb-4 flex items-center gap-2">
                      <LinkIcon size={22} className="text-primary-500" />
                      Links & Attachments
                    </h2>
                    <div className="space-y-4">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-xl transition-colors text-dark-200 hover:text-dark-100">
                          <Code2 size={20} /> {project.githubLink}
                        </a>
                      )}
                      {project.figmaLink && (
                        <a href={project.figmaLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-xl transition-colors text-dark-200 hover:text-dark-100">
                          <Target size={20} /> {project.figmaLink}
                        </a>
                      )}
                      {project.referenceLinks && project.referenceLinks.map((link, idx) => (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-dark-950 border border-dark-800 hover:border-dark-700 rounded-xl transition-colors text-primary-400 hover:text-primary-300 truncate">
                          <LinkIcon size={20} /> {link}
                        </a>
                      ))}
                      
                      {project.attachments && project.attachments.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                          {project.attachments.map((url, idx) => {
                            const isPdf = url.endsWith('.pdf');
                            return (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group block relative aspect-square rounded-xl overflow-hidden border border-dark-800 hover:border-primary-500/50 transition-all">
                                {isPdf ? (
                                  <div className="w-full h-full bg-dark-950 flex flex-col items-center justify-center text-dark-400 group-hover:text-primary-400 transition-colors">
                                    <FileText size={32} className="mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-wider">View PDF</span>
                                  </div>
                                ) : (
                                  <img src={url} alt={`Attachment ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                )}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                )}

              </div>

              {/* Right Column - Sidebar Info */}
              <div className="space-y-6">
                
                {/* Team Status Card */}
                <div className="bg-dark-950 border border-dark-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-4">Team Status</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-extrabold text-dark-100">{spotsFilled}</span>
                    <span className="text-xl text-dark-500">/ {spotsTotal}</span>
                  </div>
                  <p className="text-sm text-dark-400 mb-4">members currently in team</p>
                  
                  <div className="w-full bg-dark-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${spotsFilled >= spotsTotal ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min((spotsFilled / spotsTotal) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-dark-500 mt-3 font-medium">
                    {spotsTotal - spotsFilled > 0 ? `Need ${spotsTotal - spotsFilled} more teammate${spotsTotal - spotsFilled > 1 ? 's' : ''}` : 'Team is full!'}
                  </p>
                </div>

                {/* Creator Card */}
                <div className="bg-dark-950 border border-dark-800 p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-4">Project Lead</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-dark-800 overflow-hidden border-2 border-dark-700">
                      {project.creatorId?.avatar ? (
                        <img src={project.creatorId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-dark-400">
                          {project.creatorId?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-dark-100">{project.creatorId?.fullName || 'Student'}</p>
                      <p className="text-xs text-primary-400">{project.creatorId?.rollNumber}</p>
                    </div>
                  </div>
                  {project.creatorId?.department && (
                    <p className="text-xs text-dark-400 mb-1">{project.creatorId.department} • Year {project.creatorId.yearOfStudy}</p>
                  )}
                  {project.creatorId?.badges?.includes('verified') && (
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-2">
                      <ShieldCheck size={14} /> Verified Student
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-dark-950 border border-dark-800 p-6 rounded-2xl space-y-4">
                  {isCreator ? (
                    <>
                      <Link
                        to={`/teammates/edit/${project._id}`}
                        className="w-full py-3 rounded-xl font-bold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                      >
                        <Edit size={18} />
                        Edit Post
                      </Link>
                      <button
                        onClick={() => handleStatusChange(project.status === 'open' ? 'closed' : 'open')}
                        className={`w-full py-3 rounded-xl font-bold transition-all border ${
                          project.status === 'open' 
                            ? 'bg-dark-800 text-dark-200 border-dark-700 hover:bg-dark-700' 
                            : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-500'
                        }`}
                      >
                        {project.status === 'open' ? 'Mark as Closed' : 'Reopen Project'}
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full py-3 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        {isDeleting ? 'Deleting...' : 'Delete Listing'}
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-2">How to Contact</h3>
                      <div className="p-4 bg-dark-900 border border-dark-800 rounded-xl text-sm text-dark-200 break-words mb-4">
                        {project.contactInfo}
                      </div>
                      
                      {project.status === 'open' && (
                        <Link
                          to={`/messages?user=${project.creatorId?.rollNumber}`}
                          className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                        >
                          <Send size={18} />
                          Send Message
                        </Link>
                      )}
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
