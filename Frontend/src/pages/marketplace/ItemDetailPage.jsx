import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  IndianRupee, 
  Tag, 
  Info, 
  Phone, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MapPin,
  Building,
  Paperclip,
  Edit3
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { MOCK_MARKETPLACE_ITEMS } from '../../data/mockMarketplace';
import PostItemModal from './PostItemModal';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getItem, deleteListing, toggleSoldStatus, loading } = useMarketplace();
  const [item, setItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (id.startsWith('mock_mkt')) {
          const mockItem = MOCK_MARKETPLACE_ITEMS.find(o => o._id === id);
          if (mockItem) {
            setItem(mockItem);
            return;
          }
        }
        const data = await getItem(id);
        setItem(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItem();
  }, [id, getItem]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    
    setIsDeleting(true);
    try {
      if (id.startsWith('mock_mkt')) {
        alert("Cannot delete mock listings. Please test with real data.");
        setIsDeleting(false);
        return;
      }
      await deleteListing(id);
      navigate('/marketplace');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSold = async () => {
    try {
      if (id.startsWith('mock_mkt')) {
        setItem(prev => ({ ...prev, isSold: !prev.isSold }));
        return;
      }
      const updatedItem = await toggleSoldStatus(id);
      setItem(updatedItem);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-bold tracking-widest uppercase text-xs">Loading Details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-dark-400">
          <p>Listing not found or has been deleted.</p>
          <Link to="/marketplace" className="text-primary-400 font-bold">Go Back</Link>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = user?.id === item.sellerId?._id;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/marketplace" 
          className="inline-flex items-center gap-2 text-dark-400 hover:text-primary-400 transition-colors mb-8 group font-semibold"
        >
          <div className="p-2 bg-dark-900 rounded-xl group-hover:bg-primary-500/10 transition-colors border border-dark-800">
            <ArrowLeft size={20} />
          </div>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image & Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="auth-card p-0 overflow-hidden rounded-3xl border-dark-800 shadow-2xl relative">
              <img 
                src={item.image} 
                className="w-full aspect-[4/3] object-cover" 
                alt={item.title} 
              />
              {item.isSold && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xl font-black px-8 py-4 rounded-3xl shadow-2xl uppercase tracking-[0.2em] -rotate-12 border-4 border-white/20">
                    Sold Out
                  </div>
                </div>
              )}
            </div>

            {/* Extra Metadata Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {item.location && (
                <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800">
                  <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <MapPin size={12} /> Location
                  </p>
                  <p className="text-sm font-semibold text-dark-200">{item.location}</p>
                </div>
              )}
              {item.department && item.department !== 'All' && (
                <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800">
                  <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Building size={12} /> Department
                  </p>
                  <p className="text-sm font-semibold text-dark-200">{item.department}</p>
                </div>
              )}
              {item.negotiable && (
                <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800">
                  <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Tag size={12} /> Price
                  </p>
                  <p className="text-sm font-bold text-green-400">Negotiable</p>
                </div>
              )}
            </div>

            {item.attachments && item.attachments.length > 0 && (
              <div className="bg-dark-950 p-6 rounded-2xl border border-dark-800">
                <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Paperclip size={14} /> Attachments
                </h3>
                <div className="flex flex-col gap-2">
                  {item.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 bg-dark-900 p-3 rounded-xl border border-dark-800">
                      <ExternalLink size={16} /> View Attached Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] text-dark-400 bg-dark-900 px-3 py-1.5 rounded border border-dark-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="auth-card p-8 border-dark-800 shadow-xl relative overflow-hidden sticky top-24">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary-500/10 text-primary-400 text-[10px] font-black px-3 py-1.5 rounded-xl border border-primary-500/20 uppercase tracking-widest">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-dark-500 text-xs font-bold uppercase tracking-tighter">
                    <Clock size={12} />
                    {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>

                <h1 className="text-3xl font-black text-dark-100 leading-tight mb-2">
                  {item.title}
                </h1>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-4xl font-black text-primary-400 flex items-center">
                    <IndianRupee size={28} strokeWidth={3} />
                    {item.price.toLocaleString('en-IN')}
                  </div>
                  <div className="h-6 w-[1px] bg-dark-800 mx-2"></div>
                  <div className={`text-sm font-bold px-3 py-1 rounded-lg border ${
                    item.condition === 'New' ? 'text-green-400 border-green-500/20 bg-green-500/5' :
                    item.condition === 'Like New' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
                    'text-orange-400 border-orange-500/20 bg-orange-500/5'
                  }`}>
                    {item.condition}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Info size={14} /> Item Description
                    </h3>
                    <p className="text-dark-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-dark-800/50">
                    <h3 className="text-xs font-black text-dark-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Phone size={14} /> Seller Information
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <img 
                        src={item.sellerId?.avatar || `https://ui-avatars.com/api/?name=${item.sellerId?.fullName}&background=random`} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-dark-800"
                        alt="Seller"
                      />
                      <div>
                        <p className="text-dark-100 font-black text-lg">{item.sellerId?.fullName}</p>
                        <p className="text-dark-500 text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                          {item.sellerId?.rollNumber || 'User'} • <span className="text-primary-500/80">{item.sellerId?.role || 'Student'}</span>
                        </p>
                      </div>
                    </div>

                    {isOwner ? (
                      <div className="space-y-4 mt-8">
                        <button
                          onClick={() => setIsEditOpen(true)}
                          className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
                        >
                          <Edit3 size={18} />
                          Edit Listing
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={handleToggleSold}
                            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                              item.isSold 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                              : 'bg-dark-800 text-dark-200 border border-dark-700 hover:bg-dark-700'
                            }`}
                          >
                            {item.isSold ? <CheckCircle2 size={18} /> : <Tag size={18} />}
                            {item.isSold ? 'Available' : 'Mark Sold'}
                          </button>
                          <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center justify-center gap-2 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                            {isDeleting ? 'Deleting...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-8 space-y-4">
                        <div className="bg-dark-900/80 rounded-2xl p-5 border border-dark-800 shadow-inner">
                          <p className="text-xs text-dark-500 font-bold uppercase tracking-[0.15em] mb-1">Contact Seller via:</p>
                          <p className="text-primary-400 font-black text-xl break-words">
                            {item.contactInfo}
                          </p>
                        </div>
                        
                        <a 
                          href={`tel:${item.contactInfo}`}
                          className="btn-primary w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 flex items-center justify-center gap-3 group"
                        >
                          <Phone size={18} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                          Contact Seller Now
                        </a>
                        
                        <p className="text-[10px] text-dark-500 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <AlertCircle size={10} /> Transactions happen outside this app
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <PostItemModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          setIsEditOpen(false);
          // Refetch updated item
          try {
            const data = await getItem(id);
            setItem(data);
          } catch (err) {
            console.error(err);
          }
        }}
        editItem={item}
      />
    </DashboardLayout>
  );
}
