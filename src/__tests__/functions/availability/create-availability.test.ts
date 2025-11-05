import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connection', () => ({
  prisma: {
    availability: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

// Import after mocks
import { createAvailability } from '@/lib/actions/availability';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: '00000000-0000-0000-0000-000000000123',
    email: 'test@university.edu',
  },
};

describe('createAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should create availability slots successfully', async () => {
    const mockSlots = [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '16:00',
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);
    vi.mocked(prisma.availability.createMany).mockResolvedValue({
      count: 2,
    } as any);

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    const result = await createAvailability(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain('Successfully created');
      expect(result.data.count).toBe(2);
    }
    expect(prisma.availability.createMany).toHaveBeenCalledWith({
      data: [
        {
          userId: mockSession.user.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '11:00',
        },
        {
          userId: mockSession.user.id,
          dayOfWeek: 3,
          startTime: '14:00',
          endTime: '16:00',
        },
      ],
    });
  });

  it('should return error if slots conflict with existing availability', async () => {
    const mockSlots = [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '11:00',
      },
    ];

    const existingAvailability = [
      {
        id: '00000000-0000-0000-0000-000000000999',
        userId: mockSession.user.id,
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue(existingAvailability as any);

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Time conflicts detected');
      expect(result.conflicts).toBeDefined();
    }
    expect(prisma.availability.createMany).not.toHaveBeenCalled();
  });

  it('should return error if no slots provided', async () => {
    const formData = new FormData();
    // Don't add slots

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid slots data');
    }
  });

  it('should return error if slots array is empty', async () => {
    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);

    const formData = new FormData();
    formData.append('slots', JSON.stringify([]));

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('At least one time slot is required');
    }
  });

  it('should return error if invalid time format', async () => {
    const mockSlots = [
      {
        dayOfWeek: 1,
        startTime: '9:00', // Invalid format (should be HH:MM)
        endTime: '11:00',
      },
    ];

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('format');
    }
  });

  it('should return error if end time is before start time', async () => {
    const mockSlots = [
      {
        dayOfWeek: 1,
        startTime: '11:00',
        endTime: '09:00', // End before start
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('End time must be after start time');
    }
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const mockSlots = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
      },
    ];

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    await createAvailability(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should handle database errors gracefully', async () => {
    const mockSlots = [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);
    vi.mocked(prisma.availability.createMany).mockRejectedValue(new Error('Database error'));

    const formData = new FormData();
    formData.append('slots', JSON.stringify(mockSlots));

    const result = await createAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to create availability');
    }
  });
});

