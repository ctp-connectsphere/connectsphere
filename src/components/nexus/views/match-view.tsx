'use client';

import { findMatches, sendConnectionRequest } from '@/lib/actions/matches';
import { getUserTopics } from '@/lib/actions/topics';
import {
  Brain,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  Star,
  X,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { GlowingButton } from '../ui/glowing-button';

export const MatchView = () => {
  const { data: session } = useSession();
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [userTopics, setUserTopics] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (session?.user?.id) {
      loadUserTopics();
    }
  }, [session]);

  useEffect(() => {
    if (selectedTopicId) {
      loadTopicMatches();
    }
  }, [selectedTopicId]);

  const loadUserTopics = async () => {
    try {
      const result = await getUserTopics();
      if (result.success && result.data) {
        const topics = result.data.userTopics;
        setUserTopics(topics);
        if (topics.length > 0 && !selectedTopicId) {
          setSelectedTopicId(topics[0].topicId);
        }
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const loadTopicMatches = async () => {
    if (!selectedTopicId) return;

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('topicId', selectedTopicId);
      formData.append('limit', '10');

      const result = await findMatches(formData);
      if (result.success && result.matches) {
        // Type assertion: matches from $queryRaw is always an array
        const matchesArray = (result.matches as any[]) || [];
        const limitedMatches = matchesArray.slice(0, 10);
        setMatches(limitedMatches);
        setCurrentMatch(0);
      } else {
        setError(result.message || 'Failed to load matches');
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentMatch(prev => (prev + 1) % matches.length);
  };

  const handlePrevious = () => {
    setCurrentMatch(prev => (prev - 1 + matches.length) % matches.length);
  };

  const handleConnect = async () => {
    if (!selectedTopicId || !profile?.id) return;

    const targetId = profile.id;
    const connectionKey = `${targetId}-${selectedTopicId}`;

    // Check if already connected or pending
    if (
      connectionStatus[connectionKey] === 'connected' ||
      connectionStatus[connectionKey] === 'pending'
    ) {
      return;
    }

    try {
      setSendingRequest(true);
      const formData = new FormData();
      formData.append('targetId', targetId);
      formData.append('topicId', selectedTopicId);

      const result = await sendConnectionRequest(formData);

      if (result.success) {
        setConnectionStatus({
          ...connectionStatus,
          [connectionKey]: 'pending',
        });
        // Show success message or move to next match
        setTimeout(() => {
          handleNext();
        }, 1000);
      } else {
        setError(result.message || 'Failed to send connection request');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Failed to send connection request:', error);
      setError('Failed to send connection request');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSendingRequest(false);
    }
  };

  // Update connection status when matches load
  useEffect(() => {
    if (matches.length > 0) {
      const statusMap: Record<string, string> = {};
      matches.forEach((match: any) => {
        const key = `${match.id}-${selectedTopicId}`;
        statusMap[key] = match.connectionStatus || 'none';
      });
      setConnectionStatus(statusMap);
    }
  }, [matches, selectedTopicId]);

  if (loading && matches.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
          <Brain className="absolute inset-0 m-auto w-12 h-12 text-indigo-400 animate-pulse" />
        </div>
        <div className="text-gray-400 text-lg font-semibold">
          Finding your perfect matches...
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-8 max-w-md text-center border border-red-500/20">
          <div className="text-red-400 mb-4 text-lg font-semibold">{error}</div>
          <GlowingButton onClick={loadTopicMatches}>Try Again</GlowingButton>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="glass-panel rounded-3xl p-12 max-w-md text-center border border-white/10">
          <Brain className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <div className="text-3xl font-black text-white mb-3">
            No matches found
          </div>
          <div className="text-gray-400 mb-8 text-lg">
            Try selecting a different topic or add more topics to your profile
            to discover study partners
          </div>
          {userTopics.length === 0 && (
            <GlowingButton href="/topics">Add Topics</GlowingButton>
          )}
        </div>
      </div>
    );
  }

  const profile = matches[currentMatch];
  const matchScore = Math.min(
    100,
    Math.round((profile.availabilityScore || 0) * 10 + 60)
  );
  const selectedTopic = userTopics.find(
    ut => ut.topicId === selectedTopicId
  )?.topic;
  const connectionKey = profile?.id ? `${profile.id}-${selectedTopicId}` : '';
  const currentConnectionStatus =
    connectionStatus[connectionKey] || profile?.connectionStatus || 'none';

  // Generate avatar URL or use profile image
  const avatarUrl =
    profile.profileImageUrl ||
    `https://i.pravatar.cc/400?img=${Math.floor(Math.random() * 70)}`;

  return (
    <div className="w-full h-full flex flex-col bg-[#0F172A] overflow-y-auto">
      {/* Integrated Header with Topic Selector */}
      <div className="w-full border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Matching</h1>
                {selectedTopic && (
                  <p className="text-sm text-gray-400">
                    Find study partners for {selectedTopic.name}
                  </p>
                )}
              </div>
            </div>

            {userTopics.length > 0 && (
              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={selectedTopicId || ''}
                  onChange={e => setSelectedTopicId(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all hover:bg-white/10 min-w-[180px]"
                >
                  {userTopics.map(ut => (
                    <option
                      key={ut.topicId}
                      value={ut.topicId}
                      className="bg-[#0F172A]"
                    >
                      {ut.topic.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-xl shadow-lg border border-red-400/50 backdrop-blur-sm animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Main Content Area - Centered with more space */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl">
          {/* Large Match Card - Redesigned */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl shadow-2xl border border-gray-800/50 overflow-hidden relative">
            {/* Top Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
            </div>

            {/* Avatar - Overlapping the banner */}
            <div className="flex justify-center -mt-16 relative z-10 mb-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover shadow-2xl"
                />
                {/* Match Score Badge on Avatar */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2 shadow-lg border-2 border-gray-900">
                  <div className="text-center">
                    <span className="text-white font-black text-lg block leading-none">
                      {matchScore}%
                    </span>
                    <span className="text-green-100 text-[10px] font-semibold">
                      Match
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 pb-8 text-center">
              {/* Name and Basic Info */}
              <h2 className="text-3xl font-black text-white mb-1">
                {profile.firstName} {profile.lastName?.charAt(0)}.
              </h2>
              {selectedTopic && (
                <p className="text-gray-400 text-sm mb-6">
                  {selectedTopic.name} • {profile.studyStyle || 'Student'}
                </p>
              )}

              {/* Bio */}
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-lg mx-auto">
                {profile.bio
                  ? profile.bio.length > 120
                    ? `${profile.bio.substring(0, 120)}...`
                    : profile.bio
                  : 'Looking for study partners to collaborate and learn together.'}
              </p>

              {/* Enhanced Tags with Better Contrast */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {profile.studyStyle && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile.studyStyle}
                  </span>
                )}
                {profile.preferredLocation && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {profile.preferredLocation}
                  </span>
                )}
                {profile.studyPace && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {profile.studyPace}
                  </span>
                )}
                {profile.availabilityScore > 0 && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {profile.availabilityScore} overlapping slots
                  </span>
                )}
              </div>

              {/* Action Buttons - Redesigned with Better Hierarchy */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                {/* Pass Button */}
                <button
                  onClick={handlePrevious}
                  className="w-14 h-14 rounded-full bg-gray-800 hover:bg-red-500/20 border-2 border-gray-700 hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all shadow-lg hover:scale-110"
                  title="Pass"
                >
                  <X size={24} strokeWidth={3} />
                </button>

                {/* Save/Star Button */}
                <button
                  className="w-14 h-14 rounded-full bg-gray-800 hover:bg-yellow-500/20 border-2 border-gray-700 hover:border-yellow-500/50 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-all shadow-lg hover:scale-110"
                  title="Save for later"
                >
                  <Star size={24} strokeWidth={2} />
                </button>

                {/* Like/Connect Button - Main Action */}
                <button
                  onClick={handleConnect}
                  disabled={
                    sendingRequest ||
                    currentConnectionStatus === 'connected' ||
                    currentConnectionStatus === 'pending'
                  }
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
                    currentConnectionStatus === 'connected'
                      ? 'bg-green-600 shadow-green-500/50 cursor-not-allowed'
                      : currentConnectionStatus === 'pending'
                        ? 'bg-yellow-600 shadow-yellow-500/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-110'
                  } ${sendingRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={
                    currentConnectionStatus === 'connected'
                      ? 'Already connected'
                      : currentConnectionStatus === 'pending'
                        ? 'Request pending'
                        : 'Send connection request'
                  }
                >
                  {sendingRequest ? (
                    <Loader2 size={28} className="animate-spin" />
                  ) : currentConnectionStatus === 'connected' ? (
                    <span className="text-2xl">✓</span>
                  ) : currentConnectionStatus === 'pending' ? (
                    <span className="text-2xl">⏳</span>
                  ) : (
                    <Heart size={28} fill="white" />
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  className="w-14 h-14 rounded-full bg-gray-800 hover:bg-blue-500/20 border-2 border-gray-700 hover:border-blue-500/50 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all shadow-lg hover:scale-110"
                  title="Next"
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Indicator and Counter - Below Card */}
          <div className="flex flex-col items-center gap-3 mt-6">
            {/* Progress Bar */}
            <div className="w-full max-w-md">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentMatch + 1) / Math.min(matches.length, 10)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Match Counter */}
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-white font-semibold text-sm">
                {currentMatch + 1} of {Math.min(matches.length, 10)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
