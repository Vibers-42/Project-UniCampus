import { useState, useCallback } from 'react';
import api from '../config/api';

export function useMarketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const fetchItems = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/marketplace?${params}`);
      const d = res.data?.data ?? {};
      setItems(d.items ?? []);
      setPagination({
        total: d.total ?? 0,
        pages: d.pages ?? 1,
        page: d.page ?? 1,
      });
      setError(null);
    } catch (err) {
      console.error('[useMarketplace] fetchItems error:', err?.message || err);
      setError(err.response?.data?.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  const getItem = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/marketplace/${id}`);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/marketplace', data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/marketplace/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleSoldStatus = async (id) => {
    try {
      const res = await api.patch(`/marketplace/${id}/toggle-sold`);
      setItems(prev => prev.map(item => item._id === id ? res.data.data : item));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      throw err;
    }
  };

  const updateListing = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.put(`/marketplace/${id}`, data);
      setItems(prev => prev.map(item => item._id === id ? res.data.data : item));
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { 
    items, 
    loading, 
    error, 
    pagination,
    fetchItems, 
    getItem, 
    createListing, 
    deleteListing,
    toggleSoldStatus,
    updateListing
  };
}
