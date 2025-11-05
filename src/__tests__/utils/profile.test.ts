import { describe, it, expect } from 'vitest';
import {
  calculateProfileCompletion,
  getCompletionStatus,
  getCompletionMessage,
} from '@/lib/utils/profile';

describe('Profile Utilities', () => {
  describe('calculateProfileCompletion', () => {
    it('should calculate 100% for complete profile', () => {
      const result = calculateProfileCompletion({
        hasBio: true,
        hasPreferredLocation: true,
        hasStudyStyle: true,
        hasStudyPace: true,
        hasProfileImage: true,
      });

      expect(result.percentage).toBe(100);
      expect(result.completed).toBe(5);
      expect(result.total).toBe(5);
      expect(result.missing).toEqual([]);
    });

    it('should calculate 0% for empty profile', () => {
      const result = calculateProfileCompletion({
        hasBio: false,
        hasPreferredLocation: false,
        hasStudyStyle: false,
        hasStudyPace: false,
        hasProfileImage: false,
      });

      expect(result.percentage).toBe(0);
      expect(result.completed).toBe(0);
      expect(result.total).toBe(5);
      expect(result.missing).toHaveLength(5);
    });

    it('should calculate 60% for partial profile', () => {
      const result = calculateProfileCompletion({
        hasBio: true,
        hasPreferredLocation: true,
        hasStudyStyle: true,
        hasStudyPace: false,
        hasProfileImage: false,
      });

      expect(result.percentage).toBe(60);
      expect(result.completed).toBe(3);
      expect(result.total).toBe(5);
      expect(result.missing).toHaveLength(2);
      expect(result.missing).toContain('Study Pace');
      expect(result.missing).toContain('Profile Image');
    });

    it('should identify missing fields correctly', () => {
      const result = calculateProfileCompletion({
        hasBio: false,
        hasPreferredLocation: true,
        hasStudyStyle: false,
        hasStudyPace: true,
        hasProfileImage: true,
      });

      expect(result.missing).toContain('Bio');
      expect(result.missing).toContain('Study Style');
      expect(result.missing).not.toContain('Study Location');
      expect(result.missing).not.toContain('Study Pace');
      expect(result.missing).not.toContain('Profile Image');
    });
  });

  describe('getCompletionStatus', () => {
    it('should return complete for 100%', () => {
      expect(getCompletionStatus(100)).toBe('complete');
    });

    it('should return partial for 60-99%', () => {
      expect(getCompletionStatus(60)).toBe('partial');
      expect(getCompletionStatus(80)).toBe('partial');
      expect(getCompletionStatus(99)).toBe('partial');
    });

    it('should return incomplete for < 60%', () => {
      expect(getCompletionStatus(0)).toBe('incomplete');
      expect(getCompletionStatus(40)).toBe('incomplete');
      expect(getCompletionStatus(59)).toBe('incomplete');
    });
  });

  describe('getCompletionMessage', () => {
    it('should return complete message for 100%', () => {
      const completion = calculateProfileCompletion({
        hasBio: true,
        hasPreferredLocation: true,
        hasStudyStyle: true,
        hasStudyPace: true,
        hasProfileImage: true,
      });

      const message = getCompletionMessage(completion);
      expect(message).toBe('Your profile is complete!');
    });

    it('should return single missing field message', () => {
      const completion = calculateProfileCompletion({
        hasBio: true,
        hasPreferredLocation: true,
        hasStudyStyle: true,
        hasStudyPace: true,
        hasProfileImage: false,
      });

      const message = getCompletionMessage(completion);
      expect(message).toContain('profile image');
    });

    it('should return multiple missing fields message', () => {
      const completion = calculateProfileCompletion({
        hasBio: false,
        hasPreferredLocation: false,
        hasStudyStyle: true,
        hasStudyPace: true,
        hasProfileImage: true,
      });

      const message = getCompletionMessage(completion);
      expect(message).toContain('bio');
      expect(message).toContain('study location');
    });
  });
});

