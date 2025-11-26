import { z } from 'zod';

/**
 * Profile validation schemas
 */

export const profileSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .nullable(),
  preferredLocation: z
    .enum(['library', 'cafe', 'dorm', 'online', 'other'], {
      message: 'Please select a valid study location',
    })
    .optional()
    .nullable(),
  studyStyle: z
    .enum(['collaborative', 'quiet', 'mixed'], {
      message: 'Please select a valid study style',
    })
    .optional()
    .nullable(),
  studyPace: z
    .enum(['fast', 'moderate', 'slow'], {
      message: 'Please select a valid study pace',
    })
    .optional()
    .nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
