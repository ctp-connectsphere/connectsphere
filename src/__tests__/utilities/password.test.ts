import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Password Utilities', () => {
  describe('bcrypt hashing', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should use consistent salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      // Hashes should be different (different salts)
      expect(hash1).not.toBe(hash2);

      // But both should verify the same password
      const isValid1 = await bcrypt.compare(password, hash1);
      const isValid2 = await bcrypt.compare(password, hash2);
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });
});
