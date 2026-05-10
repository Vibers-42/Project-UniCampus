import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// App pages
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import CreateEventPage from './pages/events/CreateEventPage';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public auth routes (redirect if already logged in) ── */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* ── Verify email (static instructions — user is signed out) ── */}
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

          {/* ── Onboarding (protected but not subject to onboarding redirect) ── */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* ── Protected app routes ── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
          <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />

          {/* ── Default redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
