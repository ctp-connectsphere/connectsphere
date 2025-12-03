'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Calendar, Save } from 'lucide-react';
import { GlowingButton } from '@/components/ui/glowing-button';

export default function AvailabilityPage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="w-full h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const timeSlots = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM',
    '8:00 PM',
  ];

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                <Calendar size={24} className="text-indigo-400 sm:w-8 sm:h-8" />
                Study Availability
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Set your available study times to match with partners
              </p>
            </div>
            <GlowingButton className="w-full sm:w-auto">
              <Save size={18} className="mr-2" />
              Save Availability
            </GlowingButton>
          </div>

          {/* Availability Grid - Mobile-first with horizontal scroll */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] px-4 sm:px-0">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs sm:text-sm font-semibold text-gray-500 pb-3 sm:pb-4 pr-3 sm:pr-4">
                        Time
                      </th>
                      {days.map(day => (
                        <th
                          key={day}
                          className="text-center text-xs sm:text-sm font-semibold text-gray-500 pb-3 sm:pb-4 px-1 sm:px-2"
                        >
                          {day.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="text-xs sm:text-sm text-gray-400 py-2 pr-3 sm:pr-4">
                          <Clock
                            size={12}
                            className="inline mr-1 sm:mr-2 sm:w-[14px] sm:h-[14px]"
                          />
                          {time}
                        </td>
                        {days.map(day => {
                          const key = `${day}-${time}`;
                          const isSelected = selectedSlots.has(key);
                          return (
                            <td key={day} className="px-1 sm:px-2 py-2">
                              <button
                                onClick={() => toggleSlot(day, time)}
                                className={`w-full h-7 sm:h-8 rounded-lg transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Legend - Mobile-first */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-white/5 border border-white/10"></div>
              <span className="text-gray-400">Unavailable</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
