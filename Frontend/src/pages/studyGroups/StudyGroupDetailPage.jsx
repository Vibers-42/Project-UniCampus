import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function StudyGroupDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
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
    } catch (err) {
      console.error(err);
      setError('Group not found');
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

    // Simple polling for MVP (every 5 seconds)
    const interval = setInterval(() => {
      fetchMessages();
      // fetch group details occasionally to update member count
      if (Math.random() > 0.5) fetchGroupDetails(); 
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
    return <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">{error}</h2>
        <Link to="/study-groups" className="text-indigo-400 hover:text-indigo-300">&larr; Back to Groups</Link>
      </div>
    );
  }

  const isMember = group?.members?.includes(currentUser?.email);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between shadow-sm">
        <div>
          <Link to="/study-groups" className="text-indigo-400 hover:text-indigo-300 text-sm mb-2 inline-block">
            &larr; Back to Groups
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded-full">
              {group.category}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{group.description}</p>
          <div className="text-gray-500 text-xs mt-2">
            Created by {group.createdBy} • {group.memberCount} Members
          </div>
        </div>
        
        <div>
          {isMember ? (
            <button onClick={handleLeave} className="bg-red-900/50 hover:bg-red-900 text-red-300 px-4 py-2 rounded transition border border-red-800">
              Leave Group
            </button>
          ) : (
            <button onClick={handleJoin} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded shadow transition font-medium">
              Join Group
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-4 md:p-8">
        {!isMember ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md border border-gray-700 shadow-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold mb-2">Members Only</h2>
              <p className="text-gray-400 mb-6">You must join this study group to view and participate in the discussion.</p>
              <button onClick={handleJoin} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded shadow transition w-full">
                Join Now
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col h-[calc(100vh-200px)]">
            {/* Messages List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === currentUser?.email;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">{isMe ? 'You' : msg.sender}</span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className={`px-4 py-2 rounded-lg max-w-[80%] break-words ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-gray-700 text-gray-100 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b-lg">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message the group..."
                  className="flex-grow bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 focus:outline-none focus:border-indigo-500"
                  maxLength={2000}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
