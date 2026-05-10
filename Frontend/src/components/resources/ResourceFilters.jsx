import { useState, useEffect, useRef, useCallback } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getSubjectSuggestions } from '../../api/resource.api';

const DEPARTMENTS = [
  '', 'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'MCA', 'BBA', 'BCA', 'Other',
];

const CATEGORIES = ['', 'notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'];
const CATEGORY_LABELS = {
  '': 'All Categories', notes: 'Notes', pyq: 'PYQ',
  'lab-manual': 'Lab Manual', assignment: 'Assignment',
  reference: 'Reference', other: 'Other',
};
const YEAR_LABELS = { '': 'All Years', '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

const getSemestersForYear = (year) => {
  if (!year) return ['1','2','3','4','5','6','7','8'];
  const base = (parseInt(year, 10) - 1) * 2;
  return [`${base + 1}`, `${base + 2}`];
};

/* ── Inline select ── */
function InlineSelect({ value, onChange, options, getLabel, minWidth = 'fit-content' }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none', WebkitAppearance: 'none',
          height: '38px', paddingLeft: '12px', paddingRight: '28px',
          borderRadius: '10px', fontSize: '13px', fontWeight: 500,
          background: 'rgb(var(--color-dark-800) / 0.7)',
          border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
          color: value ? 'rgb(var(--color-dark-100))' : 'rgb(var(--color-dark-400))',
          cursor: 'pointer', outline: 'none', minWidth,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(92,124,250,0.4)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)'; }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{getLabel ? getLabel(opt) : (opt || '—')}</option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{
          position: 'absolute', right: '8px', top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgb(var(--color-dark-500))', pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/* ── Main component ── */
export default function ResourceFilters({ filters, onChange, onSearch, searchValue }) {
  const [subjectInput, setSubjectInput] = useState(filters.subject || '');
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const subjectRef = useRef(null);

  /* Autocomplete fetch */
  useEffect(() => {
    const dept = filters.department;
    const sem = filters.semester;
    if (!dept || !sem || !subjectInput.trim()) { setSubjectSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await getSubjectSuggestions(dept, sem);
        const all = res.data?.data?.subjects || [];
        setSubjectSuggestions(all.filter(s => s.toLowerCase().includes(subjectInput.toLowerCase())));
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [subjectInput, filters.department, filters.semester]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!subjectRef.current?.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleYearChange = (year) => {
    const sems = getSemestersForYear(year);
    onChange({ year, semester: sems[0] || '', subject: '' });
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
    <div style={{
      background: 'rgb(var(--color-dark-900) / 0.5)',
      border: '0.5px solid rgb(var(--color-dark-700) / 0.5)',
      borderRadius: '14px',
      padding: '14px 16px',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* ── Search bar ── */}
      <div style={{ position: 'relative' }}>
        <svg
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, pointerEvents: 'none' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search resources, subjects, tags…"
          value={searchValue}
          onChange={e => onSearch && onSearch(e.target.value)}
          style={{
            width: '100%', height: '46px', paddingLeft: '42px', paddingRight: '56px',
            borderRadius: '12px', fontSize: '14px',
            background: 'rgb(var(--color-dark-800) / 0.6)',
            border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
            color: 'rgb(var(--color-dark-100))', outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(92,124,250,0.45)';
            e.target.style.boxShadow = '0 0 0 3px rgba(92,124,250,0.08)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {/* Keyboard hint */}
        <span style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '11px', color: 'rgb(var(--color-dark-600))',
          background: 'rgb(var(--color-dark-800))', border: '0.5px solid rgb(var(--color-dark-700))',
          padding: '2px 6px', borderRadius: '6px', pointerEvents: 'none',
        }}>
          ⌘K
        </span>
        {searchValue && (
          <button
            onClick={() => onSearch && onSearch('')}
            style={{
              position: 'absolute', right: '44px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgb(var(--color-dark-500))', padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Filter row (single horizontal line, scrollable) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {/* Filter icon */}
        <SlidersHorizontal size={14} style={{ color: 'rgb(var(--color-dark-500))', flexShrink: 0 }} />

        {/* Department */}
        <InlineSelect
          value={filters.department || ''}
          onChange={dept => onChange({ department: dept, semester: '', subject: '' })}
          options={DEPARTMENTS}
          getLabel={d => d || 'All Depts'}
          minWidth="110px"
        />

        {/* Year */}
        <InlineSelect
          value={filters.year || ''}
          onChange={handleYearChange}
          options={['', '1', '2', '3', '4']}
          getLabel={y => YEAR_LABELS[y] || y}
          minWidth="90px"
        />

        {/* Semester */}
        <InlineSelect
          value={filters.semester || ''}
          onChange={sem => onChange({ semester: sem, subject: '' })}
          options={['', ...getSemestersForYear(filters.year)]}
          getLabel={s => s ? `Sem ${s}` : 'All Sems'}
          minWidth="82px"
        />

        {/* Subject with autocomplete */}
        <div ref={subjectRef} style={{ position: 'relative', flex: 1, maxWidth: '180px', minWidth: '80px' }}>
          <input
            type="text"
            placeholder="Subject…"
            value={subjectInput}
            onChange={e => { setSubjectInput(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => { setTimeout(() => onChange({ subject: subjectInput }), 150); }}
            style={{
              width: '100%', height: '38px', padding: '0 12px',
              borderRadius: '10px', fontSize: '13px',
              background: 'rgb(var(--color-dark-800) / 0.7)',
              border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
              color: 'rgb(var(--color-dark-100))', outline: 'none',
              transition: 'border-color 0.15s', boxSizing: 'border-box',
            }}
            onFocusCapture={e => { e.target.style.borderColor = 'rgba(92,124,250,0.4)'; }}
            onBlurCapture={e => { e.target.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)'; }}
          />
          {showSuggestions && subjectSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
              background: 'rgb(var(--color-dark-900))', border: '0.5px solid rgb(var(--color-dark-700))',
              borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 60, maxHeight: '160px', overflowY: 'auto',
            }}>
              {subjectSuggestions.map(s => (
                <button
                  key={s}
                  onMouseDown={() => handleSubjectSelect(s)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px',
                    fontSize: '13px', color: 'rgb(var(--color-dark-200))',
                    background: 'none', border: 'none', cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgb(var(--color-dark-800))'; e.target.style.color = 'rgb(var(--color-primary-300))'; }}
                  onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'rgb(var(--color-dark-200))'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category */}
        <InlineSelect
          value={filters.category || ''}
          onChange={cat => onChange({ category: cat })}
          options={CATEGORIES}
          getLabel={c => CATEGORY_LABELS[c] || c}
          minWidth="120px"
        />

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={handleClear}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              height: '38px', padding: '0 12px', borderRadius: '10px', flexShrink: 0,
              fontSize: '12px', fontWeight: 500,
              background: 'rgb(var(--color-dark-800) / 0.5)',
              border: '0.5px solid rgb(var(--color-dark-700) / 0.6)',
              color: 'rgb(var(--color-dark-400))', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgb(var(--color-dark-400))'; e.currentTarget.style.borderColor = 'rgb(var(--color-dark-700) / 0.6)'; }}
          >
            <X size={11} />Clear
          </button>
        )}
      </div>
    </div>
  );
}
