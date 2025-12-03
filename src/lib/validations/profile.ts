import { z } from 'zod';

/**
 * Profile validation schemas
 */

export const profileSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable()
    .transform(val => (val && val.trim() ? val.trim() : null)),
  preferredLocation: z
    .string()
    .refine(
      val =>
        !val || ['library', 'cafe', 'dorm', 'online', 'other'].includes(val),
      {
        message: 'Please select a valid study location',
      }
    )
    .optional()
    .nullable()
    .transform(val => (val && val.trim() ? val.trim() : null)),
  studyStyle: z
    .string()
    .refine(val => !val || ['collaborative', 'quiet', 'mixed'].includes(val), {
      message: 'Please select a valid study style',
    })
    .optional()
    .nullable()
    .transform(val => (val && val.trim() ? val.trim() : null)),
  studyPace: z
    .string()
    .refine(val => !val || ['fast', 'moderate', 'slow'].includes(val), {
      message: 'Please select a valid study pace',
    })
    .optional()
    .nullable()
    .transform(val => (val && val.trim() ? val.trim() : null)),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
