import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Target, Users, Code2, AlertCircle, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';

export default function CreateTeammatesPage({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'project',
    shortDescription: '',
    detailedDescription: '',
    problemStatement: '',
    requiredRoles: '',
    requiredSkills: '',
    techStack: '',
    currentTeamSize: 1,
    requiredTeamSize: 2,
    contactInfo: '',
    deadline: '',
    githubLink: '',
    figmaLink: '',
    referenceLinks: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchProject = async () => {
        try {
          const res = await api.get(`/teammates/${id}`);
          const project = res.data.data.project;
          
          setFormData({
            title: project.title || '',
            category: project.category || 'project',
            shortDescription: project.shortDescription || '',
            detailedDescription: project.detailedDescription || '',
            problemStatement: project.problemStatement || '',
            requiredRoles: project.requiredRoles ? project.requiredRoles.join(', ') : '',
            requiredSkills: project.requiredSkills ? project.requiredSkills.join(', ') : '',
            techStack: project.techStack ? project.techStack.join(', ') : '',
            currentTeamSize: project.currentTeamSize || 1,
            requiredTeamSize: project.requiredTeamSize || 2,
            contactInfo: project.contactInfo || '',
            deadline: project.deadline ? project.deadline.split('T')[0] : '',
            githubLink: project.githubLink || '',
            figmaLink: project.figmaLink || '',
            referenceLinks: project.referenceLinks ? project.referenceLinks.join(', ') : ''
          });
        } catch (err) {
          console.error(err);
          setError('Failed to load project details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        techStack: formData.techStack.split(',').map(t => t.trim()).filter(Boolean),
        referenceLinks: formData.referenceLinks.split(',').map(l => l.trim()).filter(Boolean)
      };

      if (isEdit) {
        await api.put(`/teammates/${id}`, payload);
        navigate(`/teammates/${id}`);
      } else {
        const res = await api.post('/teammates', payload);
        navigate(`/teammates/${res.data.data.project._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project listing`);
      setIsSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Link to="/teammates" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors">
          <ArrowLeft size={20} />
          Back to Teammates
        </Link>

        <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-dark-800 bg-dark-950/50">
            <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-3">
              <Target className="text-primary-500" size={28} />
              {isEdit ? 'Edit Team Requirement' : 'Post Team Requirement'}
            </h1>
            <p className="text-dark-400 mt-2">Find the right people for your hackathon, project, or startup idea.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* 1. Project Details */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <FileText size={18} className="text-primary-500" />
                1. Project Details
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Project Title *</label>
                <input type="text" name="title" required placeholder="e.g. AI Study Assistant App" value={formData.title} onChange={handleChange} className="input-field" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                    <option value="project">Academic / Personal Project</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="competition">Competition</option>
                    <option value="startup">Startup Idea</option>
                    <option value="open source">Open Source</option>
                    <option value="research">Research</option>
                    <option value="freelance">Freelance</option>
                    <option value="college project">College Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Deadline to Apply *</label>
                  <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Short Description * (Max 300 chars)</label>
                <textarea name="shortDescription" required rows="2" maxLength="300" placeholder="A brief 1-2 sentence pitch of your project..." value={formData.shortDescription} onChange={handleChange} className="input-field resize-y"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Problem Statement *</label>
                <textarea name="problemStatement" required rows="3" placeholder="What specific problem are you solving?" value={formData.problemStatement} onChange={handleChange} className="input-field resize-y"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Detailed Description *</label>
                <textarea name="detailedDescription" required rows="6" placeholder="Explain the project in detail, your vision, and what you plan to achieve..." value={formData.detailedDescription} onChange={handleChange} className="input-field resize-y"></textarea>
              </div>
            </section>

            {/* 2. Team Requirements */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800 flex items-center gap-2">
                <Users size={18} className="text-primary-500" />
                2. Team Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Current Team Size *</label>
                  <input type="number" name="currentTeamSize" min="1" required value={formData.currentTeamSize} onChange={handleChange} className="input-field" />
                  <p className="text-xs text-dark-500 mt-1">Including yourself.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Total Team Size Needed *</label>
                  <input type="number" name="requiredTeamSize" min="2" required value={formData.requiredTeamSize} onChange={handleChange} className="input-field" />
                  <p className="text-xs text-dark-500 mt-1">Final target size (e.g. 4 for a hackathon).</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Required Roles (comma separated)</label>
                <input type="text" name="requiredRoles" placeholder="e.g. Frontend Dev, UI Designer, Backend Dev" value={formData.requiredRoles} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Required Skills (comma separated)</label>
                <input type="text" name="requiredSkills" placeholder="e.g. React, Node.js, UI/UX, Python" value={formData.requiredSkills} onChange={handleChange} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                  <Code2 size={16} /> Tech Stack (comma separated)
                </label>
                <input type="text" name="techStack" placeholder="e.g. MERN, Flutter, Firebase" value={formData.techStack} onChange={handleChange} className="input-field" />
              </div>
            </section>

            {/* 3. Contact Details */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-dark-100 pb-2 border-b border-dark-800">3. Contact Details</h2>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">How should they contact you? *</label>
                <textarea name="contactInfo" required rows="2" placeholder="e.g. DM me here on UniCampus, or email me at student@uni.edu" value={formData.contactInfo} onChange={handleChange} className="input-field resize-y"></textarea>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-6 border-t border-dark-800 flex justify-end gap-4">
              <Link to="/teammates" className="px-6 py-3 rounded-xl font-bold text-dark-300 hover:text-dark-100 transition-colors">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-auto px-8 py-3 rounded-xl shadow-lg shadow-primary-500/20">
                {isSubmitting ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Requirement' : 'Post Requirement')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
