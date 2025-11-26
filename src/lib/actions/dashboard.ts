'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { redirect } from 'next/navigation';

/**
 * Get user dashboard stats
 */
export async function getDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    const [coursesCount, topicsCount, connectionsCount, matchesCount] =
      await Promise.all([
        prisma.userCourse.count({
          where: {
            userId,
            isActive: true,
          },
        }),
        prisma.userTopic.count({
          where: {
            userId,
          },
        }),
        prisma.connection.count({
          where: {
            OR: [
              { requesterId: userId, status: 'accepted' },
              { targetId: userId, status: 'accepted' },
            ],
          },
        }),
        // Count potential matches (users with shared topics/courses)
        prisma.user.count({
          where: {
            AND: [
              { id: { not: userId } },
              { isActive: true },
              { isVerified: true },
              {
                OR: [
                  {
                    userTopics: {
                      some: {
                        topic: {
                          userTopics: {
                            some: {
                              userId,
                            },
                          },
                        },
                      },
                    },
                  },
                  {
                    userCourses: {
                      some: {
                        course: {
                          userCourses: {
                            some: {
                              userId,
                              isActive: true,
                            },
                          },
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        }),
      ]);

    return {
      success: true,
      data: {
        courses: coursesCount,
        topics: topicsCount,
        connections: connectionsCount,
        matches: matchesCount,
      },
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to load dashboard stats',
    };
  }
}

/**
 * Get recommended peers (top matches)
 */
export async function getRecommendedPeers(limit = 5) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Get user's topics
    const userTopics = await prisma.userTopic.findMany({
      where: { userId },
      include: { topic: true },
    });

    if (userTopics.length === 0) {
      return {
        success: true,
        data: {
          peers: [],
        },
      };
    }

    // Find users with matching topics
    const topicIds = userTopics.map(ut => ut.topicId);

    const matchingUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isActive: true },
          { isVerified: true },
          {
            userTopics: {
              some: {
                topicId: { in: topicIds },
              },
            },
          },
        ],
      },
      include: {
        profile: true,
        userTopics: {
          include: {
            topic: true,
          },
          take: 3,
        },
      },
      take: limit,
    });

    // Calculate match scores
    const peers = matchingUsers.map(user => {
      const commonTopics = user.userTopics.filter(ut =>
        topicIds.includes(ut.topicId)
      );
      const matchScore = Math.min(98, 60 + commonTopics.length * 10);

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        bio: user.profile?.bio,
        studyStyle: user.profile?.studyStyle,
        matchScore,
        commonTopics: commonTopics.map(ut => ut.topic.name),
      };
    });

    return {
      success: true,
      data: {
        peers: peers.sort((a, b) => b.matchScore - a.matchScore),
      },
    };
  } catch (error) {
    console.error('Error getting recommended peers:', error);
    return {
      success: false,
      error: 'Failed to load recommended peers',
    };
  }
}

/**
 * Get active connections/groups
 */
export async function getActiveGroups(limit = 4) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Get accepted connections where user is involved
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
          },
        },
        target: {
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
        topic: {
          select: {
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
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // Format groups
    const groups = connections.map(conn => {
      const otherUser =
        conn.requesterId === userId ? conn.target : conn.requester;
      const groupName =
        conn.course?.name || conn.topic?.name || 'Study Session';
      const category =
        conn.topic?.category || (conn.course ? 'course' : 'topic');
      const lastMessage = conn.messages[0];
      const lastActive = lastMessage?.createdAt || conn.updatedAt;
      const now = new Date();
      const diffMs = now.getTime() - lastActive.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let lastActiveText = 'Just now';
      if (diffMins < 1) {
        lastActiveText = 'Just now';
      } else if (diffMins < 60) {
        lastActiveText = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        lastActiveText = `${diffHours}h ago`;
      } else {
        lastActiveText = `${diffDays}d ago`;
      }

      // Count members (2 for now, but could be expanded for groups)
      const memberCount = 2;

      // Get category badge color and label
      const getCategoryInfo = (cat: string) => {
        switch (cat) {
          case 'skill':
            return { badge: 'cyan' as const, label: 'Code' };
          case 'interest':
            return { badge: 'pink' as const, label: 'Interest' };
          case 'subject':
            return { badge: 'pink' as const, label: 'Science' };
          case 'course':
            return { badge: 'indigo' as const, label: 'Course' };
          default:
            return {
              badge: 'indigo' as const,
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
            };
        }
      };

      const categoryInfo = getCategoryInfo(category);

      return {
        id: conn.id,
        name: groupName,
        category: category,
        categoryBadge: categoryInfo.badge,
        categoryLabel: categoryInfo.label,
        memberCount,
        lastActive: lastActiveText,
        otherUser: {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName?.charAt(0)}.`,
          image: otherUser.profileImageUrl,
        },
      };
    });

    return {
      success: true,
      data: {
        groups,
      },
    };
  } catch (error) {
    console.error('Error getting active groups:', error);
    return {
      success: false,
      error: 'Failed to load active groups',
      data: {
        groups: [],
      },
    };
  }
}

/**
 * Get upcoming study sessions for the user
 */
export async function getUpcomingSessions(limit = 3) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Get upcoming study sessions where user is a participant
    const now = new Date();
    const sessions = await prisma.studySession.findMany({
      where: {
        OR: [
          { organizerId: userId },
          {
            participants: {
              some: {
                userId,
                status: 'Accepted',
              },
            },
          },
        ],
        startTime: {
          gte: now,
        },
        status: {
          in: ['Proposed', 'Confirmed'],
        },
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
          where: {
            status: 'Accepted',
          },
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
          take: 3,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: limit,
    });

    // Format sessions
    const formattedSessions = sessions.map(session => {
      const timeUntil = session.startTime.getTime() - now.getTime();
      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
      const daysUntil = Math.floor(hoursUntil / 24);

      let timeText = '';
      if (daysUntil > 0) {
        timeText = `${daysUntil} day${daysUntil > 1 ? 's' : ''} away`;
      } else if (hoursUntil > 0) {
        timeText = `${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} away`;
      } else {
        timeText = 'Starting soon';
      }

      return {
        id: session.id,
        title: session.title || session.course?.name || 'Study Session',
        course: session.course,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        timeText,
        organizer: {
          id: session.organizer.id,
          name: `${session.organizer.firstName} ${session.organizer.lastName}`,
          image: session.organizer.profileImageUrl,
        },
        participantCount: session.participants.length + 1, // +1 for organizer
        participants: session.participants.map(p => ({
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName}`,
          image: p.user.profileImageUrl,
        })),
      };
    });

    return {
      success: true,
      data: {
        sessions: formattedSessions,
      },
    };
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    return {
      success: false,
      error: 'Failed to load upcoming sessions',
      data: {
        sessions: [],
      },
    };
  }
}
