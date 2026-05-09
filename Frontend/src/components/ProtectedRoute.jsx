/**
 * @file ProtectedRoute.jsx — Guards routes that require authentication
 *
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner during session restoration.
 * If the user needs onboarding, redirects to /onboarding.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, needsOnboarding } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;

  return children;
}
