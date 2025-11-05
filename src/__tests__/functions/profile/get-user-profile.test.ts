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
    userProfile: {
      findUnique: vi.fn(),
    },
  },
}));

// Import after mocks
import { getUserProfile } from '@/lib/actions/profile';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@university.edu',
  },
};

describe('getUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should fetch profile successfully', async () => {
    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      bio: 'Test bio',
      preferredLocation: 'library',
      studyStyle: 'collaborative',
      studyPace: 'moderate',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-123',
        email: 'test@university.edu',
        firstName: 'John',
        lastName: 'Doe',
        university: 'Test University',
        profileImageUrl: null,
      },
    };

    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(
      mockProfile as any
    );

    const result = await getUserProfile();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        bio: 'Test bio',
        preferredLocation: 'library',
        user: {
          email: 'test@university.edu',
          firstName: 'John',
        },
      });
    }
    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            university: true,
            profileImageUrl: true,
          },
        },
      },
    });
  });

  it('should return error if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await getUserProfile();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Not authenticated');
    }
  });

  it('should return null data if profile does not exist', async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

    const result = await getUserProfile();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('should return error on database failure', async () => {
    vi.mocked(prisma.userProfile.findUnique).mockRejectedValue(
      new Error('Database error')
    );

    const result = await getUserProfile();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Failed to fetch profile');
    }
  });
});

