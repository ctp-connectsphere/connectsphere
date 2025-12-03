'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import {
  extractPublicIdFromUrl,
  uploadToCloudinary,
} from '@/lib/storage/cloudinary';
import { calculateProfileCompletion } from '@/lib/utils/profile';
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
    // Handle onboardingCompleted field gracefully in case column doesn't exist
    let profile;
    try {
      profile = await prisma.userProfile.upsert({
        where: {
          userId: session.user.id,
        },
        create: {
          userId: session.user.id,
          bio: data.bio,
          preferredLocation: data.preferredLocation,
          studyStyle: data.studyStyle,
          studyPace: data.studyPace,
          onboardingCompleted: false,
        },
        update: {
          bio: data.bio,
          preferredLocation: data.preferredLocation,
          studyStyle: data.studyStyle,
          studyPace: data.studyPace,
        },
      });
    } catch (error: any) {
      // Handle case where onboarding_completed column doesn't exist
      if (
        error?.code === 'P2022' ||
        error?.message?.includes('onboarding_completed') ||
        error?.message?.includes('does not exist')
      ) {
        // Column doesn't exist - create/update without it
        profile = await prisma.userProfile.upsert({
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
      } else {
        throw error;
      }
    }

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    // Calculate completion
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImageUrl: true },
    });

    const completion = calculateProfileCompletion({
      hasBio: !!data.bio,
      hasPreferredLocation: !!data.preferredLocation,
      hasStudyStyle: !!data.studyStyle,
      hasStudyPace: !!data.studyPace,
      hasProfileImage: !!user?.profileImageUrl,
    });

    return {
      success: true,
      data: {
        profile,
        completion,
      },
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

    // Calculate completion
    const completion = calculateProfileCompletion({
      hasBio: !!profile?.bio,
      hasPreferredLocation: !!profile?.preferredLocation,
      hasStudyStyle: !!profile?.studyStyle,
      hasStudyPace: !!profile?.studyPace,
      hasProfileImage: !!profile?.user?.profileImageUrl,
    });

    return {
      success: true,
      data: {
        profile,
        completion,
      },
    };
  } catch {
    return {
      success: false,
      error: 'Failed to fetch profile',
    };
  }
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const file = formData.get('image') as File | null;
    if (!file) {
      return {
        success: false,
        error: 'No image file provided',
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error:
          'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old image if exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profileImageUrl: true },
    });

    if (user?.profileImageUrl) {
      const oldPublicId = extractPublicIdFromUrl(user.profileImageUrl);
      if (oldPublicId) {
        // Note: We don't await this to avoid blocking the upload
        // Cloudinary will clean up old images automatically
        import('@/lib/storage/cloudinary')
          .then(({ deleteFromCloudinary }) => {
            if (deleteFromCloudinary) {
              return deleteFromCloudinary(oldPublicId);
            }
          })
          .catch(() => {
            // Silently fail - old image cleanup is not critical
          });
      }
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'profiles',
      public_id: `profile-${session.user.id}`,
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
        },
      ],
      resource_type: 'image',
    });

    // Update user profile image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImageUrl: uploadResult.secure_url },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
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
      error: 'Failed to upload image',
    };
  }
}
