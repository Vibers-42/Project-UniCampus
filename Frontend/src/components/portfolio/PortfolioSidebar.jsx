import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, Circle, Activity, FileText, Briefcase, FolderGit2, Award, User } from 'lucide-react';
import api from '../../config/api';

export default function PortfolioSidebar() {
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio/me');
      setPortfolio(res.data.data.portfolio);
    } catch (err) {
      console.error('Failed to fetch portfolio for sidebar', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [location.pathname]); // Re-fetch when navigation happens (e.g. back from edit)

  if (isLoading) {
    return (
      <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:flex flex-col overflow-y-auto">
        <div className="p-6 h-full mt-16 animate-pulse">
          <div className="h-32 bg-dark-900 rounded-2xl mb-6"></div>
          <div className="h-64 bg-dark-900 rounded-2xl"></div>
        </div>
      </aside>
    );
  }

  // Calculate completion
  const sections = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: <User size={14} />,
      isComplete: portfolio?.bio && portfolio?.skills?.length > 0,
    },
    {
      id: 'resume',
      label: 'Resume Uploaded',
      icon: <FileText size={14} />,
      isComplete: !!portfolio?.resumeUrl,
    },
    {
      id: 'projects',
      label: 'Add Projects',
      icon: <FolderGit2 size={14} />,
      isComplete: portfolio?.projects?.length > 0,
    },
    {
      id: 'experience',
      label: 'Add Experience',
      icon: <Briefcase size={14} />,
      isComplete: portfolio?.experience?.length > 0,
    },
    {
      id: 'achievements',
      label: 'Add Achievements',
      icon: <Award size={14} />,
      isComplete: portfolio?.achievements?.length > 0,
    },
  ];

  const completedCount = sections.filter((s) => s.isComplete).length;
  const completionPercentage = Math.round((completedCount / sections.length) * 100);

  return (
    <aside className="w-80 fixed right-0 top-0 bottom-0 bg-dark-950 border-l border-dark-800 hidden xl:flex flex-col h-screen overflow-y-auto hide-scrollbar">
      <div className="p-6 space-y-6 mt-16">
        
        {/* Completion Progress Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2 relative z-10">
            <Activity size={16} className="text-primary-400" /> Portfolio Status
          </h3>
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-xs font-medium text-dark-400">Completion</span>
            <span className="text-xs font-bold text-primary-400">{completionPercentage}%</span>
          </div>
          
          <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
        </div>

        {/* Sections Checklist Widget */}
        <div className="bg-dark-900/50 rounded-2xl p-5 border border-dark-800 shadow-lg">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-4">Completion Checklist</h3>
          
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${section.isComplete ? 'bg-green-500/5 border-green-500/10' : 'bg-dark-950/50 border-dark-800/50'}`}>
                <div className={`shrink-0 ${section.isComplete ? 'text-green-400' : 'text-dark-600'}`}>
                  {section.isComplete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className={`p-1.5 rounded-lg ${section.isComplete ? 'bg-green-500/10 text-green-400' : 'bg-dark-800 text-dark-400'}`}>
                    {section.icon}
                  </div>
                  <span className={`text-sm font-medium ${section.isComplete ? 'text-dark-200' : 'text-dark-400'}`}>
                    {section.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
