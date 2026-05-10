/**
 * @file AuthContext.jsx — Global auth state management
 *
 * ARCHITECTURE:
 *   Firebase is the identity provider. Users SIGN OUT immediately after
 *   registration. Email verification happens externally (user clicks link
 *   in Outlook). The first LOGIN after verification triggers:
 *     reload() → emailVerified check → getIdToken(true) → POST /auth/sync
 *   which creates the MongoDB user record.
 *
 * LIFECYCLE:
 *   Registration: createUser → sendVerification → signOut → /verify-email
 *   Login:        signIn → reload → check emailVerified → getIdToken(true) → /auth/sync
 *   Session:      onAuthStateChanged → reload → getIdToken(true) → /auth/sync
 *
 * NEVER stores tokens in localStorage/sessionStorage.
 * Only registration metadata is stored in sessionStorage temporarily.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebaseClient';
import api from '../config/api';

const AuthContext = createContext(null);

const ALLOWED_DOMAIN = 'adityauniversity.in';

/**
 * Validate email domain before making any Firebase calls.
 */
const validateDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain !== ALLOWED_DOMAIN) {
    throw new Error(`Only @${ALLOWED_DOMAIN} emails are allowed.`);
  }
};

export function AuthProvider({ children }) {
  // ── State ──
  const [user, setUser] = useState(null);                // MongoDB user from backend
  const [loading, setLoading] = useState(true);           // Initial session restoration
  const [authLoading, setAuthLoading] = useState(false);  // Login/register operations

  /**
   * Sync Firebase user with backend MongoDB.
   *
   * PRECONDITIONS (caller must ensure):
   *   - fbUser.emailVerified === true (already checked)
   *   - fbUser.reload() has been called (fresh state)
   *   - fbUser.getIdToken(true) has been called (fresh token)
   */
  const syncWithBackend = useCallback(async (metadata = {}) => {
    try {
      console.debug('[Auth] Calling POST /auth/sync...');
      const { data } = await api.post('/auth/sync', metadata);
      const backendUser = data.data.user;
      setUser(backendUser);
      console.debug('[Auth] Backend sync successful. isNewUser:', data.data.isNewUser);
      return data.data;
    } catch (error) {
      console.error('[Auth] Backend sync failed:', error.response?.data?.message || error.message);
      // If sync fails, sign out to clean state
      await signOut(auth);
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * Core verification + sync sequence.
   * Used by both login() and onAuthStateChanged session restoration.
   *
   * Steps:
   *   1. reload() — get fresh emailVerified from Firebase servers
   *   2. Re-read auth.currentUser (reference may have updated)
   *   3. Check emailVerified — reject if false
   *   4. getIdToken(true) — force a fresh token with updated claims
   *   5. POST /auth/sync — create/fetch MongoDB user
   */
  const verifyAndSync = useCallback(async (fbUser, metadata = {}) => {
    // Step 1: Reload to get fresh state from Firebase servers
    console.debug('[Auth] Reloading Firebase user state...');
    await fbUser.reload();

    // Step 2: Re-read currentUser after reload
    const freshUser = auth.currentUser;
    console.debug('[Auth] After reload — emailVerified:', freshUser?.emailVerified);

    if (!freshUser || !freshUser.emailVerified) {
      console.debug('[Auth] Email not verified. Signing out.');
      await signOut(auth);
      setUser(null);
      throw new Error('Email is not verified. Please check your inbox and verify your email first.');
    }

    // Step 3: Force fresh token with updated email_verified claim
    console.debug('[Auth] Forcing fresh ID token...');
    await freshUser.getIdToken(true);

    // Step 4: Sync with backend
    return await syncWithBackend(metadata);
  }, [syncWithBackend]);

  // ── Firebase session restoration on mount ──
  useEffect(() => {
    console.debug('[Auth] Setting up onAuthStateChanged listener...');

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        console.debug('[Auth] Session restore — Firebase user:', fbUser.email);
        try {
          await verifyAndSync(fbUser);
        } catch {
          // verifyAndSync handles cleanup — state is already cleared
        }
      } else {
        console.debug('[Auth] No Firebase session. Clearing state.');
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [verifyAndSync]);

  /**
   * Register a new user with Firebase email/password.
   *
   * FLOW:
   *   1. Create Firebase user
   *   2. Send verification email with redirect to /login?verified=true
   *   3. Store registration metadata in sessionStorage
   *   4. Sign out immediately (unverified users must NOT stay logged in)
   *   5. Navigate to /verify-email (caller handles this)
   */
  const register = async ({ email, password, fullName, rollNumber, department, yearOfStudy }) => {
    validateDomain(email);
    setAuthLoading(true);

    try {
      const normalizedEmail = email.toLowerCase();
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      // Send verification email with redirect back to login
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
      await sendEmailVerification(credential.user, {
        url: `${appUrl}/login?verified=true`,
        handleCodeInApp: false,
      });

      // Store registration metadata for first login sync
      sessionStorage.setItem(
        'unicampus_reg_meta',
        JSON.stringify({ fullName, rollNumber, department, yearOfStudy, email: normalizedEmail })
      );

      // Sign out immediately — unverified users must not stay logged in
      // This prevents the "No authenticated user found" issue entirely
      await signOut(auth);

      console.debug('[Auth] Registration complete. User signed out. Verification email sent to:', normalizedEmail);
      return { success: true };
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Log in with Firebase email/password.
   *
   * FLOW:
   *   1. signInWithEmailAndPassword
   *   2. reload() + emailVerified check
   *   3. getIdToken(true) for fresh token
   *   4. POST /auth/sync with registration metadata (if first login)
   *   5. Clear sessionStorage metadata
   *   6. Return user data for routing
   */
  const login = async (email, password) => {
    validateDomain(email);
    setAuthLoading(true);

    try {
      const normalizedEmail = email.toLowerCase();
      console.debug('[Auth] Logging in:', normalizedEmail);

      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

      // Read registration metadata (only exists for first login after verification)
      const metaRaw = sessionStorage.getItem('unicampus_reg_meta');
      const metadata = metaRaw ? JSON.parse(metaRaw) : {};

      // verifyAndSync does: reload → emailVerified check → getIdToken(true) → /auth/sync
      const result = await verifyAndSync(credential.user, metadata);

      // Clear temporary metadata after successful sync
      sessionStorage.removeItem('unicampus_reg_meta');

      console.debug('[Auth] Login + sync successful:', normalizedEmail);
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Send password reset email.
   */
  const resetPassword = async (email) => {
    validateDomain(email);
    await sendPasswordResetEmail(auth, email.toLowerCase());
  };

  /**
   * Change password (requires re-authentication).
   */
  const changePassword = async (oldPassword, newPassword) => {
    setAuthLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');
      
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      console.debug('[Auth] Password changed successfully.');
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Sign out from both Firebase and app state.
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    console.debug('[Auth] Logged out. State cleared.');
  };

  const value = {
    // State
    user,
    setUser,
    loading,
    authLoading,

    // Auth methods
    register,
    login,
    logout,
    resetPassword,
    changePassword,

    // Computed
    isAuthenticated: !!user,
    needsOnboarding: user && !user.onboardingCompleted && !user.onboardingSkipped,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
