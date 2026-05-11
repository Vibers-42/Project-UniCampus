import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Tag, Edit3 } from 'lucide-react';

export default function MarketplaceCard({ item, isOwner = false, onEdit }) {
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
          <span className="bg-dark-950/80 backdrop-blur-md text-primary-400 text-[10px] font-bold px-2 py-1 rounded-md border border-dark-800 uppercase tracking-tighter shadow-lg text-center">
            {item.category}
          </span>
          <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg shadow-primary-500/20 text-center">
            ₹{item.price}
          </span>
        </div>
        {item.negotiable && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-green-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg flex items-center gap-1">
              <Tag size={8} /> Negotiable
            </span>
          </div>
        )}
        {/* Owner Edit Button */}
        {isOwner && onEdit && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
            className="absolute top-3 left-3 p-2 bg-dark-950/80 backdrop-blur-md border border-dark-800 rounded-lg text-primary-400 hover:bg-primary-500 hover:text-white transition-all shadow-lg"
            title="Edit listing"
          >
            <Edit3 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-dark-100 font-bold text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-1 mb-1">
            {item.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              item.condition === 'New' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
              item.condition === 'Like New' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
              'text-orange-400 border-orange-500/20 bg-orange-500/5'
            } uppercase tracking-wider`}>
              {item.condition}
            </span>
            {item.location && (
              <span className="text-[10px] text-dark-400 flex items-center gap-0.5 truncate">
                <MapPin size={10} /> {item.location}
              </span>
            )}
          </div>

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
            Details
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
