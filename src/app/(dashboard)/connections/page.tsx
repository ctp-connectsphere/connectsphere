'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle, User, MoreVertical } from 'lucide-react';
import { GlowingButton } from '@/components/ui/glowing-button';
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
    <div className="w-full min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-indigo-500/30 pb-20 md:pb-0">
      {/* Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[80px] animate-pulse-glow animation-delay-4000"></div>
      </div>

      {/* Main Content - Mobile-first */}
      <main className="relative z-10 w-full min-h-screen overflow-y-auto p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header - Mobile-first */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              My Connections
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Your study partners and active conversations
            </p>
          </div>

          {/* Connections List - Mobile-first */}
          <div className="space-y-3 sm:space-y-4">
            {connections.map(connection => (
              <div
                key={connection.id}
                className="glass-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700 border-2 border-white/10"
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {connection.name}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1 truncate">
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/chat/${connection.userId}`}>
                      <GlowingButton
                        variant="outline"
                        className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                      >
                        <MessageCircle
                          size={16}
                          className="sm:w-[18px] sm:h-[18px]"
                        />
                      </GlowingButton>
                    </Link>
                    <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      <MoreVertical
                        size={16}
                        className="sm:w-[18px] sm:h-[18px]"
                      />
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
