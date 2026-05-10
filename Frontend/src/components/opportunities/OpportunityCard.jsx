import { Link } from 'react-router-dom';

export default function OpportunityCard({ opportunity }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="auth-card p-5 transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full relative group border-dark-800 hover:border-primary-500/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="chip text-[10px] bg-primary-500/10 text-primary-400 border-primary-500/30 uppercase tracking-wider mb-2 inline-block">
            {opportunity.type}
          </span>
          <h3 className="text-dark-100 font-bold text-lg leading-tight group-hover:text-primary-300 transition-colors">
            {opportunity.title}
          </h3>
          <p className="text-dark-300 text-sm font-medium mt-1">
            {opportunity.organization}
          </p>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <img 
            src={opportunity.postedBy?.avatar || 'https://ui-avatars.com/api/?name=' + (opportunity.postedBy?.fullName || 'User') + '&background=random'} 
            alt="Posted by" 
            className="w-10 h-10 rounded-xl object-cover border border-dark-700 shadow-sm"
            title={`Posted by ${opportunity.postedBy?.fullName}`}
          />
        </div>
      </div>
      
      <p className="text-dark-400 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
        {opportunity.description}
      </p>
      
      {opportunity.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-dark-500 text-xs bg-dark-900 px-2 py-1 rounded-md border border-dark-800">
              #{tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-dark-500 text-xs bg-dark-900 px-2 py-1 rounded-md border border-dark-800">
              +{opportunity.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-dark-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-dark-400 text-xs font-medium">
          <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={new Date(opportunity.deadline) < new Date() ? 'text-red-400' : ''}>
            {formatDate(opportunity.deadline)}
          </span>
        </div>
        
        <Link 
          to={`/opportunities/${opportunity._id}`}
          className="text-primary-400 text-sm font-semibold hover:text-primary-300 transition-colors flex items-center gap-1"
        >
          View Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
