/**
 * @file VerifyEmailPage.jsx — Static verification instructions
 *
 * ARCHITECTURE:
 *   After registration, the user is SIGNED OUT. This page is a pure
 *   instructions page — no auth state checks, no polling, no "I've Verified"
 *   button. The user verifies externally (Outlook) and is redirected back
 *   to /login?verified=true by Firebase's actionCodeSettings.
 *
 *   Resend verification is handled by the backend endpoint POST /auth/resend-verification
 *   using Firebase Admin SDK (not the client SDK, since user is signed out).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import api from '../../config/api';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Try to get email from sessionStorage metadata (set during registration)
  const storedMeta = sessionStorage.getItem('unicampus_reg_meta');
  const storedEmail = storedMeta ? JSON.parse(storedMeta).email : '';

  const handleResend = async () => {
    const email = resendEmail.trim() || storedEmail;

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!email.toLowerCase().endsWith('@adityauniversity.in')) {
      setError('Only @adityauniversity.in emails are allowed.');
      return;
    }

    setResending(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/resend-verification', { email: email.toLowerCase() });
      setMessage('Verification email resent! Check your inbox.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Check your inbox" subtitle="We sent you a verification link">
      <div className="space-y-5" id="verify-email-page">
        {/* Instructions */}
        <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl text-center">
          <p className="text-dark-300 text-sm">
            We sent a verification link to
          </p>
          <p className="text-primary-300 font-medium mt-1">
            {storedEmail || 'your email address'}
          </p>
        </div>

        <div className="space-y-3 text-dark-400 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold mt-0.5">1</span>
            <p>Open your <strong className="text-dark-200">Outlook</strong> inbox (check Junk/Spam too)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold mt-0.5">2</span>
            <p>Click the verification link in the email from <strong className="text-dark-200">noreply@unicampus-b2ed0.firebaseapp.com</strong></p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-400 font-bold mt-0.5">3</span>
            <p>After verification, you&apos;ll be redirected back to log in</p>
          </div>
        </div>

        {/* Status messages */}
        {message && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Resend section */}
        <div className="pt-2 border-t border-dark-700/50">
          <p className="text-dark-500 text-xs mb-3">Didn&apos;t receive the email?</p>

          {!storedEmail && (
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => { setResendEmail(e.target.value); setError(''); }}
              placeholder="you@adityauniversity.in"
              className="input-field mb-3"
              id="resend-email-input"
            />
          )}

          <button
            onClick={handleResend}
            className="btn-secondary"
            disabled={resending}
            id="resend-btn"
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        {/* Back to login */}
        <Link
          to="/login"
          className="block text-center text-dark-500 hover:text-dark-300 text-sm transition-colors py-2"
          id="back-to-login-btn"
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
