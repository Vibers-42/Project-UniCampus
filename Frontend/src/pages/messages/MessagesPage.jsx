import { useState, useEffect, useRef } from 'react';
import { Search, Send, User as UserIcon, MessageSquare } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

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
    let interval;
    if (activeConversation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages(activeConversation._id);
      interval = setInterval(() => {
        fetchMessages(activeConversation._id, false); // false means don't set loading state
      }, 5000); // Poll every 5s
    }
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.get(`/messages/search?rollNumber=${query}`);
      setSearchResults(res.data.data.users.filter(u => u._id !== user._id)); // Exclude self
    } catch (error) {
      console.error('Failed to search users', error);
    } finally {
      setIsSearching(false);
    }
  };

  const startConversation = async (receiverId) => {
    try {
      const res = await api.post('/messages/conversations', { receiverId });
      const conv = res.data.data.conversation;
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
      
      // Set active
      setActiveConversation(conv);
      
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
      
      // Optimistically add message
      setMessages(prev => [...prev, res.data.data.message]);
      fetchConversations(); // Update sidebar last message
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => p._id !== user._id) || conv.participants[0];
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-dark-900 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left Sidebar - Conversations & Search */}
        <div className="w-full md:w-80 lg:w-96 border-r border-dark-800 flex flex-col bg-dark-950/50">
          <div className="p-4 border-b border-dark-800">
            <h2 className="text-xl font-bold text-dark-100 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search roll number..."
                className="w-full bg-dark-900 border border-dark-800 rounded-xl py-2 pl-10 pr-4 text-sm text-dark-100 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all outline-none placeholder:text-dark-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
            {/* Search Results */}
            {searchQuery.length >= 3 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-dark-500 uppercase px-2 mb-2">Search Results</p>
                {isSearching ? (
                  <p className="text-sm text-dark-400 px-2">Searching...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <button
                      key={result._id}
                      onClick={() => startConversation(result._id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-900/50 flex items-center justify-center border border-primary-800 shrink-0">
                        {result.avatar ? (
                          <img src={result.avatar} alt={result.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserIcon size={20} className="text-primary-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-dark-100 truncate">{result.fullName}</p>
                        <p className="text-xs text-primary-400 truncate">{result.rollNumber}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-dark-400 px-2">No students found.</p>
                )}
                <div className="my-3 border-t border-dark-800"></div>
              </div>
            )}

            {/* Conversations List */}
            {conversations.length === 0 && !searchQuery ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-dark-400">
                <MessageSquare size={40} className="mb-4 opacity-20" />
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs mt-1">Search a roll number to start chatting!</p>
              </div>
            ) : (
              !searchQuery && conversations.map(conv => {
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
        <div className="flex-1 flex flex-col bg-dark-900 relative">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-dark-800 px-6 flex items-center gap-4 bg-dark-950/30 backdrop-blur-md absolute top-0 w-full z-10">
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
              <div className="p-4 bg-dark-950/50 border-t border-dark-800 mt-auto">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-dark-900 border border-dark-700 rounded-2xl p-1.5 focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/20 transition-all shadow-inner">
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
                Select a conversation from the sidebar or search for a student's roll number to start a new chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
