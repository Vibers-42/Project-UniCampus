import { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, MessageSquare, Search, X, MapPin, BookOpen, Terminal, ExternalLink } from 'lucide-react';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../config/api';
import { format } from 'date-fns';

export default function MessagesPage() {
  const { user } = useAuth();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.data.conversations);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  };

  const fetchMessages = async (conversationId, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(res.data.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
  }, []);

  // Poll for messages when a conversation is active
  useEffect(() => {
    if (activeConversation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  // Socket IO Setup
  useEffect(() => {
    if (!user?._id) return;

    const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
    socketRef.current = io(url, {
      withCredentials: true,
    });

    socketRef.current.emit('joinUserRoom', user._id);

    socketRef.current.on('newMessage', (message) => {
      // Add message to current conversation if it belongs there
      setMessages((prev) => {
        // If we are viewing the conversation this message belongs to
        if (prev.length > 0 && prev[0].conversationId === message.conversationId) {
          // avoid duplicates
          if (prev.find(m => m._id === message._id)) return prev;
          return [...prev, message];
        }
        return prev;
      });
      // Refresh sidebar to update last message and sorting
      fetchConversations();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?._id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/users/search?search=${encodeURIComponent(searchQuery)}&limit=10`);
          setSearchResults(res.data.data.items.filter(u => u._id !== user._id));
        } catch (err) {
          console.error('Failed to search users', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user?._id]);

  const handleViewProfile = async (rollNumber) => {
    try {
      setIsProfileModalOpen(true);
      setSelectedProfile(null); // Clear previous
      const res = await api.get(`/portfolio/${rollNumber}`);
      setSelectedProfile(res.data.data.portfolio);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      // Even if portfolio doesn't exist, we can show an empty state in modal
      setSelectedProfile({ error: 'Portfolio not set up yet.' });
    }
  };


  const startConversation = async (receiverId) => {
    try {
      const res = await api.post('/messages/conversations', { receiverId });
      const conv = res.data.data.conversation;
      
      // Set active
      setActiveConversation(conv);
      setSearchQuery(''); // clear search
      
      // Refresh conversation list to bump this to top if needed
      fetchConversations();
    } catch (error) {
      console.error('Failed to start conversation', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.post(`/messages/conversations/${activeConversation._id}/messages`, {
        content
      });
      
      // Do not manually add the message here, it will be added via the Socket.io event 'newMessage'
      // Wait, since we are emitting it to ourselves too (in the backend), it will be caught by the socket event!
      // Actually we should optimize by adding it optimistically, then filtering duplicates. 
      // But let's just let the socket handle it since it's fast.
      // But we can keep optimistic UI just in case:
      setMessages(prev => {
        if (prev.find(m => m._id === res.data.data.message._id)) return prev;
        return [...prev, res.data.data.message];
      });
      fetchConversations(); // Update sidebar last message
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => p._id !== user._id) || conv.participants[0];
  };

  return (
    <DashboardLayout hideWidgets={true} fullWidth={true}>
      <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-dark-950">
        
        {/* Left Sidebar - Conversations */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-dark-800 flex flex-col bg-dark-900/40">
          <div className="p-5 border-b border-dark-800 bg-dark-950/50 space-y-4">
            <h2 className="text-xl font-bold text-dark-100">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              <input 
                 type="text"
                 placeholder="Search students to message..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-dark-900 border border-dark-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
            {searchQuery.trim().length >= 2 ? (
              // Search Results
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-dark-500">Search Results</p>
                {isSearching ? (
                  <p className="text-center text-dark-400 py-4 text-sm animate-pulse">Searching students...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div key={result._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/30 border border-dark-800/50 hover:bg-dark-800 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center overflow-hidden border border-dark-700 shrink-0">
                        {result.avatar ? (
                          <img src={result.avatar} alt={result.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-dark-300 font-bold">{result.fullName?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-dark-100 text-[15px] truncate">{result.fullName}</p>
                        <p className="text-xs text-dark-400 truncate">{result.rollNumber} • {result.department}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewProfile(result.rollNumber)} 
                          className="p-2 bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 rounded-lg transition-colors" 
                          title="View Profile"
                        >
                          <UserIcon size={16} />
                        </button>
                        <button 
                          onClick={() => startConversation(result._id)} 
                          className="p-2 bg-primary-600 text-white hover:bg-primary-500 rounded-lg transition-colors shadow-lg shadow-primary-500/20" 
                          title="Message"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-dark-400 py-4 text-sm">No students found matching "{searchQuery}"</p>
                )}
              </div>
            ) : conversations.length === 0 ? (
              // Conversations List Empty State
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dark-400">
                <MessageSquare size={40} className="mb-4 opacity-20" />
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Search for a student using the top search bar to start chatting!</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                const isActive = activeConversation?._id === conv._id;
                
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left mb-1 border ${
                      isActive 
                        ? 'bg-primary-500/10 border-primary-500/20' 
                        : 'bg-transparent border-transparent hover:bg-dark-800 hover:border-dark-700/50'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full shrink-0">
                      <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center overflow-hidden border border-dark-700">
                        {otherUser.avatar ? (
                          <img src={otherUser.avatar} alt={otherUser.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-dark-300 font-bold">{otherUser.fullName?.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={`font-semibold truncate pr-2 ${isActive ? 'text-primary-300' : 'text-dark-100'}`}>
                          {otherUser.fullName}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-dark-500 shrink-0">
                            {format(new Date(conv.lastMessageAt), 'MMM d')}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm truncate pr-4 ${isActive ? 'text-primary-400/80' : 'text-dark-400'}`}>
                          {conv.lastMessage ? conv.lastMessage.content : 'Started a conversation'}
                        </p>
                        {/* Unread indicator could go here if implemented on frontend properly */}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className="flex-1 flex flex-col relative bg-dark-950/50">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-dark-800 px-6 flex items-center gap-4 bg-dark-900/80 backdrop-blur-xl absolute top-0 w-full z-10 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center overflow-hidden border border-dark-700">
                  {getOtherParticipant(activeConversation).avatar ? (
                    <img src={getOtherParticipant(activeConversation).avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-dark-300 font-bold">{getOtherParticipant(activeConversation).fullName?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-dark-100 leading-tight">
                    {getOtherParticipant(activeConversation).fullName}
                  </h3>
                  <p className="text-xs text-dark-400">{getOtherParticipant(activeConversation).rollNumber}</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 pt-24 pb-6 space-y-4">
                {isLoading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-dark-400 animate-pulse">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full flex-col">
                    <p className="text-dark-300 bg-dark-800 px-4 py-2 rounded-full text-sm">This is the start of your conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === user._id;
                    const showTime = index === 0 || new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 mins gap
                    
                    return (
                      <div key={msg._id} className="flex flex-col">
                        {showTime && (
                          <span className="text-[10px] text-dark-500 text-center my-4">
                            {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                          </span>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isMine 
                            ? 'bg-primary-600 text-white self-end rounded-br-sm' 
                            : 'bg-dark-800 text-dark-100 border border-dark-700/50 self-start rounded-bl-sm'
                        }`}>
                          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {isMine && index === messages.length - 1 && (
                          <span className="text-[10px] text-dark-500 self-end mt-1 mr-1">
                            {msg.isRead ? 'Read' : 'Delivered'}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-dark-900/80 backdrop-blur-md border-t border-dark-800 mt-auto">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-dark-950 border border-dark-800 rounded-2xl p-1.5 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all shadow-inner max-w-4xl mx-auto">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none text-dark-100 p-3 max-h-32 min-h-[44px] resize-none focus:ring-0 text-[15px]"
                    rows="1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 mb-1 mr-1 rounded-xl bg-primary-600 text-white disabled:opacity-50 disabled:bg-dark-800 disabled:text-dark-500 transition-all hover:bg-primary-500"
                  >
                    <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-dark-900/50">
              <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6 border border-dark-700 shadow-xl">
                <MessageSquare size={32} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-dark-100 mb-2">Your Messages</h2>
              <p className="text-dark-400 max-w-sm">
                Select a conversation from the sidebar or search for a student using the top search bar to start a new chat.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-dark-800 bg-dark-950/50">
              <h3 className="font-bold text-dark-100">Student Profile</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)} 
                className="text-dark-400 hover:text-white p-1.5 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {!selectedProfile ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-dark-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-dark-400 text-sm">Loading profile data...</p>
                </div>
              ) : selectedProfile.error ? (
                <div className="text-center py-8">
                  <UserIcon size={48} className="mx-auto text-dark-700 mb-4" />
                  <p className="text-dark-300 font-medium">User has not setup their portfolio yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-5 items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dark-700 bg-dark-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedProfile.profileImage || selectedProfile.userId?.avatar ? (
                        <img src={selectedProfile.profileImage || selectedProfile.userId?.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={40} className="text-dark-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark-100">{selectedProfile.userId?.fullName}</h2>
                      <p className="text-primary-400 font-medium text-sm mt-0.5">{selectedProfile.userId?.rollNumber}</p>
                      <div className="flex flex-col gap-1 mt-2 text-sm text-dark-400">
                        <span className="flex items-center gap-1.5"><BookOpen size={14} /> {selectedProfile.userId?.department}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> Year {selectedProfile.userId?.yearOfStudy}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProfile.bio && (
                    <div>
                      <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">About</h4>
                      <p className="text-sm text-dark-200 leading-relaxed bg-dark-950 p-4 rounded-xl border border-dark-800">
                        {selectedProfile.bio}
                      </p>
                    </div>
                  )}

                  {(selectedProfile.skills?.length > 0 || selectedProfile.techStack?.length > 0) && (
                    <div>
                      <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-2">Top Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(selectedProfile.techStack || []), ...(selectedProfile.skills || [])].slice(0, 8).map((skill, idx) => (
                          <span key={idx} className="bg-dark-800 text-dark-200 px-2.5 py-1 rounded-lg text-xs border border-dark-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-dark-800 flex justify-end gap-3">
                    <button 
                      onClick={() => {
                        setIsProfileModalOpen(false);
                        startConversation(selectedProfile.userId?._id);
                      }}
                      className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Message
                    </button>
                    <Link 
                      to={`/portfolio/${selectedProfile.userId?.rollNumber}`}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                      View Full Portfolio <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
