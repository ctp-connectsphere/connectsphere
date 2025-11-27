import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { logger } from '@/lib/utils/logger';
import { NextResponse } from 'next/server';

export async function GET() {
  let session;
  try {
    session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await prisma.userCourse.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        course: {
          include: {
            university: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json({
      courses: enrollments,
    });
  } catch (error) {
    logger.error('Error fetching user courses', error, {
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
