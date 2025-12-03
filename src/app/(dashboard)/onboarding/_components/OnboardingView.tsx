'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  Coffee,
  Music,
  Sparkles,
  Library,
  Moon,
  Sun,
  Target,
  Calendar,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { GlowingButton } from '@/components/ui/glowing-button';
import { TopicSelector } from '@/app/(dashboard)/topics/_components/TopicSelector';
import { getUserTopics } from '@/lib/actions/topics';
import { searchCourses } from '@/lib/actions/courses';

interface OnboardingViewProps {
  onComplete: () => void;
}

// Step 1: Courses Selection (Real Data)
const CoursesStep = ({
  selections,
  toggleSelection,
}: {
  selections: string[];
  toggleSelection: (item: string) => void;
}) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
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

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 py-12">
        <div className="text-gray-400">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <BookOpen size={64} className="mx-auto mb-6 text-indigo-400" />
          <h2 className="text-5xl font-black text-white mb-4">
            Select Your Courses
          </h2>
          <p className="text-xl text-gray-400">
            Choose all courses you&apos;re currently taking
          </p>
        </div>
        {courses.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No courses available. You can add courses later from the Courses
            page.
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {courses.slice(0, 20).map(course => {
              const isSelected = selections.includes(course.id);
              return (
                <button
                  key={course.id}
                  onClick={() => toggleSelection(course.id)}
                  className={`
                    px-6 py-4 rounded-2xl font-semibold transition-all duration-300
                    ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-indigo-400/50'
                    }
                  `}
                >
                  <div className="text-sm font-bold">{course.code}</div>
                  <div className="text-xs opacity-80">{course.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Step 2: Skills & Topics Selection (Real Data)
const SkillsStep = ({
  selections: _selections,
  toggleSelection: _toggleSelection,
}: {
  selections: any[];
  toggleSelection: (item: any) => void;
}) => {
  const [userTopics, setUserTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserTopics();
  }, []);

  const loadUserTopics = async () => {
    try {
      setLoading(true);
      const result = await getUserTopics();
      if (result.success && result.data) {
        setUserTopics(result.data.userTopics);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 py-12">
        <div className="text-gray-400">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <Brain size={64} className="mx-auto mb-6 text-purple-400" />
          <h2 className="text-5xl font-black text-white mb-4">
            Your Skills & Interests
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Select topics you&apos;re interested in or skilled at
          </p>
        </div>
        <TopicSelector
          selectedTopics={userTopics}
          onSelectionChange={selected => {
            setUserTopics(selected);
            // TopicSelector already saves to database when toggled
          }}
          showCategories={true}
        />
      </div>
    </div>
  );
};

// Step 3: Interests Selection (Cards)
const InterestsStep = ({
  selections,
  toggleSelection,
}: {
  selections: string[];
  toggleSelection: (item: string) => void;
}) => {
  const interests = [
    {
      label: 'Library',
      icon: Library,
      color: 'emerald',
      desc: 'Quiet & Focused',
    },
    {
      label: 'Cafe',
      icon: Coffee,
      color: 'orange',
      desc: 'Social & Energetic',
    },
    { label: 'Music', icon: Music, color: 'purple', desc: 'Lofi Vibes' },
    { label: 'Night', icon: Moon, color: 'blue', desc: 'Late Night Study' },
    { label: 'Morning', icon: Sun, color: 'yellow', desc: 'Early Bird' },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <Sparkles size={64} className="mx-auto mb-6 text-pink-400" />
          <h2 className="text-5xl font-black text-white mb-4">
            Study Interests
          </h2>
          <p className="text-xl text-gray-400">Where do you thrive?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interests.map(interest => {
            const isSelected = selections.includes(interest.label);
            const Icon = interest.icon;
            return (
              <div
                key={interest.label}
                onClick={() => toggleSelection(interest.label)}
                className={`
                  glass-panel p-8 rounded-3xl cursor-pointer transition-all duration-300
                  ${
                    isSelected
                      ? 'ring-4 ring-indigo-500/50 scale-105 bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
                      : 'hover:scale-105 hover:shadow-2xl hover:shadow-indigo-900/20'
                  }
                `}
              >
                <Icon
                  size={48}
                  className={`mb-4 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`}
                />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {interest.label}
                </h3>
                <p className="text-gray-400">{interest.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Step 4: Availability (Slider/Time Picker)
const AvailabilityStep = ({
  selections,
  toggleSelection,
}: {
  selections: string[];
  toggleSelection: (item: string) => void;
}) => {
  const timeSlots = [
    'Morning (8-12)',
    'Afternoon (12-5)',
    'Evening (5-9)',
    'Night (9-12)',
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <Calendar size={64} className="mx-auto mb-6 text-cyan-400" />
          <h2 className="text-5xl font-black text-white mb-4">
            Your Availability
          </h2>
          <p className="text-xl text-gray-400">When are you free to study?</p>
        </div>
        <div className="glass-panel rounded-3xl p-8">
          <div className="space-y-6">
            {timeSlots.map(slot => {
              const isSelected = selections.includes(slot);
              return (
                <div key={slot} className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{slot}</span>
                    <button
                      onClick={() => toggleSelection(slot)}
                      className={`
                        w-14 h-8 rounded-full transition-all duration-300 relative
                        ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/10'}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-all duration-300
                        ${isSelected ? 'translate-x-6' : 'translate-x-0'}
                      `}
                      />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {days.map(day => {
                      const dayKey = `${slot}-${day}`;
                      const isDaySelected = selections.includes(dayKey);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleSelection(dayKey)}
                          className={`
                            flex-1 py-2 rounded-lg font-medium transition-all
                            ${
                              isDaySelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }
                          `}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 5: Study Preferences (Cards with Sliders)
const StudyPreferencesStep = ({
  selections,
  toggleSelection,
}: {
  selections: Record<string, any>;
  toggleSelection: (key: string, value: any) => void;
}) => {
  const preferences = [
    {
      key: 'pace',
      label: 'Study Pace',
      options: ['Relaxed', 'Moderate', 'Intense'],
    },
    {
      key: 'group',
      label: 'Group Size',
      options: ['Solo', 'Pair', 'Small (3-4)', 'Large (5+)'],
    },
    {
      key: 'focus',
      label: 'Focus Level',
      options: ['Casual', 'Balanced', 'Deep Focus'],
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <Target size={64} className="mx-auto mb-6 text-yellow-400" />
          <h2 className="text-5xl font-black text-white mb-4">
            Study Preferences
          </h2>
          <p className="text-xl text-gray-400">How do you like to study?</p>
        </div>
        <div className="space-y-8">
          {preferences.map(pref => (
            <div key={pref.key} className="glass-panel rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                {pref.label}
              </h3>
              <div className="flex gap-4">
                {pref.options.map(option => {
                  const isSelected = selections[pref.key] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => toggleSelection(pref.key, option)}
                      className={`
                        flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OnboardingView = ({ onComplete }: OnboardingViewProps) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, any>>({
    courses: [],
    skills: [], // Will store UserTopic objects
    interests: [],
    availability: [],
    preferences: {},
  });
  const [saving, setSaving] = useState(false);

  const steps = [
    { component: CoursesStep, key: 'courses', title: 'Courses' },
    { component: SkillsStep, key: 'skills', title: 'Skills' },
    { component: InterestsStep, key: 'interests', title: 'Interests' },
    { component: AvailabilityStep, key: 'availability', title: 'Availability' },
    {
      component: StudyPreferencesStep,
      key: 'preferences',
      title: 'Preferences',
    },
  ];

  const toggleSelection = (key: string, value?: any) => {
    const currentStep = steps[step];
    if (currentStep.key === 'preferences') {
      setSelections(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value },
      }));
    } else {
      const current = selections[currentStep.key] || [];
      const newSelection =
        Array.isArray(current) && current.includes(key)
          ? current.filter((item: string) => item !== key)
          : [...current, key];
      setSelections(prev => ({
        ...prev,
        [currentStep.key]: newSelection,
      }));
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // 1. Save courses
      if (selections.courses && selections.courses.length > 0) {
        const { enrollInCourse } = await import('@/lib/actions/courses');
        for (const courseId of selections.courses) {
          try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            await enrollInCourse(formData);
          } catch (error) {
            console.error(`Failed to enroll in course ${courseId}:`, error);
          }
        }
      }

      // 2. Save availability
      if (selections.availability && selections.availability.length > 0) {
        const { createAvailability } = await import(
          '@/lib/actions/availability'
        );
        // Parse availability selections into slots
        const slots: any[] = [];
        selections.availability.forEach((slotStr: string) => {
          // Format: "Monday-Morning" or "Mon-8-12"
          const parts = slotStr.split('-');
          if (parts.length >= 2) {
            const dayMap: Record<string, number> = {
              Mon: 1,
              Monday: 1,
              Tue: 2,
              Tuesday: 2,
              Wed: 3,
              Wednesday: 3,
              Thu: 4,
              Thursday: 4,
              Fri: 5,
              Friday: 5,
              Sat: 6,
              Saturday: 6,
              Sun: 7,
              Sunday: 7,
            };
            const timeMap: Record<string, { start: string; end: string }> = {
              Morning: { start: '08:00', end: '12:00' },
              Afternoon: { start: '12:00', end: '17:00' },
              Evening: { start: '17:00', end: '21:00' },
              Night: { start: '21:00', end: '23:59' },
            };
            const day = dayMap[parts[0]];
            const timeSlot = timeMap[parts[1]];
            if (day && timeSlot) {
              slots.push({
                dayOfWeek: day,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
              });
            }
          }
        });
        if (slots.length > 0) {
          try {
            const formData = new FormData();
            formData.append('slots', JSON.stringify(slots));
            await createAvailability(formData);
          } catch (error) {
            console.error('Failed to save availability:', error);
          }
        }
      }

      // 3. Save profile preferences
      const { createOrUpdateProfile } = await import('@/lib/actions/profile');
      const formData = new FormData();
      if (selections.preferences.pace) {
        formData.append('studyPace', selections.preferences.pace.toLowerCase());
      }
      if (selections.preferences.focus) {
        formData.append(
          'studyStyle',
          selections.preferences.focus.toLowerCase()
        );
      }
      if (selections.interests.length > 0) {
        // Map interests to preferred location
        const locationMap: Record<string, string> = {
          Library: 'library',
          Cafe: 'cafe',
          Music: 'home',
          Night: 'any',
          Morning: 'any',
        };
        const firstInterest = selections.interests[0];
        if (locationMap[firstInterest]) {
          formData.append('preferredLocation', locationMap[firstInterest]);
        }
      }

      await createOrUpdateProfile(formData);

      // 4. Mark onboarding as completed
      const { completeOnboarding } = await import('@/lib/actions/onboarding');
      await completeOnboarding();

      // Topics are already saved by TopicSelector when selected

      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      // Still complete onboarding even if save fails
      const { completeOnboarding } = await import('@/lib/actions/onboarding');
      await completeOnboarding();
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const CurrentStepComponent = steps[step].component;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="px-6 pt-8 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'bg-indigo-500 flex-1'
                    : i < step
                      ? 'bg-indigo-500/50 flex-1'
                      : 'bg-gray-700 flex-1'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-400 font-semibold">
            Step {step + 1} of {steps.length} • {steps[step].title}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <CurrentStepComponent
          selections={
            selections[steps[step].key] ||
            (steps[step].key === 'preferences' ? {} : [])
          }
          toggleSelection={toggleSelection}
        />
      </div>

      {/* Navigation - Fixed at Bottom */}
      <div className="px-6 pb-8 pt-6 flex-shrink-0 border-t border-white/10 bg-[#050508]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {step > 0 ? (
            <GlowingButton
              variant="secondary"
              onClick={() => setStep(s => s - 1)}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </GlowingButton>
          ) : (
            <div></div>
          )}
          <GlowingButton
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(s => s + 1);
              } else {
                handleComplete();
              }
            }}
            className="ml-auto"
            disabled={saving}
            loading={saving}
          >
            {step === steps.length - 1
              ? saving
                ? 'Saving...'
                : 'Complete Setup'
              : 'Next'}
            {!saving && <ArrowRight size={18} className="ml-2" />}
          </GlowingButton>
        </div>
      </div>
    </div>
  );
};
