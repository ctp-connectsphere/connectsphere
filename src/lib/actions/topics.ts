'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const topicSearchSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['skill', 'interest', 'subject', 'course']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const addUserTopicSchema = z.object({
  topicId: z.string().uuid(),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  interest: z.enum(['high', 'medium', 'low']).optional(),
});

const removeUserTopicSchema = z.object({
  topicId: z.string().uuid(),
});

/**
 * Search topics
 */
export async function searchTopics(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = topicSearchSchema.parse({
      query: formData.get('query') || undefined,
      category: formData.get('category') || undefined,
      limit: Number(formData.get('limit')) || 20,
      offset: Number(formData.get('offset')) || 0,
    });

    const where: any = {
      isActive: true,
    };

    if (data.category) {
      where.category = data.category;
    }

    if (data.query) {
      where.OR = [
        { name: { contains: data.query, mode: 'insensitive' } },
        { description: { contains: data.query, mode: 'insensitive' } },
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        take: data.limit,
        skip: data.offset,
        orderBy: { name: 'asc' },
      }),
      prisma.topic.count({ where }),
    ]);

    return {
      success: true,
      data: {
        topics,
        total,
        limit: data.limit,
        offset: data.offset,
      },
    };
  } catch (error) {
    console.error('Error searching topics:', error);
    return {
      success: false,
      error: 'Failed to search topics',
    };
  }
}

/**
 * Add a topic to user's profile
 */
export async function addUserTopic(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = addUserTopicSchema.parse({
      topicId: formData.get('topicId') as string,
      proficiency: formData.get('proficiency') || undefined,
      interest: formData.get('interest') || undefined,
    });

    // Check if topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
    });

    if (!topic) {
      return {
        success: false,
        error: 'Topic not found',
      };
    }

    if (!topic.isActive) {
      return {
        success: false,
        error: 'Topic is not active',
      };
    }

    // Check if already added
    const existing = await prisma.userTopic.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: data.topicId,
        },
      },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.userTopic.update({
        where: {
          id: existing.id,
        },
        data: {
          proficiency: data.proficiency || existing.proficiency,
          interest: data.interest || existing.interest,
        },
        include: {
          topic: true,
        },
      });

      revalidatePath('/profile');
      revalidatePath('/dashboard');

      return {
        success: true,
        data: {
          message: 'Topic updated',
          userTopic: updated,
        },
      };
    }

    // Create new
    const userTopic = await prisma.userTopic.create({
      data: {
        userId: session.user.id,
        topicId: data.topicId,
        proficiency: data.proficiency,
        interest: data.interest,
      },
      include: {
        topic: true,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        message: 'Topic added',
        userTopic,
      },
    };
  } catch (error) {
    console.error('Error adding topic:', error);
    return {
      success: false,
      error: 'Failed to add topic',
    };
  }
}

/**
 * Remove a topic from user's profile
 */
export async function removeUserTopic(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = removeUserTopicSchema.parse({
      topicId: formData.get('topicId') as string,
    });

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
        error: 'Topic not found in your profile',
      };
    }

    await prisma.userTopic.delete({
      where: {
        id: userTopic.id,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        message: 'Topic removed',
      },
    };
  } catch (error) {
    console.error('Error removing topic:', error);
    return {
      success: false,
      error: 'Failed to remove topic',
    };
  }
}

/**
 * Update user topic (proficiency/interest)
 */
export async function updateUserTopic(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const topicId = formData.get('topicId') as string;
    const proficiency = formData.get('proficiency') as string | null;
    const interest = formData.get('interest') as string | null;

    if (!topicId) {
      return {
        success: false,
        error: 'Topic ID is required',
      };
    }

    // Verify user topic exists
    const userTopic = await prisma.userTopic.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
        },
      },
      include: {
        topic: true,
      },
    });

    if (!userTopic) {
      return {
        success: false,
        error: 'Topic not found in your profile',
      };
    }

    // Validate proficiency and interest based on topic category
    if (userTopic.topic.category === 'skill' && proficiency) {
      if (!['beginner', 'intermediate', 'advanced'].includes(proficiency)) {
        return {
          success: false,
          error: 'Invalid proficiency level',
        };
      }
    }

    if (userTopic.topic.category === 'interest' && interest) {
      if (!['high', 'medium', 'low'].includes(interest)) {
        return {
          success: false,
          error: 'Invalid interest level',
        };
      }
    }

    // Update user topic
    const updated = await prisma.userTopic.update({
      where: {
        id: userTopic.id,
      },
      data: {
        proficiency: proficiency || userTopic.proficiency,
        interest: interest || userTopic.interest,
      },
      include: {
        topic: true,
      },
    });

    revalidatePath('/topics');
    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        userTopic: updated,
        message: 'Topic updated successfully',
      },
    };
  } catch (error) {
    logger.error('Error updating topic:', error);
    return {
      success: false,
      error: 'Failed to update topic',
    };
  }
}

/**
 * Get user's topics
 */
export async function getUserTopics() {
  // Declare session outside try-catch to reuse in error handling
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const userTopics = await prisma.userTopic.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        topic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        userTopics,
      },
    };
  } catch (error: unknown) {
    // Handle case where user_topics table doesn't exist yet
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2021'
    ) {
      // Table doesn't exist - return empty array instead of error
      logger.warn(
        'user_topics table does not exist yet. Run: npx tsx scripts/create-user-topics-table.ts',
        {
          userId: session.user.id,
        }
      );
      return {
        success: true,
        data: {
          userTopics: [],
        },
      };
    }

    logger.error('Error getting user topics', error, {
      userId: session.user.id,
    });
    return {
      success: false,
      error: 'Failed to get user topics',
    };
  }
}
