'use client';

import {
  Calendar,
  Clock,
  Zap,
  Users,
  BookOpen,
  Target,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { GlowingButton } from '../ui/glowing-button';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  getDashboardStats,
  getRecommendedPeers,
  getActiveGroups,
  getUpcomingSessions,
} from '@/lib/actions/dashboard';
import { getUserTopics } from '@/lib/actions/topics';
import Link from 'next/link';

interface DashboardViewProps {
  userName?: string;
}

export const DashboardView = ({ userName = 'User' }: DashboardViewProps) => {
  const { data: session } = useSession();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    courses: 0,
    topics: 0,
    connections: 0,
    matches: 0,
  });
  const [recommendedPeers, setRecommendedPeers] = useState<any[]>([]);
  const [activeGroups, setActiveGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [_upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [_selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      // Extract first name from user name
      const name = session.user.name || userName;
      const firstName = name.split(' ')[0] || name || 'User';
      setUserFirstName(firstName);
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats
      const statsResult = await getDashboardStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      // Load recommended peers
      const peersResult = await getRecommendedPeers(3);
      if (peersResult.success && peersResult.data) {
        setRecommendedPeers(peersResult.data.peers);
      }

      // Load active groups/connections
      const groupsResult = await getActiveGroups(4);
      if (groupsResult.success && groupsResult.data) {
        setActiveGroups(groupsResult.data.groups);
      }

      // Load upcoming study sessions
      const sessionsResult = await getUpcomingSessions(1);
      if (
        sessionsResult.success &&
        sessionsResult.data &&
        sessionsResult.data.sessions.length > 0
      ) {
        const nextSession = sessionsResult.data.sessions[0];
        setUpcomingSession({
          id: nextSession.id,
          title: nextSession.title,
          course: nextSession.course?.name,
          courseCode: nextSession.course?.code,
          startTime: nextSession.startTime,
          timeText: nextSession.timeText,
          location: nextSession.location,
          organizer: nextSession.organizer,
        });
        setUpcomingSessions(sessionsResult.data.sessions);
      } else {
        // Fallback: Load user topics for upcoming session suggestion
        const topicsResult = await getUserTopics();
        if (
          topicsResult.success &&
          topicsResult.data &&
          topicsResult.data.userTopics.length > 0
        ) {
          const firstTopic = topicsResult.data.userTopics[0].topic;
          setSelectedTopicId(firstTopic.id);
          setUpcomingSession({
            topic: firstTopic.name,
            category: firstTopic.category,
            isSuggestion: true,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 h-full overflow-y-auto pb-32 relative flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto pb-32 relative bg-[#0a0a0a]">
      {/* Subtle background effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.05), transparent 40%)`,
        }}
      />

      {/* Header Section - Warm Greeting with CTA */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            {getGreeting()},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              {userFirstName}
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            {stats.matches > 0
              ? `You have ${stats.matches} potential matches this week.`
              : 'Start by adding topics or courses to find study partners.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/matches">
            <GlowingButton className="flex items-center gap-2">
              <Plus size={18} />
              Find Study Partner
            </GlowingButton>
          </Link>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10">
        {/* Main Feature: Next Up Session (2 columns) */}
        <div className="md:col-span-2 bg-[#121212] border border-gray-800/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-gray-700/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
            <Calendar size={120} className="text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    Next Up
                  </div>
                  {upcomingSession ? (
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                      {upcomingSession.topic}
                    </h2>
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                      No upcoming sessions
                    </h2>
                  )}
                </div>
              </div>
            </div>

            {upcomingSession ? (
              <>
                {upcomingSession.isSuggestion ? (
                  <>
                    <p className="text-gray-400 mb-6 text-lg">
                      {upcomingSession.topic} • {upcomingSession.category}
                    </p>
                    <Link href="/matches">
                      <GlowingButton
                        variant="secondary"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        Find Study Partner
                        <ArrowRight size={18} className="ml-2" />
                      </GlowingButton>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock size={16} />
                        <span>{upcomingSession.timeText}</span>
                        {upcomingSession.location && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{upcomingSession.location}</span>
                          </>
                        )}
                      </div>
                      {upcomingSession.courseCode && (
                        <div className="flex items-center gap-2">
                          <Badge color="indigo">
                            {upcomingSession.courseCode}
                          </Badge>
                          <span className="text-gray-400 text-sm">
                            {upcomingSession.course}
                          </span>
                        </div>
                      )}
                      {upcomingSession.organizer && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>
                            Organized by {upcomingSession.organizer.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/chat/${upcomingSession.id}`}>
                      <GlowingButton
                        variant="secondary"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        View Session
                        <ArrowRight size={18} className="ml-2" />
                      </GlowingButton>
                    </Link>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-lg mb-6">
                  Schedule a study session to get started.
                </p>
                <Link href="/matches">
                  <GlowingButton
                    variant="secondary"
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Plus size={18} className="mr-2" />
                    Schedule Study Session
                  </GlowingButton>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card: Weekly Focus / Topics Progress (1 column) */}
        <div className="bg-[#121212] border border-gray-800/50 rounded-3xl p-6 flex flex-col justify-between hover:border-gray-700/50 transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-200 text-lg">Weekly Focus</h3>
            </div>
            <Zap size={18} className="text-yellow-400" />
          </div>

          {/* Progress bars instead of big number */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Topics Mastered</span>
                <span className="font-semibold text-white">{stats.topics}</span>
              </div>
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min((stats.topics / 10) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Active Courses</span>
                <span className="font-semibold text-white">
                  {stats.courses}
                </span>
              </div>
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min((stats.courses / 5) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Connections</span>
                <span className="font-semibold text-white">
                  {stats.connections}
                </span>
              </div>
              <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                  style={{
                    width: `${Math.min((stats.connections / 10) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Peers (1 column, spans 2 rows) */}
        <div className="md:row-span-2 bg-[#121212] border border-gray-800/50 rounded-3xl p-6 hover:border-gray-700/50 transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-200">Quick Match</h3>
            </div>
            <Link
              href="/matches"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View all
            </Link>
          </div>

          {recommendedPeers.length > 0 ? (
            <div className="space-y-4">
              {recommendedPeers.map((peer, i) => (
                <Link key={peer.id} href="/matches">
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-xl transition cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full bg-gray-700 shadow-lg group-hover:scale-110 transition-transform"
                        style={{
                          backgroundImage: peer.profileImageUrl
                            ? `url(${peer.profileImageUrl})`
                            : `url(https://i.pravatar.cc/150?img=${i + 20})`,
                          backgroundSize: 'cover',
                        }}
                      ></div>
                      {/* Online status indicator */}
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#121212]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {peer.firstName} {peer.lastName?.charAt(0)}.
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {peer.matchScore}% Match •{' '}
                        {peer.commonTopics[0] || 'Topic'}
                      </p>
                    </div>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm mb-4">
                No recommendations yet
              </p>
              <Link href="/topics">
                <GlowingButton variant="secondary" className="text-sm">
                  Add Topics
                </GlowingButton>
              </Link>
            </div>
          )}
        </div>

        {/* Discover Groups / Empty State (2 columns) */}
        {activeGroups.length > 0 ? (
          <div className="md:col-span-2 bg-[#121212] border border-gray-800/50 rounded-3xl p-6 hover:border-gray-700/50 transition-all">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <BookOpen size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-200">Active Groups</h3>
              </div>
              <Link
                href="/groups"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGroups.slice(0, 2).map(group => (
                <Link key={group.id} href={`/chat/${group.id}`}>
                  <div className="bg-gray-800/30 p-5 rounded-2xl border border-gray-700/50 hover:border-indigo-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <Badge color={group.categoryBadge as any}>
                        {group.categoryLabel || group.category}
                      </Badge>
                      <span className="text-xs text-gray-500 font-semibold">
                        {group.memberCount}/2
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors mb-2">
                      {group.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Last active: {group.lastActive}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-gradient-to-br from-[#121212] to-[#1a1a1a] border border-gray-800/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between hover:border-gray-700/50 transition-all">
            <div className="flex-1">
              <h3 className="text-xl font-black text-white mb-2">
                No active groups yet?
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Join a study squad to boost your productivity and connect with
                peers.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300 font-medium border border-gray-700/50">
                  #LeetCode
                </span>
                <span className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300 font-medium border border-gray-700/50">
                  #WebDev
                </span>
                <span className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300 font-medium border border-gray-700/50">
                  #Python
                </span>
                <span className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-xs text-gray-300 font-medium border border-gray-700/50">
                  #DataScience
                </span>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6">
              <Link href="/groups">
                <GlowingButton
                  variant="secondary"
                  className="bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                >
                  Browse Groups
                  <ArrowRight size={18} className="ml-2" />
                </GlowingButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
