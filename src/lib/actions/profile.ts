'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/connection';
import { profileSchema } from '@/lib/validations/profile';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Create or update user profile
 */
export async function createOrUpdateProfile(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = profileSchema.parse({
      bio: formData.get('bio') || null,
      preferredLocation: formData.get('preferredLocation') || null,
      studyStyle: formData.get('studyStyle') || null,
      studyPace: formData.get('studyPace') || null,
    });

    // Create or update profile
    const profile = await prisma.userProfile.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        bio: data.bio,
        preferredLocation: data.preferredLocation,
        studyStyle: data.studyStyle,
        studyPace: data.studyPace,
      },
      update: {
        bio: data.bio,
        preferredLocation: data.preferredLocation,
        studyStyle: data.studyStyle,
        studyPace: data.studyPace,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to save profile',
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const profile = await prisma.userProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            university: true,
            profileImageUrl: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
}

