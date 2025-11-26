'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const notificationsSchema = z.object({
  newMatches: z.boolean().optional(),
  sessionReminders: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

const privacySchema = z.object({
  profileVisibility: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  allowMatching: z.boolean().optional(),
});

const appearanceSchema = z.object({
  darkMode: z.boolean().optional(),
  animations: z.boolean().optional(),
});

/**
 * Get user settings
 */
export async function getUserSettings() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const settings = (user.settings as Record<string, any>) || {};

    return {
      success: true,
      data: {
        notifications: {
          newMatches: settings.notifications?.newMatches ?? true,
          sessionReminders: settings.notifications?.sessionReminders ?? true,
          marketingEmails: settings.notifications?.marketingEmails ?? false,
        },
        privacy: {
          profileVisibility: settings.privacy?.profileVisibility ?? true,
          showOnlineStatus: settings.privacy?.showOnlineStatus ?? true,
          allowMatching: settings.privacy?.allowMatching ?? true,
        },
        appearance: {
          darkMode: settings.appearance?.darkMode ?? true,
          animations: settings.appearance?.animations ?? true,
        },
      },
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      success: false,
      error: 'Failed to get user settings',
    };
  }
}

/**
 * Update notification settings
 */
export async function updateNotifications(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = notificationsSchema.parse({
      newMatches: formData.get('newMatches') === 'true',
      sessionReminders: formData.get('sessionReminders') === 'true',
      marketingEmails: formData.get('marketingEmails') === 'true',
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const currentSettings = (user.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        ...data,
      },
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: updatedSettings },
    });

    revalidatePath('/settings');
    return {
      success: true,
      message: 'Notification settings updated successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating notifications:', error);
    return {
      success: false,
      error: 'Failed to update notification settings',
    };
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacy(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = privacySchema.parse({
      profileVisibility: formData.get('profileVisibility') === 'true',
      showOnlineStatus: formData.get('showOnlineStatus') === 'true',
      allowMatching: formData.get('allowMatching') === 'true',
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const currentSettings = (user.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      privacy: {
        ...currentSettings.privacy,
        ...data,
      },
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: updatedSettings },
    });

    revalidatePath('/settings');
    return {
      success: true,
      message: 'Privacy settings updated successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating privacy:', error);
    return {
      success: false,
      error: 'Failed to update privacy settings',
    };
  }
}

/**
 * Update appearance settings
 */
export async function updateAppearance(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = appearanceSchema.parse({
      darkMode: formData.get('darkMode') === 'true',
      animations: formData.get('animations') === 'true',
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const currentSettings = (user.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      appearance: {
        ...currentSettings.appearance,
        ...data,
      },
    };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: updatedSettings },
    });

    revalidatePath('/settings');
    return {
      success: true,
      message: 'Appearance settings updated successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error updating appearance:', error);
    return {
      success: false,
      error: 'Failed to update appearance settings',
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = changePasswordSchema.parse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
    });

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash
    );
    if (!isValid) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    revalidatePath('/settings');
    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    console.error('Error changing password:', error);
    return {
      success: false,
      error: 'Failed to change password',
    };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const confirmText = formData.get('confirm') as string;
    if (confirmText !== 'DELETE') {
      return {
        success: false,
        error: 'Please type DELETE to confirm',
      };
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      error: 'Failed to delete account',
    };
  }
}
