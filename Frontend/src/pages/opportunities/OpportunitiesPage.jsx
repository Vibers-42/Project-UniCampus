import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useOpportunities } from '../../hooks/useOpportunities';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';



const CATEGORIES = [
  'All', 'Internship', 'Placement Drive', 'Club Recruitment', 
  'Campus Ambassador', 'Hackathons', 'Workshops', 'Research Opportunities', 
  'Certifications', 'Startup Internships', 'Student Chapters', 'Technical Events', 
  'Volunteer Programs', 'Alumni Referral', 'Other'
];

const DEPARTMENTS = ['All', 'CSE', 'AIML', 'DS', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { opportunities, loading, fetchOpportunities } = useOpportunities();
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeYear, setActiveYear] = useState('All');
  
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOpportunities({ 
        type: activeCategory, 
        search: searchQuery,
        department: activeDepartment,
        year: activeYear
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery, activeDepartment, activeYear, fetchOpportunities]);

  const canPost = ['admin', 'clubAdmin'].includes(user?.role) || user?.badges?.includes('Verified Alumni') || user?.badges?.includes('Club Lead');

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const displayOpportunities = opportunities;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <span className="text-3xl">💼</span> Campus Opportunities
          </h2>
          <p className="text-dark-400 mt-1">Discover internships, hackathons, and placement drives.</p>
        </div>
        {canPost && (
          <button className="btn-primary w-auto whitespace-nowrap shadow-lg shadow-primary-500/20">
            + Post Opportunity
          </button>
        )}
      </div>

      <div className="auth-card p-4 mb-8 sticky top-[72px] z-40 shadow-xl space-y-4">
        {/* Top Row: Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-dark-500" />
            </div>
            <input
              type="text"
              placeholder="Search by role, company, or keyword..."
              className="input-field pl-10 bg-dark-950 border-dark-800 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <select 
                className="input-field bg-dark-950 border-dark-800 text-sm appearance-none py-2.5"
                value={activeDepartment}
                onChange={(e) => setActiveDepartment(e.target.value)}
              >
                <option disabled value="">Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-dark-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <div className="relative flex-1 md:w-40">
              <select 
                className="input-field bg-dark-950 border-dark-800 text-sm appearance-none py-2.5"
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                <option disabled value="">Eligible Year</option>
                {YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-dark-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Horizontal Category Scroll */}
        <div className="relative flex items-center border-t border-dark-800 pt-4">
          <button 
            onClick={() => scrollCategories('left')}
            className="absolute left-0 z-10 p-1 bg-gradient-to-r from-dark-900 via-dark-900 to-transparent pr-4 text-dark-400 hover:text-primary-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto hide-scrollbar px-8"
          >
            <div className="flex gap-2 min-w-max pb-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === category 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                      : 'bg-dark-950 border border-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => scrollCategories('right')}
            className="absolute right-0 z-10 p-1 bg-gradient-to-l from-dark-900 via-dark-900 to-transparent pl-4 text-dark-400 hover:text-primary-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && displayOpportunities.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400 font-medium">Loading opportunities...</p>
        </div>
      ) : displayOpportunities.length > 0 ? (
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayOpportunities.map(opp => (
              <OpportunityCard key={opp._id} opportunity={opp} />
            ))}
          </div>
        </div>
      ) : (
        <div className="auth-card py-24 text-center border-dashed border-dark-700 bg-dark-900/40">
          <div className="text-5xl mb-4">🔭</div>
          <h3 className="text-dark-200 font-semibold text-lg mb-2">No opportunities found</h3>
          <p className="text-dark-400 text-sm max-w-md mx-auto">
            We couldn't find any opportunities matching your criteria. Try adjusting your filters or search query.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
