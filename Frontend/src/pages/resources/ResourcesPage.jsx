import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, BookOpen, Loader2, ArrowUpDown, Clock, Download, Star, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getResources } from '../../api/resource.api';
import ResourceCard from '../../components/resources/ResourceCard';
import ResourceFilters from '../../components/resources/ResourceFilters';
import UploadResourceModal from '../../components/resources/UploadResourceModal';
import PDFPreviewModal from '../../components/resources/PDFPreviewModal';
import ResourceRightPanel from '../../components/resources/ResourceRightPanel';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most-downloaded', label: 'Most Downloaded', icon: Download },
  { value: 'top-rated', label: 'Top Rated', icon: Star },
  { value: 'exam-relevant', label: 'Exam Relevant', icon: Zap },
];

const TABS = ['all', 'my-uploads', 'bookmarked'];
const TAB_LABELS = { all: 'All Resources', 'my-uploads': 'My Uploads', bookmarked: 'Bookmarked' };

export default function ResourcesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State derived from URL params ──
  const getParam = (key, def = '') => searchParams.get(key) || def;

  const [filters, setFilters] = useState({
    department: getParam('department'),
    year: getParam('year'),
    semester: getParam('semester'),
    subject: getParam('subject'),
    category: getParam('category'),
  });
  const [search, setSearch] = useState(getParam('search'));
  const [sort, setSort] = useState(getParam('sort', 'newest'));
  const [activeTab, setActiveTab] = useState(getParam('tab', 'all'));

  // ── Resource state ──
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Bookmarks (stored in localStorage for now) ──
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('resource_bookmarks') || '[]'); }
    catch { return []; }
  });

  // ── Modals ──
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState(null);

  // ── Infinite scroll sentinel ──
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // ── Debounce search ──
  const searchTimerRef = useRef(null);

  // ── Sync URL params ──
  const syncParams = useCallback((overrides = {}) => {
    const combined = { ...filters, search, sort, tab: activeTab, ...overrides };
    const params = {};
    Object.entries(combined).forEach(([k, v]) => { if (v && v !== 'newest' && v !== 'all') params[k] = v; });
    if (combined.sort && combined.sort !== 'newest') params.sort = combined.sort;
    setSearchParams(params, { replace: true });
  }, [filters, search, sort, activeTab, setSearchParams]);

  // ── Fetch resources ──
  const fetchResources = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        ...filters,
        search: search || undefined,
        sort,
        page: pg,
        limit: 12,
      };

      // Tab-specific filters
      if (activeTab === 'my-uploads' && user) params.uploadedBy = user._id;
      if (activeTab === 'bookmarked') {
        // Client-side filter — fetch all and filter by savedIds
        if (savedIds.length === 0) {
          setResources([]); setTotalPages(1); setHasMore(false);
          setLoading(false); setLoadingMore(false);
          return;
        }
      }

      const res = await getResources(params);
      const data = res.data?.data;
      let items = data?.items || [];

      // Client-side bookmark filter
      if (activeTab === 'bookmarked') {
        items = items.filter(r => savedIds.includes(r._id));
      }

      if (append) {
        setResources(prev => [...prev, ...items]);
      } else {
        setResources(items);
      }
      setTotalPages(data?.totalPages || 1);
      setHasMore(pg < (data?.totalPages || 1));
      setPage(pg);
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, search, sort, activeTab, user, savedIds]);

  // ── Initial + filter change fetch ──
  useEffect(() => {
    setPage(1);
    fetchResources(1, false);
    syncParams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, activeTab]);

  // ── Debounced search ──
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(1);
      fetchResources(1, false);
    }, 400);
  };

  // ── Infinite scroll ──
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) {
        fetchResources(page + 1, true);
      }
    }, { threshold: 0.5 });

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchResources]);

  // ── Handlers ──
  const handleFiltersChange = (overrides) => {
    setFilters(prev => ({ ...prev, ...overrides }));
  };

  const handleSaveToggle = (id, wasSaved) => {
    setSavedIds(prev => {
      const next = wasSaved ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('resource_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleted = (id) => {
    setResources(prev => prev.filter(r => r._id !== id));
  };

  const handleQuickFilter = (key, value) => {
    if (key === 'tab') { setActiveTab(value || 'all'); return; }
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    setPage(1);
    fetchResources(1, false);
  };

  return (
    <DashboardLayout hideWidgets>
      <div className="flex gap-6">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark-100 flex items-center gap-2">
                <span className="p-2 bg-primary-500/10 rounded-xl text-xl border border-primary-500/20">📚</span>
                Academic Resources
              </h1>
              <p className="text-dark-400 text-sm mt-1">Study materials, past papers & notes shared by your peers</p>
            </div>
            <button
              onClick={() => setUploadOpen(true)}
              className="btn-primary w-auto px-5 py-2.5 flex items-center gap-2 text-sm shrink-0">
              <Plus size={16} />Upload Resource
            </button>
          </div>

          {/* Filters */}
          <ResourceFilters
            filters={filters}
            onChange={handleFiltersChange}
            onSearch={handleSearch}
            searchValue={search}
          />

          {/* Tabs + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            {/* Tabs */}
            <div className="flex bg-dark-800 border border-dark-700/50 rounded-xl p-1 gap-0.5">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'text-dark-400 hover:text-dark-100'
                  }`}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Sort buttons */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-dark-500" />
              {SORT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button key={opt.value} onClick={() => setSort(opt.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sort === opt.value
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                        : 'text-dark-500 hover:text-dark-200 hover:bg-dark-800'
                    }`}>
                    <Icon size={11} />{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={32} className="text-primary-500 animate-spin" />
              <p className="text-dark-400 text-sm">Loading resources...</p>
            </div>
          ) : resources.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {loadingMore && (
                <div className="flex justify-center py-6">
                  <Loader2 size={24} className="text-primary-500 animate-spin" />
                </div>
              )}

              {!hasMore && resources.length > 0 && (
                <p className="text-center text-dark-600 text-xs py-6">
                  — No more resources —
                </p>
              )}
            </>
          ) : (
            <div className="auth-card py-24 flex flex-col items-center justify-center text-center border-dashed border-dark-700 bg-dark-900/40">
              <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center mb-6 border border-dark-700">
                <BookOpen size={40} className="text-dark-500" />
              </div>
              <h3 className="text-dark-100 font-bold text-xl mb-2">No resources found</h3>
              <p className="text-dark-400 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                {activeTab === 'bookmarked'
                  ? "You haven't saved any resources yet."
                  : activeTab === 'my-uploads'
                  ? "You haven't uploaded any resources yet."
                  : "No resources match your current filters. Try adjusting them or be the first to upload!"}
              </p>
              <button onClick={() => setUploadOpen(true)}
                className="btn-primary w-auto px-6 py-2.5 text-sm flex items-center gap-2">
                <Plus size={16} />Be the first to upload
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <aside className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-24">
            <ResourceRightPanel
              onQuickFilter={handleQuickFilter}
              activeFilters={{ ...filters, tab: activeTab }}
            />
          </div>
        </aside>
      </div>

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
