import { useState, useCallback } from 'react';
import api from '../config/api';

/**
 * useAIChat — Hook for the AI Doubt Solver module.
 *
 * Follows the same pattern as useOpportunities, useMarketplace, etc.
 * Manages conversations list, active messages, and loading states.
 */
export function useAIChat() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch all conversations for the sidebar */
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai-chatbot/conversations');
      setConversations(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Load messages for a specific conversation */
  const loadConversation = useCallback(async (conversationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/ai-chatbot/conversations/${conversationId}`);
      setActiveConversation(res.data.data.conversation);
      setMessages(res.data.data.messages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Send a message (new or follow-up) */
  const sendMessage = useCallback(async (message, conversationId = null) => {
    setSending(true);

    // Optimistically show the user message immediately
    setMessages(prev => [
      ...prev,
      { role: 'user', content: message, createdAt: new Date().toISOString() },
    ]);

    try {
      // IMPORTANT: never send conversationId: null — express-validator treats
      // null as a present-but-invalid MongoDB ID and returns 422.
      const payload = { message };
      if (conversationId) payload.conversationId = conversationId;

      console.log('[useAIChat] POST /ai-chatbot/ask', payload);
      const res = await api.post('/ai-chatbot/ask', payload);
      console.log('[useAIChat] Response:', res.data);

      const { conversationId: returnedId, reply } = res.data.data;

      // Append the AI reply
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, createdAt: new Date().toISOString() },
      ]);

      // Set active conversation if new
      if (!conversationId) {
        // Fetch the saved conversation doc so title etc are correct
        const convRes = await api.get(`/ai-chatbot/conversations/${returnedId}`);
        setActiveConversation(convRes.data.data.conversation);
        fetchConversations(); // refresh sidebar
      } else {
        fetchConversations();
      }

      setError(null);
      return { conversationId: returnedId, reply };
    } catch (err) {
      console.error('[useAIChat] API error:', err?.response?.data || err?.message || err);
      // Remove the optimistically added user message on failure
      setMessages(prev => prev.slice(0, -1));
      setError(err?.response?.data?.message || err?.message || 'Something went wrong');
      throw err;
    } finally {
      setSending(false);
    }
  }, [fetchConversations]);


  /** Delete a single conversation */
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.delete(`/ai-chatbot/conversations/${conversationId}`);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      // If we deleted the active conversation, clear it
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }, [activeConversation]);

  /** Start a fresh chat (clear active state) */
  const startNewChat = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    error,
    fetchConversations,
    loadConversation,
    sendMessage,
    deleteConversation,
    startNewChat,
  };
}
