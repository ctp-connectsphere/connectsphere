import { z } from 'zod';

/**
 * Course validation schemas
 */

export const courseSearchSchema = z.object({
  query: z.string().optional(),
  semester: z.string().optional(),
  code: z.string().optional(),
  instructor: z.string().optional(),
  universityId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CourseSearchData = z.infer<typeof courseSearchSchema>;

export const enrollCourseSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

export type EnrollCourseData = z.infer<typeof enrollCourseSchema>;
