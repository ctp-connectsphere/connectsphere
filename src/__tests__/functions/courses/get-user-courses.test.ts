import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before importing
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth/config', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/db/connection', () => ({
    prisma: {
        userCourse: {
            findMany: vi.fn(),
        },
    },
}));

// Import after mocks
import { getUserCourses } from '@/lib/actions/courses';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

const mockSession = {
    user: {
        id: 'user-123',
        email: 'test@university.edu',
    },
};

describe('getUserCourses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(auth).mockResolvedValue(mockSession as any);
    });

    it('should fetch enrolled courses successfully', async () => {
        const mockEnrollments = [
            {
                id: 'enrollment-1',
                userId: 'user-123',
                courseId: 'course-1',
                enrolledAt: new Date(),
                isActive: true,
                course: {
                    id: 'course-1',
                    name: 'CS101',
                    code: 'CS101',
                    section: 'A',
                    semester: 'Fall 2024',
                    instructor: 'Dr. Smith',
                    university: {
                        id: 'university-123',
                        name: 'Test University',
                        domain: 'university.edu',
                    },
                    _count: {
                        userCourses: 10,
                    },
                },
            },
        ];

        vi.mocked(prisma.userCourse.findMany).mockResolvedValue(mockEnrollments as any);

        const result = await getUserCourses();

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(1);
            expect(result.data[0].code).toBe('CS101');
        }
        expect(prisma.userCourse.findMany).toHaveBeenCalledWith({
            where: {
                userId: 'user-123',
                isActive: true,
            },
            include: {
                course: {
                    include: {
                        university: {
                            select: {
                                id: true,
                                name: true,
                                domain: true,
                            },
                        },
                        _count: {
                            select: {
                                userCourses: {
                                    where: {
                                        isActive: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });
    });

    it('should return empty array if no enrollments', async () => {
        vi.mocked(prisma.userCourse.findMany).mockResolvedValue([]);

        const result = await getUserCourses();

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual([]);
        }
    });

    it('should return error if not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue(null);

        const result = await getUserCourses();

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe('Not authenticated');
        }
    });

    it('should return error on database failure', async () => {
        vi.mocked(prisma.userCourse.findMany).mockRejectedValue(
            new Error('Database error')
        );

        const result = await getUserCourses();

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe('Failed to fetch enrolled courses');
        }
    });
});

