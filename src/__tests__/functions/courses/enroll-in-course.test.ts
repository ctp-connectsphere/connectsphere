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
    course: {
      findUnique: vi.fn(),
    },
    userCourse: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Import after mocks
import { enrollInCourse } from '@/lib/actions/courses';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: '00000000-0000-0000-0000-000000000456',
    email: 'test@university.edu',
  },
};

describe('enrollInCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should enroll in course successfully', async () => {
    const courseId = '00000000-0000-0000-0000-000000000123';
    const userId = '00000000-0000-0000-0000-000000000456';
    
    const mockCourse = {
      id: courseId,
      name: 'CS101',
      isActive: true,
      university: {
        id: '00000000-0000-0000-0000-000000000789',
        name: 'Test University',
      },
    };

    const mockEnrollment = {
      id: '00000000-0000-0000-0000-000000000abc',
      userId: userId,
      courseId: courseId,
      isActive: true,
      enrolledAt: new Date(),
      course: mockCourse,
    };

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);
    vi.mocked(prisma.userCourse.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userCourse.create).mockResolvedValue(mockEnrollment as any);

    const formData = new FormData();
    formData.append('courseId', courseId);

    const result = await enrollInCourse(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain('Successfully enrolled');
    }
    expect(prisma.userCourse.create).toHaveBeenCalledWith({
      data: {
        userId: userId,
        courseId: courseId,
        isActive: true,
      },
      include: {
        course: {
          include: {
            university: true,
          },
        },
      },
    });
  });

  it('should return error if course not found', async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('courseId', '00000000-0000-0000-0000-000000000999');

    const result = await enrollInCourse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Course not found');
    }
  });

  it('should return error if course is inactive', async () => {
    const courseId = '00000000-0000-0000-0000-000000000123';
    const mockCourse = {
      id: courseId,
      name: 'CS101',
      isActive: false,
      university: {
        id: '00000000-0000-0000-0000-000000000789',
        name: 'Test University',
      },
    };

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);

    const formData = new FormData();
    formData.append('courseId', courseId);

    const result = await enrollInCourse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Course is not active');
    }
  });

  it('should return error if already enrolled', async () => {
    const courseId = '00000000-0000-0000-0000-000000000123';
    const userId = '00000000-0000-0000-0000-000000000456';
    
    const mockCourse = {
      id: courseId,
      name: 'CS101',
      isActive: true,
      university: {
        id: '00000000-0000-0000-0000-000000000789',
        name: 'Test University',
      },
    };

    const mockEnrollment = {
      id: '00000000-0000-0000-0000-000000000abc',
      userId: userId,
      courseId: courseId,
      isActive: true,
    };

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);
    vi.mocked(prisma.userCourse.findUnique).mockResolvedValue(mockEnrollment as any);

    const formData = new FormData();
    formData.append('courseId', courseId);

    const result = await enrollInCourse(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('You are already enrolled in this course');
    }
  });

  it('should reactivate inactive enrollment', async () => {
    const courseId = '00000000-0000-0000-0000-000000000123';
    const userId = '00000000-0000-0000-0000-000000000456';
    
    const mockCourse = {
      id: courseId,
      name: 'CS101',
      isActive: true,
      university: {
        id: '00000000-0000-0000-0000-000000000789',
        name: 'Test University',
      },
    };

    const mockEnrollment = {
      id: '00000000-0000-0000-0000-000000000abc',
      userId: userId,
      courseId: courseId,
      isActive: false,
    };

    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);
    vi.mocked(prisma.userCourse.findUnique).mockResolvedValue(mockEnrollment as any);
    vi.mocked(prisma.userCourse.update).mockResolvedValue({
      ...mockEnrollment,
      isActive: true,
    } as any);

    const formData = new FormData();
    formData.append('courseId', courseId);

    const result = await enrollInCourse(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain('reactivated');
    }
    expect(prisma.userCourse.update).toHaveBeenCalled();
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    formData.append('courseId', '00000000-0000-0000-0000-000000000123');

    await enrollInCourse(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });
});

