'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        completed: false,
      };
    }

    try {
      const profile = await prisma.userProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          onboardingCompleted: true,
        },
      });

      return {
        success: true,
        completed: profile?.onboardingCompleted || false,
      };
    } catch (error: any) {
      // Handle case where column doesn't exist yet
      if (
        error?.code === 'P2022' ||
        error?.message?.includes('onboarding_completed') ||
        error?.message?.includes('does not exist')
      ) {
        // Column doesn't exist - check if profile exists (means onboarding was done)
        const profile = await prisma.userProfile.findUnique({
          where: {
            userId: session.user.id,
          },
        });
        return {
          success: true,
          completed: !!profile, // If profile exists, assume onboarding is done
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      success: false,
      completed: false,
    };
  }
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    try {
      // Update or create profile with onboardingCompleted = true
      await prisma.userProfile.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          onboardingCompleted: true,
        },
        update: {
          onboardingCompleted: true,
        },
      });
    } catch (error: any) {
      // Handle case where column doesn't exist yet
      if (
        error?.code === 'P2022' ||
        error?.message?.includes('onboarding_completed') ||
        error?.message?.includes('does not exist')
      ) {
        // Column doesn't exist - just create/update profile without the field
        await prisma.userProfile.upsert({
          where: {
            userId: session.user.id,
          },
          create: {
            userId: session.user.id,
          },
          update: {
            // Profile update without onboardingCompleted field
          },
        });
      } else {
        throw error;
      }
    }

    revalidatePath('/onboarding');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Onboarding completed',
    };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return {
      success: false,
      error: 'Failed to complete onboarding',
    };
  }
}
