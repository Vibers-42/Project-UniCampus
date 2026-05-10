import { useState } from 'react';

export default function PostCard({ post, onLike }) {
  const [isLiked, setIsLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      await onLike(post._id);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="auth-card mb-6 p-4 md:p-6 transition-transform hover:-translate-y-0.5 duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <img 
            src={post.authorId?.avatar || 'https://ui-avatars.com/api/?name=' + (post.authorId?.fullName || 'User') + '&background=random'} 
            alt="Avatar" 
            className="w-11 h-11 rounded-full object-cover border-2 border-dark-800" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-dark-100 font-semibold">{post.authorId?.fullName || 'Unknown User'}</h3>
              {post.authorId?.badges?.length > 0 && (
                <span className="chip text-[10px] px-2 py-0.5 border-primary-500/30">{post.authorId.badges[0]}</span>
              )}
            </div>
            <p className="text-dark-400 text-xs mt-0.5">
              {post.authorId?.role} • {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <span className="chip text-[10px] bg-dark-800/80 text-dark-300 border-dark-700">{post.type}</span>
      </div>
      
      <p className="text-dark-200 mb-4 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      
      {post.images?.length > 0 && (
        <div className={`mb-4 grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, idx) => (
            <img key={idx} src={img} alt="Post content" className="w-full rounded-xl object-cover max-h-96 border border-dark-700/50" />
          ))}
        </div>
      )}
      
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-primary-400 text-xs font-medium">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex gap-6 mt-4 pt-4 border-t border-dark-800/50">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-400' : 'text-dark-400 hover:text-dark-200'}`}
        >
          <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={isLiked ? 0 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount}
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-dark-400 hover:text-dark-200 transition-colors">
          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.commentsCount}
        </button>
      </div>
    </div>
  );
}
