import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function MarketplaceCard({ item }) {
  return (
    <div className="auth-card p-0 overflow-hidden flex flex-col h-full group border-dark-800 hover:border-primary-500/30 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-dark-900">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              Sold
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className="bg-dark-950/80 backdrop-blur-md text-primary-400 text-[10px] font-bold px-2 py-1 rounded-md border border-dark-800 uppercase tracking-tighter">
            {item.category}
          </span>
          <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg shadow-primary-500/20">
            ₹{item.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-dark-100 font-bold text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>
          <p className="text-dark-400 text-xs line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={item.sellerId?.avatar || `https://ui-avatars.com/api/?name=${item.sellerId?.fullName}&background=random`} 
              className="w-6 h-6 rounded-lg object-cover border border-dark-700"
              alt="Seller"
            />
            <div className="overflow-hidden">
              <p className="text-[10px] text-dark-200 font-semibold truncate max-w-[80px]">
                {item.sellerId?.fullName}
              </p>
              <p className="text-[8px] text-dark-500">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <Link 
            to={`/marketplace/${item._id}`}
            className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 uppercase tracking-wider"
          >
            View Details
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
