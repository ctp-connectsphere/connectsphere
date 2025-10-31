import { describe, expect, it } from 'vitest';

describe('Validation Utilities', () => {
  describe('Email validation', () => {
    it('should validate .edu email', () => {
      const email = 'test@mail.citytech.cuny.edu';
      expect(email.endsWith('.edu')).toBe(true);
    });

    it('should reject non-.edu email', () => {
      const email = 'test@gmail.com';
      expect(email.endsWith('.edu')).toBe(false);
    });

    it('should validate email format', () => {
      const validEmail = 'test@mail.citytech.cuny.edu';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@mail.citytech.cuny.edu',
        'test@',
        'test@.edu',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Password validation', () => {
    it('should validate password length', () => {
      const validPassword = 'TestPassword123!';
      expect(validPassword.length).toBeGreaterThanOrEqual(8);
    });

    it('should reject short password', () => {
      const shortPassword = 'short';
      expect(shortPassword.length).toBeLessThan(8);
    });
  });

  describe('FormData validation', () => {
    it('should create FormData with values', () => {
      const formData = new FormData();
      formData.append('email', 'test@mail.citytech.cuny.edu');
      formData.append('password', 'TestPassword123!');

      expect(formData.get('email')).toBe('test@mail.citytech.cuny.edu');
      expect(formData.get('password')).toBe('TestPassword123!');
    });

    it('should handle missing form values', () => {
      const formData = new FormData();
      // Don't append anything

      expect(formData.get('email')).toBeNull();
      expect(formData.get('password')).toBeNull();
    });
  });
});
