'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const sendMessageSchema = z
  .object({
    connectionId: z.string().uuid().optional(),
    conversationId: z.string().uuid().optional(),
    content: z.string().min(1).max(5000),
    messageType: z.enum(['text', 'code', 'invite']).default('text'),
    metadata: z.any().optional(), // For code language, invite details, etc.
  })
  .refine(data => data.connectionId || data.conversationId, {
    message: 'Either connectionId or conversationId must be provided',
  });

/**
 * Get messages for a connection
 */
export async function getMessages(connectionId: string, limit = 50) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Verify user is part of this connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        OR: [{ requesterId: userId }, { targetId: userId }],
        status: 'accepted',
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
      },
    });

    if (!connection) {
      return {
        success: false,
        error: 'Connection not found or not authorized',
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        connectionId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        connectionId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const otherUser =
      connection.requesterId === userId
        ? connection.target
        : connection.requester;
    const matchContext = connection.course
      ? {
          type: 'course',
          name: connection.course.name,
          code: connection.course.code,
        }
      : connection.topic
        ? {
            type: 'topic',
            name: connection.topic.name,
            category: connection.topic.category,
          }
        : null;

    return {
      success: true,
      data: {
        connection: {
          id: connection.id,
          otherUser,
          matchContext,
        },
        messages: messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: msg.content,
          messageType: msg.messageType,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          isMe: msg.senderId === userId,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    return {
      success: false,
      error: 'Failed to load messages',
    };
  }
}

/**
 * Send a message
 */
export async function sendMessage(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    const data = sendMessageSchema.parse({
      connectionId: formData.get('connectionId') || undefined,
      conversationId: formData.get('conversationId') || undefined,
      content: formData.get('content'),
      messageType: formData.get('messageType') || 'text',
      metadata: formData.get('metadata')
        ? JSON.parse(formData.get('metadata') as string)
        : undefined,
    });

    // Handle conversation messages (group chats)
    if (data.conversationId) {
      // Verify user is part of this conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: data.conversationId,
          userId,
        },
        include: {
          conversation: true,
        },
      });

      if (!participant) {
        return {
          success: false,
          error: 'Conversation not found or not authorized',
        };
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
          messageType: data.messageType,
          metadata: data.metadata,
          isRead: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      revalidatePath(`/groups/${participant.conversation.groupId}`);
      revalidatePath('/chat');

      return {
        success: true,
        data: {
          message: {
            id: message.id,
            senderId: message.senderId,
            sender: message.sender,
            content: message.content,
            messageType: message.messageType,
            isRead: message.isRead,
            createdAt: message.createdAt,
            isMe: true,
          },
        },
      };
    }

    // Handle connection messages (direct messages)
    // Verify user is part of this connection
    const connection = await prisma.connection.findFirst({
      where: {
        id: data.connectionId!,
        OR: [{ requesterId: userId }, { targetId: userId }],
        status: 'accepted',
      },
    });

    if (!connection) {
      return {
        success: false,
        error: 'Connection not found or not authorized',
      };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        connectionId: data.connectionId,
        senderId: userId,
        content: data.content,
        messageType: data.messageType,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    // Update connection updatedAt
    await prisma.connection.update({
      where: { id: data.connectionId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/chat/${data.connectionId}`);
    revalidatePath('/chat');

    return {
      success: true,
      data: {
        message: {
          id: message.id,
          senderId: message.senderId,
          sender: message.sender,
          content: message.content,
          messageType: message.messageType,
          isRead: message.isRead,
          createdAt: message.createdAt,
          isMe: true,
        },
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.flatten().fieldErrors,
      };
    }
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Failed to send message',
    };
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const messageId = formData.get('messageId') as string;
    if (!messageId) {
      return {
        success: false,
        error: 'Message ID is required',
      };
    }

    // Verify message exists and user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        connection: true,
      },
    });

    if (!message) {
      return {
        success: false,
        error: 'Message not found',
      };
    }

    // Verify user is part of the connection
    const userId = session.user.id;
    if (!message.connection) {
      return {
        success: false,
        error: 'Message connection not found',
      };
    }
    if (
      message.connection.requesterId !== userId &&
      message.connection.targetId !== userId
    ) {
      return {
        success: false,
        error: 'Unauthorized to delete this message',
      };
    }

    // Only sender can delete their own message
    if (message.senderId !== userId) {
      return {
        success: false,
        error: 'You can only delete your own messages',
      };
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    // Update connection updatedAt if connection exists
    if (message.connectionId) {
      await prisma.connection.update({
        where: { id: message.connectionId },
        data: { updatedAt: new Date() },
      });
    }

    revalidatePath(`/chat/${message.connectionId}`);
    revalidatePath('/chat');

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  } catch (error) {
    logger.error('Error deleting message', error);
    return {
      success: false,
      error: 'Failed to delete message',
    };
  }
}

/**
 * Get user's conversations (connections with messages)
 */
export async function getConversations() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Get all accepted connections where user is involved
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
            id: true,
            content: true,
            messageType: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const conversations = connections.map(conn => {
      const otherUser =
        conn.requesterId === userId ? conn.target : conn.requester;
      const lastMessage = conn.messages[0];
      const unreadCount = conn._count.messages;
      const matchContext = conn.course
        ? { type: 'course', name: conn.course.name, code: conn.course.code }
        : conn.topic
          ? {
              type: 'topic',
              name: conn.topic.name,
              category: conn.topic.category,
            }
          : null;

      return {
        id: conn.id,
        otherUser,
        matchContext,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              messageType: lastMessage.messageType,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
              isMe: lastMessage.senderId === userId,
            }
          : null,
        unreadCount,
        updatedAt: conn.updatedAt,
      };
    });

    return {
      success: true,
      data: {
        conversations,
      },
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    return {
      success: false,
      error: 'Failed to load conversations',
    };
  }
}

/**
 * Get messages for a conversation (group chat)
 */
export async function getConversationMessages(
  conversationId: string,
  limit = 50
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const userId = session.user.id;

    // Verify user is part of this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
      include: {
        conversation: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!participant) {
      return {
        success: false,
        error: 'Conversation not found or not authorized',
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      data: {
        conversation: {
          id: participant.conversation.id,
          type: participant.conversation.type,
          group: participant.conversation.group,
        },
        messages: messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          sender: msg.sender,
          content: msg.content,
          messageType: msg.messageType,
          metadata: msg.metadata,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          isMe: msg.senderId === userId,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return {
      success: false,
      error: 'Failed to load messages',
    };
  }
}
