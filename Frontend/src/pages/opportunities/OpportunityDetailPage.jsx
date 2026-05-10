import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useOpportunities } from '../../hooks/useOpportunities';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { getOpportunity } = useOpportunities();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        const data = await getOpportunity(id);
        setOpportunity(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id, getOpportunity]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-dark-400 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
          Loading details...
        </div>
      </DashboardLayout>
    );
  }

  if (!opportunity) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-dark-400">Opportunity not found.</div>
      </DashboardLayout>
    );
  }

  const isReferral = opportunity.type === 'Alumni Referral';

  return (
    <DashboardLayout>
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 mb-6 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Opportunities
      </Link>

      {opportunity.banner && (
        <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 border border-dark-800">
          <img src={opportunity.banner} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="auth-card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="chip bg-primary-500/10 text-primary-400 border-primary-500/30 uppercase tracking-wider">
                {opportunity.type}
              </span>
              {opportunity.deadline && new Date(opportunity.deadline) < new Date() && (
                <span className="chip bg-red-500/10 text-red-400 border-red-500/30 uppercase tracking-wider">
                  Closed
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-dark-100 mb-2">{opportunity.title}</h1>
            <p className="text-xl text-dark-300 font-medium mb-8">{opportunity.organization}</p>
            
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2">Description</h3>
              <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">{opportunity.description}</p>
              
              {opportunity.eligibility && (
                <>
                  <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2">Eligibility</h3>
                  <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">{opportunity.eligibility}</p>
                </>
              )}
            </div>

            {opportunity.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-dark-800">
                <h4 className="text-sm font-medium text-dark-400 mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map(tag => (
                    <span key={tag} className="text-dark-400 text-sm bg-dark-900 px-3 py-1.5 rounded-lg border border-dark-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="auth-card p-6 border-primary-500/20 shadow-xl shadow-primary-500/5">
            {isReferral ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                  {opportunity.alumniName?.charAt(0) || 'A'}
                </div>
                <h3 className="text-dark-100 font-bold text-lg">{opportunity.alumniName}</h3>
                <p className="text-dark-400 text-sm">{opportunity.role} at {opportunity.organization}</p>
                <div className="mt-4 p-3 bg-dark-900 rounded-xl border border-dark-800">
                  <p className="text-xs text-dark-400 mb-1">Referral Status</p>
                  <p className={`font-semibold ${opportunity.referralStatus === 'Open' ? 'text-green-400' : 'text-red-400'}`}>
                    {opportunity.referralStatus || 'Open'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-dark-400 mb-1">Organization</p>
                <h3 className="text-dark-100 font-bold text-lg">{opportunity.organization}</h3>
              </div>
            )}

            {opportunity.deadline && (
              <div className="mb-6 pb-6 border-b border-dark-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-medium">Application Deadline</p>
                  <p className="text-dark-200 font-medium">{new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            )}

            {opportunity.applyLink ? (
              <a 
                href={opportunity.applyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary flex justify-center items-center gap-2"
              >
                {isReferral ? 'Request Referral' : 'Apply Now'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                No application link
              </button>
            )}
          </div>

          <div className="auth-card p-6">
            <h4 className="text-sm font-semibold text-dark-200 mb-4 uppercase tracking-wider">Posted By</h4>
            <div className="flex items-center gap-3">
              <img 
                src={opportunity.postedBy?.avatar || 'https://ui-avatars.com/api/?name=' + (opportunity.postedBy?.fullName || 'User') + '&background=random'} 
                alt="Posted by" 
                className="w-12 h-12 rounded-xl object-cover border border-dark-800"
              />
              <div>
                <p className="text-dark-100 font-medium text-sm">{opportunity.postedBy?.fullName || 'User'}</p>
                <p className="text-dark-400 text-xs capitalize">{opportunity.postedBy?.role || 'Student'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
