import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, User as UserIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/users/search?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(res.data.data.items);
        setShowDropdown(true);
      } catch (error) {
        console.error('Failed to search users', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserClick = (rollNumber) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/portfolio/${rollNumber}`);
  };

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

      <div className="hidden lg:flex flex-1 max-w-xl relative" ref={dropdownRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="Search students by name, roll number, or department..." 
            className="w-full pl-10 pr-10 py-2 bg-dark-800/50 border border-dark-700/50 rounded-full text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-dark-900 border border-dark-800 rounded-xl shadow-2xl overflow-hidden z-50">
            {isSearching ? (
              <div className="p-4 text-center text-dark-400 text-sm animate-pulse">Searching users...</div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserClick(user.rollNumber)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-dark-800 transition-colors text-left border-b border-dark-800/50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-dark-800 border border-dark-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={18} className="text-dark-400" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-dark-100 text-sm truncate">{user.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-dark-400">
                        <span className="text-primary-400 font-medium">{user.rollNumber}</span>
                        <span>•</span>
                        <span className="truncate">{user.department}</span>
                        {user.yearOfStudy && (
                          <>
                            <span>•</span>
                            <span>Year {user.yearOfStudy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-dark-400 text-sm">No users found matching "{searchQuery}"</div>
            )}
          </div>
        )}
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
