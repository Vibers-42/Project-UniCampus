/**
 * @file PublicRoute.jsx — Guards auth pages from authenticated users
 *
 * Redirects authenticated users away from login/register pages.
 * Shows loading during session restoration.
 *
 * NOTE: No firebaseUser check needed because unverified users are signed
 * out immediately after registration. Only fully authenticated (verified +
 * backend-synced) users are redirected.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}
