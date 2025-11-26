'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import {
  courseSearchSchema,
  enrollCourseSchema,
} from '@/lib/validations/courses';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Search courses
 */
export async function searchCourses(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = courseSearchSchema.parse({
      query: formData.get('query') || undefined,
      semester: formData.get('semester') || undefined,
      code: formData.get('code') || undefined,
      instructor: formData.get('instructor') || undefined,
      universityId: formData.get('universityId') || undefined,
      limit: formData.get('limit') || 20,
      offset: formData.get('offset') || 0,
    });

    // Get user's university from their email domain
    const userEmail = session.user.email || '';
    const emailDomain = userEmail.split('@')[1] || '';

    const userUniversity = await prisma.university.findFirst({
      where: {
        domain: emailDomain,
      },
    });

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (userUniversity) {
      where.universityId = userUniversity.id;
    }

    if (data.universityId) {
      where.universityId = data.universityId;
    }

    if (data.semester) {
      where.semester = data.semester;
    }

    if (data.code) {
      where.code = {
        contains: data.code,
        mode: 'insensitive',
      };
    }

    if (data.instructor) {
      where.instructor = {
        contains: data.instructor,
        mode: 'insensitive',
      };
    }

    if (data.query) {
      where.OR = [
        { name: { contains: data.query, mode: 'insensitive' } },
        { code: { contains: data.query, mode: 'insensitive' } },
        { instructor: { contains: data.query, mode: 'insensitive' } },
      ];
    }

    // Get courses
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
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
        orderBy: [{ code: 'asc' }, { section: 'asc' }],
        take: data.limit,
        skip: data.offset,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      success: true,
      data: {
        courses,
        total,
        limit: data.limit,
        offset: data.offset,
        hasMore: data.offset + data.limit < total,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to search courses',
    };
  }
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = enrollCourseSchema.parse({
      courseId: formData.get('courseId') as string,
    });

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      include: { university: true },
    });

    if (!course) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    if (!course.isActive) {
      return {
        success: false,
        error: 'Course is not active',
      };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: data.courseId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        return {
          success: false,
          error: 'You are already enrolled in this course',
        };
      } else {
        // Reactivate enrollment
        await prisma.userCourse.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            isActive: true,
            enrolledAt: new Date(),
          },
        });

        revalidatePath('/courses');
        revalidatePath('/dashboard');

        return {
          success: true,
          data: {
            message: 'Course enrollment reactivated',
          },
        };
      }
    }

    // Create new enrollment
    const enrollment = await prisma.userCourse.create({
      data: {
        userId: session.user.id,
        courseId: data.courseId,
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

    revalidatePath('/courses');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        enrollment,
        message: 'Successfully enrolled in course',
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to enroll in course',
    };
  }
}

/**
 * Drop a course
 */
export async function dropCourse(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const courseId = formData.get('courseId') as string;
    if (!courseId) {
      return {
        success: false,
        error: 'Course ID is required',
      };
    }

    // Find enrollment
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'You are not enrolled in this course',
      };
    }

    if (!enrollment.isActive) {
      return {
        success: false,
        error: 'Course enrollment is already inactive',
      };
    }

    // Deactivate enrollment (soft delete)
    await prisma.userCourse.update({
      where: {
        id: enrollment.id,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath('/courses');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        message: 'Successfully dropped course',
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to drop course',
    };
  }
}

/**
 * Get user's enrolled courses
 */
export async function getUserCourses() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const enrollments = await prisma.userCourse.findMany({
      where: {
        userId: session.user.id,
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

    return {
      success: true,
      data: enrollments.map(e => e.course),
    };
  } catch {
    return {
      success: false,
      error: 'Failed to fetch enrolled courses',
    };
  }
}

/**
 * Get course details
 */
export async function getCourseDetails(courseId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
    });

    if (!course) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    // Check if user is enrolled
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    return {
      success: true,
      data: {
        course,
        isEnrolled: enrollment?.isActive || false,
      },
    };
  } catch {
    return {
      success: false,
      error: 'Failed to fetch course details',
    };
  }
}
