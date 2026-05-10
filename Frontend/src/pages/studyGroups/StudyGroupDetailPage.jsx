import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ArrowLeft, Send, Users, Shield, MessageSquare, LogOut, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const fetchGroupDetails = async () => {
    try {
      const res = await api.get(`/studyGroups/${id}`);
      setGroup(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Group not found');
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/studyGroups/${id}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchMessages();

    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = async () => {
    try {
      await api.post(`/studyGroups/${id}/join`);
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await api.post(`/studyGroups/${id}/leave`);
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/studyGroups/${id}/message`, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading && !group) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 border-4 border-dark-800 border-t-primary-500 rounded-full animate-spin"></div>
          <p className="text-dark-400 font-bold tracking-widest uppercase text-xs">Syncing Group Lounge...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !group) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 text-red-500">
            <Shield size={40} />
          </div>
          <h2 className="text-2xl font-bold text-dark-100">{error || 'Group not found'}</h2>
          <Link to="/study-groups" className="btn-secondary px-8">Back to Groups</Link>
        </div>
      </DashboardLayout>
    );
  }

  const isMember = group?.members?.includes(user?.email);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="auth-card p-6 mb-6 border-dark-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <Link to="/study-groups" className="p-3 bg-dark-900 rounded-2xl hover:bg-dark-800 transition-colors border border-dark-800 text-dark-400">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-dark-100">{group.name}</h1>
                <span className="bg-primary-500/10 text-primary-400 text-[10px] font-black px-2 py-1 rounded-md border border-primary-500/20 uppercase tracking-widest">
                  {group.category}
                </span>
              </div>
              <p className="text-dark-400 text-sm font-medium flex items-center gap-4">
                <span className="flex items-center gap-1"><Users size={14} className="text-dark-500" /> {group.memberCount} Members</span>
                <span className="w-1.5 h-1.5 rounded-full bg-dark-700"></span>
                <span className="text-dark-500">Created by {group.createdBy}</span>
              </p>
            </div>
          </div>
          
          <div>
            {isMember ? (
              <button onClick={handleLeave} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5">
                <LogOut size={18} />
                Leave Lounge
              </button>
            ) : (
              <button onClick={handleJoin} className="btn-primary px-8 py-3 flex items-center gap-2 shadow-xl shadow-primary-500/20">
                <UserPlus size={18} strokeWidth={2.5} />
                Join Group
              </button>
            )}
          </div>
        </div>

        {/* Chat / Content Area */}
        {!isMember ? (
          <div className="flex-1 auth-card border-dashed border-dark-700 bg-dark-900/40 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mb-8 border border-dark-700 shadow-inner">
              <Shield size={48} className="text-dark-500" />
            </div>
            <h2 className="text-3xl font-black text-dark-100 mb-3">Lounge Locked</h2>
            <p className="text-dark-400 max-w-sm mb-10 font-medium leading-relaxed">
              You need to be a member of this study group to participate in the lounge discussion and see messages.
            </p>
            <button onClick={handleJoin} className="btn-primary px-12 py-4 shadow-2xl shadow-primary-500/25">
              Join this Group
            </button>
          </div>
        ) : (
          <div className="flex-1 auth-card p-0 flex flex-col overflow-hidden border-dark-800 shadow-2xl bg-dark-900/50 backdrop-blur-xl">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-5 bg-dark-800 rounded-3xl mb-4 border border-dark-700">
                    <MessageSquare size={32} className="text-dark-500" />
                  </div>
                  <p className="text-dark-400 font-bold uppercase tracking-widest text-[10px]">No messages yet in this lounge</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === user?.email;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                         <span className="text-[10px] font-black text-primary-400/80 mb-1.5 px-2 uppercase tracking-tighter">
                           {msg.sender.split('@')[0]}
                         </span>
                      )}
                      <div className={`group relative px-5 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] shadow-lg ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-br-none shadow-primary-600/10' 
                          : 'bg-dark-800 text-dark-100 border border-dark-700/50 rounded-bl-none shadow-black/20'
                      }`}>
                        <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
                        <span className={`absolute bottom-[-18px] text-[9px] font-bold uppercase tracking-tighter whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'right-0 text-primary-500' : 'left-0 text-dark-500'}`}>
                          {format(new Date(msg.createdAt), 'hh:mm aa')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-dark-950/80 border-t border-dark-800 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex gap-3 bg-dark-900 p-2 rounded-2xl border border-dark-800 focus-within:border-primary-500/40 transition-all shadow-inner">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message to the group..."
                  className="flex-1 bg-transparent border-none text-dark-100 px-4 py-2 focus:ring-0 text-sm font-medium"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-500 disabled:opacity-50 disabled:bg-dark-800 disabled:shadow-none transition-all"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
