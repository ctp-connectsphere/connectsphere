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
      delete: vi.fn(),
    },
  },
}));

// Import after mocks
import { deleteAvailability } from '@/lib/actions/availability';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: '00000000-0000-0000-0000-000000000123',
    email: 'test@university.edu',
  },
};

describe('deleteAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should delete availability slot successfully', async () => {
    const availabilityId = '00000000-0000-4000-8000-000000000999';
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
    vi.mocked(prisma.availability.delete).mockResolvedValue(existingAvailability as any);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);

    const result = await deleteAvailability(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain('deleted successfully');
    }
    expect(prisma.availability.delete).toHaveBeenCalledWith({
      where: { id: availabilityId },
    });
  });

  it('should return error if availability not found', async () => {
    const availabilityId = '00000000-0000-4000-8000-000000000999';

    vi.mocked(prisma.availability.findUnique).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);

    const result = await deleteAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Availability slot not found');
    }
    expect(prisma.availability.delete).not.toHaveBeenCalled();
  });

  it('should return error if user does not own the availability', async () => {
    const availabilityId = '00000000-0000-4000-8000-000000000999';
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

    const result = await deleteAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
    expect(prisma.availability.delete).not.toHaveBeenCalled();
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    formData.append('availabilityId', '00000000-0000-4000-8000-000000000999');

    await deleteAvailability(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should handle database errors gracefully', async () => {
    const availabilityId = '00000000-0000-4000-8000-000000000999';
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
    vi.mocked(prisma.availability.delete).mockRejectedValue(new Error('Database error'));

    const formData = new FormData();
    formData.append('availabilityId', availabilityId);

    const result = await deleteAvailability(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to delete availability');
    }
  });
});

