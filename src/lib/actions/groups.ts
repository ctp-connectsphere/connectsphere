'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
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

  try {
    const courseId = formData.get('courseId') as string;
    const tagsStr = formData.get('tags') as string;
    
    const data = createGroupSchema.parse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      courseId: courseId && courseId.trim() ? courseId : undefined,
      maxMembers: Number(formData.get('maxMembers')) || 6,
      vibe: formData.get('vibe') || undefined,
      tags: tagsStr ? JSON.parse(tagsStr) : undefined,
    });

    // Create the group
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
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
        userId: session.user.id,
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
    console.error('Error creating group:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: 'Failed to create group',
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
    const existingMember = group.members.find(m => m.userId === session.user.id);
    if (existingMember) {
      return { success: false, error: 'You are already a member of this group' };
    }

    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return { success: false, error: 'Group is full' };
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        groupId,
        userId: session.user.id,
        role: 'Member',
      },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Successfully joined group',
    };
  } catch (error) {
    console.error('Error joining group:', error);
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

  try {
    const groupId = formData.get('groupId') as string;

    if (!groupId) {
      return { success: false, error: 'Group ID is required' };
    }

    // Remove user from group
    await prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId: session.user.id,
      },
    });

    revalidatePath('/groups');
    return {
      success: true,
      message: 'Successfully left group',
    };
  } catch (error) {
    console.error('Error leaving group:', error);
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

    const userId = session.user.id;

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
    const formattedGroups = groups.map((group) => {
      const memberCount = group._count.members;
      const isMember = group.members.some(m => m.userId === userId);
      const isFull = memberCount >= group.maxMembers;
      const spotsLeft = group.maxMembers - memberCount;

      // Get category info
      const getCategoryInfo = (category: string) => {
        switch (category) {
          case 'skill':
            return { badge: 'cyan' as const, label: 'Code', emoji: '💻' };
          case 'interest':
            return { badge: 'pink' as const, label: 'Interest', emoji: '🎯' };
          case 'subject':
            return { badge: 'pink' as const, label: 'Science', emoji: '⚛️' };
          case 'course':
            return { badge: 'indigo' as const, label: 'Course', emoji: '📚' };
          default:
            return { badge: 'indigo' as const, label: category, emoji: '📚' };
        }
      };

      // Determine category from course or tags
      let category = 'course';
      let categoryInfo = getCategoryInfo(category);
      
      if (group.course?.code) {
        const code = group.course.code.toUpperCase();
        if (code.includes('CS') || code.includes('CST') || code.includes('COMP')) {
          categoryInfo = { badge: 'cyan' as const, label: 'Code', emoji: '💻' };
        } else if (code.includes('MATH')) {
          categoryInfo = { badge: 'purple' as const, label: 'Math', emoji: '📐' };
        } else if (code.includes('PHYS')) {
          categoryInfo = { badge: 'orange' as const, label: 'Physics', emoji: '⚛️' };
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
    console.error('Error getting groups:', error);
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
 * Get groups the user is a member of
 */
export async function getUserGroups() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

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
        groups: groups.map((group) => ({
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
  } catch (error) {
    console.error('Error getting user groups:', error);
    return {
      success: false,
      error: 'Failed to load your groups',
      data: {
        groups: [],
      },
    };
  }
}

