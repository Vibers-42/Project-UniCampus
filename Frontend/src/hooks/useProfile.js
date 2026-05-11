import { useState, useCallback } from 'react';
import api from '../config/api';

/**
 * useProfile — Hook for the Profile page.
 *
 * Fetches own profile via GET /users/profile and
 * updates it via PATCH /users/profile.
 *
 * Mirrors the pattern used by useAIChat, useOpportunities, etc.
 */
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', updates);
      setProfile(res.data.data);
      setError(null);
      return res.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, saving, error, fetchProfile, updateProfile };
}
