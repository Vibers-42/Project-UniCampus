import { Bell, Search, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-dark-800 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4 lg:hidden">
        <button type="button" className="text-dark-400 hover:text-dark-100 transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
          UniCampus
        </h1>
      </div>

      <div className="hidden lg:flex flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
          <input 
            type="text" 
            placeholder="Search for events, resources, people..." 
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-full text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button type="button" className="relative p-2 text-dark-400 hover:text-dark-100 transition-colors rounded-full hover:bg-dark-800">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
