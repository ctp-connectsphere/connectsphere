import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  doSlotsOverlap,
  hasConflict,
  findConflicts,
  calculateOverlapMinutes,
  calculateDayOverlap,
  calculateTotalOverlap,
  getDayName,
  formatTimeSlot,
  type AvailabilitySlot,
} from '@/lib/utils/availability';

describe('timeToMinutes', () => {
  it('should convert time string to minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('09:00')).toBe(540);
    expect(timeToMinutes('12:30')).toBe(750);
    expect(timeToMinutes('23:59')).toBe(1439);
  });
});

describe('minutesToTime', () => {
  it('should convert minutes to time string', () => {
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(540)).toBe('09:00');
    expect(minutesToTime(750)).toBe('12:30');
    expect(minutesToTime(1439)).toBe('23:59');
  });
});

describe('doSlotsOverlap', () => {
  it('should detect overlapping time slots', () => {
    const slot1 = { startMinutes: 540, endMinutes: 660 }; // 09:00-11:00
    const slot2 = { startMinutes: 600, endMinutes: 720 }; // 10:00-12:00
    expect(doSlotsOverlap(slot1, slot2)).toBe(true);
  });

  it('should detect non-overlapping time slots', () => {
    const slot1 = { startMinutes: 540, endMinutes: 660 }; // 09:00-11:00
    const slot2 = { startMinutes: 720, endMinutes: 840 }; // 12:00-14:00
    expect(doSlotsOverlap(slot1, slot2)).toBe(false);
  });

  it('should detect adjacent slots as non-overlapping', () => {
    const slot1 = { startMinutes: 540, endMinutes: 660 }; // 09:00-11:00
    const slot2 = { startMinutes: 660, endMinutes: 780 }; // 11:00-13:00
    expect(doSlotsOverlap(slot1, slot2)).toBe(false);
  });

  it('should detect contained slots as overlapping', () => {
    const slot1 = { startMinutes: 540, endMinutes: 840 }; // 09:00-14:00
    const slot2 = { startMinutes: 600, endMinutes: 720 }; // 10:00-12:00
    expect(doSlotsOverlap(slot1, slot2)).toBe(true);
  });
});

describe('hasConflict', () => {
  it('should detect conflicts on same day', () => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    };

    const existingSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
      },
    ];

    expect(hasConflict(newSlot, existingSlots)).toBe(true);
  });

  it('should not detect conflicts on different days', () => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '11:00',
    };

    const existingSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '11:00',
      },
    ];

    expect(hasConflict(newSlot, existingSlots)).toBe(false);
  });

  it('should not detect conflicts for non-overlapping times', () => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    };

    const existingSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '12:00',
        endTime: '14:00',
      },
    ];

    expect(hasConflict(newSlot, existingSlots)).toBe(false);
  });
});

describe('findConflicts', () => {
  it('should find all conflicts', () => {
    const newSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
      },
      {
        dayOfWeek: 2,
        startTime: '14:00',
        endTime: '16:00',
      },
    ];

    const existingSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
      },
      {
        dayOfWeek: 2,
        startTime: '15:00',
        endTime: '17:00',
      },
      {
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '16:00',
      },
    ];

    const conflicts = findConflicts(newSlots, existingSlots);

    expect(conflicts).toHaveLength(2);
    expect(conflicts[0].slot.dayOfWeek).toBe(1);
    expect(conflicts[1].slot.dayOfWeek).toBe(2);
  });

  it('should return empty array if no conflicts', () => {
    const newSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
      },
    ];

    const existingSlots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '12:00',
        endTime: '14:00',
      },
    ];

    const conflicts = findConflicts(newSlots, existingSlots);
    expect(conflicts).toHaveLength(0);
  });
});

describe('calculateOverlapMinutes', () => {
  it('should calculate overlap duration', () => {
    const slot1 = { startMinutes: 540, endMinutes: 660 }; // 09:00-11:00
    const slot2 = { startMinutes: 600, endMinutes: 720 }; // 10:00-12:00
    expect(calculateOverlapMinutes(slot1, slot2)).toBe(60); // 1 hour
  });

  it('should return 0 for non-overlapping slots', () => {
    const slot1 = { startMinutes: 540, endMinutes: 660 }; // 09:00-11:00
    const slot2 = { startMinutes: 720, endMinutes: 840 }; // 12:00-14:00
    expect(calculateOverlapMinutes(slot1, slot2)).toBe(0);
  });
});

describe('calculateDayOverlap', () => {
  it('should calculate overlap for a specific day', () => {
    const user1Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
      },
    ];

    const user2Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '13:00',
      },
    ];

    const overlap = calculateDayOverlap(user1Slots, user2Slots, 1);
    expect(overlap).toBe(120); // 2 hours overlap
  });

  it('should return 0 for different days', () => {
    const user1Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
      },
    ];

    const user2Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '12:00',
      },
    ];

    const overlap = calculateDayOverlap(user1Slots, user2Slots, 1);
    expect(overlap).toBe(0);
  });
});

describe('calculateTotalOverlap', () => {
  it('should calculate total overlap across all days', () => {
    const user1Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '12:00',
      },
      {
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '17:00',
      },
    ];

    const user2Slots: AvailabilitySlot[] = [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '13:00',
      },
      {
        dayOfWeek: 3,
        startTime: '15:00',
        endTime: '18:00',
      },
    ];

    const totalOverlap = calculateTotalOverlap(user1Slots, user2Slots);
    expect(totalOverlap).toBe(240); // 2 hours + 2 hours = 4 hours
  });
});

describe('getDayName', () => {
  it('should return correct day names', () => {
    expect(getDayName(0)).toBe('Sunday');
    expect(getDayName(1)).toBe('Monday');
    expect(getDayName(6)).toBe('Saturday');
  });
});

describe('formatTimeSlot', () => {
  it('should format time slot correctly', () => {
    const slot: AvailabilitySlot = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    };

    const formatted = formatTimeSlot(slot);
    expect(formatted).toBe('Monday: 09:00 - 11:00');
  });
});

