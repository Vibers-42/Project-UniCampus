import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BookOpen, Briefcase, Users, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 bg-dark-900 border-r border-dark-800 flex flex-col hidden lg:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent tracking-tight">
          UniCampus
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-400 font-medium' 
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-300'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all">
          <Settings size={20} className="text-dark-500" />
          Settings
        </Link>
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-dark-100 truncate">{user?.fullName}</p>
            <p className="text-xs text-dark-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
