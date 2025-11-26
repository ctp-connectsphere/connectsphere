'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle, User, MoreVertical } from 'lucide-react';
import { GlowingButton } from '@/components/nexus';
import { getUserConnections } from '@/lib/actions/matches';
import Link from 'next/link';

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      loadConnections();
    }
  }, [session]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const result = await getUserConnections();
      if (result.success && result.data) {
        setConnections(result.data.connections);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Format last message time
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="w-full h-screen bg-[#050508] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[80px] animate-pulse-glow animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full h-full overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              My Connections
            </h1>
            <p className="text-gray-400">
              Your study partners and active conversations
            </p>
          </div>

          {/* Connections List */}
          <div className="space-y-4">
            {connections.map(connection => (
              <div
                key={connection.id}
                className="glass-panel rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div
                      className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white/10"
                      style={{
                        backgroundImage: connection.profileImageUrl
                          ? `url(${connection.profileImageUrl})`
                          : `url(https://i.pravatar.cc/150?img=${connection.userId?.slice(0, 8) || '1'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    ></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#050508]"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {connection.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">
                      {connection.matchContext}
                    </p>
                    {connection.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {connection.lastMessage} •{' '}
                        {formatTime(connection.lastMessageTime)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/chat/${connection.userId}`}>
                      <GlowingButton
                        variant="outline"
                        className="w-10 h-10 p-0"
                      >
                        <MessageCircle size={18} />
                      </GlowingButton>
                    </Link>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {connections.length === 0 && (
            <div className="glass-panel rounded-3xl p-12 text-center">
              <User size={64} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white mb-2">
                No connections yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start matching with study partners to build your network
              </p>
              <GlowingButton href="/matches">Find Study Partners</GlowingButton>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
