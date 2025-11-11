import { prisma } from '@/lib/db/connection';
import { afterAll, describe, expect, it } from 'vitest';

describe('Database Connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to database successfully', async () => {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should query users table', async () => {
    const users = await prisma.user.findMany({ take: 1 });
    expect(Array.isArray(users)).toBe(true);
  });

  it('should query password_resets table', async () => {
    const resets = await prisma.passwordReset.findMany({ take: 1 });
    expect(Array.isArray(resets)).toBe(true);
  });

  it('should handle transactions', async () => {
    await prisma.$transaction(async tx => {
      const count = await tx.user.count();
      expect(typeof count).toBe('number');
    });
  });
});
