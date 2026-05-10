import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useOpportunities } from '../../hooks/useOpportunities';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['All', 'Internship', 'Placement Drive', 'Club Recruitment', 'Campus Ambassador', 'Alumni Referral', 'Workshop Opportunity', 'Hackathon Opportunity'];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { opportunities, loading, fetchOpportunities } = useOpportunities();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOpportunities({ 
        type: activeCategory, 
        search: searchQuery 
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, searchQuery, fetchOpportunities]);

  const canPost = ['admin', 'clubAdmin'].includes(user?.role) || user?.badges?.includes('Verified Alumni') || user?.badges?.includes('Club Lead');

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
            <span className="text-3xl">💼</span> Campus Opportunities
          </h2>
          <p className="text-dark-400 mt-1">Discover internships, club recruitments, and alumni referrals.</p>
        </div>
        {canPost && (
          <button className="btn-primary w-auto whitespace-nowrap shadow-lg shadow-primary-500/20">
            + Post Opportunity
          </button>
        )}
      </div>

      <div className="auth-card p-4 mb-8 sticky top-[72px] z-40 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by role, company, or keyword..."
              className="input-field pl-10 bg-dark-950 border-dark-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max pb-1">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === category 
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                      : 'bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-800'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400 font-medium">Loading opportunities...</p>
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <OpportunityCard key={opp._id} opportunity={opp} />
          ))}
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
