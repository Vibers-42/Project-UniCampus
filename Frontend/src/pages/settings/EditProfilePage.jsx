import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { uploadImage } from '../../utils/upload';
import api from '../../config/api';
import { Camera, Globe, ArrowLeft, User, Code } from 'lucide-react';

const AVAILABLE_SKILLS = Array.from(new Set([
  'Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript', 'R', 'Kotlin', 'Swift', 'Go', 'Rust', 'PHP', 'MATLAB', 'Scala', 'Ruby', 'Dart', 'HTML', 'CSS', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'REST API', 'GraphQL', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Socket.io', 'Android Development', 'iOS Development', 'React Native', 'Flutter', 'Expo', 'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase', 'Redis', 'SQLite', 'Oracle DB', 'Supabase', 'Prisma', 'Mongoose', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Vercel', 'Render', 'Nginx', 'Linux', 'Bash Scripting', 'Terraform', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'OpenCV', 'Hugging Face', 'LangChain', 'Prompt Engineering', 'Data Augmentation', 'Model Deployment', 'Data Analysis', 'Data Visualization', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'Hypothesis Testing', 'Feature Engineering', 'Web Scraping', 'Jupyter Notebook', 'Network Security', 'Ethical Hacking', 'Unity', 'Unreal Engine', 'Godot', 'C# for Games', 'Game Design', '3D Modeling', 'Blender', 'AR/VR Development', 'UI/UX Design', 'Figma', 'Adobe XD', 'Canva', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', '3D Animation', 'Motion Graphics', 'Graphic Design', 'Video Editing', 'Photography', 'Arduino', 'Raspberry Pi', 'IoT', 'Embedded C', 'VLSI', 'PCB Design', 'Microcontrollers', 'Robotics', 'ROS', '3D Printing', 'FPGA', 'Operating Systems', 'System Design', 'Data Structures', 'Algorithms', 'OOP', 'Design Patterns', 'Compiler Design', 'DBMS', 'Computer Architecture', 'Theory of Computation', 'Git & GitHub'
]));

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    tagline: user?.tagline || '',
    github: user?.socialLinks?.github || user?.github || '',
    linkedin: user?.socialLinks?.linkedin || user?.linkedin || '',
    portfolio: user?.socialLinks?.portfolio || user?.portfolio || '',
  });
  
  const [skills, setSkills] = useState(user?.skills || []);
  const [showAllSkills, setShowAllSkills] = useState(false);
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Photo State
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    
    try {
      const url = await uploadImage(file);
      await api.patch('/users/avatar', { avatar: url });
      setUser({ ...user, avatar: url });
      setProfileMessage('Photo updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setProfileMessage('Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const updateData = {
        fullName: profileForm.fullName,
        bio: profileForm.bio,
        tagline: profileForm.tagline,
        skills,
        github: profileForm.github,
        linkedin: profileForm.linkedin,
        portfolio: profileForm.portfolio
      };
      
      const { data } = await api.patch('/users/profile', updateData);
      setUser(data.data);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => {
        setProfileMessage('');
        navigate('/settings');
      }, 1500);
    } catch (err) {
      console.error(err);
      setProfileMessage('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <DashboardLayout hideWidgets={true}>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/settings" className="p-2 hover:bg-dark-800 rounded-full text-dark-400 hover:text-dark-200 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-2xl font-bold text-dark-100">Edit Profile</h2>
        </div>

        <div className="auth-card p-6 mb-8">
          <h3 className="text-lg font-medium text-dark-100 flex items-center gap-2 mb-6">
            <User size={20} className="text-primary-400" /> Public Information
          </h3>
          
          <div className="flex flex-col gap-8 max-w-2xl mx-auto mb-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-4 border-dark-800 overflow-hidden bg-dark-900 group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-dark-500 font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-xs text-white font-medium">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={uploadingPhoto} />
                </label>
              </div>
              {uploadingPhoto && <p className="text-sm text-primary-400 animate-pulse">Uploading...</p>}
            </div>

            {/* Basic Info */}
            <form onSubmit={handleSaveProfile} className="w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Display Name</label>
                  <input type="text" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} className="input-field" required />
                </div>
                <div>
                  <label className="label-text">Tagline</label>
                  <input type="text" name="tagline" value={profileForm.tagline} onChange={handleProfileChange} className="input-field" placeholder="e.g. Frontend Enthusiast" />
                </div>
              </div>

              {/* Skills */}
              <div className="pt-4 border-t border-dark-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-dark-200 flex items-center gap-2"><Code size={16}/> Skills</h4>
                  <button type="button" onClick={() => setShowAllSkills(!showAllSkills)} className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                    {showAllSkills ? 'Show Less' : 'Show More Skills'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto hide-scrollbar pb-2">
                  {(showAllSkills ? AVAILABLE_SKILLS : AVAILABLE_SKILLS.slice(0, 10)).map(skill => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                          isSelected 
                            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' 
                            : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-500 hover:text-dark-200'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-dark-400 mt-2">Selected {skills.length} skills</p>
              </div>

              {/* Bio */}
              <div className="pt-4 border-t border-dark-800">
                <label className="label-text">Bio</label>
                <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} className="input-field min-h-[100px]" placeholder="Tell us about yourself..." />
              </div>

              {/* Portfolio Links */}
              <div className="pt-4 border-t border-dark-800">
                <h4 className="text-sm font-medium text-dark-200 mb-4 flex items-center gap-2"><Globe size={16}/> Portfolio Links</h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label-text">GitHub URL</label>
                    <input type="url" name="github" value={profileForm.github} onChange={handleProfileChange} className="input-field" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="label-text">LinkedIn URL</label>
                    <input type="url" name="linkedin" value={profileForm.linkedin} onChange={handleProfileChange} className="input-field" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="label-text">Personal Site URL</label>
                    <input type="url" name="portfolio" value={profileForm.portfolio} onChange={handleProfileChange} className="input-field" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className={`text-sm ${profileMessage.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{profileMessage}</p>
                <button type="submit" disabled={savingProfile} className="btn-primary w-auto px-8">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
