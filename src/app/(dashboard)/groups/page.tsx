'use client';

import { GlowingButton } from '@/components/nexus';
import { getUserCourses } from '@/lib/actions/courses';
import { createGroup, getAllGroups, joinGroup } from '@/lib/actions/groups';
import { ArrowRight, Plus, Users, X, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Get emoji and color for category
const getCategoryStyle = (category: string, code?: string) => {
  // Check course code for specific subjects
  if (code) {
    if (code.includes('CS') || code.includes('CST') || code.includes('COMP')) {
      return {
        emoji: '💻',
        gradient: 'from-blue-500 to-cyan-400',
        color: 'blue',
      };
    }
    if (code.includes('MATH') || code.includes('MATH')) {
      return {
        emoji: '📐',
        gradient: 'from-purple-500 to-pink-500',
        color: 'purple',
      };
    }
    if (code.includes('PHYS') || code.includes('PHYS')) {
      return {
        emoji: '⚛️',
        gradient: 'from-yellow-500 to-orange-500',
        color: 'orange',
      };
    }
    if (code.includes('CHEM')) {
      return {
        emoji: '🧪',
        gradient: 'from-green-500 to-emerald-400',
        color: 'green',
      };
    }
  }

  // Fallback to category
  switch (category) {
    case 'skill':
    case 'Code':
      return {
        emoji: '💻',
        gradient: 'from-blue-500 to-cyan-400',
        color: 'blue',
      };
    case 'subject':
    case 'Science':
      return {
        emoji: '⚛️',
        gradient: 'from-yellow-500 to-orange-500',
        color: 'orange',
      };
    case 'interest':
      return {
        emoji: '🎯',
        gradient: 'from-pink-500 to-rose-500',
        color: 'pink',
      };
    default:
      return {
        emoji: '📚',
        gradient: 'from-indigo-500 to-purple-500',
        color: 'indigo',
      };
  }
};

// Study Group Card Component
const StudyGroupCard = ({
  group,
  members = [],
  onJoinGroup,
}: {
  group: any;
  members?: any[];
  onJoinGroup?: (groupId: string) => void;
}) => {
  const isAlmostFull = group.memberCount >= (group.maxMembers || 6) - 1;
  const spotsLeft = (group.maxMembers || 6) - group.memberCount;
  const isFull = spotsLeft === 0;

  const categoryStyle = getCategoryStyle(group.category, group.code);
  const vibe = group.vibe || 'Collaborative';
  const tags = group.tags || [group.categoryLabel || group.category];

  // Generate member avatars (mock for now, would come from API)
  const memberAvatars = members.slice(0, 3).map((m, i) => ({
    id: m?.id || i,
    image: m?.profileImageUrl || `https://i.pravatar.cc/150?img=${i + 10}`,
    name: m?.firstName || `User ${i + 1}`,
  }));

  return (
    <div className="group relative bg-[#111] border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Top gradient bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryStyle.gradient} opacity-60 rounded-t-3xl`}
      ></div>

      {/* Subtle glow effect */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${categoryStyle.gradient} blur-[60px] opacity-20 group-hover:opacity-40 transition`}
      ></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {group.code && (
              <span className="text-xs font-mono text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                {group.code}
              </span>
            )}
            {isAlmostFull && !isFull && (
              <span className="text-[10px] font-bold uppercase bg-red-500/20 text-red-400 px-2 py-1 rounded-full animate-pulse border border-red-500/30">
                Hot
              </span>
            )}
            {isFull && (
              <span className="text-[10px] font-bold uppercase bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full border border-gray-500/30">
                Full
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all mb-1">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-sm text-gray-400 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Vibe Badge - Smaller and icon-based */}
        <div className="bg-gray-800/50 p-2.5 rounded-xl border border-gray-700/50 flex-shrink-0 ml-3">
          {vibe.toLowerCase().includes('intense') ||
          vibe.toLowerCase().includes('focus') ? (
            <Zap size={18} className="text-yellow-400" />
          ) : (
            <Users size={18} className="text-blue-400" />
          )}
        </div>
      </div>

      {/* Category Emoji */}
      <div className="mb-4 relative z-10">
        <span className="text-3xl">
          {group.categoryEmoji || categoryStyle.emoji}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
        {tags.map((tag: string, index: number) => (
          <span
            key={index}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="h-px w-full bg-gray-800 mb-6"></div>

      {/* Bottom: Facepile + Action */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          {/* Avatar Facepile */}
          <div className="flex -space-x-3 items-center mb-2">
            {memberAvatars.map(member => (
              <div
                key={member.id}
                className="w-10 h-10 rounded-full border-2 border-[#111] bg-gray-600 flex items-center justify-center overflow-hidden shadow-lg"
                title={member.name}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {group.memberCount > 3 && (
              <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 font-bold shadow-lg">
                +{group.memberCount - 3}
              </div>
            )}
          </div>

          {/* Urgency message */}
          <span
            className={`text-xs ${isAlmostFull && !isFull ? 'text-amber-400 font-semibold animate-pulse' : isFull ? 'text-gray-500' : 'text-gray-500'}`}
          >
            {isFull
              ? 'Group is full'
              : isAlmostFull
                ? `Only ${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left!`
                : `${group.memberCount}/${group.maxMembers || 6} members joined`}
          </span>
        </div>

        <button
          onClick={() => !isFull && !group.isMember && onJoinGroup?.(group.id)}
          className="bg-white text-black hover:bg-gray-200 rounded-xl px-5 py-2.5 font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isFull || group.isMember}
        >
          {isFull ? 'Full' : group.isMember ? 'Joined' : 'Join'}
          {!isFull && !group.isMember && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userCourses, setUserCourses] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: '',
    maxMembers: 6,
    vibe: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      loadGroups();
      loadUserCourses();
    }
  }, [session]);

  const loadUserCourses = async () => {
    try {
      const result = await getUserCourses();
      if (result.success && result.data) {
        setUserCourses(result.data);
      }
    } catch (error) {
      console.error('Failed to load user courses:', error);
    }
  };

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await getAllGroups(20);
      if (result.success && result.data) {
        setGroups(result.data.groups);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const formData = new FormData();
      formData.append('groupId', groupId);
      const result = await joinGroup(formData);

      if (result.success) {
        // Reload groups to update member count
        await loadGroups();
      } else {
        alert(result.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Failed to join group');
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setCreating(true);
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      if (formData.description) {
        submitFormData.append('description', formData.description);
      }
      if (formData.courseId) {
        submitFormData.append('courseId', formData.courseId);
      }
      submitFormData.append('maxMembers', formData.maxMembers.toString());
      if (formData.vibe) {
        submitFormData.append('vibe', formData.vibe);
      }
      if (formData.tags.length > 0) {
        submitFormData.append('tags', JSON.stringify(formData.tags));
      }

      const result = await createGroup(submitFormData);

      if (result.success) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          courseId: '',
          maxMembers: 6,
          vibe: '',
          tags: [],
        });
        setShowCreateModal(false);
        // Reload groups
        await loadGroups();
      } else {
        alert(result.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Filter groups
  const filteredGroups =
    selectedFilter === 'All'
      ? groups
      : groups.filter(g => {
          if (selectedFilter === 'Computer Science')
            return (
              g.category === 'cyan' ||
              g.code?.includes('CS') ||
              g.code?.includes('CST') ||
              g.code?.includes('COMP')
            );
          if (selectedFilter === 'Math') return g.code?.includes('MATH');
          if (selectedFilter === 'Exam Prep')
            return g.tags?.some((t: string) =>
              t.toLowerCase().includes('exam')
            );
          if (selectedFilter === 'Full') return g.isFull;
          return true;
        });

  const filters = ['All', 'Computer Science', 'Math', 'Exam Prep', 'Full'];

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-slate-200 font-sans overflow-y-auto">
      <main className="relative z-10 w-full p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center gap-4">
                <Users size={48} className="text-indigo-400" />
                Study Groups
              </h1>
              <p className="text-gray-400 text-lg">
                Join vibrant study communities and learn together
              </p>
            </div>
            <GlowingButton onClick={() => setShowCreateModal(true)}>
              <Plus size={20} className="mr-2" />
              Create Group
            </GlowingButton>
          </div>

          {/* Filter Pills */}
          <div className="mb-8 flex flex-wrap gap-3">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedFilter === filter
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Groups Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  members={group.members || []}
                  onJoinGroup={handleJoinGroup}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111] border border-gray-800 rounded-3xl p-16 text-center">
              <Users size={80} className="mx-auto mb-6 text-gray-600" />
              <h3 className="text-2xl font-black text-white mb-3">
                No groups found
              </h3>
              <p className="text-gray-400 mb-8">
                {selectedFilter === 'All'
                  ? 'Create or join a study group to get started'
                  : `No groups match the "${selectedFilter}" filter`}
              </p>
              <GlowingButton onClick={() => setShowCreateModal(true)}>
                <Plus size={20} className="mr-2" />
                Create Your First Group
              </GlowingButton>
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Create Study Group
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Group Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., React Study Group"
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What's this group about?"
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                  maxLength={500}
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Related Course (Optional)
                </label>
                <select
                  value={formData.courseId}
                  onChange={e =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">No specific course</option>
                  {userCourses.map(course => (
                    <option
                      key={course.id}
                      value={course.id}
                      className="bg-[#1a1a1a]"
                    >
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Members */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  value={formData.maxMembers}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      maxMembers: parseInt(e.target.value) || 6,
                    })
                  }
                  min={2}
                  max={20}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Vibe */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Group Vibe (Optional)
                </label>
                <select
                  value={formData.vibe}
                  onChange={e =>
                    setFormData({ ...formData, vibe: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Select vibe...</option>
                  <option value="Intense Focus" className="bg-[#1a1a1a]">
                    Intense Focus
                  </option>
                  <option value="Collaborative" className="bg-[#1a1a1a]">
                    Collaborative
                  </option>
                  <option value="Chill" className="bg-[#1a1a1a]">
                    Chill
                  </option>
                  <option value="Exam Prep" className="bg-[#1a1a1a]">
                    Exam Prep
                  </option>
                  <option value="Project-Based" className="bg-[#1a1a1a]">
                    Project-Based
                  </option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index),
                          });
                        }}
                        className="hover:text-red-400 transition"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      const newTag = e.currentTarget.value.trim();
                      if (
                        !formData.tags.includes(newTag) &&
                        formData.tags.length < 5
                      ) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, newTag],
                        });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to add a tag (max 5 tags)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition"
                  disabled={creating}
                >
                  Cancel
                </button>
                <GlowingButton
                  onClick={handleCreateGroup}
                  disabled={creating || !formData.name.trim()}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
