import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { requestPasswordReset, resetPassword } from '@/lib/actions/auth';

describe('requestPasswordReset', () => {
  const testEmail = `test.reset.${Date.now()}@mail.citytech.cuny.edu`;

  beforeEach(async () => {
    // Setup: Create test user
    const hash = await bcrypt.hash('TestPassword123!', 12);
    await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: hash,
        firstName: 'Test',
        lastName: 'User',
        university: 'City Tech',
        isVerified: true,
      },
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.passwordReset.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should request password reset for valid email', async () => {
    // Use Vitest's environment stubbing to set NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'development');

    const formData = new FormData();
    formData.append('email', testEmail);

    const result = await requestPasswordReset(formData);

    // Restore original NODE_ENV
    vi.unstubAllEnvs();
    if (originalNodeEnv) {
      Object.assign(process.env, { NODE_ENV: originalNodeEnv });
    }

    expect(result.success).toBe(true);
    // In development, should return resetLink
    expect(result.resetLink).toBeDefined();
    expect(result.resetLink).toContain('/reset-password?token=');
  });

  it('should not reveal if user exists (security)', async () => {
    const formData = new FormData();
    formData.append(
      'email',
      `nonexistent.${Date.now()}@mail.citytech.cuny.edu`
    );

    const result = await requestPasswordReset(formData);

    // Security best practice: return success even if user doesn't exist
    expect(result.success).toBe(true);
  });

  it('should reject non-.edu email', async () => {
    const formData = new FormData();
    formData.append('email', 'test@gmail.com');

    const result = await requestPasswordReset(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('university email');
  });

  it('should store reset token in database', async () => {
    // Use Vitest's environment stubbing to set NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'development');

    const formData = new FormData();
    formData.append('email', testEmail);

    await requestPasswordReset(formData);

    // Restore original NODE_ENV
    vi.unstubAllEnvs();
    if (originalNodeEnv) {
      Object.assign(process.env, { NODE_ENV: originalNodeEnv });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { email: testEmail },
    });

    expect(resetRecord).toBeDefined();
    expect(resetRecord?.token).toBeDefined();
    expect(resetRecord?.expiresAt).toBeDefined();
  });
});

describe('resetPassword', () => {
  const testEmail = `test.reset.${Date.now()}@mail.citytech.cuny.edu`;
  const oldPassword = 'OldPassword123!';
  const newPassword = 'NewPassword123!';

  beforeEach(async () => {
    // Setup: Create user and valid reset token
    const hash = await bcrypt.hash(oldPassword, 12);
    await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: hash,
        firstName: 'Test',
        lastName: 'User',
        university: 'City Tech',
        isVerified: true,
      },
    });

    const validToken = crypto.randomUUID();
    await prisma.passwordReset.create({
      data: {
        email: testEmail,
        token: validToken,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    await prisma.passwordReset.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reset password with valid token', async () => {
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email: testEmail },
    });

    const formData = new FormData();
    formData.append('token', resetRecord!.token);
    formData.append('password', newPassword);

    const result = await resetPassword(formData);

    expect(result.success).toBe(true);

    // Verify password was actually changed
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    const isValid = await bcrypt.compare(newPassword, user!.passwordHash);
    expect(isValid).toBe(true);
  });

  it('should reject invalid token', async () => {
    const formData = new FormData();
    formData.append('token', 'invalid-token-12345');
    formData.append('password', newPassword);

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('should reject expired token', async () => {
    // Delete existing and create expired token
    await prisma.passwordReset.deleteMany({ where: { email: testEmail } });

    const expiredToken = crypto.randomUUID();
    await prisma.passwordReset.create({
      data: {
        email: testEmail,
        token: expiredToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
        createdAt: new Date(),
      },
    });

    const formData = new FormData();
    formData.append('token', expiredToken);
    formData.append('password', newPassword);

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message.toLowerCase()).toContain('expired');
  });

  it('should reject used token', async () => {
    // Delete existing and create used token
    await prisma.passwordReset.deleteMany({ where: { email: testEmail } });

    const usedToken = crypto.randomUUID();
    await prisma.passwordReset.create({
      data: {
        email: testEmail,
        token: usedToken,
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(), // Already used
        createdAt: new Date(),
      },
    });

    const formData = new FormData();
    formData.append('token', usedToken);
    formData.append('password', newPassword);

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message.toLowerCase()).toContain('used');
  });

  it('should reject short password', async () => {
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email: testEmail },
    });

    const formData = new FormData();
    formData.append('token', resetRecord!.token);
    formData.append('password', 'short'); // Less than 8 chars

    const result = await resetPassword(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('at least 8 characters');
  });
});
