'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import {
  createAvailability,
  deleteAvailability,
} from '@/lib/actions/availability';

interface AvailabilityEditorProps {
  initialAvailability?: any[];
  onSave?: () => void;
  onCancel?: () => void;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = 8 + i;
  return {
    label:
      hour >= 12
        ? `${hour === 12 ? 12 : hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
        : `${hour}:00 AM`,
    value: `${hour.toString().padStart(2, '0')}:00`,
    hour,
  };
});

export function AvailabilityEditor({
  initialAvailability = [],
  onSave,
  onCancel,
}: AvailabilityEditorProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected slots from existing availability
  useEffect(() => {
    const slots = new Set<string>();
    initialAvailability.forEach(avail => {
      const dayIndex = avail.dayOfWeek - 1; // Convert to 0-based index
      if (dayIndex >= 0 && dayIndex < days.length) {
        const dayName = days[dayIndex];
        const [startHour] = avail.startTime.split(':').map(Number);
        const [endHour] = avail.endTime.split(':').map(Number);

        // Add all hours in the range
        for (let hour = startHour; hour < endHour; hour++) {
          const timeSlot = timeSlots.find(ts => ts.hour === hour);
          if (timeSlot) {
            slots.add(`${dayName}-${timeSlot.value}`);
          }
        }
      }
    });
    setSelectedSlots(slots);
  }, [initialAvailability]);

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
    setError(null);
  };

  const convertSlotsToRanges = (): Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }> => {
    const ranges: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }> = [];

    days.forEach((day, dayIndex) => {
      const daySlots = Array.from(selectedSlots)
        .filter(key => key.startsWith(`${day}-`))
        .map(key => {
          const time = key.split('-')[1];
          const slot = timeSlots.find(ts => ts.value === time);
          return slot ? slot.hour : null;
        })
        .filter((hour): hour is number => hour !== null)
        .sort((a, b) => a - b);

      if (daySlots.length === 0) return;

      // Group consecutive hours into ranges
      let start = daySlots[0];
      for (let i = 1; i < daySlots.length; i++) {
        if (daySlots[i] !== daySlots[i - 1] + 1) {
          // Gap found, save current range
          ranges.push({
            dayOfWeek: dayIndex + 1, // Monday = 1
            startTime: `${start.toString().padStart(2, '0')}:00`,
            endTime: `${(daySlots[i - 1] + 1).toString().padStart(2, '0')}:00`,
          });
          start = daySlots[i];
        }
      }
      // Save last range
      ranges.push({
        dayOfWeek: dayIndex + 1,
        startTime: `${start.toString().padStart(2, '0')}:00`,
        endTime: `${(daySlots[daySlots.length - 1] + 1).toString().padStart(2, '0')}:00`,
      });
    });

    return ranges;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Delete all existing availability first
      if (initialAvailability && initialAvailability.length > 0) {
        for (const avail of initialAvailability) {
          const formData = new FormData();
          formData.append('availabilityId', avail.id);
          const deleteResult = await deleteAvailability(formData);
          if (!deleteResult.success) {
            console.error('Failed to delete availability:', deleteResult.error);
          }
        }
      }

      // Convert selected slots to time ranges
      const ranges = convertSlotsToRanges();

      if (ranges.length === 0) {
        // No slots selected, all availability deleted
        onSave?.();
        return;
      }

      // Create new availability slots
      const formData = new FormData();
      formData.append('slots', JSON.stringify(ranges));
      const result = await createAvailability(formData);

      if (result.success) {
        onSave?.();
      } else {
        setError(result.error || 'Failed to save availability');
      }
    } catch (err) {
      console.error('Failed to save availability:', err);
      setError('Failed to save availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        {/* Modal Content */}
        <div
          className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-indigo-500" />
              <h3 className="text-lg font-bold text-white">
                Edit Weekly Availability
              </h3>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-6 gap-2">
                  {/* Header */}
                  <div className="text-xs text-gray-500 font-medium pt-2">
                    Time
                  </div>
                  {days.map(day => (
                    <div
                      key={day}
                      className="text-xs text-gray-500 font-medium text-center pt-2"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Time slots */}
                  {timeSlots.map(time => (
                    <div key={time.value} className="contents">
                      <div className="text-xs text-gray-400 py-2 flex items-center gap-1">
                        <Clock size={10} />
                        {time.label}
                      </div>
                      {days.map(day => {
                        const key = `${day}-${time.value}`;
                        const isSelected = selectedSlots.has(key);
                        return (
                          <button
                            key={`${day}-${time.value}`}
                            type="button"
                            onClick={() => toggleSlot(day, time.value)}
                            className={`h-7 rounded transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400 shadow-lg shadow-indigo-500/30'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                <span className="text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/5 border border-white/10"></div>
                <span className="text-gray-400">Unavailable</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
