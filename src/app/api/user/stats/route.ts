import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user stats
    const [coursesCount, topicsCount, connectionsCount, matchesCount] =
      await Promise.all([
        // Enrolled courses
        prisma.userCourse.count({
          where: {
            userId,
            isActive: true,
          },
        }),
        // User topics
        prisma.userTopic.count({
          where: {
            userId,
          },
        }),
        // Accepted connections
        prisma.connection.count({
          where: {
            OR: [
              { requesterId: userId, status: 'accepted' },
              { targetId: userId, status: 'accepted' },
            ],
          },
        }),
        // Pending matches (users in same courses/topics)
        prisma.userCourse.count({
          where: {
            userId,
            isActive: true,
          },
        }),
      ]);

    return NextResponse.json({
      courses: coursesCount,
      topics: topicsCount,
      connections: connectionsCount,
      matches: matchesCount,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
