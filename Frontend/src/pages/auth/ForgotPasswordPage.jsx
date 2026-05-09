import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSent(false);

    if (!email.toLowerCase().endsWith('@adityauniversity.in')) {
      return setError('Only @adityauniversity.in emails are allowed.');
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      if (err?.code === 'auth/user-not-found') {
        // Don't reveal if user exists — just show success
        setSent(true);
      } else {
        setError(err.message || 'Failed to send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit} className="space-y-4" id="forgot-password-form">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
              <p className="font-medium">Check your email</p>
              <p className="mt-1 text-green-500/80">
                If an account exists for {email}, you&apos;ll receive a password reset link.
              </p>
            </div>
            <Link to="/login" className="btn-secondary block text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="reset-email" className="label-text">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@adityauniversity.in"
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} id="reset-btn">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-dark-400 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </>
        )}
      </form>
    </AuthLayout>
  );
}
