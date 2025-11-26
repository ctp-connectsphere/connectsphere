'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, Calendar, Save } from 'lucide-react';
import { GlowingButton, Badge } from '@/components/nexus';

export default function AvailabilityPage() {
  const { data: session, status } = useSession();
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar size={32} className="text-indigo-400" />
                Study Availability
              </h1>
              <p className="text-gray-400">Set your available study times to match with partners</p>
            </div>
            <GlowingButton>
              <Save size={18} className="mr-2" />
              Save Availability
            </GlowingButton>
          </div>

          {/* Availability Grid */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-semibold text-gray-500 pb-4 pr-4">Time</th>
                    {days.map(day => (
                      <th key={day} className="text-center text-sm font-semibold text-gray-500 pb-4 px-2">
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="text-sm text-gray-400 py-2 pr-4">
                        <Clock size={14} className="inline mr-2" />
                        {time}
                      </td>
                      {days.map(day => {
                        const key = `${day}-${time}`;
                        const isSelected = selectedSlots.has(key);
                        return (
                          <td key={day} className="px-2 py-2">
                            <button
                              onClick={() => toggleSlot(day, time)}
                              className={`w-full h-8 rounded-lg transition-all ${
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

          {/* Legend */}
          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/5 border border-white/10"></div>
              <span className="text-gray-400">Unavailable</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
