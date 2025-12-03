'use client';

import { TopicSelector } from '@/app/(dashboard)/topics/_components/TopicSelector';
import { GlowingButton } from '@/components/ui/glowing-button';
import { getUserAvailability } from '@/lib/actions/availability';
import { getUserCourses } from '@/lib/actions/courses';
import { getDashboardStats } from '@/lib/actions/dashboard';
import { getUserProfile } from '@/lib/actions/profile';
import { getUserTopics } from '@/lib/actions/topics';
import {
  BookOpen,
  Calendar,
  Clock,
  Code,
  Cpu,
  Edit3,
  Github,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AvailabilityEditor } from './_components/AvailabilityEditor';
import { InlineSelect } from './_components/InlineSelect';
import { ProfileForm } from './_components/ProfileForm';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [stats, setStats] = useState({
    courses: 0,
    topics: 0,
    connections: 0,
    matches: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      loadProfileData();
    }
  }, [status, router]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load all profile data in parallel
      const [
        profileResult,
        topicsResult,
        availabilityResult,
        statsResult,
        coursesResult,
      ] = await Promise.all([
        getUserProfile(),
        getUserTopics(),
        getUserAvailability(),
        getDashboardStats(),
        getUserCourses(),
      ]);

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data.profile);
      }

      if (topicsResult.success && topicsResult.data) {
        setTopics(topicsResult.data.userTopics || []);
      }

      if (availabilityResult.success && availabilityResult.data) {
        setAvailability(availabilityResult.data || []);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (coursesResult.success && coursesResult.data) {
        setCourses(coursesResult.data.slice(0, 4)); // Show only first 4 courses
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelectionChange = async (selected: any[]) => {
    setTopics(selected);
    setShowTopicSelector(false);
  };

  const getAvailabilityPercentage = (dayIndex: number) => {
    const daySlots = availability.filter(s => s.dayOfWeek === dayIndex);
    if (daySlots.length === 0) return 0;

    // Calculate total minutes available
    const totalMinutes = daySlots.reduce((acc, slot) => {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      return acc + (end - start);
    }, 0);

    // Return percentage of day (assuming 8am-10pm is the active window = 840 minutes)
    return Math.min(100, Math.round((totalMinutes / 840) * 100));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const user = profile?.user || session?.user;
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : session?.user?.name || 'User';
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Get user's major/university info
  const userMajor = user?.university || 'Student';
  const userLocation = profile?.preferredLocation || 'Not set';
  const userEmail = user?.email || session?.user?.email || '';

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-[#050505] text-white font-sans overflow-y-auto pb-20 md:pb-10">
      {/* --- 1. Hero Section (顶部个人信息) --- */}
      <div className="relative mb-8 group">
        {/* 背景 Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-[#0a0a0a] rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        </div>

        {/* 个人信息悬浮层 - Mobile-first */}
        <div className="flex flex-col md:flex-row items-start md:items-end px-4 sm:px-6 md:px-8 -mt-12 sm:-mt-16 relative z-10 gap-4 sm:gap-6">
          {/* 头像 */}
          <div className="relative">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-[#121212] border-4 border-[#050505] flex items-center justify-center overflow-hidden shadow-2xl"
              style={{
                backgroundImage: user?.profileImageUrl
                  ? `url(${user.profileImageUrl})`
                  : undefined,
                backgroundSize: 'cover',
              }}
            >
              {!user?.profileImageUrl && (
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {userInitials}
                </span>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-1 right-1 p-2 bg-indigo-600 rounded-full text-white border-4 border-[#050505] hover:bg-indigo-500 transition">
                <Edit3 size={14} />
              </button>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 p-2 bg-indigo-600 rounded-full text-white border-4 border-[#050505] hover:bg-indigo-500 transition"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>

          {/* 名字与简介 - Mobile-first */}
          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {userName}
              </h1>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Student
                </span>
                {stats.connections > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                    Active
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm flex flex-wrap items-center gap-4">
              {userMajor && (
                <>
                  <span className="flex items-center gap-1.5">
                    <Code size={14} /> {userMajor}
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                </>
              )}
              {userLocation !== 'Not set' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {userLocation}
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                </>
              )}
              {userEmail && (
                <span className="text-indigo-400 hover:underline cursor-pointer">
                  {userEmail}
                </span>
              )}
            </p>
          </div>

          {/* Stats Summary (紧凑型) */}
          <div className="hidden md:flex gap-6 md:gap-8 pb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.matches}
              </div>
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                Matches
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.courses}
              </div>
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                Courses
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.connections > 0
                  ? Math.min(
                      100,
                      Math.round((stats.connections / stats.matches) * 100)
                    )
                  : 0}
                <span className="text-sm text-gray-600">%</span>
              </div>
              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                Success
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Bento Grid Layout (核心内容) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === 左侧栏 (Main Content) === */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. About Me & Tech Stack */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8">
            {isEditing ? (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Edit Profile
                </h3>
                <ProfileForm
                  initialData={{
                    bio: profile?.bio || null,
                    preferredLocation: profile?.preferredLocation || null,
                    studyStyle: profile?.studyStyle || null,
                    studyPace: profile?.studyPace || null,
                  }}
                  onSuccess={() => {
                    loadProfileData();
                  }}
                />
                <button
                  onClick={() => {
                    loadProfileData();
                    setIsEditing(false);
                  }}
                  className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Done editing
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">About Me</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {profile?.bio ||
                    'No bio yet. Add one to help others get to know you!'}
                </p>

                <h4 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Tech Stack & Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topics.length > 0 ? (
                    topics.map((ut: any) => {
                      const topic = ut.topic || ut;
                      return (
                        <span
                          key={ut.id || ut.topicId}
                          className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/5 text-gray-300 text-sm hover:border-indigo-500/50 hover:text-white transition cursor-default"
                        >
                          {topic.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/5 text-gray-500 text-sm">
                      No topics yet
                    </span>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => setShowTopicSelector(!showTopicSelector)}
                      className="px-3 py-1.5 rounded-lg border border-dashed border-gray-700 text-gray-500 text-sm hover:text-white hover:border-gray-500 transition"
                    >
                      + Add
                    </button>
                  )}
                </div>
                {showTopicSelector && isEditing && (
                  <div className="mt-4">
                    <TopicSelector
                      selectedTopics={topics}
                      onSelectionChange={handleTopicSelectionChange}
                      showCategories={true}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* 2. Current Courses (My Courses) */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Current Focus</h3>
              <Link
                href="/courses"
                className="text-xs text-indigo-400 font-medium hover:text-indigo-300"
              >
                View All Courses
              </Link>
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => {
                  const getCourseIcon = (code: string) => {
                    if (
                      code?.includes('CS') ||
                      code?.includes('CST') ||
                      code?.includes('COMP')
                    ) {
                      return <Cpu size={20} className="text-blue-400" />;
                    }
                    if (code?.includes('MATH') || code?.includes('MAT')) {
                      return <Layers size={20} className="text-purple-400" />;
                    }
                    return <BookOpen size={20} className="text-indigo-400" />;
                  };
                  const getCourseColor = (code: string) => {
                    if (
                      code?.includes('CS') ||
                      code?.includes('CST') ||
                      code?.includes('COMP')
                    ) {
                      return 'bg-blue-500/20';
                    }
                    if (code?.includes('MATH') || code?.includes('MAT')) {
                      return 'bg-purple-500/20';
                    }
                    return 'bg-indigo-500/20';
                  };

                  return (
                    <Link
                      key={course.id}
                      href={`/courses`}
                      className="p-4 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-start gap-4 hover:border-indigo-500/50 transition"
                    >
                      <div
                        className={`p-3 rounded-xl ${getCourseColor(course.code || '')}`}
                      >
                        {getCourseIcon(course.code || '')}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-200">
                          {course.code || 'N/A'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {course.name || 'Course'} •{' '}
                          {course.semester || 'Current'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-sm mb-4">
                  No courses enrolled yet
                </p>
                <Link href="/courses">
                  <GlowingButton variant="secondary" className="text-sm">
                    Browse Courses
                  </GlowingButton>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* === 右侧栏 (Settings & Widgets) === */}
        <div className="space-y-6">
          {/* 1. Availability Widget */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-indigo-500" />
                <h3 className="font-bold text-white">Weekly Availability</h3>
              </div>
              {isEditing && (
                <button
                  onClick={() =>
                    setShowAvailabilityEditor(!showAvailabilityEditor)
                  }
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 transition"
                >
                  <Edit3 size={14} />
                </button>
              )}
            </div>

            {showAvailabilityEditor && isEditing ? (
              <AvailabilityEditor
                initialAvailability={availability}
                onSave={() => {
                  setShowAvailabilityEditor(false);
                  loadProfileData();
                }}
                onCancel={() => {
                  setShowAvailabilityEditor(false);
                }}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                    const dayIndex = i + 1; // Monday = 1, Tuesday = 2, etc.
                    const percentage = getAvailabilityPercentage(dayIndex);
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-3 text-xs"
                      >
                        <span className="w-6 text-gray-500 font-medium">
                          {day}
                        </span>
                        <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                          {percentage > 0 && (
                            <div
                              className={`h-full rounded-full ${percentage > 50 ? 'bg-indigo-500' : 'bg-gray-700'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-500 mt-4 text-center">
                  Visible to matches only.
                </p>
              </>
            )}
          </div>

          {/* 2. Preferences / Settings */}
          <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-4">Study Style</h3>
            <div className="space-y-3">
              <InlineSelect
                value={profile?.preferredLocation || null}
                options={[
                  { value: 'library', label: 'Library' },
                  { value: 'cafe', label: 'Cafe' },
                  { value: 'dorm', label: 'Dorm Room' },
                  { value: 'online', label: 'Online' },
                  { value: 'other', label: 'Other' },
                ]}
                onChange={value => {
                  setProfile((prev: any) => ({
                    ...prev,
                    preferredLocation: value,
                  }));
                  loadProfileData();
                }}
                fieldName="preferredLocation"
                icon={<BookOpen size={16} />}
                label="Location"
              />
              <InlineSelect
                value={profile?.studyPace || null}
                options={[
                  { value: 'fast', label: 'Fast' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'slow', label: 'Slow' },
                ]}
                onChange={value => {
                  setProfile((prev: any) => ({
                    ...prev,
                    studyPace: value,
                  }));
                  loadProfileData();
                }}
                fieldName="studyPace"
                icon={<Zap size={16} />}
                label="Pace"
              />
              <InlineSelect
                value={profile?.studyStyle || null}
                options={[
                  { value: 'collaborative', label: 'Collaborative' },
                  { value: 'quiet', label: 'Quiet' },
                  { value: 'mixed', label: 'Mixed' },
                ]}
                onChange={value => {
                  setProfile((prev: any) => ({
                    ...prev,
                    studyStyle: value,
                  }));
                  loadProfileData();
                }}
                fieldName="studyStyle"
                icon={<Calendar size={16} />}
                label="Style"
              />
            </div>
          </div>

          {/* 3. Social Links */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-2xl bg-[#121212] border border-white/10 hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition flex justify-center">
              <Github size={20} />
            </button>
            <button className="flex-1 py-3 rounded-2xl bg-[#121212] border border-white/10 hover:bg-[#1a1a1a] text-blue-400 hover:text-blue-300 transition flex justify-center">
              <Linkedin size={20} />
            </button>
            <a
              href={`mailto:${userEmail}`}
              className="flex-1 py-3 rounded-2xl bg-[#121212] border border-white/10 hover:bg-[#1a1a1a] text-red-400 hover:text-red-300 transition flex justify-center"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
