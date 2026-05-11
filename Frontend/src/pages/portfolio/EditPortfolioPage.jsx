import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, GitBranch, Book, MessageSquare, Globe, Code2, Plus, Trash2, FileText, Upload, Briefcase, Award, FolderGit2, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { uploadImage } from '../../utils/upload';

export default function EditPortfolioPage() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [links, setLinks] = useState({
    github: '', linkedin: '', leetcode: '', codechef: '', hackerrank: '', website: '', twitter: ''
  });

  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // New Item States
  const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', githubLink: '', liveLink: '', status: 'completed' });
  const [newExp, setNewExp] = useState({ title: '', organization: '', description: '', startDate: '', endDate: '', type: 'internship', isCurrent: false });
  const [newAch, setNewAch] = useState({ title: '', description: '', issuer: '', date: '', link: '' });

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio/me');
      const data = res.data.data.portfolio;
      setPortfolio(data);
      setBio(data.bio || '');
      setSkills(data.skills?.join(', ') || '');
      setCgpa(data.cgpa || '');
      setResumeUrl(data.resumeUrl || '');
      setLinks({
        github: data.socialLinks?.github || '',
        linkedin: data.socialLinks?.linkedin || '',
        leetcode: data.socialLinks?.leetcode || '',
        codechef: data.socialLinks?.codechef || '',
        hackerrank: data.socialLinks?.hackerrank || '',
        website: data.socialLinks?.website || '',
        twitter: data.socialLinks?.twitter || '',
      });
      setProjects(data.projects || []);
      setExperience(data.experience || []);
      setAchievements(data.achievements || []);
    } catch (err) {
      setError('Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleSaveBasic = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.put('/portfolio/me', {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        resumeUrl,
        socialLinks: links
      });
      setSuccessMsg('Portfolio updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const url = await uploadImage(file, 'resumes');
      setResumeUrl(url);
      setSuccessMsg('Resume uploaded successfully. Dont forget to save!');
    } catch (err) {
      setError('Failed to upload resume. Ensure it is a valid file.');
    } finally {
      setResumeUploading(false);
    }
  };

  // --- ARRAY ITEM HANDLERS ---
  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description) return setError('Title and Description are required for Project.');
    try {
      const data = {
        ...newProject,
        techStack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await api.post('/portfolio/me/projects', data);
      setProjects(res.data.data.portfolio.projects);
      setNewProject({ title: '', description: '', techStack: '', githubLink: '', liveLink: '', status: 'completed' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to add project'); }
  };

  const handleRemoveProject = async (id) => {
    try {
      const res = await api.delete(`/portfolio/me/projects/${id}`);
      setProjects(res.data.data.portfolio.projects);
    } catch (err) { setError('Failed to remove project'); }
  };

  const handleAddExperience = async () => {
    if (!newExp.title || !newExp.organization || !newExp.startDate) return setError('Title, Organization, and Start Date are required.');
    try {
      const res = await api.post('/portfolio/me/experience', newExp);
      setExperience(res.data.data.portfolio.experience);
      setNewExp({ title: '', organization: '', description: '', startDate: '', endDate: '', type: 'internship', isCurrent: false });
    } catch (err) { setError(err.response?.data?.message || 'Failed to add experience'); }
  };

  const handleRemoveExperience = async (id) => {
    try {
      const res = await api.delete(`/portfolio/me/experience/${id}`);
      setExperience(res.data.data.portfolio.experience);
    } catch (err) { setError('Failed to remove experience'); }
  };

  const handleAddAchievement = async () => {
    if (!newAch.title || !newAch.date) return setError('Title and Date are required.');
    try {
      const res = await api.post('/portfolio/me/achievements', newAch);
      setAchievements(res.data.data.portfolio.achievements);
      setNewAch({ title: '', description: '', issuer: '', date: '', link: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to add achievement'); }
  };

  const handleRemoveAchievement = async (id) => {
    try {
      const res = await api.delete(`/portfolio/me/achievements/${id}`);
      setAchievements(res.data.data.portfolio.achievements);
    } catch (err) { setError('Failed to remove achievement'); }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-64 bg-dark-900 rounded-3xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        <div className="flex items-center justify-between">
          <Link to="/portfolio/me" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors">
            <ArrowLeft size={20} />
            Back to Portfolio
          </Link>
          <button
            onClick={handleSaveBasic}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm">
            {successMsg}
          </div>
        )}

        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-dark-800 bg-dark-950/50">
            <h1 className="text-2xl font-bold text-dark-100">Edit Portfolio</h1>
            <p className="text-dark-400 mt-2">Complete your portfolio sections to increase your visibility on campus.</p>
          </div>

          <div className="p-8 space-y-12">
            
            {/* Basic Info & Resume */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <User size={20} className="text-primary-500" /> Basic Info & Resume
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-dark-300 mb-2">About Me (Bio)</label>
                  <textarea
                    rows="4"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none transition-all resize-y"
                    placeholder="I am a passionate developer building..."
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                    <Code2 size={16} /> Skills & Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none transition-all"
                    placeholder="React, Node.js, Python, Figma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none transition-all"
                    placeholder="e.g. 8.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Resume Upload
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-dark-200 px-4 py-3 rounded-xl cursor-pointer transition-colors flex-1 justify-center border border-dark-700">
                      <Upload size={16} /> {resumeUploading ? 'Uploading...' : 'Choose File'}
                      <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handleResumeUpload} disabled={resumeUploading} />
                    </label>
                    {resumeUrl && (
                      <div className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 px-3 py-2 rounded-xl">
                        <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline text-sm font-medium whitespace-nowrap">
                          View
                        </a>
                        <button type="button" onClick={() => setResumeUrl('')} className="text-dark-400 hover:text-red-400 p-1 rounded-md transition-colors" title="Remove Resume">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <Globe size={20} className="text-primary-500" /> Professional Links
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2"><GitBranch size={16} /> GitHub URL</label>
                  <input type="url" value={links.github} onChange={e => setLinks({...links, github: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2"><Book size={16} /> LinkedIn URL</label>
                  <input type="url" value={links.linkedin} onChange={e => setLinks({...links, linkedin: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2"><Globe size={16} /> Personal Website</label>
                  <input type="url" value={links.website} onChange={e => setLinks({...links, website: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">LeetCode URL</label>
                  <input type="url" value={links.leetcode} onChange={e => setLinks({...links, leetcode: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">CodeChef URL</label>
                  <input type="url" value={links.codechef} onChange={e => setLinks({...links, codechef: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">HackerRank URL</label>
                  <input type="url" value={links.hackerrank} onChange={e => setLinks({...links, hackerrank: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
              </div>
            </section>

            {/* Projects */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <FolderGit2 size={20} className="text-primary-500" /> Projects
              </h2>
              
              <div className="space-y-4">
                {projects.map(p => (
                  <div key={p._id} className="flex items-start justify-between bg-dark-950 border border-dark-800 p-4 rounded-xl">
                    <div>
                      <h4 className="font-bold text-dark-100">{p.title}</h4>
                      <p className="text-sm text-dark-400 mt-1">{p.description}</p>
                    </div>
                    <button onClick={() => handleRemoveProject(p._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="bg-dark-900/50 border border-dark-800 border-dashed rounded-xl p-6 space-y-4">
                  <h4 className="font-medium text-dark-200">Add New Project</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="text" placeholder="Tech Stack (comma separated)" value={newProject.techStack} onChange={e => setNewProject({...newProject, techStack: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="url" placeholder="GitHub Link" value={newProject.githubLink} onChange={e => setNewProject({...newProject, githubLink: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="url" placeholder="Live Demo Link" value={newProject.liveLink} onChange={e => setNewProject({...newProject, liveLink: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <textarea placeholder="Description" rows="2" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="col-span-1 md:col-span-2 bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none resize-y"></textarea>
                  </div>
                  <button onClick={handleAddProject} className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-dark-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Project
                  </button>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <Briefcase size={20} className="text-primary-500" /> Experience
              </h2>
              
              <div className="space-y-4">
                {experience.map(e => (
                  <div key={e._id} className="flex items-start justify-between bg-dark-950 border border-dark-800 p-4 rounded-xl">
                    <div>
                      <h4 className="font-bold text-dark-100">{e.title} <span className="text-primary-400 font-normal">at {e.organization}</span></h4>
                      <p className="text-xs text-dark-500 mt-1">{new Date(e.startDate).toLocaleDateString()} - {e.isCurrent || !e.endDate ? 'Present' : new Date(e.endDate).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleRemoveExperience(e._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="bg-dark-900/50 border border-dark-800 border-dashed rounded-xl p-6 space-y-4">
                  <h4 className="font-medium text-dark-200">Add New Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Role Title" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="text" placeholder="Organization" value={newExp.organization} onChange={e => setNewExp({...newExp, organization: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="date" value={newExp.startDate} onChange={e => setNewExp({...newExp, startDate: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-400 outline-none" />
                    <div className="flex items-center gap-3">
                      <input type="date" value={newExp.endDate} disabled={newExp.isCurrent} onChange={e => setNewExp({...newExp, endDate: e.target.value})} className="flex-1 bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-400 outline-none disabled:opacity-50" />
                      <label className="flex items-center gap-2 text-sm text-dark-300">
                        <input type="checkbox" checked={newExp.isCurrent} onChange={e => setNewExp({...newExp, isCurrent: e.target.checked})} className="rounded bg-dark-900 border-dark-700 text-primary-500 focus:ring-primary-500/20" /> Current
                      </label>
                    </div>
                    <select value={newExp.type} onChange={e => setNewExp({...newExp, type: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-200 outline-none">
                      <option value="internship">Internship</option>
                      <option value="campus_role">Campus Role</option>
                      <option value="club_position">Club Position</option>
                      <option value="freelance">Freelance</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea placeholder="Description" rows="2" value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} className="col-span-1 md:col-span-2 bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none resize-y"></textarea>
                  </div>
                  <button onClick={handleAddExperience} className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-dark-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Experience
                  </button>
                </div>
              </div>
            </section>

            {/* Achievements */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <Award size={20} className="text-primary-500" /> Achievements & Certifications
              </h2>
              
              <div className="space-y-4">
                {achievements.map(a => (
                  <div key={a._id} className="flex items-start justify-between bg-dark-950 border border-dark-800 p-4 rounded-xl">
                    <div>
                      <h4 className="font-bold text-dark-100">{a.title}</h4>
                      <p className="text-xs text-dark-500 mt-1">{a.issuer} • {new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleRemoveAchievement(a._id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <div className="bg-dark-900/50 border border-dark-800 border-dashed rounded-xl p-6 space-y-4">
                  <h4 className="font-medium text-dark-200">Add New Achievement/Certification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Title" value={newAch.title} onChange={e => setNewAch({...newAch, title: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="text" placeholder="Issuer (e.g. Coursera, Hackathon Name)" value={newAch.issuer} onChange={e => setNewAch({...newAch, issuer: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <input type="date" value={newAch.date} onChange={e => setNewAch({...newAch, date: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-400 outline-none" />
                    <input type="url" placeholder="Credential URL" value={newAch.link} onChange={e => setNewAch({...newAch, link: e.target.value})} className="bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none" />
                    <textarea placeholder="Description" rows="2" value={newAch.description} onChange={e => setNewAch({...newAch, description: e.target.value})} className="col-span-1 md:col-span-2 bg-dark-950 border border-dark-800 rounded-lg px-3 py-2 text-sm text-dark-100 outline-none resize-y"></textarea>
                  </div>
                  <button onClick={handleAddAchievement} className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-dark-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Achievement
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
