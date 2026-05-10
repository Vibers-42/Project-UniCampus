import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FileText, FileImage, File, Download, ThumbsUp, Bookmark,
  Share2, Trash2, Eye, Star, ExternalLink, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { voteResource, downloadResource, deleteResource } from '../../api/resource.api';

/* ── Constants ────────────────────────────────────────────────────────────── */
const FILE_STYLE = {
  pdf: {
    Icon: FileText,
    iconColor: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.18)',
  },
  doc: {
    Icon: FileText,
    iconColor: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.18)',
  },
  image: {
    Icon: FileImage,
    iconColor: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.18)',
  },
};

const CAT_STYLE = {
  notes: { bg: 'rgba(92,124,250,0.1)', color: '#748ffc', border: 'rgba(92,124,250,0.2)' },
  pyq: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  'lab-manual': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  assignment: { bg: 'rgba(250,204,21,0.1)', color: '#facc15', border: 'rgba(250,204,21,0.2)' },
  reference: { bg: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: 'rgba(34,211,238,0.2)' },
  other: { bg: 'rgba(73,80,87,0.3)', color: '#8891a8', border: 'rgba(73,80,87,0.4)' },
};

/* ── Compact variant for trending/related ─────────────────────────────────── */
function CompactCard({ resource }) {
  return (
    <Link
      to={`/resources/${resource._id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '12px',
        background: 'rgb(var(--color-dark-800) / 0.4)',
        border: '0.5px solid rgb(var(--color-dark-700) / 0.5)',
        textDecoration: 'none',
        transition: 'all 0.18s',
      }}
      className="hover:border-primary-500/30 hover:bg-dark-800 group"
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(var(--color-dark-100))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          className="group-hover:text-primary-300 transition-colors">
          {resource.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
          {resource.subject && (
            <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '20px', background: 'rgb(var(--color-primary-500) / 0.1)', color: 'rgb(var(--color-primary-400))' }}>
              {resource.subject}
            </span>
          )}
          <span style={{ fontSize: '10px', color: 'rgb(var(--color-dark-500))', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Download size={9} />{resource.downloadCount || 0}
          </span>
        </div>
      </div>
      <ExternalLink size={12} style={{ color: 'rgb(var(--color-dark-600))', flexShrink: 0 }}
        className="group-hover:text-primary-400 transition-colors" />
    </Link>
  );
}

/* ── Main card ────────────────────────────────────────────────────────────── */
export default function ResourceCard({
  resource: initialResource,
  compact = false,
  onDeleted,
  savedIds = [],
  onSaveToggle,
  onPreview,
}) {
  const { user } = useAuth();
  const [resource, setResource] = useState(initialResource);
  const [downloading, setDownloading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  if (compact) return <CompactCard resource={initialResource} />;

  const fileStyle = FILE_STYLE[resource.fileType] || FILE_STYLE.pdf;
  const { Icon: FileIcon } = fileStyle;
  const catStyle = CAT_STYLE[resource.category] || CAT_STYLE.other;

  const uploaderName = resource.uploadedBy?.fullName || 'Unknown';
  const uploaderAvatar = resource.uploadedBy?.avatar;
  const isOwner = user && resource.uploadedBy?._id === user._id;
  const isVoted = user && Array.isArray(resource.upvotes)
    ? resource.upvotes.some(u => (typeof u === 'string' ? u : u?._id) === user._id)
    : false;
  const isSaved = savedIds.includes(resource._id);

  const uploadedDate = resource.createdAt
    ? Date.now() - new Date(resource.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
      ? formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })
      : format(new Date(resource.createdAt), 'MMM d')
    : '';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };

  /* ── Action handlers (zero logic changes) ── */
  const handleVote = useCallback(async (e) => {
    e.stopPropagation();
    if (!user) return;
    setResource(prev => {
      const prev2 = prev.upvotes || [];
      const voted = prev2.some(u => (typeof u === 'string' ? u : u?._id) === user._id);
      return {
        ...prev,
        upvotes: voted
          ? prev2.filter(u => (typeof u === 'string' ? u : u?._id) !== user._id)
          : [...prev2, user._id],
      };
    });
    try { await voteResource(resource._id); }
    catch { setResource(initialResource); }
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
    } catch { showToast('Download failed', 'error'); }
    finally { setDownloading(false); }
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
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/resources/${resource._id}`);
      showToast('Link copied!');
    } catch { showToast('Could not copy', 'error'); }
  }, [resource._id]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteResource(resource._id);
      showToast('Deleted');
      if (onDeleted) onDeleted(resource._id);
    } catch { showToast('Delete failed', 'error'); }
    finally { setDeleting(false); setShowConfirmDelete(false); }
  }, [resource._id, onDeleted]);

  const voteCount = (resource.upvotes || []).length;

  return (
    <div
      className="group"
      style={{
        position: 'relative',
        background: 'rgb(var(--color-dark-900) / 0.6)',
        border: '0.5px solid rgb(var(--color-dark-700) / 0.5)',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(92,124,250,0.35)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgb(var(--color-dark-700) / 0.5)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
          fontWeight: 500, background: toast.type === 'error' ? '#ef4444' : 'rgb(var(--color-primary-500))',
          color: '#fff', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm overlay */}
      {showConfirmDelete && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 40, borderRadius: '16px',
          background: 'rgba(13,15,20,0.92)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '10px', padding: '20px',
        }}>
          <AlertTriangle size={22} style={{ color: '#f87171' }} />
          <p style={{ color: 'rgb(var(--color-dark-100))', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
            Delete this resource?
          </p>
          <p style={{ color: 'rgb(var(--color-dark-400))', fontSize: '12px', textAlign: 'center' }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button onClick={() => setShowConfirmDelete(false)}
              style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px',
                background: 'rgb(var(--color-dark-800))', border: '0.5px solid rgb(var(--color-dark-600))',
                color: 'rgb(var(--color-dark-200))', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              style={{ flex: 1, padding: '8px', borderRadius: '10px', fontSize: '13px',
                background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer',
                opacity: deleting ? 0.6 : 1 }}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* ── Row 1: Icon + badges + title ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* File type icon */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
          background: fileStyle.bg, border: `1px solid ${fileStyle.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileIcon size={22} style={{ color: fileStyle.iconColor }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: 600,
              letterSpacing: '0.3px', textTransform: 'uppercase',
              background: catStyle.bg, color: catStyle.color, border: `0.5px solid ${catStyle.border}`,
            }}>
              {resource.category?.replace('-', ' ')}
            </span>
            {resource.subject && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                background: 'rgb(var(--color-dark-800))', border: '0.5px solid rgb(var(--color-dark-700))',
                color: 'rgb(var(--color-dark-400))',
              }}>
                {resource.subject}
              </span>
            )}
            {resource.isExamPeriod && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(251,146,60,0.1)', border: '0.5px solid rgba(251,146,60,0.2)',
                color: '#fb923c', fontWeight: 600,
              }}>
                📝 Exam
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/resources/${resource._id}`}
            style={{
              fontSize: '14px', fontWeight: 600, lineHeight: '1.35',
              color: 'rgb(var(--color-dark-100))', textDecoration: 'none',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            className="hover:text-primary-300 transition-colors"
          >
            {resource.title}
          </Link>
        </div>
      </div>

      {/* ── Row 2: Breadcrumb ── */}
      <p style={{
        fontSize: '11px', color: 'rgb(var(--color-dark-500))',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {[
          resource.department,
          resource.year && `Year ${resource.year}`,
          resource.semester && `Sem ${resource.semester}`,
          resource.subject,
        ].filter(Boolean).join(' › ')}
      </p>

      {/* ── Row 3: Uploader + date ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {uploaderAvatar ? (
          <img src={uploaderAvatar} alt={uploaderName}
            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgb(var(--color-dark-700))' }} />
        ) : (
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgb(var(--color-primary-600)), rgb(var(--color-primary-400)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', color: '#fff', fontWeight: 700,
          }}>
            {uploaderName.charAt(0)}
          </div>
        )}
        <Link to={`/profile/${resource.uploadedBy?._id}`}
          onClick={e => e.stopPropagation()}
          style={{ fontSize: '11px', color: 'rgb(var(--color-dark-400))', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          className="hover:text-primary-300 transition-colors">
          {uploaderName}
        </Link>
        <span style={{ fontSize: '10px', color: 'rgb(var(--color-dark-600))', flexShrink: 0 }}>
          {uploadedDate}
        </span>
      </div>

      {/* ── Row 4: Stats ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>
          <Download size={12} style={{ opacity: 0.7 }} />{resource.downloadCount || 0}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>
          <ThumbsUp size={12} style={{ opacity: 0.7 }} />{voteCount}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>
          <Star size={11} style={{ color: '#facc15' }} />
          {resource.qualityRating > 0 ? resource.qualityRating.toFixed(1) : '—'}
        </span>
      </div>

      {/* ── Row 5: Action buttons (visible on hover) ── */}
      <div
        style={{
          borderTop: '0.5px solid rgb(var(--color-dark-800))',
          paddingTop: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          opacity: 0,
          transition: 'opacity 0.18s',
        }}
        className="group-hover:!opacity-100"
      >
        {/* Preview */}
        <ActionBtn icon={<Eye size={12} />} label="Preview" onClick={e => { e.stopPropagation(); if (onPreview) onPreview(resource); }} />
        {/* Download */}
        <ActionBtn icon={<Download size={12} />} label={downloading ? '…' : 'Download'} onClick={handleDownload} disabled={downloading} />
        {/* Upvote */}
        <ActionBtn
          icon={<ThumbsUp size={12} style={isVoted ? { fill: 'rgb(var(--color-primary-400))' } : {}} />}
          label={String(voteCount)}
          onClick={handleVote}
          active={isVoted}
          activeStyle={{ background: 'rgba(92,124,250,0.12)', borderColor: 'rgba(92,124,250,0.3)', color: 'rgb(var(--color-primary-300))' }}
        />
        {/* Save */}
        <ActionBtn
          icon={<Bookmark size={12} style={isSaved ? { fill: '#facc15' } : {}} />}
          onClick={handleSave}
          active={isSaved}
          activeStyle={{ background: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.2)', color: '#facc15' }}
        />
        {/* Share */}
        <ActionBtn icon={<Share2 size={12} />} onClick={handleShare} />
        {/* Delete (owner only) */}
        {isOwner && (
          <ActionBtn
            icon={<Trash2 size={12} />}
            onClick={e => { e.stopPropagation(); setShowConfirmDelete(true); }}
            style={{ marginLeft: 'auto' }}
            hoverStyle={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.25)' }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Small reusable action button ── */
function ActionBtn({ icon, label, onClick, disabled, active, activeStyle, style, hoverStyle }) {
  const base = {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
    border: '0.5px solid rgb(var(--color-dark-700) / 0.5)',
    background: 'rgb(var(--color-dark-800) / 0.5)',
    color: 'rgb(var(--color-dark-400))', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, transition: 'all 0.15s', ...style,
  };
  const merged = active ? { ...base, ...activeStyle } : base;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={merged}
      onMouseEnter={e => {
        if (!active && hoverStyle) Object.assign(e.currentTarget.style, hoverStyle);
        if (!active && !hoverStyle) {
          e.currentTarget.style.borderColor = 'rgb(var(--color-dark-600))';
          e.currentTarget.style.color = 'rgb(var(--color-dark-100))';
        }
      }}
      onMouseLeave={e => Object.assign(e.currentTarget.style, merged)}
    >
      {icon}{label}
    </button>
  );
}
