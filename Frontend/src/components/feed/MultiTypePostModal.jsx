import { X, MessageSquare, BookOpen, Users, ShoppingBag, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MultiTypePostModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const POST_TYPES = [
    {
      id: 'discussion',
      title: 'General Discussion',
      description: 'Start a conversation, ask a doubt, or share an idea.',
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      action: () => {
        onClose();
        // Since discussion is part of the feed, we can emit an event or open a discussion-specific modal.
        // For simplicity, we can navigate to a generic /create-post page or emit an event.
        // Let's use an event to open the discussion form in the feed.
        window.dispatchEvent(new CustomEvent('open-discussion-modal'));
      }
    },
    {
      id: 'resource',
      title: 'Study Resource',
      description: 'Upload notes, past papers, or study guides.',
      icon: BookOpen,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      action: () => {
        onClose();
        navigate('/resources?upload=true');
      }
    },
    {
      id: 'teammates',
      title: 'Find Teammates',
      description: 'Post a requirement for a project, hackathon, or study group.',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      action: () => {
        onClose();
        navigate('/teammates/create');
      }
    },
    {
      id: 'marketplace',
      title: 'Marketplace Listing',
      description: 'Sell textbooks, electronics, or hostel essentials.',
      icon: ShoppingBag,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      action: () => {
        onClose();
        navigate('/marketplace?post=true');
      }
    },
    {
      id: 'event',
      title: 'Event / Announcement',
      description: 'Promote a club event, workshop, or seminar.',
      icon: CalendarPlus,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      action: () => {
        onClose();
        navigate('/events/create');
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-dark-900 border border-dark-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between bg-dark-950/50">
          <h2 className="text-lg font-bold text-dark-100">What would you like to post?</h2>
          <button 
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-dark-400 mb-6">
            Choose the right context for your post to help it reach the relevant audience and appear in the correct module.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POST_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={type.action}
                  className={`flex items-start gap-4 p-4 rounded-2xl border bg-dark-950 hover:bg-dark-800 transition-all text-left group ${
                    type.id === 'discussion' 
                    ? 'md:col-span-2' 
                    : ''
                  }`}
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${type.bg} ${type.color} ${type.border} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-dark-200 group-hover:text-dark-100 mb-1">
                      {type.title}
                    </h3>
                    <p className="text-xs text-dark-400 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
