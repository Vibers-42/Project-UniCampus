import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function RegisterPage() {
  const { register, authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    department: '',
    yearOfStudy: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!form.fullName.trim()) return setError('Full name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.email.toLowerCase().endsWith('@adityauniversity.in')) {
      return setError('Only @adityauniversity.in emails are allowed.');
    }
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName.trim(),
        rollNumber: form.rollNumber.trim(),
        department: form.department.trim(),
        yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
      });

      // register() signs out the user. Navigate to verification instructions.
      navigate('/verify-email');
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join the UniCampus community">
      <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="label-text">Full Name *</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="label-text">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@adityauniversity.in"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rollNumber" className="label-text">Roll Number</label>
            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              value={form.rollNumber}
              onChange={handleChange}
              placeholder="21A91A0501"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="yearOfStudy" className="label-text">Year</label>
            <select
              id="yearOfStudy"
              name="yearOfStudy"
              value={form.yearOfStudy}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="department" className="label-text">Department</label>
          <input
            id="department"
            name="department"
            type="text"
            value={form.department}
            onChange={handleChange}
            placeholder="Computer Science & Engineering"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="password" className="label-text">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label-text">Confirm Password *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="btn-primary mt-2" disabled={authLoading} id="register-btn">
          {authLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-dark-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
