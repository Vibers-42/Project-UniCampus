import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Code2, Save } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';

export default function CreateTeammatesPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'project',
    description: '',
    requiredRoles: '',
    techStack: '',
    currentTeamSize: 1,
    requiredTeamSize: 2,
    contactInfo: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (parseInt(formData.currentTeamSize) >= parseInt(formData.requiredTeamSize)) {
      setError('Required total team size must be greater than current team size.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process arrays
      const payload = {
        ...formData,
        currentTeamSize: parseInt(formData.currentTeamSize),
        requiredTeamSize: parseInt(formData.requiredTeamSize),
        requiredRoles: formData.requiredRoles.split(',').map(r => r.trim()).filter(Boolean),
        techStack: formData.techStack.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await api.post('/teammates', payload);
      navigate(`/teammates/${res.data.data.project._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project listing');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <Link to="/teammates" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors">
          <ArrowLeft size={20} />
          Back to Teammates
        </Link>

        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-dark-800 bg-dark-950/50">
            <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
              <Target className="text-primary-500" size={28} />
              Post Team Requirement
            </h1>
            <p className="text-dark-400 mt-2">Find the right people for your hackathon, project, or competition.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800">1. Project Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Project Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. AI Study Assistant App"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                  >
                    <option value="project">Academic / Personal Project</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="competition">Competition</option>
                    <option value="startup">Startup Idea</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  placeholder="Describe your project goal, what you are trying to build, and what kind of teammates you are looking for..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all resize-y"
                ></textarea>
              </div>
            </section>

            {/* Team Requirements */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <Users size={18} className="text-primary-500" />
                2. Team Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Current Team Size *</label>
                  <input
                    type="number"
                    name="currentTeamSize"
                    min="1"
                    required
                    value={formData.currentTeamSize}
                    onChange={handleChange}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                  />
                  <p className="text-xs text-dark-500 mt-1">Including yourself.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Total Team Size Needed *</label>
                  <input
                    type="number"
                    name="requiredTeamSize"
                    min="2"
                    required
                    value={formData.requiredTeamSize}
                    onChange={handleChange}
                    className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                  />
                  <p className="text-xs text-dark-500 mt-1">Final target size (e.g. 4 for a hackathon).</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Required Roles (comma separated)</label>
                <input
                  type="text"
                  name="requiredRoles"
                  placeholder="e.g. Frontend Dev, UI Designer, Backend Dev"
                  value={formData.requiredRoles}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                  <Code2 size={16} /> Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  name="techStack"
                  placeholder="e.g. React, Node.js, MongoDB, Figma"
                  value={formData.techStack}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800">3. Contact Details</h2>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">How should they contact you? *</label>
                <textarea
                  name="contactInfo"
                  required
                  rows="2"
                  placeholder="e.g. DM me here on UniCampus, or email me at student@uni.edu"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-800 rounded-xl px-4 py-3 text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all resize-y"
                ></textarea>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-dark-800 flex justify-end gap-4">
              <Link
                to="/teammates"
                className="px-6 py-3 rounded-xl font-bold text-dark-300 hover:text-dark-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
              >
                <Save size={20} />
                {isSubmitting ? 'Posting...' : 'Post Requirement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
