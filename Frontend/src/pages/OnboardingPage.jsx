import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

export default function OnboardingPage() {
  // eslint-disable-next-line no-unused-vars
  const { user, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: '',
    skills: '',
    interests: '',
    techStack: '',
    rolesPreferred: '',
    availability: '',
    github: '',
    portfolio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  /**
   * Parse comma-separated string into trimmed array.
   */
  const toArray = (str) =>
    str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/users/onboarding', {
        bio: form.bio.trim(),
        skills: toArray(form.skills),
        interests: toArray(form.interests),
        techStack: toArray(form.techStack),
        rolesPreferred: toArray(form.rolesPreferred),
        availability: form.availability || undefined,
        github: form.github.trim() || undefined,
        portfolio: form.portfolio.trim() || undefined,
      });

      // Force page reload to refresh auth state from backend
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await api.post('/users/onboarding/skip');
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to skip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-primary-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
            Welcome to UniCampus
          </h1>
          <p className="text-dark-400 mt-2">
            Hey {user?.fullName || 'there'}! Tell us about yourself.
          </p>
          <p className="text-dark-500 text-sm mt-1">All fields are optional — you can update later.</p>
        </div>

        {/* Form Card */}
        <div className="auth-card space-y-5" id="onboarding-form">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Bio */}
          <div>
            <label htmlFor="onb-bio" className="label-text">Bio</label>
            <textarea
              id="onb-bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="A short bio about yourself..."
              className="input-field resize-none h-24"
              maxLength={500}
            />
            <p className="text-dark-600 text-xs mt-1">{form.bio.length}/500</p>
          </div>

          {/* Skills & Interests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="onb-skills" className="label-text">Skills</label>
              <input
                id="onb-skills"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="react, python, figma"
                className="input-field"
              />
              <p className="text-dark-600 text-xs mt-1">Comma-separated</p>
            </div>
            <div>
              <label htmlFor="onb-interests" className="label-text">Interests</label>
              <input
                id="onb-interests"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="web dev, AI, design"
                className="input-field"
              />
              <p className="text-dark-600 text-xs mt-1">Comma-separated</p>
            </div>
          </div>

          {/* Tech Stack & Preferred Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="onb-techStack" className="label-text">Tech Stack</label>
              <input
                id="onb-techStack"
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                placeholder="MERN, Flutter, Django"
                className="input-field"
              />
              <p className="text-dark-600 text-xs mt-1">Comma-separated</p>
            </div>
            <div>
              <label htmlFor="onb-roles" className="label-text">Preferred Roles</label>
              <input
                id="onb-roles"
                name="rolesPreferred"
                value={form.rolesPreferred}
                onChange={handleChange}
                placeholder="frontend, backend, PM"
                className="input-field"
              />
              <p className="text-dark-600 text-xs mt-1">Comma-separated</p>
            </div>
          </div>

          {/* Availability */}
          <div>
            <label htmlFor="onb-availability" className="label-text">Availability</label>
            <select
              id="onb-availability"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select...</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="looking-for-team">Looking for Team</option>
              <option value="not-available">Not Available</option>
            </select>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="onb-github" className="label-text">GitHub</label>
              <input
                id="onb-github"
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="onb-portfolio" className="label-text">Portfolio</label>
              <input
                id="onb-portfolio"
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.dev"
                className="input-field"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleComplete}
              className="btn-primary"
              disabled={loading}
              id="complete-onboarding-btn"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
            <button
              onClick={handleSkip}
              className="btn-secondary"
              disabled={loading}
              id="skip-onboarding-btn"
            >
              Skip for now
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-600 text-xs mt-6">
          You can always update your profile from settings.
        </p>
      </div>
    </div>
  );
}
