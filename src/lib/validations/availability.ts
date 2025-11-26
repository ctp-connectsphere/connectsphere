import { z } from 'zod';

// Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export const availabilitySlotSchema = z.object({
  dayOfWeek: z
    .number()
    .int()
    .min(0, 'Day of week must be between 0 (Sunday) and 6 (Saturday)')
    .max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      'Start time must be in HH:MM format (24-hour)'
    ),
  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      'End time must be in HH:MM format (24-hour)'
    ),
});

// Schema for validating time range (end time must be after start time)
export const availabilitySlotWithValidationSchema =
  availabilitySlotSchema.refine(
    data => {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

// Schema for creating/updating availability (single slot or multiple)
export const createAvailabilitySchema = z.object({
  slots: z
    .array(availabilitySlotWithValidationSchema)
    .min(1, 'At least one time slot is required'),
});

// Schema for updating/deleting a specific availability slot
export const updateAvailabilitySchema = z
  .object({
    availabilityId: z.string().uuid('Invalid availability ID'),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
  })
  .refine(
    data => {
      // If updating times, both start and end must be provided
      if (data.startTime || data.endTime) {
        return data.startTime !== undefined && data.endTime !== undefined;
      }
      return true;
    },
    {
      message:
        'Both start time and end time must be provided when updating times',
    }
  )
  .refine(
    data => {
      // Validate time range if times are provided
      if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number);
        const [endHour, endMin] = data.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const deleteAvailabilitySchema = z.object({
  availabilityId: z.string().uuid('Invalid availability ID'),
});

export type AvailabilitySlotSchema = z.infer<typeof availabilitySlotSchema>;
export type CreateAvailabilitySchema = z.infer<typeof createAvailabilitySchema>;
export type UpdateAvailabilitySchema = z.infer<typeof updateAvailabilitySchema>;
export type DeleteAvailabilitySchema = z.infer<typeof deleteAvailabilitySchema>;
