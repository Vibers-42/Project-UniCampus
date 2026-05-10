import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FileText, FileImage, File, Download, ThumbsUp, Bookmark, Share2, Trash2,
  Eye, Star, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  voteResource, downloadResource, deleteResource
} from '../../api/resource.api';

// ─── File type helpers ───────────────────────────────────────────────────────
const FILE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  doc: { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  image: { icon: FileImage, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
};

const CATEGORY_COLORS = {
  notes: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  pyq: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'lab-manual': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  assignment: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  reference: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  other: 'bg-dark-700 text-dark-400 border-dark-600',
};

function StarRating({ rating, count }) {
  return (
    <span className="flex items-center gap-1">
      <Star size={11} className="text-yellow-400 fill-yellow-400" />
      <span className="text-dark-300 text-xs">{rating > 0 ? rating.toFixed(1) : '—'}</span>
      {count > 0 && <span className="text-dark-500 text-[10px]">({count})</span>}
    </span>
  );
}

export default function ResourceCard({
  resource: initialResource,
  compact = false,
  onDeleted,
  savedIds = [],
  onSaveToggle,
  onPreview,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(initialResource);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  };

  const fileInfo = FILE_ICONS[resource.fileType] || FILE_ICONS.pdf;
  const FileIcon = fileInfo.icon;
  const catColor = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.other;
  const uploaderName = resource.uploadedBy?.fullName || 'Unknown';
  const uploaderAvatar = resource.uploadedBy?.avatar;
  const isOwner = user && resource.uploadedBy?._id === user._id;
  const isVoted = user && Array.isArray(resource.upvotes)
    ? resource.upvotes.some(u => (typeof u === 'string' ? u : u?._id) === user._id)
    : false;
  const isSaved = savedIds.includes(resource._id);

  const uploadedDate = resource.createdAt
    ? (Date.now() - new Date(resource.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
      ? formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })
      : format(new Date(resource.createdAt), 'MMM d'))
    : '';

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleVote = useCallback(async (e) => {
    e.stopPropagation();
    if (!user) return;
    // Optimistic update
    setResource(prev => {
      const prevVotes = prev.upvotes || [];
      const alreadyVoted = prevVotes.some(u => (typeof u === 'string' ? u : u?._id) === user._id);
      return {
        ...prev,
        upvotes: alreadyVoted
          ? prevVotes.filter(u => (typeof u === 'string' ? u : u?._id) !== user._id)
          : [...prevVotes, user._id],
      };
    });
    try {
      await voteResource(resource._id);
    } catch {
      setResource(initialResource); // revert on error
    }
  }, [resource._id, user, initialResource]);

  const handleDownload = useCallback(async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await downloadResource(resource._id);
      const url = res.data?.data?.downloadUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        setResource(prev => ({ ...prev, downloadCount: (prev.downloadCount || 0) + 1 }));
      }
    } catch {
      showToast('Download failed', 'error');
    } finally {
      setDownloading(false);
    }
  }, [resource._id]);

  const handleSave = useCallback((e) => {
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(resource._id, isSaved);
      showToast(isSaved ? 'Removed from saved' : 'Saved!');
    }
  }, [resource._id, isSaved, onSaveToggle]);

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/resources/${resource._id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Could not copy link', 'error');
    }
  }, [resource._id]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteResource(resource._id);
      showToast('Resource deleted');
      if (onDeleted) onDeleted(resource._id);
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }, [resource._id, onDeleted]);

  const handlePreview = useCallback((e) => {
    e.stopPropagation();
    if (onPreview) onPreview(resource);
  }, [resource, onPreview]);

  if (compact) {
    return (
      <Link to={`/resources/${resource._id}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-primary-500/30 hover:bg-dark-800 transition-all group">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${fileInfo.bg} shrink-0`}>
          <FileIcon size={16} className={fileInfo.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-dark-100 text-sm font-medium truncate group-hover:text-primary-300 transition-colors">{resource.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${catColor}`}>{resource.category}</span>
            <span className="text-dark-500 text-[10px] flex items-center gap-1">
              <Download size={9} />{resource.downloadCount || 0}
            </span>
          </div>
        </div>
        <ExternalLink size={12} className="text-dark-600 group-hover:text-primary-400 transition-colors shrink-0" />
      </Link>
    );
  }

  return (
    <div className="auth-card p-0 overflow-hidden flex flex-col border-dark-800 hover:border-primary-500/30 transition-all duration-300 group relative">
      {/* Toast */}
      {toast && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-40 bg-dark-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 rounded-2xl">
          <AlertTriangle size={24} className="text-red-400" />
          <p className="text-dark-100 text-sm font-medium text-center">Delete this resource?</p>
          <p className="text-dark-400 text-xs text-center">This action cannot be undone.</p>
          <div className="flex gap-2 w-full">
            <button onClick={() => setShowConfirmDelete(false)}
              className="flex-1 py-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-200 text-sm hover:bg-dark-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-400 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Card header */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${fileInfo.bg} shrink-0`}>
          <FileIcon size={20} className={fileInfo.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${catColor}`}>
              {resource.category?.replace('-', ' ')}
            </span>
            {resource.subject && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 border border-dark-700 text-dark-400">
                {resource.subject}
              </span>
            )}
            {resource.isExamPeriod && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 font-medium">
                📝 Exam
              </span>
            )}
          </div>
          <Link to={`/resources/${resource._id}`}
            className="text-dark-100 font-semibold text-sm leading-snug hover:text-primary-300 transition-colors line-clamp-2 block">
            {resource.title}
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 pb-2">
        <p className="text-[10px] text-dark-500 truncate">
          {[resource.department, resource.year && `Year ${resource.year}`, resource.semester && `Sem ${resource.semester}`, resource.subject]
            .filter(Boolean).join(' → ')}
        </p>
      </div>

      {/* Uploader */}
      <div className="px-4 pb-3 flex items-center gap-2">
        {uploaderAvatar ? (
          <img src={uploaderAvatar} alt={uploaderName}
            className="w-5 h-5 rounded-full object-cover border border-dark-700" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-[9px] text-white font-bold">
            {uploaderName.charAt(0)}
          </div>
        )}
        <Link to={`/profile/${resource.uploadedBy?._id}`}
          className="text-[11px] text-dark-400 hover:text-primary-300 transition-colors truncate" onClick={e => e.stopPropagation()}>
          {uploaderName}
        </Link>
        <span className="text-dark-600 text-[10px] ml-auto shrink-0">{uploadedDate}</span>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 flex items-center gap-3">
        <span className="flex items-center gap-1 text-dark-500 text-xs">
          <Download size={11} />{resource.downloadCount || 0}
        </span>
        <span className="flex items-center gap-1 text-dark-500 text-xs">
          <ThumbsUp size={11} />{(resource.upvotes || []).length}
        </span>
        <StarRating rating={resource.qualityRating || 0} count={resource.ratingCount || 0} />
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 pt-2 border-t border-dark-800 flex items-center gap-1 flex-wrap">
        <button onClick={handlePreview}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-100 text-xs transition-colors">
          <Eye size={12} />Preview
        </button>
        <button onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-primary-500/20 text-dark-300 hover:text-primary-300 text-xs transition-colors disabled:opacity-50">
          <Download size={12} />{downloading ? '...' : 'Download'}
        </button>
        <button onClick={handleVote}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isVoted ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-100'
          }`}>
          <ThumbsUp size={12} className={isVoted ? 'fill-primary-400' : ''} />
          {(resource.upvotes || []).length}
        </button>
        <button onClick={handleSave}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
            isSaved ? 'bg-yellow-400/10 text-yellow-400' : 'bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-100'
          }`}>
          <Bookmark size={12} className={isSaved ? 'fill-yellow-400' : ''} />
        </button>
        <button onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-100 text-xs transition-colors">
          <Share2 size={12} />
        </button>
        {isOwner && (
          <button onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-red-500/15 text-dark-300 hover:text-red-400 text-xs transition-colors ml-auto">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
