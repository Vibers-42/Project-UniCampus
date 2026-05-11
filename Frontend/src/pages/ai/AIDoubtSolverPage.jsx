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
  Zap,
  BookOpen,
  Code2,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ─── Markdown Renderer ─────────────────────────────────────────────────────────
function MarkdownContent({ content }) {
  const renderMarkdown = (text) => {
    const parts = [];
    let remaining = text;
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{renderInlineMarkdown(remaining.slice(lastIndex, match.index))}</span>
        );
      }
      const language = match[1] || 'code';
      const code = match[2].trim();
      parts.push(
        <div key={`code-${lastIndex}`} className="my-3 rounded-lg overflow-hidden border border-dark-700/60">
          <div className="flex items-center justify-between px-3 py-1.5 bg-dark-800/80 border-b border-dark-700/50">
            <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{language}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-[10px] font-semibold text-dark-500 hover:text-primary-400 uppercase tracking-widest transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-3 bg-dark-950/80 overflow-x-auto text-[13px] leading-relaxed">
            <code className="text-dark-200 font-mono">{code}</code>
          </pre>
        </div>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < remaining.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{renderInlineMarkdown(remaining.slice(lastIndex))}</span>
      );
    }

    return parts.length > 0 ? parts : renderInlineMarkdown(text);
  };

  const renderInlineMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} className="text-dark-100 font-bold text-sm mt-3 mb-1">{processInline(line.slice(4))}</h4>;
      if (line.startsWith('## ')) return <h3 key={i} className="text-dark-100 font-bold text-base mt-3 mb-1">{processInline(line.slice(3))}</h3>;
      if (line.startsWith('# ')) return <h2 key={i} className="text-dark-100 font-bold text-lg mt-3 mb-1">{processInline(line.slice(2))}</h2>;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-primary-500 mt-1.5 text-[10px] flex-shrink-0">●</span>
            <span>{processInline(line.slice(2))}</span>
          </div>
        );
      }
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-primary-400 font-semibold text-xs mt-0.5 min-w-[1.2em]">{numMatch[1]}.</span>
            <span>{processInline(line.slice(numMatch[0].length))}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      return <p key={i} className="my-0.5 leading-relaxed">{processInline(line)}</p>;
    });
  };

  const processInline = (text) => {
    const parts = [];
    let remaining = text;
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIdx = 0;
    let m;
    while ((m = inlineCodeRegex.exec(remaining)) !== null) {
      if (m.index > lastIdx) {
        parts.push(<span key={`t-${lastIdx}`}>{processBoldItalic(remaining.slice(lastIdx, m.index))}</span>);
      }
      parts.push(
        <code key={`c-${lastIdx}`} className="px-1 py-0.5 bg-dark-700/80 border border-dark-600/50 rounded text-primary-300 text-[12px] font-mono">
          {m[1]}
        </code>
      );
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < remaining.length) {
      parts.push(<span key={`t-${lastIdx}`}>{processBoldItalic(remaining.slice(lastIdx))}</span>);
    }
    return parts.length > 0 ? parts : processBoldItalic(text);
  };

  const processBoldItalic = (text) => {
    return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-dark-100 font-semibold">{part}</strong> : part
    );
  };

  return <div className="text-sm leading-relaxed text-dark-200">{renderMarkdown(content)}</div>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIDoubtSolverPage() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    sending,
    error,
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

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const currentInput = trimmed;
    setInput('');
    try {
      await sendMessage(currentInput, activeConversation?._id || null);
    } catch (err) {
      console.error('[AI Solver] sendMessage error:', err);
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
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleNewChat = () => {
    startNewChat();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) deleteConversation(id);
  };

  const suggestions = [
    { icon: BookOpen,     text: 'Explain DBMS normalization',  color: 'text-blue-400',   bg: 'bg-blue-500/8' },
    { icon: Code2,        text: 'Help me debug this code',     color: 'text-emerald-400', bg: 'bg-emerald-500/8' },
    { icon: GraduationCap,text: 'Give me a DSA roadmap',       color: 'text-violet-400', bg: 'bg-violet-500/8' },
    { icon: Zap,          text: 'Placement preparation tips',  color: 'text-amber-400',  bg: 'bg-amber-500/8' },
  ];

  const firstName = user?.fullName?.split(' ')[0] || '';

  return (
    <DashboardLayout hideWidgets fullWidth>
      {/* Naturally fills the exact available space in the dashboard without hacks */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-dark-950">

        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <div
          className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 flex flex-col
            transition-all duration-200 ease-in-out overflow-hidden
            border-r border-dark-800/60 bg-dark-900/70`}
        >
          {/* Sidebar top */}
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2
                bg-primary-600 hover:bg-primary-500 text-white text-[13px] font-semibold
                rounded-lg transition-colors shadow-md shadow-primary-600/20"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Chat
            </button>
          </div>

          {/* Label */}
          <div className="px-3 py-1.5">
            <p className="text-[10px] font-semibold text-dark-600 uppercase tracking-widest">Recent</p>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-3 space-y-0.5">
            {!Array.isArray(conversations) || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <MessageSquare size={22} className="text-dark-700 mb-2" />
                <p className="text-dark-600 text-xs">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  type="button"
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-150
                    group flex items-start justify-between gap-1.5
                    ${activeConversation?._id === conv._id
                      ? 'bg-primary-500/10 text-primary-300'
                      : 'hover:bg-dark-800/60 text-dark-400 hover:text-dark-200'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate leading-snug">{conv.title}</p>
                    <p className="text-[11px] text-dark-600 mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {(() => { try { return formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true }); } catch { return ''; } })()}
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeleteConversation(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 mt-0.5 p-1 rounded-md
                      hover:bg-red-500/15 text-dark-600 hover:text-red-400
                      transition-all cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main chat panel ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-dark-950/30">

          {/* Chat header */}
          <div className="h-12 flex-shrink-0 border-b border-dark-800/50
            bg-dark-900/50 backdrop-blur-sm
            flex items-center px-3 gap-2.5">

            {/* Sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-500
                hover:text-dark-300 transition-colors flex-shrink-0"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen
                ? <PanelLeftClose size={17} />
                : <PanelLeftOpen size={17} />}
            </button>

            <div className="w-px h-4 bg-dark-800 flex-shrink-0" />

            {/* Bot icon + title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600
                rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/30">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-dark-100 truncate leading-none">
                  {activeConversation ? activeConversation.title : 'AI Doubt Solver'}
                </p>
                <p className="text-[10px] text-dark-600 leading-none mt-0.5">
                  {sending ? 'Thinking…' : 'Powered by UniBot · Llama 3.3'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages / empty state */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {messages.length === 0 && !activeConversation ? (

              /* ── Empty / Welcome state ─────────────────────────── */
              <div className="h-full flex flex-col items-center px-6">
                <div className="flex-[2]" />
                <div className="w-full max-w-lg flex flex-col items-center text-center">

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-700/10
                    rounded-[1.25rem] flex items-center justify-center mb-5
                    border border-primary-500/15 shadow-xl shadow-primary-500/10">
                    <Bot size={32} className="text-primary-400" />
                  </div>

                  {/* Greeting */}
                  <h2 className="text-2xl font-bold text-dark-100 mb-2 tracking-tight">
                    {firstName ? `Hey, ${firstName}! 👋` : 'Hey there! 👋'}
                  </h2>
                  <p className="text-dark-400 text-[15px] leading-relaxed mb-8 max-w-sm">
                    I&apos;m <span className="text-primary-400 font-semibold">UniBot</span> &mdash; ask me
                    about DSA, DBMS, debugging, or placement prep.
                  </p>

                  {/* Suggestion grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {suggestions.map((s, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                        className={`${s.bg} text-left p-4 rounded-2xl border border-dark-700/40
                          hover:border-primary-500/40 hover:bg-primary-500/10 hover:-translate-y-0.5
                          transition-all duration-200 group`}
                      >
                        <s.icon size={18} className={`${s.color} mb-2`} />
                        <p className="text-dark-300 text-[13px] font-medium leading-snug
                          group-hover:text-dark-100 transition-colors">
                          {s.text}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Error banner on empty state */}
                  {error && !sending && (
                    <div className="mt-5 w-full px-4 py-3 rounded-xl bg-red-500/10
                      border border-red-500/20 text-red-400 text-[13px] font-medium text-left">
                      ⚠ {error}
                    </div>
                  )}
                </div>
                <div className="flex-[3]" />
              </div>

            ) : (

              /* ── Chat messages ──────────────────────────────────── */
              <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot avatar */}
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-7 h-7 mt-0.5
                        bg-gradient-to-br from-primary-500 to-primary-600
                        rounded-lg flex items-center justify-center
                        shadow-sm shadow-primary-500/20">
                        <Bot size={14} className="text-white" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`max-w-[80%] lg:max-w-[72%] ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md shadow-primary-600/15'
                        : 'bg-dark-800/50 rounded-2xl rounded-bl-sm px-4 py-3 border border-dark-700/30 shadow-sm'
                    }`}>
                      {msg.role === 'assistant'
                        ? <MarkdownContent content={msg.content} />
                        : <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                      }
                    </div>

                    {/* User avatar */}
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-7 h-7 mt-0.5
                        bg-dark-800 rounded-lg flex items-center justify-center
                        border border-dark-700/50">
                        <User size={13} className="text-dark-400" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking indicator */}
                {sending && (
                  <div className="flex gap-2.5 items-start">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600
                      rounded-lg flex items-center justify-center shadow-sm shadow-primary-500/20">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-dark-800/50 rounded-2xl rounded-bl-sm px-4 py-2.5
                      border border-dark-700/30">
                      <div className="flex items-center gap-2">
                        <Loader2 size={13} className="text-primary-400 animate-spin" />
                        <span className="text-dark-500 text-xs font-medium">UniBot is thinking…</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error bubble in chat */}
                {error && !sending && (
                  <div className="flex gap-2.5 items-start">
                    <div className="flex-shrink-0 w-7 h-7 bg-red-500/15 rounded-lg
                      flex items-center justify-center border border-red-500/20">
                      <Bot size={14} className="text-red-400" />
                    </div>
                    <div className="bg-red-500/8 rounded-2xl rounded-bl-sm px-4 py-2.5
                      border border-red-500/20 max-w-[72%]">
                      <p className="text-red-400 text-xs font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input area ───────────────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-dark-800/50 bg-dark-900/50 px-4 py-2.5">
            <div className="max-w-2xl mx-auto">
              {/* Error banner when empty state */}
              {error && !sending && messages.length === 0 && !activeConversation && (
                <div className="mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20
                  text-red-400 text-xs font-medium">
                  ⚠ {error}
                </div>
              )}

              {/* Input box */}
              <div className="flex gap-2 items-end bg-dark-800/50 rounded-xl
                border border-dark-700/40 focus-within:border-primary-500/40
                transition-colors px-3 py-2 shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your doubt…"
                  rows={1}
                  disabled={sending}
                  className="flex-1 bg-transparent border-none text-dark-100 text-sm
                    font-medium resize-none focus:ring-0 hide-scrollbar
                    placeholder-dark-600 py-0.5 leading-relaxed"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="flex-shrink-0 p-2 bg-primary-600 text-white rounded-lg
                    hover:bg-primary-500 disabled:opacity-35 disabled:bg-dark-700
                    transition-all shadow-md shadow-primary-600/20 mb-0.5"
                >
                  {sending
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Send size={15} strokeWidth={2.5} />}
                </button>
              </div>

              {/* Footer note */}
              <p className="text-[10px] text-dark-700 text-center mt-1.5 font-medium">
                UniBot may make mistakes — verify important information.
              </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
