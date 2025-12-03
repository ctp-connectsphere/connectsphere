'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  announcement: z.string().max(1000).optional(),
  zoomLink: z.string().url().optional().or(z.literal('')),
  courseId: z.string().uuid().optional(),
  maxMembers: z.number().min(2).max(20).default(6),
  vibe: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Create a new study group
 */
export async function createGroup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // TypeScript: userId is guaranteed after auth check
  const userId = session.user.id as string;

  try {
    const courseId = formData.get('courseId') as string;
    const tagsStr = formData.get('tags') as string;

    // Parse tags safely
    let tags: string[] | undefined = undefined;
    if (tagsStr && tagsStr.trim()) {
      try {
        const parsed = JSON.parse(tagsStr);
        if (Array.isArray(parsed)) {
          tags = parsed;
        } else if (typeof parsed === 'string') {
          // Handle case where tags is a single string
          tags = [parsed];
        }
      } catch {
        // If JSON parse fails, treat as single tag
        tags = [tagsStr];
      }
    }

    const data = createGroupSchema.parse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      announcement: formData.get('announcement') || undefined,
      zoomLink: formData.get('zoomLink') || undefined,
      courseId:
        courseId && courseId.trim() && courseId !== 'null'
          ? courseId
          : undefined,
      maxMembers: Number(formData.get('maxMembers')) || 6,
      vibe: formData.get('vibe') || undefined,
      tags: tags,
    });

    // Create the group
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        announcement: data.announcement,
        zoomLink: data.zoomLink || null,
        courseId: data.courseId,
        maxMembers: data.maxMembers,
        vibe: data.vibe,
        tags: data.tags || [],
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'Admin',
      },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Group created successfully',
      data: group,
    };
  } catch (error: any) {
    logger.error('Error creating group', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    // Provide more detailed error message
    const errorMessage = error?.message || 'Failed to create group';
    if (error?.code === 'P2003') {
      return {
        success: false,
        error: 'Invalid course ID or course does not exist',
      };
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Join a study group
 */
export async function joinGroup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // TypeScript: userId is guaranteed after auth check
  const userId = session.user.id as string;

  try {
    const groupId = formData.get('groupId') as string;

    if (!groupId) {
      return { success: false, error: 'Group ID is required' };
    }

    // Check if group exists and has space
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    // Check if user is already a member
    const existingMember = group.members.find(m => m.userId === userId);
    if (existingMember) {
      return {
        success: false,
        error: 'You are already a member of this group',
      };
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return { success: false, error: 'Group is full' };
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'Member',
      },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Successfully joined group',
    };
  } catch (error) {
    logger.error('Error joining group', error);
    return {
      success: false,
      error: 'Failed to join group',
    };
  }
}

/**
 * Leave a study group
 */
export async function leaveGroup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // TypeScript: userId is guaranteed after auth check
  const userId = session.user.id as string;

  try {
    const groupId = formData.get('groupId') as string;

    if (!groupId) {
      return { success: false, error: 'Group ID is required' };
    }

    // Remove user from group
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Successfully left group',
    };
  } catch (error) {
    logger.error('Error leaving group', error);
    return {
      success: false,
      error: 'Failed to leave group',
    };
  }
}

/**
 * Get all available study groups
 */
export async function getAllGroups(limit = 20) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id as string;

    const groups = await prisma.group.findMany({
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        members: {
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
          take: 5,
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format groups
    const formattedGroups = groups.map(group => {
      const memberCount = group._count.members;
      const isMember = group.members.some(m => m.userId === userId);
      const isFull = memberCount >= group.maxMembers;
      const spotsLeft = group.maxMembers - memberCount;

      // Get category info
      type BadgeColor =
        | 'indigo'
        | 'purple'
        | 'pink'
        | 'cyan'
        | 'emerald'
        | 'orange'
        | 'blue'
        | 'amber'
        | 'gray';
      type CategoryInfo = { badge: BadgeColor; label: string; emoji: string };

      const getCategoryInfo = (category: string): CategoryInfo => {
        switch (category) {
          case 'skill':
            return { badge: 'cyan', label: 'Code', emoji: '💻' };
          case 'interest':
            return { badge: 'pink', label: 'Interest', emoji: '🎯' };
          case 'subject':
            return { badge: 'pink', label: 'Science', emoji: '⚛️' };
          case 'course':
            return { badge: 'indigo', label: 'Course', emoji: '📚' };
          default:
            return { badge: 'indigo', label: category, emoji: '📚' };
        }
      };

      // Determine category from course or tags
      const category = 'course';
      let categoryInfo: CategoryInfo = getCategoryInfo(category);

      if (group.course?.code) {
        const code = group.course.code.toUpperCase();
        if (
          code.includes('CS') ||
          code.includes('CST') ||
          code.includes('COMP')
        ) {
          categoryInfo = { badge: 'cyan', label: 'Code', emoji: '💻' };
        } else if (code.includes('MATH')) {
          categoryInfo = { badge: 'purple', label: 'Math', emoji: '📐' };
        } else if (code.includes('PHYS')) {
          categoryInfo = { badge: 'orange', label: 'Physics', emoji: '⚛️' };
        }
      }

      const tags = Array.isArray(group.tags) ? group.tags : [];

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        course: group.course,
        code: group.course?.code,
        maxMembers: group.maxMembers,
        memberCount,
        spotsLeft,
        isFull,
        isMember,
        vibe: group.vibe || 'Collaborative',
        tags: tags.length > 0 ? tags : [categoryInfo.label],
        category: categoryInfo.badge,
        categoryLabel: categoryInfo.label,
        categoryEmoji: categoryInfo.emoji,
        members: group.members.map(m => ({
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          profileImageUrl: m.user.profileImageUrl,
          role: m.role,
        })),
        createdAt: group.createdAt,
      };
    });

    return {
      success: true,
      data: {
        groups: formattedGroups,
      },
    };
  } catch (error) {
    logger.error('Error getting groups', error);
    return {
      success: false,
      error: 'Failed to load groups',
      data: {
        groups: [],
      },
    };
  }
}

/**
 * Update a study group
 */
export async function updateGroup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id as string;

  try {
    const groupId = formData.get('groupId') as string;
    const tagsStr = formData.get('tags') as string;

    if (!groupId) {
      return { success: false, error: 'Group ID is required' };
    }

    // Verify group exists and user is admin
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    const userMember = group.members.find(m => m.userId === userId);
    if (!userMember || userMember.role !== 'Admin') {
      return {
        success: false,
        error: 'Only group admins can update the group',
      };
    }

    // Parse update data
    const updateData: any = {};
    if (formData.get('name')) {
      updateData.name = formData.get('name') as string;
    }
    if (formData.get('description') !== null) {
      updateData.description = formData.get('description') as string | null;
    }
    if (formData.get('announcement') !== null) {
      updateData.announcement = formData.get('announcement') as string | null;
    }
    if (formData.get('zoomLink') !== null) {
      const zoomLink = formData.get('zoomLink') as string;
      updateData.zoomLink = zoomLink && zoomLink.trim() ? zoomLink : null;
    }
    if (formData.get('maxMembers')) {
      const maxMembers = Number(formData.get('maxMembers'));
      if (maxMembers >= group.members.length && maxMembers <= 20) {
        updateData.maxMembers = maxMembers;
      }
    }
    if (formData.get('vibe')) {
      updateData.vibe = formData.get('vibe') as string;
    }
    if (tagsStr) {
      updateData.tags = JSON.parse(tagsStr);
    }

    // Update group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        members: {
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

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup,
    };
  } catch (error) {
    logger.error('Error updating group', error);
    return {
      success: false,
      error: 'Failed to update group',
    };
  }
}

/**
 * Delete a study group
 */
export async function deleteGroup(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id as string;

  try {
    const groupId = formData.get('groupId') as string;

    if (!groupId) {
      return { success: false, error: 'Group ID is required' };
    }

    // Verify group exists and user is admin
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });

    if (!group) {
      return { success: false, error: 'Group not found' };
    }

    const userMember = group.members.find(m => m.userId === userId);
    if (!userMember || userMember.role !== 'Admin') {
      return {
        success: false,
        error: 'Only group admins can delete the group',
      };
    }

    // Delete group (cascade will delete members)
    await prisma.group.delete({
      where: { id: groupId },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Group deleted successfully',
    };
  } catch (error) {
    logger.error('Error deleting group', error);
    return {
      success: false,
      error: 'Failed to delete group',
    };
  }
}

/**
 * Get a single group by ID with full details
 */
export async function getGroupById(groupId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id as string;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            section: true,
          },
        },
        members: {
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
        conversations: {
          where: {
            type: 'Group',
          },
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          take: 1,
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      return {
        success: false,
        error: 'Group not found',
      };
    }

    const isMember = group.members.some(m => m.userId === userId);
    const memberCount = group._count.members;
    const isFull = memberCount >= group.maxMembers;

    // Get group conversation
    let conversation = group.conversations[0] || null;
    if (!conversation && isMember) {
      // Create group conversation if member and doesn't exist
      try {
        const newConversation = await prisma.conversation.create({
          data: {
            type: 'Group',
            groupId: group.id,
            participants: {
              create: group.members.map(member => ({
                userId: member.userId,
              })),
            },
          },
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });
        conversation = newConversation as (typeof group.conversations)[0];
      } catch (_error) {
        // If creation fails, try to find it again (race condition)
        const foundConversation = await prisma.conversation.findFirst({
          where: {
            groupId: group.id,
            type: 'Group',
          },
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });
        if (foundConversation) {
          conversation = foundConversation as (typeof group.conversations)[0];
        }
      }
    }

    return {
      success: true,
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        announcement: group.announcement,
        zoomLink: group.zoomLink,
        course: group.course,
        maxMembers: group.maxMembers,
        memberCount,
        isFull,
        isMember,
        vibe: group.vibe || 'Collaborative',
        tags: Array.isArray(group.tags) ? group.tags : [],
        members: group.members.map(m => ({
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          profileImageUrl: m.user.profileImageUrl,
          role: m.role,
        })),
        conversationId: conversation?.id,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    };
  } catch (error) {
    logger.error('Error getting group by ID', error);
    return {
      success: false,
      error: 'Failed to load group',
    };
  }
}

/**
 * Get groups the user is a member of
 */
export async function getUserGroups() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id as string;

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        course: {
          select: {
            name: true,
            code: true,
          },
        },
        members: {
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
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          course: group.course,
          memberCount: group._count.members,
          maxMembers: group.maxMembers,
          members: group.members.map(m => ({
            id: m.user.id,
            name: `${m.user.firstName} ${m.user.lastName}`,
            image: m.user.profileImageUrl,
            role: m.role,
          })),
        })),
      },
    };
  } catch (err) {
    logger.error('Error getting user groups', err);
    return {
      success: false,
      error: 'Failed to load your groups',
      data: {
        groups: [],
      },
    };
  }
}
