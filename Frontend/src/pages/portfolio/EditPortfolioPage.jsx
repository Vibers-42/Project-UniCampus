import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, GitBranch, Book, MessageSquare, Globe, Code2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';

export default function EditPortfolioPage() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [links, setLinks] = useState({
    github: '', linkedin: '', leetcode: '', codechef: '', hackerrank: '', website: '', twitter: ''
  });

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio/me');
      const data = res.data.data.portfolio;
      setPortfolio(data);
      setBio(data.bio || '');
      setSkills(data.skills?.join(', ') || '');
      setLinks({
        github: data.socialLinks?.github || '',
        linkedin: data.socialLinks?.linkedin || '',
        leetcode: data.socialLinks?.leetcode || '',
        codechef: data.socialLinks?.codechef || '',
        hackerrank: data.socialLinks?.hackerrank || '',
        website: data.socialLinks?.website || '',
        twitter: data.socialLinks?.twitter || '',
      });
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
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await api.put('/portfolio/me', {
        bio,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        socialLinks: links
      });
      navigate('/portfolio/me');
    } catch (err) {
      setError('Failed to save profile');
      setIsSaving(false);
    }
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
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-dark-800 bg-dark-950/50">
            <h1 className="text-2xl font-bold text-dark-100">Edit Portfolio</h1>
            <p className="text-dark-400 mt-2">Update your identity in the campus ecosystem.</p>
          </div>

          <form onSubmit={handleSaveBasic} className="p-8 space-y-8">
            
            {/* Basic Info */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800">Basic Info & Bio</h2>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">About Me (Bio)</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none transition-all resize-y"
                  placeholder="I am a passionate developer building..."
                ></textarea>
              </div>

              <div>
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
            </section>

            {/* Social Links */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800">Professional Links</h2>
              
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
                  <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2"><MessageSquare size={16} /> Twitter / X URL</label>
                  <input type="url" value={links.twitter} onChange={e => setLinks({...links, twitter: e.target.value})} className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 outline-none" />
                </div>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-dark-800 flex justify-end gap-4">
              <Link to="/portfolio/me" className="px-6 py-3 rounded-xl font-bold text-dark-300 hover:text-dark-100 transition-colors">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
              >
                <Save size={20} /> {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Note on MVB limits: We use postman/api for adding complex subdocs to keep the UI MVP minimal for now, or the user can add a simple form here. We'll add a simplified generic "Item Management" hint below. */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 text-center text-dark-400">
          <p>Note: To add Projects, Experience, and Achievements, please contact the admin or use the API directly for this MVP phase.</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
