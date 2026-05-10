import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, ThumbsUp, Bookmark, Share2, Trash2,
  FileText, FileImage, File, Star, Tag, Loader2, AlertTriangle, Brain
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  getResourceById, voteResource, rateResource, downloadResource, deleteResource, getResources
} from '../../api/resource.api';
import ResourceCard from '../../components/resources/ResourceCard';
import PDFPreviewModal from '../../components/resources/PDFPreviewModal';

const CATEGORY_COLORS = {
  notes: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  pyq: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'lab-manual': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  assignment: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  reference: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  other: 'bg-dark-700 text-dark-400 border-dark-600',
};

function StarRatingWidget({ current, onRate, myRating }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n}
          onClick={() => !myRating && onRate(n)}
          onMouseEnter={() => !myRating && setHover(n)}
          onMouseLeave={() => !myRating && setHover(0)}
          className={`transition-all ${myRating ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          title={myRating ? `You rated ${myRating}/5` : `Rate ${n}`}>
          <Star
            size={18}
            className={
              n <= (hover || myRating || current)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-dark-600'
            }
          />
        </button>
      ))}
      {current > 0 && <span className="text-dark-400 text-sm ml-1">{current.toFixed(1)}</span>}
      {myRating && <span className="text-dark-500 text-xs ml-1">(rated)</span>}
    </div>
  );
}

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [related, setRelated] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [toast, setToast] = useState(null);

  // Bookmarks
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resource_bookmarks') || '[]'); }
    catch { return []; }
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch resource ──
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await getResourceById(id);
        if (cancelled) return;
        setResource(res.data?.data);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Resource not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Fetch related resources ──
  useEffect(() => {
    if (!resource) return;
    const load = async () => {
      try {
        const res = await getResources({
          subject: resource.subject || '',
          semester: resource.semester || '',
          limit: 3,
        });
        const items = (res.data?.data?.items || []).filter(r => r._id !== id);
        setRelated(items.slice(0, 3));
      } catch { /* silent */ }
    };
    load();
  }, [resource, id]);

  // ── Computed ──
  const isOwner = user && resource?.uploadedBy?._id === user._id;
  const isVoted = user && Array.isArray(resource?.upvotes)
    ? resource.upvotes.some(u => (typeof u === 'string' ? u : u?._id) === user?._id)
    : false;
  const isSaved = savedIds.includes(id);
  const catColor = CATEGORY_COLORS[resource?.category] || CATEGORY_COLORS.other;
  const uploaderName = resource?.uploadedBy?.fullName || 'Unknown';
  const uploaderAvatar = resource?.uploadedBy?.avatar;

  const uploadedDate = resource?.createdAt
    ? (Date.now() - new Date(resource.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
      ? formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })
      : format(new Date(resource.createdAt), 'MMM d, yyyy'))
    : '';

  // ── Handlers ──
  const handleVote = async () => {
    if (!user) return;
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
      await voteResource(id);
    } catch { /* revert */ }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadResource(id);
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
  };

  const handleRate = async (rating) => {
    if (myRating) return;
    try {
      const res = await rateResource(id, rating);
      setMyRating(rating);
      const data = res.data?.data;
      if (data) {
        setResource(prev => ({
          ...prev,
          qualityRating: data.qualityRating,
          ratingCount: data.ratingCount,
        }));
      }
      showToast(`Rated ${rating}/5!`);
    } catch (e) {
      showToast(e?.message || 'Could not rate', 'error');
    }
  };

  const handleSave = () => {
    setSavedIds(prev => {
      const next = isSaved ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('resource_bookmarks', JSON.stringify(next));
      showToast(isSaved ? 'Removed from saved' : 'Saved!');
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteResource(id);
      navigate('/resources', { replace: true });
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAskAI = () => {
    const prefill = `Help me understand: ${resource?.title}${resource?.description ? ` — ${resource.description}` : ''}`;
    navigate('/ai-solver', { state: { prefill } });
  };

  // ── Render ──
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={32} className="text-primary-500 animate-spin" />
          <p className="text-dark-400 text-sm">Loading resource...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
          <AlertTriangle size={32} className="text-red-400" />
          <p className="text-dark-100 font-semibold">Resource not found</p>
          <p className="text-dark-400 text-sm">{error}</p>
          <Link to="/resources" className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
            ← Back to Resources
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isImage = resource.fileType === 'image';
  const isPdf = resource.fileType === 'pdf';
  const FileIcon = isImage ? FileImage : resource.fileType === 'doc' ? FileText : File;
  const fileIconColor = isImage ? 'text-green-400' : resource.fileType === 'doc' ? 'text-blue-400' : 'text-red-400';

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-xl ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-primary-500 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-dark-100 font-bold mb-2">Delete this resource?</h3>
            <p className="text-dark-400 text-sm mb-5">This will permanently delete the file from Cloudinary and remove it from the feed.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-400 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Back nav */}
        <Link to="/resources"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 text-sm mb-6 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Resources
        </Link>

        {/* Main card */}
        <div className="auth-card p-6 mb-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${
              isImage ? 'bg-green-400/10 border-green-400/20' : isPdf ? 'bg-red-400/10 border-red-400/20' : 'bg-blue-400/10 border-blue-400/20'
            }`}>
              <FileIcon size={28} className={fileIconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wide ${catColor}`}>
                  {resource.category?.replace('-', ' ')}
                </span>
                {resource.isExamPeriod && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 font-medium">
                    📝 Exam Period
                  </span>
                )}
              </div>
              <h1 className="text-dark-100 font-bold text-xl leading-snug mb-1">{resource.title}</h1>
              {resource.description && (
                <p className="text-dark-400 text-sm leading-relaxed">{resource.description}</p>
              )}
            </div>
          </div>

          {/* Breadcrumb */}
          <p className="text-dark-500 text-sm mb-4">
            {[resource.department, resource.year && `Year ${resource.year}`, resource.semester && `Semester ${resource.semester}`, resource.subject]
              .filter(Boolean).join(' → ')}
          </p>

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags.map(t => (
                <span key={t} className="flex items-center gap-1 chip text-xs">
                  <Tag size={10} />{t}
                </span>
              ))}
            </div>
          )}

          {/* Uploader + date */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-dark-800">
            {uploaderAvatar ? (
              <img src={uploaderAvatar} alt={uploaderName}
                className="w-8 h-8 rounded-full object-cover border border-dark-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-sm text-white font-bold">
                {uploaderName.charAt(0)}
              </div>
            )}
            <div>
              <Link to={`/profile/${resource.uploadedBy?._id}`}
                className="text-dark-200 text-sm font-medium hover:text-primary-300 transition-colors">
                {uploaderName}
              </Link>
              <p className="text-dark-500 text-xs">{uploadedDate}</p>
            </div>

            {/* Stats */}
            <div className="ml-auto flex items-center gap-4 text-sm text-dark-500">
              <span className="flex items-center gap-1.5">
                <Download size={14} />{resource.downloadCount || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <ThumbsUp size={14} />{(resource.upvotes || []).length}
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400" />{resource.qualityRating?.toFixed(1) || '—'}
              </span>
            </div>
          </div>

          {/* Preview area */}
          <div className="bg-dark-950 rounded-2xl overflow-hidden mb-5 border border-dark-800">
            {isImage ? (
              <img src={resource.fileUrl} alt={resource.title}
                className="w-full max-h-96 object-contain" />
            ) : isPdf ? (
              <iframe src={resource.fileUrl} title={resource.title}
                className="w-full border-0" style={{ height: '500px' }} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FileText size={40} className="text-blue-400" />
                <p className="text-dark-300 font-medium">DOC Preview not available</p>
                <button onClick={handleDownload} disabled={downloading}
                  className="text-primary-400 hover:text-primary-300 text-sm transition-colors">
                  Download to view
                </button>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 pb-5 border-b border-dark-800">
            <div>
              <p className="text-dark-400 text-xs mb-2">Rate this resource</p>
              <StarRatingWidget
                current={resource.qualityRating || 0}
                onRate={handleRate}
                myRating={myRating}
              />
              {resource.ratingCount > 0 && (
                <p className="text-dark-600 text-xs mt-1">{resource.ratingCount} rating{resource.ratingCount !== 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Ask AI */}
            <button onClick={handleAskAI}
              className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-primary-500/15 border border-primary-500/20 text-primary-300 text-sm font-medium hover:from-purple-500/25 hover:to-primary-500/25 transition-all">
              <Brain size={16} />Ask AI about this
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary w-auto text-sm">
              <Download size={15} />{downloading ? 'Opening...' : 'Download'}
            </button>
            <button onClick={handleVote}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isVoted ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600 hover:text-dark-100'
              }`}>
              <ThumbsUp size={15} className={isVoted ? 'fill-primary-400' : ''} />
              Upvote ({(resource.upvotes || []).length})
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                isSaved ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600 hover:text-dark-100'
              }`}>
              <Bookmark size={15} className={isSaved ? 'fill-yellow-400' : ''} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:text-dark-100 hover:border-dark-600 text-sm font-medium transition-all">
              <Share2 size={15} />Share
            </button>
            {isOwner && (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-dark-400 hover:text-red-400 hover:border-red-400/30 text-sm font-medium transition-all ml-auto">
                <Trash2 size={15} />Delete
              </button>
            )}
          </div>
        </div>

        {/* Related resources */}
        {related.length > 0 && (
          <div className="auth-card p-5">
            <h2 className="text-dark-100 font-bold text-base mb-4">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(r => (
                <ResourceCard key={r._id} resource={r} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <PDFPreviewModal resource={resource} onClose={() => setShowPreview(false)} />
      )}
    </DashboardLayout>
  );
}
