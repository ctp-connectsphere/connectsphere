import { z } from 'zod';

/**
 * Study session validation schemas
 */

export const createStudySessionSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
});

export const updateStudySessionSchema = z.object({
  sessionId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  status: z
    .enum(['Proposed', 'Confirmed', 'Cancelled', 'Completed'])
    .optional(),
});

export const joinStudySessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export const updateParticipantStatusSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid().optional(), // If not provided, updates current user's status
  status: z.enum(['Pending', 'Accepted', 'Declined']),
});

export type CreateStudySessionData = z.infer<typeof createStudySessionSchema>;
export type UpdateStudySessionData = z.infer<typeof updateStudySessionSchema>;
export type JoinStudySessionData = z.infer<typeof joinStudySessionSchema>;
export type UpdateParticipantStatusData = z.infer<
  typeof updateParticipantStatusSchema
>;
