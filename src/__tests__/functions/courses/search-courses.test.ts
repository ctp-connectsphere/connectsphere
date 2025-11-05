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
      findMany: vi.fn(),
      count: vi.fn(),
    },
    university: {
      findFirst: vi.fn(),
    },
  },
}));

// Import after mocks
import { searchCourses } from '@/lib/actions/courses';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@university.edu',
  },
};

describe('searchCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
  });

  it('should search courses successfully', async () => {
    const mockUniversity = {
      id: 'university-123',
      name: 'Test University',
      domain: 'university.edu',
    };

    const mockCourses = [
      {
        id: 'course-1',
        name: 'Introduction to Computer Science',
        code: 'CS101',
        section: 'A',
        semester: 'Fall 2024',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        universityId: 'university-123',
        isActive: true,
        university: mockUniversity,
        _count: {
          userCourses: 5,
        },
      },
    ];

    vi.mocked(prisma.university.findFirst).mockResolvedValue(mockUniversity as any);
    vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);
    vi.mocked(prisma.course.count).mockResolvedValue(1);

    const formData = new FormData();
    formData.append('query', 'CS101');

    const result = await searchCourses(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.courses).toHaveLength(1);
      expect(result.data.total).toBe(1);
      expect(result.data.courses[0].code).toBe('CS101');
    }
  });

  it('should filter by semester', async () => {
    const mockUniversity = {
      id: 'university-123',
      name: 'Test University',
      domain: 'university.edu',
    };

    vi.mocked(prisma.university.findFirst).mockResolvedValue(mockUniversity as any);
    vi.mocked(prisma.course.findMany).mockResolvedValue([]);
    vi.mocked(prisma.course.count).mockResolvedValue(0);

    const formData = new FormData();
    formData.append('semester', 'Fall 2024');

    await searchCourses(formData);

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          semester: 'Fall 2024',
        }),
      })
    );
  });

  it('should filter by course code', async () => {
    const mockUniversity = {
      id: 'university-123',
      name: 'Test University',
      domain: 'university.edu',
    };

    vi.mocked(prisma.university.findFirst).mockResolvedValue(mockUniversity as any);
    vi.mocked(prisma.course.findMany).mockResolvedValue([]);
    vi.mocked(prisma.course.count).mockResolvedValue(0);

    const formData = new FormData();
    formData.append('code', 'CS');

    await searchCourses(formData);

    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          code: expect.objectContaining({
            contains: 'CS',
          }),
        }),
      })
    );
  });

  it('should handle pagination', async () => {
    const mockUniversity = {
      id: 'university-123',
      name: 'Test University',
      domain: 'university.edu',
    };

    vi.mocked(prisma.university.findFirst).mockResolvedValue(mockUniversity as any);
    vi.mocked(prisma.course.findMany).mockResolvedValue([]);
    vi.mocked(prisma.course.count).mockResolvedValue(50);

    const formData = new FormData();
    formData.append('limit', '10');
    formData.append('offset', '20');

    const result = await searchCourses(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(result.data.offset).toBe(20);
      expect(result.data.hasMore).toBe(true);
    }
    expect(prisma.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 20,
      })
    );
  });

  it('should redirect if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    await searchCourses(formData);

    expect(redirect).toHaveBeenCalledWith('/login');
  });
});

