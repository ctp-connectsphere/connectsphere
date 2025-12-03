'use client';

import { getGroupById } from '@/lib/actions/groups';
import { getConversationMessages, sendMessage } from '@/lib/actions/messages';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Users,
  Video,
  MessageSquare,
  ExternalLink,
  Send,
  Calendar,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && id) {
      loadGroup();
    }
  }, [session, id]);

  useEffect(() => {
    if (group?.conversationId) {
      loadMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [group?.conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const result = await getGroupById(id as string);
      if (result.success && result.data) {
        setGroup(result.data);
      } else {
        alert(result.error || 'Failed to load group');
        router.push('/groups');
      }
    } catch (error) {
      console.error('Failed to load group:', error);
      alert('Failed to load group');
      router.push('/groups');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!group?.conversationId) return;
    try {
      const result = await getConversationMessages(group.conversationId);
      if (result.success && result.data) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !group?.conversationId || sending) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('conversationId', group.conversationId);
      formData.append('content', messageInput);
      formData.append('messageType', 'text');

      const result = await sendMessage(formData);
      if (result.success && result.data) {
        setMessages(prev => [...prev, result.data.message]);
        setMessageInput('');
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
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

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !group) {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/groups"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            Back to Groups
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {group.course && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                    {group.course.code}
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {group.memberCount}/{group.maxMembers} members
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                {group.name}
              </h1>
              {group.vibe && (
                <p className="text-sm text-gray-400 mb-4">{group.vibe}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Group Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Description */}
            {group.description && (
              <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-400" />
                  Description
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {group.description}
                </p>
              </div>
            )}

            {/* Announcement */}
            {group.announcement && (
              <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-800/50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-400" />
                  Announcement
                </h2>
                <p className="text-gray-200 whitespace-pre-wrap">
                  {group.announcement}
                </p>
              </div>
            )}

            {/* Zoom Link */}
            {group.zoomLink && (
              <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Video size={20} className="text-blue-400" />
                  Zoom Meeting
                </h2>
                <a
                  href={group.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition font-medium"
                >
                  Join Zoom Meeting
                  <ExternalLink size={16} />
                </a>
              </div>
            )}

            {/* Members */}
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-indigo-400" />
                Members ({group.memberCount})
              </h2>
              <div className="space-y-3">
                {group.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition"
                  >
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundImage: member.profileImageUrl
                          ? `url(${member.profileImageUrl})`
                          : undefined,
                        backgroundSize: 'cover',
                      }}
                    >
                      {!member.profileImageUrl &&
                        `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] border border-gray-800 rounded-2xl flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <MessageSquare size={20} className="text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Group Chat</h2>
                {!group.isMember && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Join group to chat
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-2">
                      {group.isMember
                        ? 'Start the conversation!'
                        : 'Join the group to start chatting'}
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.isMe ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{
                          backgroundImage: msg.sender.profileImageUrl
                            ? `url(${msg.sender.profileImageUrl})`
                            : undefined,
                          backgroundSize: 'cover',
                        }}
                      >
                        {!msg.sender.profileImageUrl &&
                          `${msg.sender.firstName?.charAt(0) || ''}${msg.sender.lastName?.charAt(0) || ''}`}
                      </div>
                      <div
                        className={`max-w-[70%] ${
                          msg.isMe ? 'items-end' : 'items-start'
                        } flex flex-col`}
                      >
                        {!msg.isMe && (
                          <p className="text-xs text-gray-400 mb-1 px-2">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            msg.isMe
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {group.isMember && (
                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send size={18} />
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
