import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, BookOpen, Loader2, Clock, Download, Star, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilters from '../../components/resources/ResourceFilters';
import UploadResourceModal from '../../components/resources/UploadResourceModal';
import PDFPreviewModal from '../../components/resources/PDFPreviewModal';
import ResourceRightPanel from '../../components/resources/ResourceRightPanel';



/* ── Constants ── */
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', Icon: Clock },
  { value: 'most-downloaded', label: 'Most Downloaded', Icon: Download },
  { value: 'top-rated', label: 'Top Rated', Icon: Star },
  { value: 'exam-relevant', label: 'Exam Relevant', Icon: Zap },
];

const TABS = [
  { key: 'all', label: 'All Resources' },
  { key: 'my-uploads', label: 'My Uploads' },
  { key: 'bookmarked', label: 'Bookmarked' },
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const getP = (k, def = '') => searchParams.get(k) || def;

  /* ── Filter / sort / tab state ── */
  const [filters, setFilters] = useState({
    department: getP('department'),
    year: getP('year'),
    semester: getP('semester'),
    subject: getP('subject'),
    category: getP('category'),
  });
  const [search, setSearch] = useState(getP('search'));
  const [sort, setSort] = useState(getP('sort', 'newest'));
  const [activeTab, setActiveTab] = useState(getP('tab', 'all'));

  /* ── Resources state ── */
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Bookmarks (localStorage) ── */
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resource_bookmarks') || '[]'); }
    catch { return []; }
  });

  /* ── Modals ── */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const searchTimerRef = useRef(null);

  /* ── Sync state when URL params change (Fix for "View my uploads" link) ── */
  useEffect(() => {
    setFilters({
      department: getP('department'),
      year: getP('year'),
      semester: getP('semester'),
      subject: getP('subject'),
      category: getP('category'),
    });
    setSearch(getP('search'));
    setSort(getP('sort', 'newest'));
    setActiveTab(getP('tab', 'all'));
    
    if (searchParams.get('upload') === 'true') {
      setUploadOpen(true);
      // Clean up the URL so it doesn't re-open on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('upload');
      setSearchParams(newParams, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ── Sync URL params ── */
  const syncParams = useCallback((overrides = {}) => {
    const combined = { ...filters, search, sort, tab: activeTab, ...overrides };
    const p = {};
    Object.entries(combined).forEach(([k, v]) => {
      if (v && v !== 'newest' && v !== 'all') p[k] = v;
    });
    if (combined.sort && combined.sort !== 'newest') p.sort = combined.sort;
    setSearchParams(p, { replace: true });
  }, [filters, search, sort, activeTab, setSearchParams]);

  /* ── Fetch ── */
  const fetchResources = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    
    try {
      const params = { ...filters, search: search || undefined, sort, page: pg, limit: 12 };
      if (activeTab === 'my-uploads' && user) params.uploadedBy = user._id;
      const res = await getResources(params);
      const data = res.data?.data;
      let items = data?.items || [];
      if (activeTab === 'bookmarked') items = items.filter(r => savedIds.includes(r._id));
      setResources(append ? prev => [...prev, ...items] : items);
      setTotalPages(data?.totalPages || 1);
      setHasMore(pg < (data?.totalPages || 1));
      setPage(pg);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [filters, search, sort, activeTab, user, savedIds]);

  // Main fetch effect
  useEffect(() => {
    setPage(1);
    fetchResources(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, activeTab, search]);

  const handleSearch = (val) => {
    // We do NOT update the main `search` state immediately because it's in the fetch dependency array.
    // Instead, we just update the URL via syncParams after a debounce, which will eventually update `search` via the searchParams effect.
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      syncParams({ search: val });
    }, 400);
  };

  /* ── Infinite scroll ── */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasMore) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) fetchResources(page + 1, true);
    }, { threshold: 0.5 });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchResources]);

  /* ── Handlers ── */
  const handleFiltersChange = (overrides) => syncParams(overrides);

  const handleSaveToggle = (id, wasSaved) => {
    setSavedIds(prev => {
      const next = wasSaved ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('resource_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleted = (id) => setResources(prev => prev.filter(r => r._id !== id));

  const handleQuickFilter = (key, value) => {
    syncParams({ [key]: value });
  };

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    setPage(1);
    fetchResources(1, false);
  };

  /* ── Right panel (injected into fixed slot) ── */
  const rightPanel = (
    <ResourceRightPanel
      onQuickFilter={handleQuickFilter}
      activeFilters={{ ...filters, tab: activeTab }}
    />
  );

  return (
    <DashboardLayout rightContent={rightPanel}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Accent line + title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '28px', borderRadius: '3px', background: 'linear-gradient(180deg, #6c63ff, #5a52d5)', flexShrink: 0 }} />
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'rgb(var(--color-dark-100))', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(108,99,255,0.1)', border: '0.5px solid rgba(108,99,255,0.2)', fontSize: '18px',
              }}>
                📚
              </span>
              Academic Resources
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-400))', marginLeft: '13px' }}>
            Study materials, past papers &amp; notes shared by your peers
          </p>
        </div>

        {/* Upload button */}
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            background: '#6c63ff',
            color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(108,99,255,0.25)', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#5a52d5';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,99,255,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#6c63ff';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.25)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          }}
        >
          <Plus size={16} strokeWidth={2.5} />Upload Resource
        </button>
      </div>

      {/* ── Filters ── */}
      <ResourceFilters
        filters={filters}
        onChange={handleFiltersChange}
        onSearch={handleSearch}
        searchValue={search}
      />

      {/* ── Tabs + Sort on one line ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.6)', border: '0.5px solid rgb(var(--color-dark-700) / 0.5)' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => syncParams({ tab: tab.key })}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: active ? 500 : 400,
                  border: active ? '0.5px solid #6c63ff' : '0.5px solid transparent', cursor: 'pointer', transition: 'all 0.15s ease',
                  background: active ? '#6c63ff' : 'transparent',
                  color: active ? '#ffffff' : 'rgb(var(--color-dark-400))',
                  boxShadow: active ? '0 2px 8px rgba(108,99,255,0.25)' : 'none',
                }}
                onMouseEnter={e => { 
                  if (!active) {
                    e.currentTarget.style.borderColor = '#6c63ff';
                    e.currentTarget.style.color = 'rgb(var(--color-dark-100))';
                  }
                }}
                onMouseLeave={e => { 
                  if (!active) {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'rgb(var(--color-dark-400))';
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sort buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.Icon;
            const active = sort === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => syncParams({ sort: opt.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 11px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s ease',
                  background: active ? 'rgba(108,99,255,0.15)' : 'transparent',
                  color: active ? '#6c63ff' : 'rgb(var(--color-dark-500))',
                  borderBottom: active ? '2px solid #6c63ff' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#6c63ff'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgb(var(--color-dark-500))'; }}
              >
                <Icon size={11} />{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', gap: '12px' }}>
          <Loader2 size={32} style={{ color: '#6c63ff', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: 'rgb(var(--color-dark-400))' }}>Loading resources…</p>
        </div>
      ) : resources.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', alignItems: 'stretch' }}>
            {resources.map(r => (
              <ResourceCard
                key={r._id}
                resource={r}
                savedIds={savedIds}
                onSaveToggle={handleSaveToggle}
                onDeleted={handleDeleted}
                onPreview={setPreviewResource}
              />
            ))}
          </div>

          <div ref={sentinelRef} style={{ height: '16px' }} />

          {loadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <Loader2 size={22} style={{ color: '#6c63ff', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!hasMore && resources.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgb(var(--color-dark-600))', padding: '24px 0' }}>
              — No more resources —
            </p>
          )}
        </>
      ) : (
        /* Empty state */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '96px 24px', textAlign: 'center',
          border: '1px dashed rgb(var(--color-dark-700) / 0.4)',
          borderRadius: '16px', background: 'rgb(var(--color-dark-900) / 0.3)',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgb(var(--color-dark-800))', border: '0.5px solid rgb(var(--color-dark-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
          }}>
            <BookOpen size={30} style={{ color: 'rgb(var(--color-dark-500))' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'rgb(var(--color-dark-200))', marginBottom: '8px' }}>
            No resources found
          </h3>
          <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-500))', marginBottom: '20px', maxWidth: '320px', lineHeight: '1.5' }}>
            {activeTab === 'bookmarked' ? "You haven't saved any resources yet."
              : activeTab === 'my-uploads' ? "You haven't uploaded any resources yet."
              : 'Be the first to upload study material for your peers.'}
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
              background: '#6c63ff',
              color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(108,99,255,0.2)',
            }}
          >
            <Plus size={15} />Upload Resource
          </button>
        </div>
      )}

      {/* Modals */}
      <UploadResourceModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
      {previewResource && (
        <PDFPreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </DashboardLayout>
  );
}
