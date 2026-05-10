import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, MapPin, Tag } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 0,
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy submit
    console.log('Form data:', formData);
    navigate('/events');
  };

  return (
    <DashboardLayout>
      <Link to="/events" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      <div className="bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-100">Create New Event</h1>
          <p className="text-dark-400 mt-1">Fill out the details below to publish an official campus event.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Upload Placeholder */}
          <div>
            <label className="label-text">Event Banner</label>
            <div className="w-full h-48 border-2 border-dashed border-dark-700 rounded-2xl flex flex-col items-center justify-center text-dark-400 hover:text-primary-400 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all cursor-pointer">
              <Upload size={32} className="mb-3" />
              <p className="font-medium text-sm">Click to upload poster</p>
              <p className="text-xs text-dark-500 mt-1">PNG, JPG up to 5MB (16:9 recommended)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label-text">Event Title *</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Tech Symposium 2026" 
                className="input-field" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Description *</label>
              <textarea 
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="4" 
                placeholder="Describe what the event is about, who should attend, and what they will learn..." 
                className="input-field resize-none"
              ></textarea>
            </div>

            <div>
              <label className="label-text">Category *</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="hackathon">Hackathon</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="club">Club Activity</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label-text">Venue *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input 
                  type="text" 
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g., Lab 4 or Online" 
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div>
              <label className="label-text">Start Date & Time *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input 
                  type="datetime-local" 
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div>
              <label className="label-text">End Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input 
                  type="datetime-local" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div>
              <label className="label-text">Registration Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input 
                  type="datetime-local" 
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="input-field pl-10" 
                />
              </div>
            </div>

            <div>
              <label className="label-text">Max Participants (0 for unlimited)</label>
              <input 
                type="number" 
                name="maxParticipants"
                min="0"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="input-field" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-text">Tags (comma separated)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
                <input 
                  type="text" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., coding, ai, competition" 
                  className="input-field pl-10" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-dark-800 flex justify-end gap-4">
            <Link to="/events" className="btn-secondary w-auto">Cancel</Link>
            <button type="submit" className="btn-primary w-auto">Publish Event</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
