import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, BookOpen, Info,
  Send, Paperclip, Hash, Pin, X,
  ArrowLeft, Plus, Shield, MoreVertical, Trash2
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { getGroupById, getMessages, sendMessage } from '../api/group.api';
import toast from 'react-hot-toast';

import GroupDetailRightPanel from '../components/groups/GroupDetailRightPanel';
import GroupMembersTab from '../components/groups/GroupMembersTab';
import GroupResourcesTab from '../components/groups/GroupResourcesTab';
import AdminPanelModal from '../components/groups/AdminPanelModal';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'chat',     label: 'Chat',     icon: MessageSquare },
  { key: 'threads',  label: 'Threads',  icon: Hash },
  { key: 'resources',label: 'Resources',icon: BookOpen },
  { key: 'members',  label: 'Members',  icon: Users },
];

// ── Chat Message with context menu ───────────────────────────────────────────
function ChatMessage({ msg, isMe, isAdmin, onDelete, onPin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (msg.isDeleted) {
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
        <p style={{ fontSize: '13px', color: 'rgb(var(--color-dark-500))', fontStyle: 'italic', padding: '8px 14px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.4)' }}>
          This message was deleted
        </p>
      </div>
    );
  }

  return (
    <div
      className="group/msg"
      style={{ display: 'flex', gap: '10px', maxWidth: '80%', alignSelf: isMe ? 'flex-end' : 'flex-start', flexDirection: isMe ? 'row-reverse' : 'row', position: 'relative' }}
    >
      {/* Avatar */}
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgb(var(--color-dark-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#fff', flexShrink: 0, fontWeight: 700 }}>
        {msg.sender?.fullName?.charAt(0) || '?'}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {!isMe && (
          <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-400))', marginLeft: '4px' }}>{msg.sender?.fullName}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
          <div style={{
            padding: '10px 14px', borderRadius: '16px',
            background: isMe ? '#6c63ff' : 'rgb(var(--color-dark-800))',
            color: '#fff', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word',
          }}>
            {msg.body}
          </div>

          {/* ⋮ menu — appears on hover */}
          {(isMe || isAdmin) && (
            <div style={{ position: 'relative', opacity: 0, transition: '0.15s' }} className="group-hover/msg:opacity-100">
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ padding: '4px', background: 'rgb(var(--color-dark-800))', border: '1px solid rgb(var(--color-dark-700))', borderRadius: '6px', cursor: 'pointer', color: 'rgb(var(--color-dark-400))', display: 'flex', alignItems: 'center' }}
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div ref={menuRef} style={{
                  position: 'absolute', bottom: '110%', [isMe ? 'right' : 'left']: 0,
                  background: 'rgb(var(--color-dark-900))', border: '1px solid rgb(var(--color-dark-700))',
                  borderRadius: '12px', padding: '6px', minWidth: '140px', zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {isAdmin && (
                    <button
                      onClick={() => { onPin(msg); setMenuOpen(false); }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'none', border: 'none', color: '#6c63ff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Pin size={14} /> Pin Message
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(msg._id); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Trash2 size={14} /> Delete Message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p style={{ fontSize: '10px', color: 'rgb(var(--color-dark-500))', textAlign: isMe ? 'right' : 'left', marginLeft: '4px' }}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  // Chat
  const [messages, setMessages]   = useState([]);
  const [msgInput, setMsgInput]   = useState('');
  const [pinnedMsg, setPinnedMsg] = useState(null);
  const chatEndRef                = useRef(null);
  const msgRefs                   = useRef({});

  // Threads
  const [threads, setThreads]     = useState([]);

  // Modals
  const [adminOpen, setAdminOpen] = useState(false);

  // ── Fetch ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getGroupById(id);
        setGroup(res.data?.data?.group);
        setThreads(res.data?.data?.threads || []);
        const msgRes = await getMessages(id);
        setMessages(msgRes.data?.data || []);
      } catch {
        toast.error('Failed to load group');
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  if (loading || !group) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ color: 'rgb(var(--color-dark-400))' }}>Loading group…</p>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = user && group.admin?._id === user._id;

  // ── Handlers ──
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    try {
      await sendMessage(id, { body: msgInput });
      setMsgInput('');
      // Refetch messages
      const msgRes = await getMessages(id);
      setMessages(msgRes.data?.data || []);
    } catch {
      toast.error('Failed to send');
    }
  };

  const handleDeleteMessage = (msgId) => {
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, body: null } : m));
    if (pinnedMsg?._id === msgId) setPinnedMsg(null);
  };

  const handlePinMessage = (msg) => {
    setPinnedMsg(msg);
    toast.success('Message pinned');
  };

  const handleScrollToMsg = (msgId) => {
    const el = msgRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.background = 'rgba(108,99,255,0.15)';
      setTimeout(() => { if (el) el.style.background = ''; }, 1500);
    }
  };

  // Right panel
  const rightPanel = (
    <GroupDetailRightPanel
      group={group}
      threads={threads}
      onSwitchTab={setActiveTab}
    />
  );

  return (
    <DashboardLayout rightContent={rightPanel}>
      {/* Admin Panel Modal */}
      {adminOpen && (
        <AdminPanelModal
          group={group}
          onClose={() => setAdminOpen(false)}
          onGroupChange={(updated) => setGroup(updated)}
          onNavigateBack={() => navigate('/groups')}
        />
      )}

      {/* ── Group Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/groups')}
            style={{ color: 'rgb(var(--color-dark-400))', background: 'rgb(var(--color-dark-800))', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgb(var(--color-dark-800))', border: '1px solid rgb(var(--color-dark-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {group.avatar || '🎓'}
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{group.name}</h1>
              <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-400))' }}>
                {group.members?.length} Members · {group.category} · {group.isPrivate ? '🔒 Private' : '🌐 Public'}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setAdminOpen(true)}
            style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#6c63ff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', transition: '0.2s' }}
          >
            <Shield size={16} /> Admin Panel
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', borderBottom: '1px solid rgb(var(--color-dark-800))', marginBottom: '20px' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px', padding: '12px 0',
                background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
                color: active ? '#6c63ff' : 'rgb(var(--color-dark-400))',
                fontSize: '14px', fontWeight: 600, transition: '0.2s',
              }}
            >
              <Icon size={17} />
              {tab.label}
              {tab.key === 'members' && <span style={{ fontSize: '11px', background: 'rgb(var(--color-dark-800))', padding: '1px 6px', borderRadius: '8px' }}>{group.members?.length}</span>}
              {active && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2.5px', background: '#6c63ff', borderRadius: '4px' }} />}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ height: 'calc(100vh - 290px)', background: 'rgb(var(--color-dark-900) / 0.4)', borderRadius: '20px', border: '1px solid rgb(var(--color-dark-800))', overflow: 'hidden' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ padding: '28px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <section>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>About this group</h3>
              <p style={{ color: 'rgb(var(--color-dark-300))', lineHeight: 1.7, fontSize: '14px' }}>{group.description}</p>
            </section>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Subject', value: group.subject },
                { label: 'Target', value: `Year ${group.year} · Sem ${group.semester}` },
                { label: 'Admin', value: group.admin?.fullName },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '18px', borderRadius: '14px', background: 'rgb(var(--color-dark-800) / 0.5)', border: '1px solid rgb(var(--color-dark-700))' }}>
                  <p style={{ color: 'rgb(var(--color-dark-500))', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>{value}</p>
                </div>
              ))}
            </section>
            <section>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {group.tags?.map(tag => (
                  <span key={tag} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: 'rgb(var(--color-dark-800))', color: 'rgb(var(--color-dark-400))', border: '1px solid rgb(var(--color-dark-700))' }}>#{tag}</span>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CHAT */}
        {activeTab === 'chat' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Pinned message banner */}
            {pinnedMsg && !pinnedMsg.isDeleted && (
              <div style={{ padding: '8px 16px', background: 'rgba(108,99,255,0.1)', borderLeft: '3px solid #6c63ff', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <Pin size={14} style={{ color: '#6c63ff', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'rgb(var(--color-dark-400))', flexShrink: 0 }}>Pinned:</span>
                <span style={{ fontSize: '13px', color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pinnedMsg.body?.slice(0, 80)}{pinnedMsg.body?.length > 80 ? '…' : ''}
                </span>
                <button
                  onClick={() => handleScrollToMsg(pinnedMsg._id)}
                  style={{ fontSize: '11px', color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
                >
                  View
                </button>
                {isAdmin && (
                  <button onClick={() => setPinnedMsg(null)} style={{ color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(msg => (
                <div key={msg._id} ref={el => msgRefs.current[msg._id] = el} style={{ borderRadius: '8px', transition: 'background 0.4s' }}>
                  <ChatMessage
                    msg={msg}
                    isMe={user && msg.sender?._id === user._id}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteMessage}
                    onPin={handlePinMessage}
                  />
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              style={{ padding: '16px 20px', borderTop: '1px solid rgb(var(--color-dark-800))', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}
            >
              <button type="button" style={{ color: 'rgb(var(--color-dark-400))', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Paperclip size={20} />
              </button>
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                placeholder="Type a message…"
                style={{ flex: 1, padding: '11px 16px', borderRadius: '12px', background: 'rgb(var(--color-dark-800) / 0.8)', border: '1px solid rgb(var(--color-dark-700))', color: '#fff', outline: 'none', fontSize: '14px' }}
              />
              <button
                type="submit"
                disabled={!msgInput.trim()}
                style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#6c63ff', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: msgInput.trim() ? 1 : 0.5, flexShrink: 0 }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}

        {/* THREADS */}
        {activeTab === 'threads' && (
          <div style={{ height: '100%', padding: '20px 24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>Discussion Threads</h3>
              <button
                onClick={() => {
                  const title = prompt('Thread title:');
                  if (!title?.trim()) return;
                  const newThread = { _id: `thr_${Date.now()}`, title: title.trim(), topic: '', isPinned: false, messageCount: 0, lastActivity: new Date(), createdBy: { _id: user?._id, fullName: user?.fullName || 'You' } };
                  setThreads(prev => [newThread, ...prev]);
                  toast.success('Thread created!');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.2)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                <Plus size={15} /> New Thread
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {threads.length === 0 && (
                <p style={{ textAlign: 'center', color: 'rgb(var(--color-dark-500))', padding: '40px 0', fontSize: '14px' }}>No threads yet. Create the first one!</p>
              )}
              {threads.map(thr => (
                <div key={thr._id} style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgb(var(--color-dark-800) / 0.4)', border: '1px solid rgb(var(--color-dark-700))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgb(var(--color-dark-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c63ff' }}>
                      <Hash size={18} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{thr.title}</h4>
                        {thr.isPinned && <Pin size={12} style={{ color: '#6c63ff' }} />}
                      </div>
                      {thr.topic && <p style={{ fontSize: '12px', color: 'rgb(var(--color-dark-400))', marginTop: '2px' }}>{thr.topic}</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{thr.messageCount} messages</p>
                    <p style={{ fontSize: '11px', color: 'rgb(var(--color-dark-500))', marginTop: '2px' }}>
                      {new Date(thr.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === 'resources' && (
          <GroupResourcesTab
            group={group}
            onGroupChange={setGroup}
          />
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <GroupMembersTab
            group={group}
            onGroupChange={setGroup}
          />
        )}

      </div>
    </DashboardLayout>
  );
}
