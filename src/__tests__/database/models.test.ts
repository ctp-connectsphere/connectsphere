import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';

describe('Database Models', () => {
  const testEmail = `test.models.${Date.now()}@mail.citytech.cuny.edu`;

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.passwordReset.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Model', () => {
    it('should create a user', async () => {
      const hash = await bcrypt.hash('TestPassword123!', 12);
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hash,
          firstName: 'Test',
          lastName: 'User',
          university: 'City Tech',
          isVerified: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.firstName).toBe('Test');
      expect(user.isVerified).toBe(true);
    });

    it('should enforce unique email constraint', async () => {
      const hash = await bcrypt.hash('TestPassword123!', 12);
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hash,
          firstName: 'Test',
          lastName: 'User',
          university: 'City Tech',
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email: testEmail,
            passwordHash: hash,
            firstName: 'Test',
            lastName: 'User',
            university: 'City Tech',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('PasswordReset Model', () => {
    beforeEach(async () => {
      const hash = await bcrypt.hash('TestPassword123!', 12);
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hash,
          firstName: 'Test',
          lastName: 'User',
          university: 'City Tech',
        },
      });
    });

    it('should create a password reset record', async () => {
      const reset = await prisma.passwordReset.create({
        data: {
          email: testEmail,
          token: 'test-token-123',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      expect(reset).toBeDefined();
      expect(reset.email).toBe(testEmail);
      expect(reset.token).toBe('test-token-123');
    });

    it('should enforce unique email constraint', async () => {
      await prisma.passwordReset.create({
        data: {
          email: testEmail,
          token: 'token-1',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      await expect(
        prisma.passwordReset.create({
          data: {
            email: testEmail,
            token: 'token-2',
            expiresAt: new Date(Date.now() + 3600000),
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce unique token constraint', async () => {
      await prisma.passwordReset.create({
        data: {
          email: testEmail,
          token: 'unique-token',
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // Try to create with same token but different email
      await expect(
        prisma.passwordReset.create({
          data: {
            email: `different.${Date.now()}@mail.citytech.cuny.edu`,
            token: 'unique-token',
            expiresAt: new Date(Date.now() + 3600000),
          },
        })
      ).rejects.toThrow();
    });
  });
});
