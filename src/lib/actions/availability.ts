'use server';

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySchema,
} from '@/lib/validations/availability';
import { findConflicts, getDayName, type AvailabilitySlot } from '@/lib/utils/availability';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Create availability slots for the authenticated user
 */
export async function createAvailability(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    // Parse slots from form data
    const slotsJson = formData.get('slots');
    if (!slotsJson || typeof slotsJson !== 'string') {
      return {
        success: false,
        error: 'Invalid slots data',
      };
    }

    const slots = JSON.parse(slotsJson) as AvailabilitySlot[];
    const data = createAvailabilitySchema.parse({ slots });

    // Get existing availability for conflict detection
    const existingAvailability = await prisma.availability.findMany({
      where: {
        userId: session.user.id,
      },
    });

    const existingSlots: AvailabilitySlot[] = existingAvailability.map((avail) => ({
      dayOfWeek: avail.dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
    }));

    // Check for conflicts
    const conflicts = findConflicts(data.slots, existingSlots);
    if (conflicts.length > 0) {
      const conflictMessages = conflicts.map(
        (conflict) =>
          `Conflict on ${getDayName(conflict.slot.dayOfWeek)}: ${conflict.slot.startTime} - ${conflict.slot.endTime} overlaps with existing slot`
      );
      return {
        success: false,
        error: `Time conflicts detected: ${conflictMessages.join('; ')}`,
        conflicts,
      };
    }

    // Create all slots
    const created = await prisma.availability.createMany({
      data: data.slots.map((slot) => ({
        userId: session.user.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/availability');

    return {
      success: true,
      data: {
        message: `Successfully created ${created.count} availability slot(s)`,
        count: created.count,
      },
    };
  } catch (error) {
    console.error('Error creating availability:', error);
    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod validation error
      const zodError = error as { issues: Array<{ message: string; path: string[] }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to create availability',
    };
  }
}

/**
 * Update a specific availability slot
 */
export async function updateAvailability(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = updateAvailabilitySchema.parse({
      availabilityId: formData.get('availabilityId') as string,
      dayOfWeek: formData.get('dayOfWeek') ? Number(formData.get('dayOfWeek')) : undefined,
      startTime: (formData.get('startTime') as string) || undefined,
      endTime: (formData.get('endTime') as string) || undefined,
    });

    // Check if the availability belongs to the user
    const existing = await prisma.availability.findUnique({
      where: {
        id: data.availabilityId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Availability slot not found',
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Prepare update data
    const updateData: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
    } = {};

    if (data.dayOfWeek !== undefined) {
      updateData.dayOfWeek = data.dayOfWeek;
    }
    if (data.startTime !== undefined) {
      updateData.startTime = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.endTime = data.endTime;
    }

    // If updating times or day, check for conflicts
    if (updateData.startTime || updateData.endTime || updateData.dayOfWeek !== undefined) {
      const finalDayOfWeek = updateData.dayOfWeek ?? existing.dayOfWeek;
      const finalStartTime = updateData.startTime ?? existing.startTime;
      const finalEndTime = updateData.endTime ?? existing.endTime;

      // Get all other availability slots for conflict detection
      const otherAvailability = await prisma.availability.findMany({
        where: {
          userId: session.user.id,
          id: {
            not: data.availabilityId,
          },
        },
      });

      const otherSlots: AvailabilitySlot[] = otherAvailability.map((avail) => ({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
      }));

      const conflicts = findConflicts(
        [{ dayOfWeek: finalDayOfWeek, startTime: finalStartTime, endTime: finalEndTime }],
        otherSlots
      );

      if (conflicts.length > 0) {
        return {
          success: false,
          error: 'Updated time slot conflicts with existing availability',
          conflicts,
        };
      }
    }

    // Update the availability
    const updated = await prisma.availability.update({
      where: {
        id: data.availabilityId,
      },
      data: updateData,
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/availability');

    return {
      success: true,
      data: {
        message: 'Availability slot updated successfully',
        availability: updated,
      },
    };
  } catch (error) {
    console.error('Error updating availability:', error);
    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod validation error
      const zodError = error as { issues: Array<{ message: string; path: string[] }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to update availability',
    };
  }
}

/**
 * Delete a specific availability slot
 */
export async function deleteAvailability(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const data = deleteAvailabilitySchema.parse({
      availabilityId: formData.get('availabilityId') as string,
    });

    // Check if the availability belongs to the user
    const existing = await prisma.availability.findUnique({
      where: {
        id: data.availabilityId,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: 'Availability slot not found',
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Delete the availability
    await prisma.availability.delete({
      where: {
        id: data.availabilityId,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/availability');

    return {
      success: true,
      data: {
        message: 'Availability slot deleted successfully',
      },
    };
  } catch (error) {
    console.error('Error deleting availability:', error);
    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod validation error
      const zodError = error as { issues: Array<{ message: string; path: string[] }> };
      const firstError = zodError.issues[0];
      return {
        success: false,
        error: firstError?.message || 'Validation error',
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to delete availability',
    };
  }
}

/**
 * Get all availability slots for the authenticated user
 */
export async function getUserAvailability() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const availability = await prisma.availability.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });

    return {
      success: true,
      data: availability,
    };
  } catch (error) {
    console.error('Error fetching availability:', error);
    return {
      success: false,
      error: 'Failed to fetch availability',
    };
  }
}

/**
 * Get availability for a specific user (for matching/connections)
 */
export async function getUserAvailabilityById(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const availability = await prisma.availability.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });

    return {
      success: true,
      data: availability,
    };
  } catch (error) {
    console.error('Error fetching user availability:', error);
    return {
      success: false,
      error: 'Failed to fetch user availability',
    };
  }
}


