import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { getSubjectSuggestions } from '../../api/resource.api';

const DEPARTMENTS = [
  '', 'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'MCA', 'BBA', 'BCA', 'Other',
];

const CATEGORIES = ['', 'notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'];
const CATEGORY_LABELS = {
  '': 'All Categories', notes: 'Notes', pyq: 'PYQ', 'lab-manual': 'Lab Manual',
  assignment: 'Assignment', reference: 'Reference', other: 'Other',
};

const YEARS = ['', '1', '2', '3', '4'];
const YEAR_LABELS = { '': 'All Years', '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

const getSemestersForYear = (year) => {
  if (!year) return ['1','2','3','4','5','6','7','8'];
  const base = (parseInt(year) - 1) * 2;
  return [`${base + 1}`, `${base + 2}`];
};

function SelectFilter({ label, value, onChange, options, getLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-dark-800 border border-dark-700/50 text-dark-200 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all cursor-pointer min-w-[120px]"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{getLabel ? getLabel(opt) : (opt || label)}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
    </div>
  );
}

export default function ResourceFilters({ filters, onChange, onSearch, searchValue }) {
  const [subjectInput, setSubjectInput] = useState(filters.subject || '');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const subjectRef = useRef(null);
  const suggestRef = useRef(null);

  // Fetch subject suggestions when dept+semester set and user types
  useEffect(() => {
    const dept = filters.department;
    const sem = filters.semester;
    if (!dept || !sem || !subjectInput.trim()) {
      setSubjectSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getSubjectSuggestions(dept, sem);
        const all = res.data?.data?.subjects || [];
        setSubjectSuggestions(all.filter(s => s.toLowerCase().includes(subjectInput.toLowerCase())));
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [subjectInput, filters.department, filters.semester]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!subjectRef.current?.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleYearChange = (year) => {
    const sems = getSemestersForYear(year);
    onChange({ year, semester: sems[0] || '' });
  };

  const handleSubjectSelect = (subject) => {
    setSubjectInput(subject);
    onChange({ subject });
    setShowSuggestions(false);
  };

  const handleClear = useCallback(() => {
    setSubjectInput('');
    onChange({ department: '', year: '', semester: '', subject: '', category: '' });
    if (onSearch) onSearch('');
  }, [onChange, onSearch]);

  const hasFilters = filters.department || filters.year || filters.semester || filters.subject || filters.category || searchValue;

  return (
    <div className="auth-card p-4 mb-6 bg-dark-950/80 backdrop-blur-xl border-dark-800">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          placeholder="Search resources, subjects, tags..."
          value={searchValue}
          onChange={e => onSearch && onSearch(e.target.value)}
          className="input-field pl-10 bg-dark-900 border-dark-700/50 placeholder:text-dark-600 text-sm"
        />
        {searchValue && (
          <button onClick={() => onSearch && onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-200 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-dark-500 shrink-0" />

        {/* Department */}
        <SelectFilter
          label="All Depts"
          value={filters.department || ''}
          onChange={dept => onChange({ department: dept, semester: '', subject: '' })}
          options={DEPARTMENTS}
          getLabel={d => d || 'All Depts'}
        />

        {/* Year */}
        <SelectFilter
          label="All Years"
          value={filters.year || ''}
          onChange={handleYearChange}
          options={YEARS}
          getLabel={y => YEAR_LABELS[y] || y}
        />

        {/* Semester */}
        <SelectFilter
          label="All Sems"
          value={filters.semester || ''}
          onChange={sem => onChange({ semester: sem, subject: '' })}
          options={['', ...getSemestersForYear(filters.year)]}
          getLabel={s => s ? `Sem ${s}` : 'All Sems'}
        />

        {/* Subject with autocomplete */}
        <div className="relative" ref={subjectRef}>
          <input
            type="text"
            placeholder="Subject..."
            value={subjectInput}
            onChange={e => { setSubjectInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={e => { if (!suggestRef.current?.contains(e.relatedTarget)) { onChange({ subject: subjectInput }); } }}
            className="pl-3 pr-3 py-2 rounded-xl bg-dark-800 border border-dark-700/50 text-dark-200 text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all w-36 placeholder:text-dark-600"
          />
          {showSuggestions && subjectSuggestions.length > 0 && (
            <div ref={suggestRef}
              className="absolute top-full left-0 mt-1 w-52 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-40 overflow-y-auto">
              {subjectSuggestions.map(s => (
                <button key={s} onMouseDown={() => handleSubjectSelect(s)}
                  className="w-full text-left px-3 py-2 text-sm text-dark-200 hover:bg-dark-800 hover:text-primary-300 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <SelectFilter
          label="All Categories"
          value={filters.category || ''}
          onChange={cat => onChange({ category: cat })}
          options={CATEGORIES}
          getLabel={c => CATEGORY_LABELS[c] || c}
        />

        {/* Clear */}
        {hasFilters && (
          <button onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-dark-700/50 text-dark-400 hover:text-red-400 hover:border-red-400/30 text-sm transition-all">
            <X size={12} />Clear
          </button>
        )}
      </div>
    </div>
  );
}
