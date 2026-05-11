import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Edit, ExternalLink, GitBranch, Book, MapPin, Globe, BookOpen, Briefcase, Award, FolderGit2, Mail, Code2, Terminal, FileText, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function PortfolioPage() {
  const { rollNumber } = useParams();
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPortfolio();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollNumber]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-40 bg-dark-900 rounded-2xl"></div>
          <div className="h-40 bg-dark-900 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !portfolio) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-20 bg-dark-900 rounded-2xl border border-dark-800">
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
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-800">
          <h1 className="text-2xl font-bold text-dark-100">Student Portfolio</h1>
          {isOwnProfile && (
            <Link to="/portfolio/edit" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm font-bold shadow-lg">
              <Edit size={16} /> Edit Portfolio
            </Link>
          )}
        </div>

        {/* Basic Details Section */}
        <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-2xl border border-dark-700 bg-dark-800 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-dark-400">
              {portfolio.profileImage || profileUser.avatar ? (
                <img src={portfolio.profileImage || profileUser.avatar} alt={profileUser.fullName} className="w-full h-full object-cover" />
              ) : (
                profileUser.fullName?.charAt(0) || <User />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-dark-100 mb-2">{profileUser.fullName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm text-dark-300">
                <div className="flex items-center gap-2"><MapPin size={16} className="text-dark-500" /> Year {profileUser.yearOfStudy}</div>
                <div className="flex items-center gap-2"><BookOpen size={16} className="text-dark-500" /> {profileUser.department}</div>
                <div className="flex items-center gap-2"><Terminal size={16} className="text-dark-500" /> {profileUser.rollNumber}</div>
                <div className="flex items-center gap-2"><Mail size={16} className="text-dark-500" /> {profileUser.email}</div>
                <div className="flex items-center gap-2"><Award size={16} className="text-dark-500" /> {portfolio.cgpa ? `${portfolio.cgpa} CGPA` : 'CGPA: To Be Filled'}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-dark-800">
            <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-3">About / Bio</h3>
            {portfolio.bio ? (
              <p className="text-dark-200 leading-relaxed text-sm whitespace-pre-wrap">{portfolio.bio}</p>
            ) : (
              <p className="text-dark-500 text-sm italic">To Be Filled</p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Section */}
          <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary-500" /> Resume Document
            </h3>
            {portfolio.resumeUrl ? (
              <div className="flex items-center justify-between bg-dark-950 border border-dark-800 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg"><FileText size={20} /></div>
                  <div>
                    <p className="text-sm font-bold text-dark-100">Resume Uploaded</p>
                    <p className="text-xs text-dark-400">Available for viewing</p>
                  </div>
                </div>
                <a href={portfolio.resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary-400 hover:text-primary-300 bg-primary-500/10 px-4 py-2 rounded-lg transition-colors">
                  View PDF
                </a>
              </div>
            ) : (
              <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
                <p className="text-dark-500 text-sm">No Resume Uploaded</p>
              </div>
            )}
          </section>

          {/* Professional Links */}
          <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
              <Globe size={20} className="text-primary-500" /> Professional Links
            </h3>
            {Object.keys(links).some(k => links[k]) ? (
              <div className="grid grid-cols-2 gap-3">
                {links.github && <a href={links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><GitBranch size={16} className="text-dark-400" /> GitHub</a>}
                {links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Book size={16} className="text-[#0a66c2]" /> LinkedIn</a>}
                {links.website && <a href={links.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Globe size={16} className="text-primary-400" /> Website</a>}
                {links.leetcode && <a href={links.leetcode} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Terminal size={16} className="text-orange-400" /> LeetCode</a>}
                {links.codechef && <a href={links.codechef} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Code2 size={16} className="text-stone-400" /> CodeChef</a>}
                {links.hackerrank && <a href={links.hackerrank} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Code2 size={16} className="text-green-500" /> HackerRank</a>}
                {links.codeforces && <a href={links.codeforces} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Code2 size={16} className="text-blue-500" /> Codeforces</a>}
                {links.geeksforgeeks && <a href={links.geeksforgeeks} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-dark-200 hover:text-white bg-dark-950 border border-dark-800 p-2.5 rounded-lg transition-colors"><Code2 size={16} className="text-green-600" /> GeeksForGeeks</a>}
              </div>
            ) : (
              <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
                <p className="text-dark-500 text-sm">To Be Filled</p>
              </div>
            )}
          </section>
        </div>

        {/* Skills Section */}
        <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-dark-100 mb-6 flex items-center gap-2">
            <Code2 size={20} className="text-primary-500" /> Technical Skills & Tools
          </h3>
          {(portfolio.skills?.length > 0 || portfolio.techStack?.length > 0 || portfolio.tools?.length > 0 || portfolio.domains?.length > 0) ? (
            <div className="space-y-6">
              {portfolio.skills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Core Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, idx) => (
                      <span key={idx} className="bg-dark-950 text-dark-200 px-3 py-1.5 rounded-lg border border-dark-800 text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.techStack?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.techStack.map((skill, idx) => (
                      <span key={idx} className="bg-primary-950 text-primary-300 px-3 py-1.5 rounded-lg border border-primary-900 text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.tools?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Tools Known</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.tools.map((skill, idx) => (
                      <span key={idx} className="bg-dark-950 text-dark-200 px-3 py-1.5 rounded-lg border border-dark-800 text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.domains?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-2">Domains of Interest</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.domains.map((skill, idx) => (
                      <span key={idx} className="bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-900/50 text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
              <p className="text-dark-500 text-sm">To Be Filled</p>
            </div>
          )}
        </section>

        {/* Experience Section */}
        <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-primary-500" /> Experience
          </h3>
          {portfolio.experience?.length > 0 ? (
            <div className="space-y-4">
              {portfolio.experience.map(exp => (
                <div key={exp._id} className="p-4 bg-dark-950 border border-dark-800 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-dark-100 text-base">{exp.title}</h4>
                    <span className="text-xs font-medium text-dark-400 bg-dark-900 px-2 py-1 rounded-md border border-dark-800 shrink-0">
                      {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.isCurrent || !exp.endDate ? 'Present' : format(new Date(exp.endDate), 'MMM yyyy')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary-400 mb-2">{exp.organization} <span className="text-dark-500 font-normal">({exp.type.replace('_', ' ')})</span></p>
                  {exp.description && <p className="text-sm text-dark-300 whitespace-pre-wrap">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
              <p className="text-dark-500 text-sm">To Be Filled</p>
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
            <FolderGit2 size={20} className="text-primary-500" /> Projects
          </h3>
          {portfolio.projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map(proj => (
                <div key={proj._id} className="bg-dark-950 border border-dark-800 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-dark-100 text-base">{proj.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${proj.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-300 mb-4 flex-1">{proj.description}</p>
                  
                  {proj.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.techStack.map((tech, idx) => (
                        <span key={idx} className="text-[11px] bg-dark-900 text-dark-400 px-2 py-1 rounded border border-dark-800">{tech}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t border-dark-800 mt-auto">
                    {proj.githubLink && (
                      <a href={proj.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-dark-200 hover:text-white transition-colors">
                        <GitBranch size={16} /> Repository
                      </a>
                    )}
                    {proj.liveLink && (
                      <a href={proj.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                        <ExternalLink size={16} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
              <p className="text-dark-500 text-sm">To Be Filled</p>
            </div>
          )}
        </section>

        {/* Achievements Section */}
        <section className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-dark-100 mb-4 flex items-center gap-2">
            <Award size={20} className="text-primary-500" /> Achievements & Certifications
          </h3>
          {portfolio.achievements?.length > 0 ? (
            <div className="space-y-4">
              {portfolio.achievements.map(ach => (
                <div key={ach._id} className="p-4 bg-dark-950 border border-dark-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-dark-100 text-base">{ach.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-dark-400 mt-1">
                      {ach.issuer && <span className="font-medium">{ach.issuer}</span>}
                      {ach.issuer && <span>•</span>}
                      <span>{format(new Date(ach.date), 'MMM yyyy')}</span>
                    </div>
                    {ach.description && <p className="text-sm text-dark-300 mt-2">{ach.description}</p>}
                  </div>
                  {ach.link && (
                    <a href={ach.link} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 bg-primary-500/10 px-4 py-2 rounded-lg transition-colors border border-primary-500/20">
                      <ExternalLink size={14} /> Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-950 border border-dark-800 border-dashed p-6 rounded-xl text-center">
              <p className="text-dark-500 text-sm">To Be Filled</p>
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
