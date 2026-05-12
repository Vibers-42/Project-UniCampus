import { useState, useCallback } from 'react';
import api from '../config/api';

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (type = 'All', page = 1, sort = '') => {
    setLoading(true);
    try {
      let url = `/feed?type=${type}&page=${page}`;
      if (sort) url += `&sort=${sort}`;
      const res = await api.get(url);
      setPosts(res.data?.data?.items ?? []);
      setError(null);
    } catch (err) {
      console.error('[useFeed] fetchFeed error:', err?.message || err);
      setError(err.response?.data?.message || err.message || 'Failed to load feed');
      // Ensure posts is always an array on error
      setPosts(prev => Array.isArray(prev) ? prev : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (data) => {
    const res = await api.post('/feed', data);
    setPosts(prev => [res.data.data, ...prev]);
    return res.data.data;
  };

  const likePost = async (postId) => {
    const res = await api.post(`/feed/${postId}/like`);
    const { liked, likesCount } = res.data.data;
    setPosts(prev => prev.map(p => 
      p._id === postId ? { ...p, hasLiked: liked, likesCount } : p
    ));
    return res.data.data;
  };

  const addComment = async (postId, content) => {
    const res = await api.post(`/feed/${postId}/comments`, { content });
    setPosts(prev => prev.map(p => 
      p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));
    return res.data.data;
  };

  return { posts, loading, error, fetchFeed, createPost, likePost, addComment };
}
