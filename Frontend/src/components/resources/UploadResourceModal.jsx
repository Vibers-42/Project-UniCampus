import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Check, AlertTriangle, ChevronRight, ChevronLeft, File, FileText, FileImage, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { uploadResource, getSubjectSuggestions } from '../../api/resource.api';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'MCA', 'BBA', 'BCA', 'Other',
];

const CATEGORIES = [
  { value: 'notes', label: 'Notes' },
  { value: 'pyq', label: 'PYQ (Past Year Questions)' },
  { value: 'lab-manual', label: 'Lab Manual' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'reference', label: 'Reference Book' },
  { value: 'other', label: 'Other' },
];

const YEAR_LABELS = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

const getSemesters = (year) => {
  if (!year) return [1,2,3,4,5,6,7,8];
  const base = (parseInt(year) - 1) * 2;
  return [base + 1, base + 2];
};

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
];
const MAX_SIZE_MB = 20;

function FileIcon({ type }) {
  if (!type) return <File size={36} className="text-dark-500" />;
  if (type.includes('pdf')) return <FileText size={36} className="text-red-400" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={36} className="text-blue-400" />;
  if (type.startsWith('image')) return <FileImage size={36} className="text-green-400" />;
  return <File size={36} className="text-dark-500" />;
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
          i === current ? 'w-8 bg-primary-500' : i < current ? 'w-4 bg-primary-500/40' : 'w-4 bg-dark-700'
        }`} />
      ))}
    </div>
  );
}

const TOTAL_STEPS = 5;

export default function UploadResourceModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    department: user?.department || '',
    year: user?.yearOfStudy?.toString() || '',
    semester: '',
    subject: '',
    isExamPeriod: false,
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const subjectRef = useRef(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  // Duplicate handling
  const [duplicate, setDuplicate] = useState(null);

  // Success
  const [uploadedResource, setUploadedResource] = useState(null);

  const dropRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(0); setFile(null); setFileError(''); setForm({
        title: '', description: '', category: '', department: user?.department || '',
        year: user?.yearOfStudy?.toString() || '', semester: '', subject: '', isExamPeriod: false,
      });
      setTags([]); setTagInput(''); setFormErrors({}); setUploading(false);
      setProgress(0); setUploadError(''); setDuplicate(null); setUploadedResource(null);
    }
  }, [isOpen, user]);

  // Subject autocomplete
  useEffect(() => {
    if (!form.department || !form.semester || !form.subject.trim()) {
      setSubjectSuggestions([]); return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getSubjectSuggestions(form.department, form.semester);
        const all = res.data?.data?.subjects || [];
        setSubjectSuggestions(all.filter(s => s.toLowerCase().includes(form.subject.toLowerCase())));
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.subject, form.department, form.semester]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = e => {
      if (!subjectRef.current?.contains(e.target)) setShowSubjectSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Invalid file type. Only PDF, DOC, DOCX, and images allowed.';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return '';
  };

  const handleFileDrop = useCallback((f) => {
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileDrop(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) handleFileDrop(f);
  };

  // Step 2 validation
  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.department) errs.department = 'Department is required';
    if (!form.year) errs.year = 'Year is required';
    if (!form.semester) errs.semester = 'Semester is required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateForm()) return;
    setStep(s => s + 1);
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags(t => [...t, tag]);
      }
      setTagInput('');
    }
  };

  const handleUpload = async () => {
    setUploading(true); setUploadError(''); setProgress(0);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('category', form.category);
    fd.append('department', form.department);
    fd.append('year', form.year);
    fd.append('semester', form.semester);
    fd.append('subject', form.subject.trim());
    fd.append('isExamPeriod', form.isExamPeriod.toString());
    tags.forEach(t => fd.append('tags', t));

    try {
      const res = await uploadResource(fd, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      setUploadedResource(res.data?.data);
      setStep(4); // success
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicate(err.response.data?.existingResource);
        setStep(3); // duplicate
      } else {
        setUploadError(err.response?.data?.message || err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const semesters = getSemesters(form.year);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-dark-100 font-bold text-lg">Upload Resource</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <StepIndicator current={step} total={TOTAL_STEPS} />

        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">

          {/* ── STEP 0: File Drop ── */}
          {step === 0 && (
            <div>
              <h3 className="text-dark-200 font-semibold mb-4">Select File</h3>
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  dragging ? 'border-primary-500 bg-primary-500/5' : 'border-dark-700 hover:border-dark-600 bg-dark-800/40'
                }`}
                onClick={() => document.getElementById('resource-file-input').click()}
              >
                <input id="resource-file-input" type="file" className="hidden"
                  accept=".pdf,.doc,.docx,image/*" onChange={handleFileInput} />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileIcon type={file.type} />
                    <p className="text-dark-100 font-semibold">{file.name}</p>
                    <p className="text-dark-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); setFileError(''); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors">Change file</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center">
                      <Upload size={24} className="text-dark-400" />
                    </div>
                    <p className="text-dark-200 font-medium">Drag & drop or click to browse</p>
                    <p className="text-dark-500 text-sm">PDF, DOC, DOCX, Image • Max {MAX_SIZE_MB}MB</p>
                  </div>
                )}
              </div>
              {fileError && <p className="error-text mt-2">{fileError}</p>}
              <button onClick={() => setStep(1)} disabled={!file || !!fileError}
                className="btn-primary mt-4 flex items-center justify-center gap-2">
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 1: Details Form ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-dark-200 font-semibold mb-2">Resource Details</h3>

              <div>
                <label className="label-text">Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => setField('title', e.target.value)}
                  className="input-field" placeholder="e.g. Data Structures Unit 3 Notes" />
                {formErrors.title && <p className="error-text">{formErrors.title}</p>}
              </div>

              <div>
                <label className="label-text">Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  className="input-field min-h-[72px] resize-none" placeholder="Brief description (optional)" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Category <span className="text-red-400">*</span></label>
                  <select value={form.category} onChange={e => setField('category', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {formErrors.category && <p className="error-text">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="label-text">Department <span className="text-red-400">*</span></label>
                  <select value={form.department} onChange={e => setField('department', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formErrors.department && <p className="error-text">{formErrors.department}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Year <span className="text-red-400">*</span></label>
                  <select value={form.year} onChange={e => { setField('year', e.target.value); setField('semester', ''); }} className="input-field">
                    <option value="">Select...</option>
                    {['1','2','3','4'].map(y => <option key={y} value={y}>{YEAR_LABELS[y]}</option>)}
                  </select>
                  {formErrors.year && <p className="error-text">{formErrors.year}</p>}
                </div>
                <div>
                  <label className="label-text">Semester <span className="text-red-400">*</span></label>
                  <select value={form.semester} onChange={e => setField('semester', e.target.value)} className="input-field">
                    <option value="">Select...</option>
                    {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                  {formErrors.semester && <p className="error-text">{formErrors.semester}</p>}
                </div>
              </div>

              {/* Subject with autocomplete */}
              <div ref={subjectRef} className="relative">
                <label className="label-text">Subject <span className="text-red-400">*</span></label>
                <input value={form.subject}
                  onChange={e => { setField('subject', e.target.value); setShowSubjectSuggestions(true); }}
                  onFocus={() => setShowSubjectSuggestions(true)}
                  className="input-field" placeholder="e.g. Data Structures" />
                {formErrors.subject && <p className="error-text">{formErrors.subject}</p>}
                {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-36 overflow-y-auto">
                    {subjectSuggestions.map(s => (
                      <button key={s} onMouseDown={() => { setField('subject', s); setShowSubjectSuggestions(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-dark-200 hover:bg-dark-800 hover:text-primary-300 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="label-text">Tags</label>
                <div className="input-field flex flex-wrap gap-1.5 min-h-[44px] cursor-text"
                  onClick={() => document.getElementById('tag-input-res').focus()}>
                  {tags.map(t => (
                    <span key={t} className="chip">
                      <Tag size={10} />
                      {t}
                      <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="chip-remove ml-1">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input id="tag-input-res" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput} className="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-dark-200 placeholder:text-dark-600"
                    placeholder={tags.length === 0 ? 'Add tags (Enter to add)' : ''} />
                </div>
              </div>

              {/* Exam Period */}
              <div className="flex items-center gap-3">
                <button onClick={() => setField('isExamPeriod', !form.isExamPeriod)}
                  className={`w-10 h-6 rounded-full transition-all duration-200 ${form.isExamPeriod ? 'bg-primary-500' : 'bg-dark-700'}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.isExamPeriod ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <label className="text-dark-300 text-sm cursor-pointer" onClick={() => setField('isExamPeriod', !form.isExamPeriod)}>
                  📝 Mark as Exam Period resource
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="btn-secondary flex items-center justify-center gap-2">
                  <ChevronLeft size={16} />Back
                </button>
                <button onClick={handleNext} className="btn-primary flex items-center justify-center gap-2">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <div>
              <h3 className="text-dark-200 font-semibold mb-4">Review & Confirm</h3>
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-5 space-y-3 mb-5">
                <div className="flex items-center gap-3">
                  <FileIcon type={file?.type} />
                  <div>
                    <p className="text-dark-100 font-semibold">{file?.name}</p>
                    <p className="text-dark-500 text-sm">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-dark-500">Title:</span> <span className="text-dark-200">{form.title}</span></div>
                  <div><span className="text-dark-500">Category:</span> <span className="text-dark-200">{form.category}</span></div>
                  <div><span className="text-dark-500">Department:</span> <span className="text-dark-200">{form.department}</span></div>
                  <div><span className="text-dark-500">Year:</span> <span className="text-dark-200">{YEAR_LABELS[form.year]}</span></div>
                  <div><span className="text-dark-500">Semester:</span> <span className="text-dark-200">Sem {form.semester}</span></div>
                  <div><span className="text-dark-500">Subject:</span> <span className="text-dark-200">{form.subject}</span></div>
                </div>
                <p className="text-dark-500 text-xs">
                  Saved to: {form.department} → Year {form.year} → Sem {form.semester} → {form.subject}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => <span key={t} className="chip text-xs">{t}</span>)}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-dark-400 mb-1">
                    <span>Uploading...</span><span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm mb-4">
                  <AlertTriangle size={16} />{uploadError}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} disabled={uploading} className="btn-secondary flex items-center justify-center gap-2">
                  <ChevronLeft size={16} />Back
                </button>
                <button onClick={handleUpload} disabled={uploading}
                  className="btn-primary flex items-center justify-center gap-2">
                  {uploading ? `Uploading ${progress}%...` : 'Confirm Upload'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Duplicate ── */}
          {step === 3 && (
            <div>
              <h3 className="text-dark-200 font-semibold mb-4">Duplicate Detected</h3>
              <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl mb-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-dark-100 font-medium mb-1">This file already exists</p>
                    {duplicate && (
                      <p className="text-dark-400 text-sm">
                        "<span className="text-dark-200">{duplicate.title}</span>" was uploaded by{' '}
                        <span className="text-dark-200">{duplicate.uploadedBy?.fullName || 'another user'}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {duplicate?._id && (
                  <button onClick={() => { onClose(); navigate(`/resources/${duplicate._id}`); }}
                    className="btn-secondary">View Existing Resource</button>
                )}
                <button onClick={async () => {
                  setStep(2);
                  await handleUpload();
                }} className="btn-primary">Upload Anyway</button>
                <button onClick={onClose} className="text-dark-500 hover:text-dark-300 text-sm transition-colors">Cancel</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <h3 className="text-dark-100 font-bold text-lg mb-2">Uploaded Successfully!</h3>
              <p className="text-dark-400 text-sm mb-1">"{form.title}" has been saved to:</p>
              <p className="text-primary-400 text-sm font-medium mb-6">
                {form.department} → Year {form.year} → Sem {form.semester} → {form.subject}
              </p>
              <div className="flex flex-col gap-3">
                {uploadedResource && (
                  <button onClick={() => { onClose(); navigate(`/resources/${uploadedResource._id}`); }}
                    className="btn-secondary text-sm">View Resource</button>
                )}
                <button onClick={onClose} className="btn-primary">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
