import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAIChat } from '../../hooks/useAIChat';
import { useAuth } from '../../contexts/AuthContext';
import {
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Bot,
  User,
  Sparkles,
  Clock,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Zap,
  BookOpen,
  Code2,
  GraduationCap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ─── Lightweight Markdown Renderer ───
function MarkdownContent({ content }) {
  const renderMarkdown = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    // Split by code blocks first
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(remaining)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>{renderInlineMarkdown(remaining.slice(lastIndex, match.index))}</span>
        );
      }

      // Code block
      const language = match[1] || 'code';
      const code = match[2].trim();
      parts.push(
        <div key={key++} className="my-4 rounded-xl overflow-hidden border border-dark-700/50 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700/50">
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-[10px] font-bold text-dark-500 hover:text-primary-400 uppercase tracking-widest transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 bg-dark-950 overflow-x-auto text-sm leading-relaxed">
            <code className="text-dark-200 font-mono">{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last code block
    if (lastIndex < remaining.length) {
      parts.push(
        <span key={key++}>{renderInlineMarkdown(remaining.slice(lastIndex))}</span>
      );
    }

    return parts.length > 0 ? parts : renderInlineMarkdown(text);
  };

  const renderInlineMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h4 key={i} className="text-dark-100 font-bold text-base mt-4 mb-2">{processInline(line.slice(4))}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-dark-100 font-bold text-lg mt-4 mb-2">{processInline(line.slice(3))}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="text-dark-100 font-bold text-xl mt-4 mb-2">{processInline(line.slice(2))}</h2>;

      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-primary-500 mt-1.5 text-xs">●</span>
            <span>{processInline(line.slice(2))}</span>
          </div>
        );
      }

      // Numbered lists
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-2 my-1">
            <span className="text-primary-400 font-bold text-xs mt-0.5 min-w-[1.2em]">{numMatch[1]}.</span>
            <span>{processInline(line.slice(numMatch[0].length))}</span>
          </div>
        );
      }

      // Empty line → spacer
      if (line.trim() === '') return <div key={i} className="h-2" />;

      // Regular paragraph
      return <p key={i} className="my-1">{processInline(line)}</p>;
    });
  };

  const processInline = (text) => {
    // Process inline code, bold, italic
    const parts = [];
    let remaining = text;
    let key = 0;

    // Inline code: `code`
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIdx = 0;
    let m;

    while ((m = inlineCodeRegex.exec(remaining)) !== null) {
      if (m.index > lastIdx) {
        parts.push(<span key={key++}>{processBoldItalic(remaining.slice(lastIdx, m.index))}</span>);
      }
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 bg-dark-800 border border-dark-700/50 rounded-md text-primary-300 text-[13px] font-mono">
          {m[1]}
        </code>
      );
      lastIdx = m.index + m[0].length;
    }

    if (lastIdx < remaining.length) {
      parts.push(<span key={key++}>{processBoldItalic(remaining.slice(lastIdx))}</span>);
    }

    return parts.length > 0 ? parts : processBoldItalic(text);
  };

  const processBoldItalic = (text) => {
    // **bold**
    return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-dark-100 font-bold">{part}</strong> : part
    );
  };

  return <div className="text-[15px] leading-relaxed">{renderMarkdown(content)}</div>;
}


// ─── Main Page ───
export default function AIDoubtSolverPage() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    loading,
    sending,
    fetchConversations,
    loadConversation,
    sendMessage,
    deleteConversation,
    startNewChat,
  } = useAIChat();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const currentInput = trimmed;
    setInput('');

    try {
      await sendMessage(currentInput, activeConversation?._id || null);
    } catch {
      // Error is handled in the hook
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv) => {
    loadConversation(conv._id);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleNewChat = () => {
    startNewChat();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  // ─── Quick Action Suggestions ───
  const suggestions = [
    { icon: BookOpen, text: 'Explain DBMS normalization', color: 'text-blue-400' },
    { icon: Code2, text: 'Help me debug this code', color: 'text-green-400' },
    { icon: GraduationCap, text: 'Give DSA roadmap', color: 'text-purple-400' },
    { icon: Zap, text: 'Placement preparation tips', color: 'text-amber-400' },
  ];

  return (
    <DashboardLayout hideWidgets>
      <div className="flex h-[calc(100vh-7rem)] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 overflow-hidden">

        {/* ── Conversation Sidebar ── */}
        <div className={`${sidebarOpen ? 'w-80 border-r border-dark-800' : 'w-0'} transition-all duration-300 bg-dark-900/50 backdrop-blur-xl flex-shrink-0 flex flex-col overflow-hidden`}>

          {/* Sidebar Header */}
          <div className="p-4 border-b border-dark-800/50 flex-shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 text-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
              New Doubt
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={32} className="mx-auto text-dark-600 mb-3" />
                <p className="text-dark-500 text-xs font-bold uppercase tracking-widest">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center justify-between gap-2 ${
                    activeConversation?._id === conv._id
                      ? 'bg-primary-500/10 border border-primary-500/20 text-primary-300'
                      : 'hover:bg-dark-800/80 text-dark-300 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{conv.title}</p>
                    <p className="text-[10px] text-dark-500 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Chat Header */}
          <div className="h-14 border-b border-dark-800/50 bg-dark-900/30 backdrop-blur-xl flex items-center px-4 gap-3 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <MessageSquare size={20} />}
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-dark-100">
                  {activeConversation ? activeConversation.title : 'AI Doubt Solver'}
                </h2>
                <p className="text-[10px] text-dark-500 font-medium">
                  {sending ? 'Thinking...' : 'Powered by UniBot'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {messages.length === 0 && !activeConversation ? (
              /* ── Empty State / Welcome ── */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-3xl flex items-center justify-center mb-6 border border-primary-500/20 shadow-xl shadow-primary-500/5">
                  <Bot size={40} className="text-primary-400" />
                </div>
                <h2 className="text-2xl font-black text-dark-100 mb-2">
                  Hey{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋
                </h2>
                <p className="text-dark-400 max-w-md mb-10 font-medium leading-relaxed">
                  I'm <span className="text-primary-400 font-bold">UniBot</span>, your AI academic assistant.
                  Ask me any doubt — from DBMS to DSA, coding bugs to placement prep.
                </p>

                {/* Quick Action Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                      className="auth-card p-4 text-left hover:border-primary-500/30 transition-all duration-200 group cursor-pointer border-dark-800"
                    >
                      <s.icon size={18} className={`${s.color} mb-2 group-hover:scale-110 transition-transform`} />
                      <p className="text-dark-200 text-sm font-semibold group-hover:text-primary-300 transition-colors">
                        {s.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Chat Messages ── */
              <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mt-1 shadow-md shadow-primary-500/20">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] lg:max-w-[75%] ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-none px-5 py-3 shadow-lg shadow-primary-600/10'
                        : 'bg-dark-800/60 text-dark-200 rounded-2xl rounded-bl-none px-5 py-4 border border-dark-700/30 shadow-lg shadow-black/10'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <MarkdownContent content={msg.content} />
                      ) : (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-dark-800 rounded-xl flex items-center justify-center mt-1 border border-dark-700/50">
                        <User size={16} className="text-dark-400" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking indicator */}
                {sending && (
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-dark-800/60 rounded-2xl rounded-bl-none px-5 py-4 border border-dark-700/30">
                      <div className="flex items-center gap-3">
                        <Loader2 size={16} className="text-primary-400 animate-spin" />
                        <span className="text-dark-400 text-sm font-medium animate-pulse">UniBot is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Area ── */}
          <div className="border-t border-dark-800/50 p-4 bg-dark-900/30 backdrop-blur-xl flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 bg-dark-800/40 p-2 rounded-2xl border border-dark-700/30 focus-within:border-primary-500/40 transition-all shadow-inner">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your doubt..."
                  rows={1}
                  className="flex-1 bg-transparent border-none text-dark-100 px-4 py-2.5 focus:ring-0 text-sm font-medium resize-none hide-scrollbar placeholder-dark-500"
                  style={{ maxHeight: '160px' }}
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="self-end p-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-500 disabled:opacity-40 disabled:bg-dark-700 disabled:shadow-none transition-all"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={2.5} />}
                </button>
              </div>
              <p className="text-[10px] text-dark-600 text-center mt-2 font-medium">
                UniBot may make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
