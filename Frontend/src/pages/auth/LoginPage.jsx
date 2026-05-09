import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function LoginPage() {
  const { login, authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show success banner if redirected from email verification
  const justVerified = searchParams.get('verified') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) return setError('Email is required.');
    if (!email.toLowerCase().endsWith('@adityauniversity.in')) {
      return setError('Only @adityauniversity.in emails are allowed.');
    }
    if (!password) return setError('Password is required.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');

    try {
      // login() handles: signIn → reload → emailVerified → getIdToken(true) → /auth/sync
      const result = await login(email, password);

      // Route based on onboarding state
      if (result?.user?.onboardingCompleted || result?.user?.onboardingSkipped) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your UniCampus account">
      <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
        {/* Verification success banner */}
        {justVerified && !error && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            ✓ Email verified successfully! You can now sign in.
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="label-text">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="you@adityauniversity.in"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="label-text">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter your password"
            className="input-field"
            required
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm auth-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={authLoading} id="login-btn">
          {authLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-dark-400 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
