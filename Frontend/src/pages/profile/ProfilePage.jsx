import { useEffect, useRef, useState } from 'react';
import {
  Edit2, BookOpen, MapPin, Code2, Star, Award,
  CheckCircle2, X, Save, Loader2, User, Camera,
  Users, Bot, HeartHandshake, GraduationCap, Briefcase,
  Activity, Sparkles
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { uploadImage } from '../../utils/upload';
import api from '../../config/api';

const PREDEFINED_SKILLS = [
  'Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'R', 'Kotlin', 'Swift', 'Go', 'Rust', 'PHP', 'MATLAB', 'Scala', 'Ruby', 'Dart', 'HTML', 'CSS', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'REST API', 'GraphQL', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Socket.io', 'Android Development', 'iOS Development', 'React Native', 'Flutter', 'Expo', 'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'Redis', 'SQLite', 'Oracle DB', 'Supabase', 'Prisma', 'Mongoose', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Vercel', 'Render', 'Nginx', 'Linux', 'Bash Scripting', 'Terraform', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV', 'Hugging Face', 'LangChain', 'Prompt Engineering', 'Data Augmentation', 'Model Deployment', 'Data Analysis', 'Data Visualization', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'Hypothesis Testing', 'Feature Engineering', 'Web Scraping', 'Jupyter Notebook', 'Network Security', 'Ethical Hacking', 'Unity', 'Unreal Engine', 'Godot', 'C# for Games', 'Game Design', '3D Modeling', 'Blender', 'AR/VR Development', 'UI/UX Design', 'Figma', 'Adobe XD', 'Canva', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', '3D Animation', 'Motion Graphics', 'Graphic Design', 'Video Editing', 'Photography', 'Arduino', 'Raspberry Pi', 'IoT', 'Embedded C', 'VLSI', 'PCB Design', 'Microcontrollers', 'Robotics', 'ROS', '3D Printing', 'FPGA', 'Operating Systems', 'System Design', 'Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'Compiler Design', 'DBMS', 'Computer Architecture', 'Theory of Computation', 'Git & GitHub'
];



function Chip({ label, color = 'bg-dark-800 border-dark-700/60 text-dark-200' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, color, subtitle }) {
  return (
    <div className="flex-1 min-w-0 bg-dark-900/60 border border-dark-800/60 rounded-xl px-4 py-3 flex flex-col gap-0.5 relative overflow-hidden group hover:border-dark-700/80 transition-colors">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} mb-1.5 transition-transform group-hover:scale-110`}>
        <Icon size={14} />
      </div>
      <p className="text-xl font-bold text-dark-100 leading-none">{value}</p>
      <p className="text-[11px] text-dark-500 font-medium">{label}</p>
      
      {subtitle && (
        <div className="absolute top-3 right-3">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-dark-800/80 text-dark-400 uppercase tracking-wider border border-dark-700/50 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-colors">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Edit Profile View (Full Width) ─────────────────────────────────────────
function EditProfileView({ profile, onSave, onClose, saving, authUser, setUser, fetchProfile }) {
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    tagline: profile.tagline || '',
    department: profile.department || '',
    yearOfStudy: profile.yearOfStudy || '',
    bio: profile.bio || '',
    skills: profile.skills || [],
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file, 'avatars');
      const res = await api.patch('/users/avatar', { avatar: url });
      if (setUser && res.data?.data) {
        setUser(prev => ({ ...prev, ...res.data.data }));
      } else if (setUser) {
        setUser(prev => ({ ...prev, avatar: url }));
      }
      if (fetchProfile) fetchProfile();
      showToast('Photo updated!', 'success');
    } catch {
      showToast('Photo upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleSkill = (skill) => {
    setForm(f => {
      const exists = f.skills.includes(skill);
      if (exists) return { ...f, skills: f.skills.filter(s => s !== skill) };
      return { ...f, skills: [...f.skills, skill] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fullName: form.fullName.trim() || undefined,
      tagline: form.tagline.trim() || undefined,
      department: form.department.trim() || undefined,
      yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
      bio: form.bio.trim() || undefined,
      skills: form.skills,
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    onSave(payload);
  };

  const visibleSkills = showAllSkills ? PREDEFINED_SKILLS : PREDEFINED_SKILLS.slice(0, 15);
  const initials = (form.fullName || authUser?.fullName || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 lg:px-0 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-10 border-b border-dark-800 pb-5">
        <div className="flex items-center gap-2 text-dark-100">
          <User size={20} className="text-primary-400" />
          <h1 className="text-xl font-bold">Public Information</h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-dark-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="button" disabled={saving || uploadingAvatar} onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500
              disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors
              shadow-lg shadow-primary-600/20">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 text-sm font-semibold ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />} {toast.msg}
        </div>
      )}

      {/* Main Edit Form */}
      <div className="space-y-12">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer mb-4" onClick={() => fileRef.current?.click()}>
            <div className="w-32 h-32 rounded-full border border-dark-700 bg-dark-900 overflow-hidden flex items-center justify-center shadow-xl">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary-400">{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              {uploadingAvatar ? <Loader2 size={28} className="text-white animate-spin" /> : <Camera size={28} className="text-white" />}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div className="text-center">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-primary-500/15 text-primary-400 border border-primary-500/25 uppercase tracking-widest">
              {profile.role || 'STUDENT'}
            </span>
          </div>
        </div>

        {/* Display Name & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-dark-200 mb-2">Display Name</label>
            <input type="text" value={form.fullName} onChange={set('fullName')}
              className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-3.5 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none transition-all placeholder-dark-700"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-dark-200 mb-2">Tagline</label>
            <input type="text" value={form.tagline} onChange={set('tagline')}
              className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-3.5 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none transition-all placeholder-dark-700"
              placeholder="e.g. Frontend Enthusiast" />
          </div>
        </div>

        {/* Department & Year (added as requested) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-dark-200 mb-2">Department</label>
            <input type="text" value={form.department} onChange={set('department')}
              className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-3.5 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none transition-all placeholder-dark-700"
              placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="block text-sm font-bold text-dark-200 mb-2">Year of Study</label>
            <select value={form.yearOfStudy} onChange={set('yearOfStudy')}
              className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-3.5 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none transition-all">
              <option value="">Select Year</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-dark-800/50 pb-2">
            <div className="flex items-center gap-2 text-dark-200 font-bold text-sm">
              <Code2 size={16} className="text-dark-400" /> Skills
            </div>
            <button type="button" onClick={() => setShowAllSkills(!showAllSkills)}
              className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
              {showAllSkills ? 'Show Less' : 'Show More Skills'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2.5 mb-3">
            {visibleSkills.map(s => {
              const isSelected = form.skills.includes(s);
              return (
                <button type="button" key={s} onClick={() => toggleSkill(s)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary-500/15 text-primary-300 border-primary-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                      : 'bg-dark-900/40 text-dark-400 border-dark-800 hover:bg-dark-800 hover:text-dark-200 hover:border-dark-700'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-dark-500 font-medium">Selected {form.skills.length} skills</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-dark-200 mb-2">Bio</label>
          <textarea value={form.bio} onChange={set('bio')}
            className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-4 text-dark-100 text-sm focus:border-primary-500/50 focus:outline-none transition-all placeholder-dark-700 resize-none h-36"
            placeholder="Tell us about yourself..." maxLength={500} />
          <p className="text-[11px] text-dark-600 text-right mt-1 font-medium">{form.bio.length}/500</p>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, setUser } = useAuth();
  const { profile, loading, saving, error, fetchProfile, updateProfile } = useProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (updates) => {
    try {
      const updated = await updateProfile(updates);
      if (setUser) setUser(prev => ({ ...prev, ...updated }));
      setEditOpen(false);
      showToast('Profile saved successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error');
    }
  };

  if (loading) {
    return (
      <DashboardLayout hideWidgets>
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse py-6 px-4">
          <div className="h-44 bg-dark-900 rounded-2xl" />
          <div className="h-20 bg-dark-900 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-36 bg-dark-900 rounded-2xl" />
            <div className="h-36 bg-dark-900 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout hideWidgets>
        <div className="max-w-3xl mx-auto py-20 text-center">
          <p className="text-dark-400 mb-4">{error}</p>
          <button onClick={fetchProfile} className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const p = profile || {};
  const initials = (p.fullName || authUser?.fullName || 'U').charAt(0).toUpperCase();

  // If edit mode is active, render the full-width EditProfileView instead of the read-only profile
  if (editOpen) {
    return (
      <DashboardLayout hideWidgets>
        <EditProfileView profile={p} authUser={authUser} setUser={setUser} fetchProfile={fetchProfile} onSave={handleSave} onClose={() => setEditOpen(false)} saving={saving} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideWidgets>
      <div className="max-w-4xl mx-auto py-6 px-4 lg:px-0 space-y-6 pb-12 animate-in fade-in duration-300">

        {/* ── Header card ───────────────────────────────────────────────── */}
        <div className="bg-dark-900 border border-dark-800/60 rounded-2xl overflow-hidden shadow-lg">
          <div className="h-32 bg-gradient-to-r from-primary-900/40 via-primary-800/20 to-dark-900 relative">
            <button id="edit-profile-btn" type="button"
              onClick={() => setEditOpen(true)}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-4 py-2
                bg-dark-900/80 hover:bg-dark-800 backdrop-blur border border-dark-700/60
                text-dark-200 hover:text-white text-xs font-bold rounded-xl transition-all shadow-md">
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>

          <div className="px-6 pb-6 -mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="w-24 h-24 rounded-2xl border-4 border-dark-900 bg-dark-800
                overflow-hidden flex-shrink-0 shadow-xl relative z-10">
                {p.avatar
                  ? <img src={p.avatar} alt={p.fullName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center
                      bg-gradient-to-br from-primary-700/60 to-primary-900/40
                      text-3xl font-bold text-primary-300">{initials}</div>
                }
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-2xl font-bold text-dark-100">{p.fullName || 'Your Name'}</h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md
                    bg-primary-500/15 text-primary-400 border border-primary-500/25 uppercase tracking-widest">
                    {p.role || 'STUDENT'}
                  </span>
                </div>
                {p.tagline && (
                  <p className="text-sm text-primary-400/90 font-medium mb-1.5">{p.tagline}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-500 font-medium">
                  {p.rollNumber && <span className="flex items-center gap-1.5"><User size={12} />{p.rollNumber}</span>}
                  {p.department && <span className="flex items-center gap-1.5"><BookOpen size={12} />{p.department}</span>}
                  {p.yearOfStudy && <span className="flex items-center gap-1.5"><MapPin size={12} />Year {p.yearOfStudy}</span>}
                </div>
              </div>
            </div>

            {p.bio && <p className="mt-5 text-sm text-dark-300 leading-relaxed max-w-3xl whitespace-pre-wrap">{p.bio}</p>}

            {p.profileCompletionPercent !== undefined && (
              <div className="mt-6 flex items-center gap-3 bg-dark-950/50 py-2.5 px-4 rounded-xl border border-dark-800/40 w-max">
                <div className="w-48 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                    style={{ width: `${p.profileCompletionPercent}%` }} />
                </div>
                <span className="text-xs text-dark-400 font-bold">{p.profileCompletionPercent}% complete</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="flex gap-4 overflow-x-auto pb-1">
          <StatCard icon={Star}  value={p.reputationScore ?? 0}       label="Reputation" color="bg-amber-500/15 text-amber-400" />
          <StatCard icon={Code2} value={(p.skills || []).length}        label="Skills"     color="bg-primary-500/15 text-primary-400" />
          <StatCard icon={Award} value={(p.badges || []).length}        label="Badges"     color="bg-violet-500/15 text-violet-400" />
          <StatCard icon={Activity} value={48} label="Campus Engagement" color="bg-blue-500/15 text-blue-400" subtitle="Highly Active" />
        </div>

        {/* ── Two-column Layout (Info & Activity) ───────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column (Academic Info & Skills) */}
          <div className="md:col-span-5 space-y-5">
            {/* Academic Info */}
            <div className="bg-dark-900 border border-dark-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
              <h2 className="text-[11px] font-bold text-dark-500 uppercase tracking-widest border-b border-dark-800/50 pb-2">Academic Info</h2>
              {[
                { label: 'Department', value: p.department },
                { label: 'Year',       value: p.yearOfStudy ? `Year ${p.yearOfStudy}` : null },
                { label: 'Roll No.',   value: p.rollNumber },
                { label: 'Email',      value: p.email },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-dark-500 font-medium flex-shrink-0">{label}</span>
                  <span className="text-sm text-dark-200 text-right truncate font-medium">{value}</span>
                </div>
              ) : null)}
              {p.isVerified && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2 mt-2 border-t border-dark-800/50">
                  <CheckCircle2 size={14} /> Verified Account
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-dark-900 border border-dark-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
              <h2 className="text-[11px] font-bold text-dark-500 uppercase tracking-widest border-b border-dark-800/50 pb-2">Skills</h2>
              {(p.skills || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((s, i) => <Chip key={i} label={s} />)}
                </div>
              ) : (
                <p className="text-sm text-dark-600 italic">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* Right Column (Campus Presence) */}
          <div className="md:col-span-7">
            <div className="bg-dark-900 border border-dark-800/60 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between">
              
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-dark-100 flex items-center gap-2">
                      <Activity size={16} className="text-primary-400" /> Campus Presence
                    </h2>
                    <p className="text-[10px] text-dark-400 mt-0.5 font-medium">Student engagement across UniCampus</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>

                {/* Compact Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">AI/ML Community</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      <Users size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">Contributor</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
                      <GraduationCap size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">6 Events</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/20 transition-colors shrink-0">
                      <HeartHandshake size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">12 Connections</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                      <Bot size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">AI Solver Active</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:bg-dark-800/60 hover:border-dark-600/50 transition-colors group cursor-default">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <span className="text-xs font-semibold text-dark-200">24 Resources</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Collaboration Status */}
              <div className="pt-4 mt-5 border-t border-dark-800/50 flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest mr-1">Open To:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800/60 border border-dark-700/50 text-[10px] font-bold text-dark-300 uppercase tracking-widest hover:text-dark-200 hover:border-dark-600 transition-colors cursor-default">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Study Groups
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800/60 border border-dark-700/50 text-[10px] font-bold text-dark-300 uppercase tracking-widest hover:text-dark-200 hover:border-dark-600 transition-colors cursor-default">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Hackathons
                </span>
              </div>
              
            </div>
          </div>
        </div>

        {/* ── Empty CTA ────────────────────────────────────────────────── */}
        {!p.bio && !p.skills?.length && (
          <div className="bg-dark-900 border border-dark-800/60 border-dashed rounded-2xl p-10 text-center">
            <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center text-dark-500 mx-auto mb-4 border border-dark-700">
              <Edit2 size={20} />
            </div>
            <h3 className="text-base font-bold text-dark-200 mb-2">Complete your profile</h3>
            <p className="text-sm text-dark-500 mb-5 max-w-sm mx-auto">Add a bio and skills to stand out on UniCampus.</p>
            <button type="button" onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500
                text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary-600/20">
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl
          shadow-2xl text-sm font-bold border transition-all animate-in slide-in-from-bottom-4
          ${toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}
