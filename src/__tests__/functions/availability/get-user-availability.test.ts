import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing
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
    },
  },
}));

// Import after mocks
import { getUserAvailability, getUserAvailabilityById } from '@/lib/actions/availability';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: '00000000-0000-0000-0000-000000000123',
    email: 'test@university.edu',
  },
};

describe('getUserAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should fetch availability slots successfully', async () => {
    const mockAvailability = [
      {
        id: '00000000-0000-0000-0000-000000000999',
        userId: mockSession.user.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '00000000-0000-0000-0000-000000000888',
        userId: mockSession.user.id,
        dayOfWeek: 3,
        startTime: '14:00',
        endTime: '16:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue(mockAvailability as any);

    const result = await getUserAvailability();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0].dayOfWeek).toBe(1);
      expect(result.data[1].dayOfWeek).toBe(3);
    }
    expect(prisma.availability.findMany).toHaveBeenCalledWith({
      where: {
        userId: mockSession.user.id,
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  });

  it('should return empty array if no availability', async () => {
    vi.mocked(prisma.availability.findMany).mockResolvedValue([]);

    const result = await getUserAvailability();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });

  it('should return error if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await getUserAvailability();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });

  it('should return error on database failure', async () => {
    vi.mocked(prisma.availability.findMany).mockRejectedValue(new Error('Database error'));

    const result = await getUserAvailability();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to fetch availability');
    }
  });
});

describe('getUserAvailabilityById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should fetch availability for specific user', async () => {
    const targetUserId = '00000000-0000-0000-0000-000000000456';
    const mockAvailability = [
      {
        id: '00000000-0000-0000-0000-000000000999',
        userId: targetUserId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '11:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(prisma.availability.findMany).mockResolvedValue(mockAvailability as any);

    const result = await getUserAvailabilityById(targetUserId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe(targetUserId);
    }
    expect(prisma.availability.findMany).toHaveBeenCalledWith({
      where: {
        userId: targetUserId,
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  });

  it('should return error if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await getUserAvailabilityById('00000000-0000-0000-0000-000000000456');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(prisma.availability.findMany).mockRejectedValue(new Error('Database error'));

    const result = await getUserAvailabilityById('00000000-0000-0000-0000-000000000456');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to fetch user availability');
    }
  });
});

