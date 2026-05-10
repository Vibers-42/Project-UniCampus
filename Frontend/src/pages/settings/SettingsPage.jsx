import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Sun, Moon, LogOut, Shield, User, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const { logout, changePassword } = useAuth();
  const navigate = useNavigate();
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Password Form State
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '' });
  const [savingPass, setSavingPass] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    setPassMessage({ type: '', text: '' });
    try {
      await changePassword(passForm.oldPassword, passForm.newPassword);
      setPassMessage({ type: 'success', text: 'Password changed successfully!' });
      setPassForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      setPassMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-100">Settings</h2>
          <p className="text-dark-400 mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="auth-card p-0 overflow-hidden">
            <div 
              onClick={() => navigate('/settings/profile')}
              className="p-6 border-b border-dark-800 flex justify-between items-center group cursor-pointer hover:bg-dark-800/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark-100">Edit Profile</h3>
                  <p className="text-dark-400 text-sm mt-0.5">Update your photo, display name, bio, and portfolio links</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-dark-500 group-hover:text-primary-400 transition-colors" />
            </div>

            <div className="p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                  {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-dark-100">Theme Preference</h3>
                  <p className="text-dark-400 text-sm mt-0.5">Switch between dark and light mode for the application</p>
                </div>
              </div>
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-primary-500' : 'bg-dark-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="auth-card p-0 overflow-hidden">
            <div className="p-6 border-b border-dark-800 bg-dark-900/30">
              <h3 className="text-lg font-medium text-dark-100 flex items-center gap-2">
                <Shield size={20} className="text-primary-400" /> Security
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="label-text">Current Password</label>
                  <input 
                    type="password" 
                    value={passForm.oldPassword} 
                    onChange={(e) => setPassForm({...passForm, oldPassword: e.target.value})} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label className="label-text">New Password</label>
                  <input 
                    type="password" 
                    value={passForm.newPassword} 
                    onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})} 
                    className="input-field" 
                    required 
                    minLength="8"
                  />
                </div>
                
                <div className="pt-2">
                  {passMessage.text && (
                    <p className={`text-sm text-center mb-3 ${passMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                      {passMessage.text}
                    </p>
                  )}
                  <button type="submit" disabled={savingPass} className="btn-primary w-full py-2.5">
                    {savingPass ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="auth-card p-0 overflow-hidden border border-red-500/20">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-500/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <LogOut size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-400">Sign Out</h3>
                  <p className="text-dark-400 text-sm mt-0.5">Securely log out of your account on this device</p>
                </div>
              </div>
              <button onClick={logout} className="px-6 py-2.5 bg-red-500/10 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all">
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
