import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db/connection';

// Mock dependencies before importing
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db/connection', () => ({
  prisma: {
    userProfile: {
      upsert: vi.fn(),
    },
  },
}));

// Import after mocks
import { createOrUpdateProfile } from '@/lib/actions/profile';
import { auth } from '@/lib/auth/config';

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@university.edu',
  },
};

describe('createOrUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should create profile successfully', async () => {
    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      bio: 'Test bio',
      preferredLocation: 'library',
      studyStyle: 'collaborative',
      studyPace: 'moderate',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.userProfile.upsert).mockResolvedValue(mockProfile as any);

    const formData = new FormData();
    formData.append('bio', 'Test bio');
    formData.append('preferredLocation', 'library');
    formData.append('studyStyle', 'collaborative');
    formData.append('studyPace', 'moderate');

    const result = await createOrUpdateProfile(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        bio: 'Test bio',
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate',
      });
    }
    expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      create: {
        userId: 'user-123',
        bio: 'Test bio',
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate',
      },
      update: {
        bio: 'Test bio',
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate',
      },
    });
  });

  it('should handle null values', async () => {
    const mockProfile = {
      id: 'profile-123',
      userId: 'user-123',
      bio: null,
      preferredLocation: null,
      studyStyle: null,
      studyPace: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.userProfile.upsert).mockResolvedValue(mockProfile as any);

    const formData = new FormData();

    const result = await createOrUpdateProfile(formData);

    expect(result.success).toBe(true);
    expect(prisma.userProfile.upsert).toHaveBeenCalled();
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    await createOrUpdateProfile(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('should return error on validation failure', async () => {
    const formData = new FormData();
    formData.append('preferredLocation', 'invalid-location');

    const result = await createOrUpdateProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });

  it('should return error on database failure', async () => {
    vi.mocked(prisma.userProfile.upsert).mockRejectedValue(
      new Error('Database error')
    );

    const formData = new FormData();
    formData.append('bio', 'Test bio');

    const result = await createOrUpdateProfile(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Database error');
    }
  });
});

