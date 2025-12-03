'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Code,
  Calendar,
  MoreVertical,
  Phone,
  Video,
  Search,
  Hash,
  ChevronLeft,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  getMessages,
  sendMessage,
  getConversations,
} from '@/lib/actions/messages';
import { useParams, useRouter } from 'next/navigation';

// Code Block Component with Syntax Highlighting
const CodeBlock = ({
  code,
  language = 'text',
  onCopy,
}: {
  code: string;
  language?: string;
  onCopy?: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl overflow-hidden w-full min-w-[300px] text-left group">
      <div className="px-3 py-2 bg-[#252526] border-b border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-400 uppercase font-mono">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-500 hover:text-white cursor-pointer transition flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Study Session Invite Card
const InviteCard = ({
  title,
  date,
  location,
  status = 'pending',
  onAccept,
  onDecline,
}: {
  title: string;
  date: string;
  location?: string;
  status?: 'pending' | 'accepted' | 'declined';
  onAccept?: () => void;
  onDecline?: () => void;
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 w-72 text-left">
      <div className="flex items-center gap-2 mb-3 text-indigo-400">
        <Calendar size={16} />
        <span className="text-xs font-bold uppercase tracking-wide">
          Study Session
        </span>
      </div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400 mb-1">{date}</p>
      {location && <p className="text-xs text-gray-500 mb-4">{location}</p>}
      {status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {status === 'accepted' && (
        <div className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium text-center">
          ✓ Accepted
        </div>
      )}
      {status === 'declined' && (
        <div className="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium text-center">
          Declined
        </div>
      )}
    </div>
  );
};

export const ChatView = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const connectionId = params?.id as string;

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadConversations();
    }
  }, [session]);

  useEffect(() => {
    if (connectionId) {
      loadMessages(connectionId);
    }
  }, [connectionId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const result = await getConversations();
      if (result.success && result.data) {
        setConversations(result.data.conversations);
        if (connectionId) {
          const active = result.data.conversations.find(
            (c: any) => c.id === connectionId
          );
          setActiveConversation(active);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (connId: string) => {
    try {
      setLoading(true);
      const result = await getMessages(connId, 100);
      if (result.success && result.data) {
        setActiveConversation(result.data.connection);
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !connectionId) return;

    try {
      const formData = new FormData();
      formData.append('connectionId', connectionId);
      formData.append('content', message);
      formData.append('messageType', 'text');

      const result = await sendMessage(formData);
      if (result.success && result.data) {
        setMessages(prev => [...prev, result.data.message]);
        setMessage('');
        loadConversations(); // Refresh conversation list
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendCode = async () => {
    if (!codeInput.trim() || !connectionId) return;

    try {
      const formData = new FormData();
      formData.append('connectionId', connectionId);
      formData.append('content', codeInput);
      formData.append('messageType', 'code');
      formData.append('metadata', JSON.stringify({ language: codeLanguage }));

      const result = await sendMessage(formData);
      if (result.success && result.data) {
        setMessages(prev => [...prev, result.data.message]);
        setCodeInput('');
        setShowCodeInput(false);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send code:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!connectionId) return;

    // For now, create a simple invite message
    // In production, this would create a structured invite
    const inviteText = `📅 Study Session Invite\n\nLocation: Library Room 304\nTime: Tomorrow, 2:00 PM\n\nWould you like to join?`;

    try {
      const formData = new FormData();
      formData.append('connectionId', connectionId);
      formData.append('content', inviteText);
      formData.append('messageType', 'invite');

      const result = await sendMessage(formData);
      if (result.success && result.data) {
        setMessages(prev => [...prev, result.data.message]);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (!connectionId) {
    return (
      <div className="flex h-full bg-[#0a0a0a] text-white">
        {/* Conversation List Only */}
        <div className="w-80 border-r border-gray-800 flex flex-col bg-[#111]">
          <div className="p-5 border-b border-gray-800">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider mb-2 mt-2">
              Direct Messages
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-2">
                  Start by connecting with someone!
                </p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.otherUser;
                const initials = `${otherUser.firstName?.charAt(0) || ''}${otherUser.lastName?.charAt(0) || ''}`;
                const isActive = conv.id === connectionId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => router.push(`/chat/${conv.id}`)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                      isActive
                        ? 'bg-gray-800/50 border border-gray-700'
                        : 'hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundImage: otherUser.profileImageUrl
                            ? `url(${otherUser.profileImageUrl})`
                            : undefined,
                          backgroundSize: 'cover',
                        }}
                      >
                        {!otherUser.profileImageUrl && initials}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate text-sm">
                          {otherUser.firstName} {otherUser.lastName?.charAt(0)}.
                        </h3>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.lastMessage?.isMe ? 'You: ' : ''}
                        {conv.lastMessage?.messageType === 'code'
                          ? '📝 Code snippet'
                          : conv.lastMessage?.messageType === 'invite'
                            ? '📅 Study invite'
                            : conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Hash size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-400">
              Choose a chat from the sidebar to start messaging
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full bg-[#0a0a0a] text-white items-center justify-center">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  const otherUser = activeConversation?.otherUser;
  const matchContext = activeConversation?.matchContext;
  const initials = `${otherUser?.firstName?.charAt(0) || ''}${otherUser?.lastName?.charAt(0) || ''}`;

  return (
    <div className="flex h-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Left Sidebar: Conversation List */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-[#111] flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider mb-2 mt-2">
            Direct Messages
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = conv.otherUser;
              const otherInitials = `${other.firstName?.charAt(0) || ''}${other.lastName?.charAt(0) || ''}`;
              const isActive = conv.id === connectionId;

              return (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/chat/${conv.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    isActive
                      ? 'bg-gray-800/50 border border-gray-700'
                      : 'hover:bg-gray-800/30'
                  }`}
                >
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundImage: other.profileImageUrl
                          ? `url(${other.profileImageUrl})`
                          : undefined,
                        backgroundSize: 'cover',
                      }}
                    >
                      {!other.profileImageUrl && otherInitials}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate text-sm">
                        {other.firstName} {other.lastName?.charAt(0)}.
                      </h3>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatTime(conv.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage?.isMe ? 'You: ' : ''}
                      {conv.lastMessage?.messageType === 'code'
                        ? '📝 Code snippet'
                        : conv.lastMessage?.messageType === 'invite'
                          ? '📅 Study invite'
                          : conv.lastMessage?.content?.substring(0, 30) ||
                            'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        {/* Header with Context */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold"
              style={{
                backgroundImage: otherUser?.profileImageUrl
                  ? `url(${otherUser.profileImageUrl})`
                  : undefined,
                backgroundSize: 'cover',
              }}
            >
              {!otherUser?.profileImageUrl && initials}
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {otherUser?.firstName} {otherUser?.lastName?.charAt(0)}.
              </h2>
              {matchContext && (
                <p className="text-xs text-indigo-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Matched on{' '}
                  {matchContext.type === 'course'
                    ? matchContext.code || matchContext.name
                    : matchContext.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <Phone
              size={20}
              className="hover:text-white cursor-pointer transition"
            />
            <Video
              size={20}
              className="hover:text-white cursor-pointer transition"
            />
            <div className="w-px h-6 bg-gray-800"></div>
            <MoreVertical
              size={20}
              className="hover:text-white cursor-pointer transition"
            />
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => {
            return (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isMe && (
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 mr-3 mt-1 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundImage: msg.sender?.profileImageUrl
                        ? `url(${msg.sender.profileImageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                    }}
                  >
                    {!msg.sender?.profileImageUrl &&
                      `${msg.sender?.firstName?.charAt(0) || ''}${msg.sender?.lastName?.charAt(0) || ''}`}
                  </div>
                )}

                <div
                  className={`max-w-[70%] space-y-1 ${msg.isMe ? 'items-end flex flex-col' : ''}`}
                >
                  {/* Text Message */}
                  {msg.messageType === 'text' && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}

                  {/* Code Block */}
                  {msg.messageType === 'code' && (
                    <CodeBlock
                      code={msg.content}
                      language={msg.metadata?.language || 'text'}
                    />
                  )}

                  {/* Invite Card */}
                  {msg.messageType === 'invite' && (
                    <InviteCard
                      title="Study Session"
                      date={
                        msg.content.includes('Tomorrow')
                          ? 'Tomorrow, 2:00 PM'
                          : 'TBA'
                      }
                      location={
                        msg.content.includes('Library')
                          ? 'Library Room 304'
                          : undefined
                      }
                      status="pending"
                      onAccept={() => {
                        // Handle accept
                        console.log('Accept invite');
                      }}
                      onDecline={() => {
                        // Handle decline
                        console.log('Decline invite');
                      }}
                    />
                  )}

                  <span className="text-[10px] text-gray-600 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Code Input Modal */}
        {showCodeInput && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Insert Code Snippet</h3>
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeInput('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <select
                value={codeLanguage}
                onChange={e => setCodeLanguage(e.target.value)}
                className="w-full mb-3 px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="text">Plain Text</option>
              </select>
              <textarea
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-64 p-4 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCodeInput('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCode}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Send Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-[#0a0a0a] border-t border-gray-800">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-2 flex items-end gap-2">
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition">
              <Paperclip size={20} />
            </button>
            <textarea
              placeholder="Type a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-transparent text-white text-sm p-2 focus:outline-none resize-none max-h-32"
              rows={1}
            />

            {/* Special Toolbar */}
            <div className="flex items-center gap-1 pb-1">
              <button
                onClick={() => setShowCodeInput(true)}
                className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition"
                title="Insert Code"
              >
                <Code size={18} />
              </button>
              <button
                onClick={handleSendInvite}
                className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition"
                title="Schedule Session"
              >
                <Calendar size={18} />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Details Panel (Collapsible) */}
      {showDetails && otherUser && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setShowDetails(false)}
          />
          <div className="hidden md:flex w-80 border-l border-gray-800 bg-[#111] flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="mb-6">
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold mb-4 mx-auto"
                style={{
                  backgroundImage: otherUser.profileImageUrl
                    ? `url(${otherUser.profileImageUrl})`
                    : undefined,
                  backgroundSize: 'cover',
                }}
              >
                {!otherUser.profileImageUrl && initials}
              </div>
              <h4 className="text-center font-bold text-white mb-1">
                {otherUser.firstName} {otherUser.lastName}
              </h4>
              {matchContext && (
                <p className="text-center text-sm text-gray-400">
                  {matchContext.type === 'course'
                    ? matchContext.code
                    : matchContext.name}
                </p>
              )}
            </div>

            {/* Common Interests */}
            {matchContext && (
              <div className="mb-6">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Common Interests
                </h5>
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-white">
                      {matchContext.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
