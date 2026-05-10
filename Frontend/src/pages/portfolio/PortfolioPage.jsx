import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, GitBranch, Book, MapPin, MessageSquare, Globe, BookOpen, Briefcase, Award, FolderGit2, ShieldCheck, Mail, Code2, Terminal } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function PortfolioPage() {
  const { rollNumber } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // If no roll number is provided in URL, we load 'me'
  const isOwnProfile = !rollNumber || rollNumber === user?.rollNumber;

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setError('');
      const url = isOwnProfile ? '/portfolio/me' : `/portfolio/${rollNumber}`;
      const res = await api.get(url);
      setPortfolio(res.data.data.portfolio);
    } catch (err) {
      console.error('Failed to fetch portfolio', err);
      setError(err.response?.data?.message || 'Portfolio not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [rollNumber]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-64 bg-dark-900 rounded-3xl"></div>
          <div className="h-40 bg-dark-900 rounded-3xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !portfolio) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto text-center py-20 bg-dark-900 rounded-3xl border border-dark-800">
          <h2 className="text-2xl font-bold text-dark-100 mb-2">Portfolio Not Found</h2>
          <p className="text-dark-400 mb-6">{error}</p>
          {isOwnProfile ? (
            <button onClick={fetchPortfolio} className="px-6 py-2 bg-primary-600 text-white rounded-xl">Try Again</button>
          ) : (
            <Link to="/portfolio" className="px-6 py-2 bg-dark-800 text-white rounded-xl">Go to My Portfolio</Link>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const profileUser = portfolio.userId;
  const links = portfolio.socialLinks || {};

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Header Profile Card */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-xl relative">
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary-900/40 via-dark-800 to-dark-900 border-b border-dark-800 relative">
            {isOwnProfile && (
              <Link to="/portfolio/edit" className="absolute top-4 right-4 bg-dark-900/80 hover:bg-dark-800 backdrop-blur border border-dark-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg text-sm font-medium z-10">
                <Edit size={16} /> Edit Profile
              </Link>
            )}
          </div>
          
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20 mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dark-900 bg-dark-800 overflow-hidden shrink-0 relative z-10 shadow-2xl">
                {portfolio.profileImage || profileUser.avatar ? (
                  <img src={portfolio.profileImage || profileUser.avatar} alt={profileUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-dark-400 bg-dark-800">
                    {profileUser.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-dark-100">{profileUser.fullName}</h1>
                  {profileUser.badges?.includes('verified') && (
                    <ShieldCheck className="text-green-500" size={24} />
                  )}
                </div>
                <p className="text-lg text-primary-400 font-medium mt-1">{profileUser.rollNumber}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-dark-400">
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {profileUser.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> Year {profileUser.yearOfStudy}</span>
                </div>
              </div>
              
              {/* Social Links Quick Access */}
              <div className="flex gap-3 pb-2">
                {links.github && <a href={links.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-300 hover:text-white hover:bg-dark-700 transition-colors border border-dark-700"><GitBranch size={18} /></a>}
                {links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-300 hover:text-[#0a66c2] hover:bg-dark-700 transition-colors border border-dark-700"><Book size={18} /></a>}
                {links.website && <a href={links.website} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-300 hover:text-primary-400 hover:bg-dark-700 transition-colors border border-dark-700"><Globe size={18} /></a>}
                {links.twitter && <a href={links.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center text-dark-300 hover:text-[#1da1f2] hover:bg-dark-700 transition-colors border border-dark-700"><MessageSquare size={18} /></a>}
                {!isOwnProfile && (
                  <Link to={`/messages?user=${profileUser.rollNumber}`} className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/20"><Mail size={18} /></Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {portfolio.bio && (
              <div className="text-dark-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-[15px]">
                {portfolio.bio}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Skills & Other Links) */}
          <div className="space-y-8 lg:col-span-1">
            {/* Skills */}
            <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                <Code2 size={20} className="text-primary-500" /> Tech Stack
              </h3>
              {portfolio.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {portfolio.skills.map((skill, idx) => (
                    <span key={idx} className="bg-dark-800 text-dark-200 px-3 py-1.5 rounded-lg border border-dark-700 text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-500 italic">No skills added yet.</p>
              )}
            </div>

            {/* Coding Profiles */}
            {(links.leetcode || links.codechef || links.hackerrank) && (
              <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
                  <Terminal size={20} className="text-primary-500" /> Coding Profiles
                </h3>
                <div className="space-y-3">
                  {links.leetcode && (
                    <a href={links.leetcode} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-dark-800 hover:border-dark-700 transition-colors group">
                      <span className="text-sm font-medium text-dark-200">LeetCode</span>
                      <ExternalLink size={14} className="text-dark-500 group-hover:text-primary-400" />
                    </a>
                  )}
                  {links.codechef && (
                    <a href={links.codechef} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-dark-800 hover:border-dark-700 transition-colors group">
                      <span className="text-sm font-medium text-dark-200">CodeChef</span>
                      <ExternalLink size={14} className="text-dark-500 group-hover:text-primary-400" />
                    </a>
                  )}
                  {links.hackerrank && (
                    <a href={links.hackerrank} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-dark-800 hover:border-dark-700 transition-colors group">
                      <span className="text-sm font-medium text-dark-200">HackerRank</span>
                      <ExternalLink size={14} className="text-dark-500 group-hover:text-primary-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Experience, Projects, Achievements) */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Experience Section */}
            {portfolio.experience?.length > 0 && (
              <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                  <Briefcase size={22} className="text-primary-500" /> Experience & Roles
                </h3>
                <div className="space-y-6">
                  {portfolio.experience.map(exp => (
                    <div key={exp._id} className="relative pl-6 border-l-2 border-dark-800 last:border-transparent pb-6 last:pb-0">
                      <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5 ring-4 ring-dark-900"></div>
                      <h4 className="text-lg font-bold text-dark-100">{exp.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 mb-3">
                        <span className="font-medium text-primary-400">{exp.organization}</span>
                        <span className="text-dark-600">•</span>
                        <span className="text-sm text-dark-400">
                          {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.isCurrent || !exp.endDate ? 'Present' : format(new Date(exp.endDate), 'MMM yyyy')}
                        </span>
                        <span className="text-dark-600">•</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-dark-800 text-dark-300 px-2 py-0.5 rounded border border-dark-700">{exp.type.replace('_', ' ')}</span>
                      </div>
                      {exp.description && <p className="text-sm text-dark-300 whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Showcase */}
            {portfolio.projects?.length > 0 && (
              <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                  <FolderGit2 size={22} className="text-primary-500" /> Projects Showcase
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.projects.map(proj => (
                    <div key={proj._id} className="bg-dark-950 border border-dark-800 rounded-2xl p-5 hover:border-primary-500/30 transition-colors flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-dark-100">{proj.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${proj.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-sm text-dark-400 mb-4 flex-1">{proj.description}</p>
                      
                      {proj.techStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.techStack.map((tech, idx) => (
                            <span key={idx} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded border border-dark-700">{tech}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-dark-800 mt-auto">
                        {proj.githubLink && (
                          <a href={proj.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-dark-400 hover:text-white transition-colors">
                            <GitBranch size={16} /> Code
                          </a>
                        )}
                        {proj.liveLink && (
                          <a href={proj.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-dark-400 hover:text-primary-400 transition-colors">
                            <ExternalLink size={16} /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {portfolio.achievements?.length > 0 && (
              <div className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-dark-100 mb-6 flex items-center gap-2">
                  <Award size={22} className="text-primary-500" /> Achievements & Certifications
                </h3>
                <div className="space-y-4">
                  {portfolio.achievements.map(ach => (
                    <div key={ach._id} className="flex gap-4 p-4 bg-dark-950 border border-dark-800 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-primary-900/30 text-primary-400 flex items-center justify-center shrink-0 border border-primary-800/30">
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-100">{ach.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-dark-400 mb-2 mt-0.5">
                          {ach.issuer && <span className="font-medium text-dark-300">{ach.issuer}</span>}
                          {ach.issuer && <span>•</span>}
                          <span>{format(new Date(ach.date), 'MMM yyyy')}</span>
                        </div>
                        {ach.description && <p className="text-sm text-dark-400">{ach.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State / Call to Action */}
            {isOwnProfile && (!portfolio.experience?.length && !portfolio.projects?.length && !portfolio.achievements?.length) && (
              <div className="bg-dark-900 border border-dark-800 border-dashed rounded-3xl p-10 text-center shadow-lg">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center text-dark-500 mx-auto mb-4 border border-dark-700">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold text-dark-100 mb-2">Build Your Identity</h3>
                <p className="text-dark-400 mb-6 max-w-md mx-auto">Your portfolio is empty! Add projects, internships, and achievements to showcase your skills to the campus ecosystem.</p>
                <Link to="/portfolio/edit" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20">
                  <Edit size={18} /> Update Portfolio
                </Link>
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}


