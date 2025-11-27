'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { logger } from '@/lib/utils/logger';
import {
  createStudySessionSchema,
  updateStudySessionSchema,
  joinStudySessionSchema,
  updateParticipantStatusSchema,
} from '@/lib/validations/study-sessions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Create a new study session
 */
export async function createStudySession(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = createStudySessionSchema.parse({
      courseId: formData.get('courseId') || undefined,
      title: formData.get('title') || undefined,
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime') || undefined,
      location: formData.get('location') || undefined,
    });

    // Validate start time is in the future
    const startTime = new Date(data.startTime);
    if (startTime <= new Date()) {
      return {
        success: false,
        error: 'Start time must be in the future',
      };
    }

    // Validate end time is after start time if provided
    if (data.endTime) {
      const endTime = new Date(data.endTime);
      if (endTime <= startTime) {
        return {
          success: false,
          error: 'End time must be after start time',
        };
      }
    }

    // Verify course exists if provided
    if (data.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: data.courseId },
      });
      if (!course) {
        return {
          success: false,
          error: 'Course not found',
        };
      }
    }

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        organizerId: session.user.id,
        courseId: data.courseId || null,
        title: data.title || null,
        startTime,
        endTime: data.endTime ? new Date(data.endTime) : null,
        location: data.location || null,
        status: 'Proposed',
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        course: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/study-sessions');

    return {
      success: true,
      data: {
        session: studySession,
        message: 'Study session created successfully',
      },
    };
  } catch (error) {
    logger.error('Error creating study session', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to create study session',
    };
  }
}

/**
 * Update a study session
 */
export async function updateStudySession(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = updateStudySessionSchema.parse({
      sessionId: formData.get('sessionId'),
      title: formData.get('title') || undefined,
      startTime: formData.get('startTime') || undefined,
      endTime: formData.get('endTime') || undefined,
      location: formData.get('location') || undefined,
      status: formData.get('status') || undefined,
    });

    // Verify session exists and user is organizer
    const existingSession = await prisma.studySession.findUnique({
      where: { id: data.sessionId },
    });

    if (!existingSession) {
      return {
        success: false,
        error: 'Study session not found',
      };
    }

    if (existingSession.organizerId !== session.user.id) {
      return {
        success: false,
        error: 'Only the organizer can update this session',
      };
    }

    // Validate times if provided
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.startTime) {
      const startTime = new Date(data.startTime);
      if (startTime <= new Date()) {
        return {
          success: false,
          error: 'Start time must be in the future',
        };
      }
      updateData.startTime = startTime;
    }

    if (data.endTime) {
      const endTime = new Date(data.endTime);
      const startTime = updateData.startTime || existingSession.startTime;
      if (endTime <= startTime) {
        return {
          success: false,
          error: 'End time must be after start time',
        };
      }
      updateData.endTime = endTime;
    }

    // Update session
    const updatedSession = await prisma.studySession.update({
      where: { id: data.sessionId },
      data: updateData,
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/study-sessions');

    return {
      success: true,
      data: {
        session: updatedSession,
        message: 'Study session updated successfully',
      },
    };
  } catch (error) {
    logger.error('Error updating study session', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to update study session',
    };
  }
}

/**
 * Delete/Cancel a study session
 */
export async function deleteStudySession(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const sessionId = formData.get('sessionId') as string;
    if (!sessionId) {
      return {
        success: false,
        error: 'Session ID is required',
      };
    }

    // Verify session exists and user is organizer
    const existingSession = await prisma.studySession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      return {
        success: false,
        error: 'Study session not found',
      };
    }

    if (existingSession.organizerId !== session.user.id) {
      return {
        success: false,
        error: 'Only the organizer can cancel this session',
      };
    }

    // Delete session (cascade will delete participants)
    await prisma.studySession.delete({
      where: { id: sessionId },
    });

    revalidatePath('/dashboard');
    revalidatePath('/study-sessions');

    return {
      success: true,
      message: 'Study session cancelled successfully',
    };
  } catch (error) {
    logger.error('Error deleting study session', error);
    return {
      success: false,
      error: 'Failed to cancel study session',
    };
  }
}

/**
 * Join a study session
 */
export async function joinStudySession(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = joinStudySessionSchema.parse({
      sessionId: formData.get('sessionId'),
    });

    // Verify session exists
    const studySession = await prisma.studySession.findUnique({
      where: { id: data.sessionId },
      include: {
        participants: true,
      },
    });

    if (!studySession) {
      return {
        success: false,
        error: 'Study session not found',
      };
    }

    // Check if user is organizer
    if (!session.user?.id) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    if (studySession.organizerId === session.user.id) {
      return {
        success: false,
        error: 'You are already the organizer of this session',
      };
    }

    // Check if already a participant
    const existingParticipant = studySession.participants.find(
      p => p.userId === userId
    );

    if (existingParticipant) {
      return {
        success: false,
        error: 'You are already a participant in this session',
      };
    }

    // Create participant
    await prisma.studySessionParticipant.create({
      data: {
        sessionId: data.sessionId,
        userId: session.user.id,
        status: 'Pending',
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/study-sessions');

    return {
      success: true,
      message: 'Request to join study session sent',
    };
  } catch (error) {
    logger.error('Error joining study session', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to join study session',
    };
  }
}

/**
 * Update participant status (accept/decline/leave)
 */
export async function updateParticipantStatus(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = updateParticipantStatusSchema.parse({
      sessionId: formData.get('sessionId'),
      participantId: formData.get('participantId') || undefined,
      status: formData.get('status'),
    });

    // Verify session exists
    const studySession = await prisma.studySession.findUnique({
      where: { id: data.sessionId },
      include: {
        participants: true,
      },
    });

    if (!studySession) {
      return {
        success: false,
        error: 'Study session not found',
      };
    }

    // Determine which participant to update
    const participantId = data.participantId || session.user?.id;
    if (!participantId) {
      return {
        success: false,
        error: 'User ID not found',
      };
    }
    if (!session.user?.id) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    const isOrganizer = studySession.organizerId === session.user.id;
    const isUpdatingSelf = participantId === session.user.id;

    // Only organizer can update others, users can update themselves
    if (!isOrganizer && !isUpdatingSelf) {
      return {
        success: false,
        error: 'Unauthorized to update this participant',
      };
    }

    // Find participant
    const participant = studySession.participants.find(
      p => p.userId === participantId
    );

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      };
    }

    // Update participant status
    await prisma.studySessionParticipant.update({
      where: { id: participant.id },
      data: {
        status: data.status,
        joinedAt: data.status === 'Accepted' ? new Date() : null,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/study-sessions');

    return {
      success: true,
      message: `Participant status updated to ${data.status}`,
    };
  } catch (error) {
    logger.error('Error updating participant status', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to update participant status',
    };
  }
}

/**
 * Get all study sessions for the current user
 */
export async function getUserStudySessions() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    const sessions = await prisma.studySession.findMany({
      where: {
        OR: [
          { organizerId: userId },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      success: true,
      data: {
        sessions,
      },
    };
  } catch (error) {
    logger.error('Error getting user study sessions', error);
    return {
      success: false,
      error: 'Failed to load study sessions',
      data: {
        sessions: [],
      },
    };
  }
}

