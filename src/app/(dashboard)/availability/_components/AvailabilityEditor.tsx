'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  deleteAvailability,
  createAvailability,
} from '@/lib/actions/availability';
import { toast } from 'sonner';

// Generate time options (e.g., 08:00, 08:30, ...)
const timeOptions = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type AvailabilitySlot = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type AvailabilityEditorProps = {
  initialAvailability: AvailabilitySlot[];
  onClose: () => void;
  onSave: () => void;
};

export function AvailabilityEditor({
  initialAvailability,
  onClose,
  onSave,
}: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sort initial availability for consistent display
    const sortedAvailability = [...initialAvailability].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
    setSlots(sortedAvailability);
  }, [initialAvailability]);

  const addSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '10:00',
    };
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Delete all existing slots
      const deletePromises = initialAvailability.map(slot => {
        if (slot.id) {
          const formData = new FormData();
          formData.append('availabilityId', slot.id);
          return deleteAvailability(formData);
        }
        return Promise.resolve({ success: true });
      });
      await Promise.all(deletePromises);

      // Step 2: Create new slots
      if (slots.length > 0) {
        const newSlots = slots.map(({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime,
          endTime,
        }));
        const createFormData = new FormData();
        createFormData.append('slots', JSON.stringify(newSlots));
        const result = await createAvailability(createFormData);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create new slots.');
        }
      }

      toast.success('Availability updated successfully!');
      onSave(); // This will trigger a data reload on the parent page
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
      toast.error(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-bold text-white">Edit Availability</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {dayNames.map((day, dayIndex) => (
          <div key={dayIndex}>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-semibold text-gray-300">{day}</h5>
              <button
                onClick={() => addSlot(dayIndex + 1)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {slots
                .map((slot, index) => ({ slot, originalIndex: index }))
                .filter(({ slot }) => slot.dayOfWeek === dayIndex + 1)
                .map(({ slot, originalIndex }) => (
                  <div
                    key={originalIndex}
                    className="flex items-center gap-2 p-2 bg-[#0c0c0c] rounded-lg"
                  >
                    <select
                      value={slot.startTime}
                      onChange={e =>
                        updateSlot(originalIndex, 'startTime', e.target.value)
                      }
                      className="bg-transparent text-white text-sm focus:outline-none w-full"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">-</span>
                    <select
                      value={slot.endTime}
                      onChange={e =>
                        updateSlot(originalIndex, 'endTime', e.target.value)
                      }
                      className="bg-transparent text-white text-sm focus:outline-none w-full"
                    >
                      {timeOptions.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeSlot(originalIndex)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              {slots.filter(s => s.dayOfWeek === dayIndex + 1).length === 0 && (
                <div className="text-center py-2 text-xs text-gray-600">
                  No slots scheduled.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold text-gray-300 bg-transparent rounded-lg hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
