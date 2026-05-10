import { useState, useCallback } from 'react';
import api from '../config/api';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOpportunities = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/opportunities?${params}`);
      setOpportunities(res.data.data.items);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOpportunity = async (id) => {
    const res = await api.get(`/opportunities/${id}`);
    return res.data.data;
  };

  const createOpportunity = async (data) => {
    const res = await api.post('/opportunities', data);
    setOpportunities(prev => [res.data.data, ...prev]);
    return res.data.data;
  };

  const deleteOpportunity = async (id) => {
    await api.delete(`/opportunities/${id}`);
    setOpportunities(prev => prev.filter(opp => opp._id !== id));
  };

  return { opportunities, loading, error, fetchOpportunities, getOpportunity, createOpportunity, deleteOpportunity };
}
