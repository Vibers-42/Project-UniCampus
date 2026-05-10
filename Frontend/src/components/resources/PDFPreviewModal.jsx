import { useState } from 'react';
import { X, Download, FileText, FileImage, ExternalLink } from 'lucide-react';
import { downloadResource } from '../../api/resource.api';

const CATEGORY_COLORS = {
  notes: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  pyq: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  'lab-manual': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  assignment: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  reference: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  other: 'bg-dark-700 text-dark-400 border-dark-600',
};

export default function PDFPreviewModal({ resource, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!resource) return null;

  const catColor = CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.other;
  const isImage = resource.fileType === 'image';
  const filename = resource.title + (resource.fileType === 'pdf' ? '.pdf' : resource.fileType === 'doc' ? '.docx' : '');

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await downloadResource(resource._id);
      const url = res.data?.data?.downloadUrl;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      /* silent */
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-dark-900 border border-dark-700/50 rounded-2xl flex flex-col shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
              {isImage ? <FileImage size={16} className="text-green-400" /> : <FileText size={16} className="text-red-400" />}
            </div>
            <div className="min-w-0">
              <p className="text-dark-100 font-semibold text-sm truncate">{resource.title}</p>
              <p className="text-dark-500 text-xs truncate">{filename}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide shrink-0 ${catColor}`}>
              {resource.category?.replace('-', ' ')}
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors shrink-0 ml-3">
            <X size={16} />
          </button>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-hidden bg-dark-950 rounded-none" style={{ minHeight: 0 }}>
          {isImage ? (
            <div className="w-full h-[500px] flex items-center justify-center p-4">
              <img src={resource.fileUrl} alt={resource.title}
                className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
          ) : resource.fileType === 'pdf' ? (
            <iframe
              src={resource.fileUrl}
              title={resource.title}
              className="w-full border-0"
              style={{ height: '500px' }}
              allow="fullscreen"
            />
          ) : (
            <div className="w-full h-[500px] flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex items-center justify-center">
                <FileText size={32} className="text-blue-400" />
              </div>
              <p className="text-dark-300 font-medium">DOC/DOCX Preview not available in browser</p>
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors">
                <ExternalLink size={14} />Open in Google Docs Viewer
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-dark-500">
            <span>{resource.department}</span>
            {resource.semester && <span>Sem {resource.semester}</span>}
            {resource.subject && <span>{resource.subject}</span>}
          </div>
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary w-auto text-sm">
            <Download size={14} />
            {downloading ? 'Opening...' : 'Download Full File'}
          </button>
        </div>
      </div>
    </div>
  );
}
