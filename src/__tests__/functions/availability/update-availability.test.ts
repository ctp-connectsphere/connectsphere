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
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Import after mocks
import { updateAvailability } from '@/lib/actions/availability';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: '00000000-0000-0000-0000-000000000123',
    email: 'test@university.edu',
  },
};

describe('updateAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should update availability slot successfully', async () => {
    const availabilityId = '00000000-0000-0000-0000-000000000999';
    const existingAvailability = {
      id: availabilityId,
      userId: mockSession.user.id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedAvailability = {
      ...existingAvailability,
      startTime: '10:00',
      endTime: '12:00',
    };

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(existingAvailability as any);
    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);
    vi.mocked(prisma.availability.update).mockResolvedValue(updatedAvailability as any);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);
    formData.append('startTime', '10:00');
    formData.append('endTime', '12:00');

    const result = await updateAvailability(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain('updated successfully');
      expect(result.data.availability).toBeDefined();
    }
    expect(prisma.availability.update).toHaveBeenCalledWith({
      where: { id: availabilityId },
      data: {
        startTime: '10:00',
        endTime: '12:00',
      },
    });
  });

  it('should return error if availability not found', async () => {
    const availabilityId = '00000000-0000-0000-0000-000000000999';

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);

    const result = await updateAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Availability slot not found');
    }
  });

  it('should return error if user does not own the availability', async () => {
    const availabilityId = '00000000-0000-0000-0000-000000000999';
    const existingAvailability = {
      id: availabilityId,
      userId: '00000000-0000-0000-0000-000000000456', // Different user
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(existingAvailability as any);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);

    const result = await updateAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });

  it('should return error if updated time conflicts with existing availability', async () => {
    const availabilityId = '00000000-0000-0000-0000-000000000999';
    const existingAvailability = {
      id: availabilityId,
      userId: mockSession.user.id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conflictingAvailability = [
      {
        id: '00000000-0000-0000-0000-000000000888',
        userId: mockSession.user.id,
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '12:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(existingAvailability as any);
    vi.mocked(prisma.availability.findMany).mockResolvedValue(conflictingAvailability as any);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);
    formData.append('startTime', '10:30');
    formData.append('endTime', '11:30');

    const result = await updateAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('conflicts');
    }
  });

  it('should return error if only one time is provided', async () => {
    const availabilityId = '00000000-0000-0000-0000-000000000999';
    const existingAvailability = {
      id: availabilityId,
      userId: mockSession.user.id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(existingAvailability as any);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);
    formData.append('startTime', '10:00');
    // Missing endTime

    const result = await updateAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Both start time and end time');
    }
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    formData.append('availabilityId', '00000000-0000-0000-0000-000000000999');

    await updateAvailability(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });
});

