import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useOpportunities } from '../../hooks/useOpportunities';
import { MOCK_OPPORTUNITIES } from '../../data/mockOpportunities';
import { Briefcase, MapPin, Calendar, Users, GraduationCap, Banknote, User, Phone, FileText } from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { getOpportunity } = useOpportunities();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        if (id.startsWith('mock')) {
          const mockItem = MOCK_OPPORTUNITIES.find(o => o._id === id);
          if (mockItem) {
            setOpportunity(mockItem);
            return;
          }
        }
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
              {opportunity.mode && (
                <span className="chip bg-dark-800 text-dark-300 border-dark-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {opportunity.mode}
                </span>
              )}
              {opportunity.deadline && new Date(opportunity.deadline) < new Date() && (
                <span className="chip bg-red-500/10 text-red-400 border-red-500/30 uppercase tracking-wider">
                  Closed
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-dark-100 mb-2">{opportunity.title}</h1>
            <p className="text-xl text-dark-300 font-medium mb-8 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {opportunity.organization}
            </p>
            
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" /> Description
              </h3>
              <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">{opportunity.description}</p>
              
              {opportunity.responsibilities && (
                <>
                  <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2">Responsibilities</h3>
                  <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">{opportunity.responsibilities}</p>
                </>
              )}

              {(opportunity.requirements || opportunity.eligibility) && (
                <>
                  <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2">Requirements & Eligibility</h3>
                  <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">
                    {opportunity.requirements || opportunity.eligibility}
                  </p>
                </>
              )}

              {opportunity.applicationProcess && (
                <>
                  <h3 className="text-lg font-semibold text-dark-200 mb-3 border-b border-dark-800 pb-2">Application Process</h3>
                  <p className="text-dark-300 whitespace-pre-wrap leading-relaxed mb-8">{opportunity.applicationProcess}</p>
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

            {opportunity.stipend && (
              <div className="mb-6 pb-6 border-b border-dark-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-green-500/80">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-medium">Stipend / Package</p>
                  <p className="text-dark-200 font-medium text-sm">{opportunity.stipend}</p>
                </div>
              </div>
            )}

            {opportunity.deadline && (
              <div className="mb-6 pb-6 border-b border-dark-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-medium">Application Deadline</p>
                  <p className="text-dark-200 font-medium text-sm">
                    {new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {opportunity.departments?.length > 0 && (
              <div className="mb-6 pb-6 border-b border-dark-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-300 flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-medium mb-1">Eligible Branches</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.departments.map(dept => (
                      <span key={dept} className="text-[10px] text-dark-300 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {opportunity.yearsEligible?.length > 0 && (
              <div className="mb-6 pb-6 border-b border-dark-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-300 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-dark-400 font-medium mb-1">Eligible Years</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.yearsEligible.map(yr => (
                      <span key={yr} className="text-[10px] text-dark-300 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">
                        {yr}
                      </span>
                    ))}
                  </div>
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

          <div className="auth-card p-6 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-dark-400 mb-4 uppercase tracking-wider">Posted By</h4>
              <div className="flex items-center gap-3">
                <img 
                  src={opportunity.postedBy?.avatar || 'https://ui-avatars.com/api/?name=' + (opportunity.postedBy?.fullName || 'User') + '&background=random'} 
                  alt="Posted by" 
                  className="w-10 h-10 rounded-xl object-cover border border-dark-800"
                />
                <div>
                  <p className="text-dark-100 font-medium text-sm">{opportunity.postedBy?.fullName || 'User'}</p>
                  <p className="text-dark-400 text-xs capitalize">{opportunity.postedBy?.role || 'Student'}</p>
                </div>
              </div>
            </div>

            {(opportunity.facultyCoordinator || opportunity.facultyContact) && (
              <div className="pt-4 border-t border-dark-800">
                <h4 className="text-xs font-semibold text-dark-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Faculty Coordinator
                </h4>
                <div>
                  {opportunity.facultyCoordinator && <p className="text-dark-200 text-sm font-medium mb-1">{opportunity.facultyCoordinator}</p>}
                  {opportunity.facultyContact && (
                    <p className="text-dark-400 text-xs flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {opportunity.facultyContact}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(opportunity.studentCoordinator || opportunity.studentContact) && (
              <div className="pt-4 border-t border-dark-800">
                <h4 className="text-xs font-semibold text-dark-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Student Coordinator
                </h4>
                <div>
                  {opportunity.studentCoordinator && <p className="text-dark-200 text-sm font-medium mb-1">{opportunity.studentCoordinator}</p>}
                  {opportunity.studentContact && (
                    <p className="text-dark-400 text-xs flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {opportunity.studentContact}
                    </p>
                  )}
                </div>
              </div>
            )}

            {opportunity.attachments?.length > 0 && (
              <div className="pt-4 border-t border-dark-800">
                <h4 className="text-xs font-semibold text-dark-400 mb-4 uppercase tracking-wider">Attachments</h4>
                <div className="space-y-2">
                  {opportunity.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300">
                      <FileText className="w-4 h-4" /> Attachment {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
