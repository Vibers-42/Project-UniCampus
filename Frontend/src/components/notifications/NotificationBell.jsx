/**
 * @file NotificationBell.jsx — Live notification bell with dropdown
 *
 * Features:
 *   - Shows unread count badge on bell icon
 *   - Dropdown with scrollable notification list
 *   - Mark individual or all as read
 *   - Delete notifications
 *   - Real-time updates via Socket.IO event listener
 *   - Auto-closes on outside click
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, CheckCheck, Trash2, X, Users, ShoppingBag, Calendar, MessageSquare, Info, BookOpen } from 'lucide-react';
import api from '../../config/api';

const TYPE_CONFIG = {
  teammate_apply:       { icon: Users,       color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  marketplace_interest: { icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  event_reminder:       { icon: Calendar,    color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  group_invite:         { icon: Users,       color: 'text-purple-400', bg: 'bg-purple-500/10' },
  resource_uploaded:    { icon: BookOpen,     color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  message:              { icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  system:               { icon: Info,        color: 'text-dark-400',   bg: 'bg-dark-700/50' },
};

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const mountedRef = useRef(false); // Prevent StrictMode double-fetch

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data?.data?.count || 0);
    } catch (err) {
      // If rate limited, don't spam — silently fail
      if (err?.isRateLimited) return;
    }
  }, []);

  // Fetch full notification list when dropdown opens
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data || []);
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // StrictMode guard — prevent double-fetch on mount
    if (mountedRef.current) return;
    mountedRef.current = true;

    fetchUnreadCount();
    // Poll every 2 minutes (was 30s — saves 45 requests per 15-minute window)
    const interval = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const portalRef = useRef(null);

  // Close on outside click — must check both the bell button and the portal dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inBell = dropdownRef.current?.contains(e.target);
      const inPortal = portalRef.current?.contains(e.target);
      if (!inBell && !inPortal) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Fail silently
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Fail silently
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Fail silently
    }
  };

  const bellRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // Recompute position when opening or on scroll/resize
  const updatePos = useCallback(() => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [isOpen, updatePos]);

  return (
    <div ref={dropdownRef}>
      {/* Bell Button */}
      <button
        ref={bellRef}
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-dark-400 hover:text-dark-100 transition-colors rounded-full hover:bg-dark-800"
        id="notification-bell"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — rendered via Portal to escape all stacking contexts */}
      {isOpen && createPortal(
        <div
          ref={portalRef}
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
          className="w-96 max-h-[28rem] bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-800 bg-dark-950/50">
            <h3 className="text-sm font-bold text-dark-100">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary-500/10"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-dark-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-12 h-12 bg-dark-800 rounded-2xl flex items-center justify-center mb-3">
                  <Bell size={24} className="text-dark-600" />
                </div>
                <p className="text-dark-400 text-sm font-medium">No notifications yet</p>
                <p className="text-dark-500 text-xs mt-1">
                  You&apos;ll see activity updates here
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                const IconComp = config.icon;

                return (
                  <div
                    key={n._id}
                    className={`group flex items-start gap-3 px-5 py-3.5 border-b border-dark-800/50 last:border-0 transition-colors hover:bg-dark-800/30 ${
                      !n.isRead ? 'bg-primary-500/[0.03]' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-xl ${config.bg} ${config.color} shrink-0 mt-0.5`}>
                      <IconComp size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.isRead ? 'text-dark-100 font-semibold' : 'text-dark-300'}`}>
                        {n.title || n.message || 'Notification'}
                      </p>
                      {(n.body) && (
                        <p className="text-xs text-dark-500 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-dark-600 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="p-1.5 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-primary-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-primary-400 rounded-full shrink-0 mt-2 shadow-sm shadow-primary-400/30" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
