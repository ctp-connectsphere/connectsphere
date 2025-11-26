'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const findMatchesSchema = z
  .object({
    courseId: z.string().uuid().optional(),
    topicId: z.string().uuid().optional(),
    limit: z.number().min(1).max(10).default(10), // Limit to 10 matches per person
  })
  .refine(data => data.courseId || data.topicId, {
    message: 'Either courseId or topicId must be provided',
  });

/**
 * Find matches for a course or topic
 * Supports both course-based and topic-based matching
 */
export async function findMatches(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const data = findMatchesSchema.parse({
      courseId: formData.get('courseId') || undefined,
      topicId: formData.get('topicId') || undefined,
      limit: Number(formData.get('limit')) || 10, // Default to 10 matches
    });

    // If matching by course, verify enrollment
    if (data.courseId) {
      const userEnrollment = await prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: data.courseId,
          },
        },
      });

      if (!userEnrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
        };
      }
    }

    // If matching by topic, verify user has the topic
    if (data.topicId) {
      const userTopic = await prisma.userTopic.findUnique({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId: data.topicId,
          },
        },
      });

      if (!userTopic) {
        return {
          success: false,
          message: 'You do not have this topic selected',
        };
      }
    }

    // Build the matching query based on course or topic
    let matches;

    if (data.courseId) {
      // Course-based matching
      matches = await prisma.$queryRaw`
        WITH user_course_mates AS (
          SELECT uc2.user_id
          FROM user_courses uc1
          JOIN user_courses uc2 ON uc1.course_id = uc2.course_id
          WHERE uc1.user_id = ${session.user.id}::uuid
            AND uc1.course_id = ${data.courseId}::uuid
            AND uc2.user_id != ${session.user.id}::uuid
            AND uc2.is_active = TRUE
        ),
        availability_overlaps AS (
          SELECT 
            ucm.user_id,
            COUNT(*) as overlap_count,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'day', a1.day_of_week,
                'start', a1.start_time,
                'end', a1.end_time
              )
            ) as common_slots
          FROM user_course_mates ucm
          JOIN availability a1 ON ucm.user_id = a1.user_id
          JOIN availability a2 ON a1.day_of_week = a2.day_of_week
          WHERE a2.user_id = ${session.user.id}::uuid
            AND a1.start_time < a2.end_time
            AND a1.end_time > a2.start_time
          GROUP BY ucm.user_id
        )
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          up.preferred_location,
          up.study_style,
          up.study_pace,
          up.bio,
          COALESCE(ao.overlap_count, 0) as availability_score,
          COALESCE(ao.common_slots, '{}') as common_availability,
          CASE 
            WHEN c.id IS NOT NULL THEN 'connected'
            WHEN c2.id IS NOT NULL THEN 'pending'
            ELSE 'none'
          END as connection_status,
          'course' as match_type,
          ${data.courseId}::uuid as match_context_id
        FROM user_course_mates ucm
        JOIN users u ON ucm.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN availability_overlaps ao ON u.id = ao.user_id
        LEFT JOIN connections c ON (
          (c.requester_id = ${session.user.id}::uuid AND c.target_id = u.id AND c.course_id = ${data.courseId}::uuid AND c.status = 'accepted') OR
          (c.target_id = ${session.user.id}::uuid AND c.requester_id = u.id AND c.course_id = ${data.courseId}::uuid AND c.status = 'accepted')
        )
        LEFT JOIN connections c2 ON (
          (c2.requester_id = ${session.user.id}::uuid AND c2.target_id = u.id AND c2.course_id = ${data.courseId}::uuid AND c2.status = 'pending') OR
          (c2.target_id = ${session.user.id}::uuid AND c2.requester_id = u.id AND c2.course_id = ${data.courseId}::uuid AND c2.status = 'pending')
        )
        WHERE u.is_active = TRUE
          AND u.is_verified = TRUE
        ORDER BY availability_score DESC, u.created_at ASC
        LIMIT ${data.limit}
      `;
    } else if (data.topicId) {
      // Topic-based matching
      matches = await prisma.$queryRaw`
        WITH user_topic_mates AS (
          SELECT ut2.user_id
          FROM user_topics ut1
          JOIN user_topics ut2 ON ut1.topic_id = ut2.topic_id
          WHERE ut1.user_id = ${session.user.id}::uuid
            AND ut1.topic_id = ${data.topicId}::uuid
            AND ut2.user_id != ${session.user.id}::uuid
        ),
        availability_overlaps AS (
          SELECT 
            utm.user_id,
            COUNT(*) as overlap_count,
            ARRAY_AGG(
              JSON_BUILD_OBJECT(
                'day', a1.day_of_week,
                'start', a1.start_time,
                'end', a1.end_time
              )
            ) as common_slots
          FROM user_topic_mates utm
          JOIN availability a1 ON utm.user_id = a1.user_id
          JOIN availability a2 ON a1.day_of_week = a2.day_of_week
          WHERE a2.user_id = ${session.user.id}::uuid
            AND a1.start_time < a2.end_time
            AND a1.end_time > a2.start_time
          GROUP BY utm.user_id
        )
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          up.preferred_location,
          up.study_style,
          up.study_pace,
          up.bio,
          COALESCE(ao.overlap_count, 0) as availability_score,
          COALESCE(ao.common_slots, '{}') as common_availability,
          CASE 
            WHEN c.id IS NOT NULL THEN 'connected'
            WHEN c2.id IS NOT NULL THEN 'pending'
            ELSE 'none'
          END as connection_status,
          'topic' as match_type,
          ${data.topicId}::uuid as match_context_id
        FROM user_topic_mates utm
        JOIN users u ON utm.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN availability_overlaps ao ON u.id = ao.user_id
        LEFT JOIN connections c ON (
          (c.requester_id = ${session.user.id}::uuid AND c.target_id = u.id AND c.topic_id = ${data.topicId}::uuid AND c.status = 'accepted') OR
          (c.target_id = ${session.user.id}::uuid AND c.requester_id = u.id AND c.topic_id = ${data.topicId}::uuid AND c.status = 'accepted')
        )
        LEFT JOIN connections c2 ON (
          (c2.requester_id = ${session.user.id}::uuid AND c2.target_id = u.id AND c2.topic_id = ${data.topicId}::uuid AND c2.status = 'pending') OR
          (c2.target_id = ${session.user.id}::uuid AND c2.requester_id = u.id AND c2.topic_id = ${data.topicId}::uuid AND c2.status = 'pending')
        )
        WHERE u.is_active = TRUE
          AND u.is_verified = TRUE
        ORDER BY availability_score DESC, u.created_at ASC
        LIMIT ${data.limit}
      `;
    } else {
      return {
        success: false,
        message: 'Either courseId or topicId must be provided',
      };
    }

    return { success: true, matches };
  } catch (error) {
    console.error('Error finding matches:', error);
    return { success: false, message: 'Failed to find matches' };
  }
}

/**
 * Send a connection request to a user
 */
export async function sendConnectionRequest(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const targetId = formData.get('targetId') as string;
    const courseId = formData.get('courseId') as string | null;
    const topicId = formData.get('topicId') as string | null;

    if (!targetId) {
      return { success: false, message: 'Target user ID is required' };
    }

    if (targetId === session.user.id) {
      return {
        success: false,
        message: 'Cannot send connection request to yourself',
      };
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          {
            requesterId: session.user.id,
            targetId,
            ...(courseId && { courseId }),
            ...(topicId && { topicId }),
          },
          {
            requesterId: targetId,
            targetId: session.user.id,
            ...(courseId && { courseId }),
            ...(topicId && { topicId }),
          },
        ],
      },
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return { success: false, message: 'Already connected with this user' };
      }
      if (existingConnection.status === 'pending') {
        return {
          success: false,
          message: 'Connection request already pending',
        };
      }
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requesterId: session.user.id,
        targetId,
        ...(courseId && { courseId }),
        ...(topicId && { topicId }),
        status: 'pending',
      },
    });

    revalidatePath('/matches');
    revalidatePath('/connections');

    return {
      success: true,
      message: 'Connection request sent',
      data: connection,
    };
  } catch (error) {
    console.error('Error sending connection request:', error);
    return { success: false, message: 'Failed to send connection request' };
  }
}

/**
 * Accept a connection request
 */
export async function acceptConnectionRequest(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const connectionId = formData.get('connectionId') as string;

    if (!connectionId) {
      return { success: false, message: 'Connection ID is required' };
    }

    // Verify the connection exists and user is the target
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return { success: false, message: 'Connection not found' };
    }

    if (connection.targetId !== session.user.id) {
      return {
        success: false,
        message: 'Unauthorized to accept this connection',
      };
    }

    if (connection.status !== 'pending') {
      return { success: false, message: 'Connection request is not pending' };
    }

    // Update connection status
    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' },
    });

    revalidatePath('/connections');
    revalidatePath('/matches');

    return {
      success: true,
      message: 'Connection request accepted',
    };
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return { success: false, message: 'Failed to accept connection request' };
  }
}

/**
 * Decline a connection request
 */
export async function declineConnectionRequest(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const connectionId = formData.get('connectionId') as string;

    if (!connectionId) {
      return { success: false, message: 'Connection ID is required' };
    }

    // Verify the connection exists and user is the target
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return { success: false, message: 'Connection not found' };
    }

    if (connection.targetId !== session.user.id) {
      return {
        success: false,
        message: 'Unauthorized to decline this connection',
      };
    }

    // Delete the connection request
    await prisma.connection.delete({
      where: { id: connectionId },
    });

    revalidatePath('/connections');
    revalidatePath('/matches');

    return {
      success: true,
      message: 'Connection request declined',
    };
  } catch (error) {
    console.error('Error declining connection request:', error);
    return { success: false, message: 'Failed to decline connection request' };
  }
}

/**
 * Get all connections for the current user
 */
export async function getUserConnections() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const userId = session.user.id;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'accepted' },
          { targetId: userId, status: 'accepted' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format connections
    const formattedConnections = connections.map(conn => {
      const otherUser =
        conn.requesterId === userId ? conn.target : conn.requester;
      const matchContext =
        conn.course?.name || conn.topic?.name || 'Study Partner';
      const lastMessage = conn.messages[0];

      return {
        id: conn.id,
        userId: otherUser.id,
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        email: otherUser.email,
        profileImageUrl: otherUser.profileImageUrl,
        matchContext,
        matchType: conn.course ? 'course' : 'topic',
        lastMessage: lastMessage?.content || null,
        lastMessageTime: lastMessage?.createdAt || conn.updatedAt,
      };
    });

    return {
      success: true,
      data: {
        connections: formattedConnections,
      },
    };
  } catch (error) {
    console.error('Error getting user connections:', error);
    return {
      success: false,
      message: 'Failed to load connections',
      data: { connections: [] },
    };
  }
}

/**
 * Get pending connection requests (received)
 */
export async function getPendingConnectionRequests() {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const userId = session.user.id;

    const requests = await prisma.connection.findMany({
      where: {
        targetId: userId,
        status: 'pending',
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true,
          },
        },
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        topic: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        requests: requests.map(req => ({
          id: req.id,
          requester: {
            id: req.requester.id,
            name: `${req.requester.firstName} ${req.requester.lastName}`,
            email: req.requester.email,
            profileImageUrl: req.requester.profileImageUrl,
          },
          matchContext: req.course?.name || req.topic?.name || 'Study Partner',
          matchType: req.course ? 'course' : 'topic',
          createdAt: req.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting pending connection requests:', error);
    return {
      success: false,
      message: 'Failed to load connection requests',
      data: { requests: [] },
    };
  }
}
