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
