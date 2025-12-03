'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Clock, MapPin, Plus, Search, BookOpen } from 'lucide-react';
import { GlowingButton } from '@/components/ui/glowing-button';
import { searchCourses } from '@/lib/actions/courses';

// Get course color and style based on code
const getCourseStyle = (code: string | null | undefined) => {
  if (!code) {
    return {
      color: 'bg-indigo-600',
      bg: 'bg-indigo-600/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
    };
  }
  const upperCode = code.toUpperCase();

  // Computer Science / CST
  if (
    upperCode.startsWith('CS') ||
    upperCode.startsWith('CST') ||
    upperCode.startsWith('COMP')
  ) {
    return {
      color: 'bg-blue-600',
      bg: 'bg-blue-600/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    };
  }

  // Biology / BIO
  if (upperCode.startsWith('BIO')) {
    return {
      color: 'bg-emerald-500',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    };
  }

  // Math / MAT
  if (upperCode.startsWith('MATH') || upperCode.startsWith('MAT')) {
    return {
      color: 'bg-purple-600',
      bg: 'bg-purple-600/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
    };
  }

  // Physics / PHYS
  if (upperCode.startsWith('PHYS')) {
    return {
      color: 'bg-yellow-500',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
    };
  }

  // Chemistry / CHEM
  if (upperCode.startsWith('CHEM')) {
    return {
      color: 'bg-green-600',
      bg: 'bg-green-600/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
    };
  }

  // Engineering / ENG
  if (upperCode.startsWith('ENG')) {
    return {
      color: 'bg-orange-500',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
    };
  }

  // Default
  return {
    color: 'bg-indigo-600',
    bg: 'bg-indigo-600/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
  };
};

// Get course status (mock for now - would come from enrollment data)
const getCourseStatus = (course: any, enrolledCount: number) => {
  // Mock logic - in real app, this would check enrollment capacity
  const capacity = 30; // Default capacity
  const enrolled = enrolledCount || 0;
  const available = capacity - enrolled;

  if (available <= 0) {
    return { status: 'Closed', color: 'red' };
  } else if (available <= 5) {
    return { status: 'Waitlist', color: 'yellow' };
  } else {
    return { status: 'Open', color: 'green' };
  }
};

// Course Card Component
const CourseCard = ({
  course,
  isEnrolled,
  onEnroll,
}: {
  course: any;
  isEnrolled: boolean;
  onEnroll: () => void;
}) => {
  const style = getCourseStyle(course.code);
  const status = getCourseStatus(course, course._count?.userCourses || 0);
  const courseCode = course.code || 'N/A';
  const courseCodeParts = courseCode.split(' ');
  const department = courseCodeParts[0] || 'N/A';
  const number = courseCodeParts[1] || '';

  // Parse schedule if available
  const schedule = course.schedule || 'TBA';
  const room = course.schedule?.includes('Room')
    ? course.schedule.split('Room')[1]?.trim()
    : 'TBA';

  return (
    <div
      className={`bg-[#121212] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition group relative overflow-hidden ${isEnrolled ? 'opacity-75' : ''}`}
    >
      {/* Top: Course Code Badge + Status */}
      <div className="flex justify-between items-start mb-4">
        {/* Dynamic colored course code box */}
        <div
          className={`w-16 h-16 rounded-xl ${style.color} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}
        >
          <div className="text-center leading-tight">
            <span className="text-xs block">{department}</span>
            <span className="text-sm">{number}</span>
          </div>
        </div>

        {/* Status label */}
        <span
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
            status.status === 'Open'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : status.status === 'Waitlist'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
        >
          {status.status}
        </span>
      </div>

      {/* Course Title */}
      <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
        {course.name}
      </h3>

      {/* Metadata with Icons */}
      <div className="space-y-2.5 mb-4">
        {course.instructor && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={14} className="flex-shrink-0" />
            <span className="truncate">{course.instructor}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} className="flex-shrink-0" />
          <span className="truncate">{schedule}</span>
        </div>
        {room && room !== 'TBA' && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{room}</span>
          </div>
        )}
      </div>

      {/* Bottom: Section Info + Action */}
      <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            Section {course.section}
          </span>
          <span className="text-xs text-gray-500">{course.semester}</span>
        </div>

        {isEnrolled ? (
          <span className="text-sm text-indigo-400 font-semibold">
            ✓ Enrolled
          </span>
        ) : status.status === 'Closed' ? (
          <span className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-500 cursor-not-allowed">
            Full
          </span>
        ) : (
          <button
            onClick={async () => {
              try {
                const formData = new FormData();
                formData.append('courseId', course.id);
                const { enrollInCourse } = await import(
                  '@/lib/actions/courses'
                );
                const result = await enrollInCourse(formData);
                if (result.success) {
                  onEnroll();
                } else {
                  alert(result.error || 'Failed to enroll');
                }
              } catch (error) {
                console.error('Failed to enroll:', error);
                alert('Failed to enroll in course');
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 bg-white text-black hover:bg-gray-200"
          >
            Enroll
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default function CoursesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadCourses();
      loadEnrolledCourses();
    }
  }, [status, router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (searchQuery) {
        formData.append('query', searchQuery);
      }
      formData.append('limit', '50');
      const result = await searchCourses(formData);
      if (result.success && result.data) {
        setCourses(result.data.courses);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/user/courses');
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load enrolled courses:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
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

  const enrolledCourseIds = enrolledCourses.map(ec => ec.id);

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-slate-200 font-sans overflow-y-auto pb-20 md:pb-10">
      <main className="relative z-10 w-full p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header - Mobile-first */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
                Course Catalog
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-400">
                Search and enroll in courses for {new Date().getFullYear()}
              </p>
            </div>

            {/* Enhanced Search - Mobile-first */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by code (e.g. CST 4800)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-gray-500"
              />
            </form>
          </div>

          {/* Enrolled Courses Section */}
          {enrolledCourses.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen size={24} className="text-indigo-400" />
                My Enrolled Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {enrolledCourses.map(course => {
                  const style = getCourseStyle(course.code);
                  const courseCode = course.code || 'N/A';
                  const courseCodeParts = courseCode.split(' ');
                  const department = courseCodeParts[0] || 'N/A';
                  const number = courseCodeParts[1] || '';

                  return (
                    <div
                      key={course.id}
                      className="bg-[#121212] border-2 border-indigo-500/30 rounded-2xl p-5 hover:border-indigo-500/50 transition group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-16 h-16 rounded-xl ${style.color} flex items-center justify-center text-white font-bold shadow-lg`}
                        >
                          <div className="text-center leading-tight">
                            <span className="text-xs block">{department}</span>
                            <span className="text-sm">{number}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Enrolled
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                        {course.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        {course.instructor && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <User size={14} />
                            <span>{course.instructor}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={14} />
                          <span>{course.schedule || 'TBA'}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <GlowingButton
                          variant="outline"
                          href={`/matches?courseId=${course.id}`}
                          className="w-full text-sm py-2"
                        >
                          View Matches
                        </GlowingButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'Available Courses'}
            </h2>
          </div>

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map(course => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={isEnrolled}
                    onEnroll={loadEnrolledCourses}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-12 text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search query
              </p>
            </div>
          )}

          {/* Empty State */}
          {enrolledCourses.length === 0 && courses.length === 0 && !loading && (
            <div className="bg-[#121212] border border-gray-800 rounded-3xl p-12 text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white mb-2">
                No courses yet
              </h3>
              <p className="text-gray-400 mb-6">
                Search and enroll in courses to start finding study partners
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
