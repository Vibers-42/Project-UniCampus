import { useEffect } from 'react';
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

// Resources
import ResourcesPage from './pages/resources/ResourcesPage';

// Study Groups
import StudyGroupsPage from './pages/studyGroups/StudyGroupsPage';
import StudyGroupDetailPage from './pages/studyGroups/StudyGroupDetailPage';

// Messages
import MessagesPage from './pages/messages/MessagesPage';

// Settings
import SettingsPage from './pages/settings/SettingsPage';
import EditProfilePage from './pages/settings/EditProfilePage';

// Marketplace
import MarketplacePage from './pages/marketplace/MarketplacePage';
import ItemDetailPage from './pages/marketplace/ItemDetailPage';

// AI Doubt Solver
import AIDoubtSolverPage from './pages/ai/AIDoubtSolverPage';

// Teammates
import TeammatesPage from './pages/teammates/TeammatesPage';
import TeammatesDetailPage from './pages/teammates/TeammatesDetailPage';
import CreateTeammatesPage from './pages/teammates/CreateTeammatesPage';

// Portfolio
import PortfolioPage from './pages/portfolio/PortfolioPage';
import EditPortfolioPage from './pages/portfolio/EditPortfolioPage';
export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

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

          {/* ── Onboarding (protected — user must be authenticated) ── */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* ── Protected app routes ── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />

          <Route path="/opportunities" element={<ProtectedRoute><OpportunitiesPage /></ProtectedRoute>} />
          <Route path="/opportunities/:id" element={<ProtectedRoute><OpportunityDetailPage /></ProtectedRoute>} />

          <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />

          <Route path="/study-groups" element={<ProtectedRoute><StudyGroupsPage /></ProtectedRoute>} />
          <Route path="/study-groups/:id" element={<ProtectedRoute><StudyGroupDetailPage /></ProtectedRoute>} />

          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />

          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />

          <Route path="/ai-solver" element={<ProtectedRoute><AIDoubtSolverPage /></ProtectedRoute>} />

          <Route path="/teammates" element={<ProtectedRoute><TeammatesPage /></ProtectedRoute>} />
          <Route path="/teammates/create" element={<ProtectedRoute><CreateTeammatesPage /></ProtectedRoute>} />
          <Route path="/teammates/:id" element={<ProtectedRoute><TeammatesDetailPage /></ProtectedRoute>} />

          <Route path="/portfolio/me" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/portfolio/edit" element={<ProtectedRoute><EditPortfolioPage /></ProtectedRoute>} />
          <Route path="/portfolio/:rollNumber" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />

          {/* ── Default redirect ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
