/**
 * Utility functions for availability management
 */

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface TimeSlot {
  startMinutes: number;
  endMinutes: number;
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time slots overlap
 */
export function doSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return (
    (slot1.startMinutes < slot2.endMinutes &&
      slot1.endMinutes > slot2.startMinutes) ||
    (slot2.startMinutes < slot1.endMinutes &&
      slot2.endMinutes > slot1.startMinutes)
  );
}

/**
 * Check if a new availability slot conflicts with existing slots
 */
export function hasConflict(
  newSlot: AvailabilitySlot,
  existingSlots: AvailabilitySlot[]
): boolean {
  const newTimeSlot: TimeSlot = {
    startMinutes: timeToMinutes(newSlot.startTime),
    endMinutes: timeToMinutes(newSlot.endTime),
  };

  return existingSlots.some(existing => {
    if (existing.dayOfWeek !== newSlot.dayOfWeek) {
      return false; // Different days, no conflict
    }

    const existingTimeSlot: TimeSlot = {
      startMinutes: timeToMinutes(existing.startTime),
      endMinutes: timeToMinutes(existing.endTime),
    };

    return doSlotsOverlap(newTimeSlot, existingTimeSlot);
  });
}

/**
 * Find all conflicts between a new set of slots and existing slots
 */
export function findConflicts(
  newSlots: AvailabilitySlot[],
  existingSlots: AvailabilitySlot[]
): Array<{ slot: AvailabilitySlot; conflicts: AvailabilitySlot[] }> {
  const conflicts: Array<{
    slot: AvailabilitySlot;
    conflicts: AvailabilitySlot[];
  }> = [];

  for (const newSlot of newSlots) {
    const conflictingSlots = existingSlots.filter(existing => {
      if (existing.dayOfWeek !== newSlot.dayOfWeek) {
        return false;
      }

      const newTimeSlot: TimeSlot = {
        startMinutes: timeToMinutes(newSlot.startTime),
        endMinutes: timeToMinutes(newSlot.endTime),
      };

      const existingTimeSlot: TimeSlot = {
        startMinutes: timeToMinutes(existing.startTime),
        endMinutes: timeToMinutes(existing.endTime),
      };

      return doSlotsOverlap(newTimeSlot, existingTimeSlot);
    });

    if (conflictingSlots.length > 0) {
      conflicts.push({ slot: newSlot, conflicts: conflictingSlots });
    }
  }

  return conflicts;
}

/**
 * Calculate overlap duration between two time slots in minutes
 */
export function calculateOverlapMinutes(
  slot1: TimeSlot,
  slot2: TimeSlot
): number {
  if (!doSlotsOverlap(slot1, slot2)) {
    return 0;
  }

  const overlapStart = Math.max(slot1.startMinutes, slot2.startMinutes);
  const overlapEnd = Math.min(slot1.endMinutes, slot2.endMinutes);

  return Math.max(0, overlapEnd - overlapStart);
}

/**
 * Calculate overlap between two users' availability for a specific day
 */
export function calculateDayOverlap(
  user1Slots: AvailabilitySlot[],
  user2Slots: AvailabilitySlot[],
  dayOfWeek: number
): number {
  const user1DaySlots = user1Slots.filter(s => s.dayOfWeek === dayOfWeek);
  const user2DaySlots = user2Slots.filter(s => s.dayOfWeek === dayOfWeek);

  if (user1DaySlots.length === 0 || user2DaySlots.length === 0) {
    return 0;
  }

  let totalOverlap = 0;

  for (const slot1 of user1DaySlots) {
    const timeSlot1: TimeSlot = {
      startMinutes: timeToMinutes(slot1.startTime),
      endMinutes: timeToMinutes(slot1.endTime),
    };

    for (const slot2 of user2DaySlots) {
      const timeSlot2: TimeSlot = {
        startMinutes: timeToMinutes(slot2.startTime),
        endMinutes: timeToMinutes(slot2.endTime),
      };

      totalOverlap += calculateOverlapMinutes(timeSlot1, timeSlot2);
    }
  }

  return totalOverlap;
}

/**
 * Calculate total overlap between two users across all days
 */
export function calculateTotalOverlap(
  user1Slots: AvailabilitySlot[],
  user2Slots: AvailabilitySlot[]
): number {
  const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday through Saturday
  let totalOverlap = 0;

  for (const day of days) {
    totalOverlap += calculateDayOverlap(user1Slots, user2Slots, day);
  }

  return totalOverlap;
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: AvailabilitySlot): string {
  const dayName = getDayName(slot.dayOfWeek);
  return `${dayName}: ${slot.startTime} - ${slot.endTime}`;
}
