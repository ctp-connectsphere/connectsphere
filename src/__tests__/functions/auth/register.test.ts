import { registerUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/connection';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

describe('registerUser', () => {
  const testEmail = `test.register.${Date.now()}@mail.citytech.cuny.edu`;

  afterEach(async () => {
    // Cleanup after each test
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a valid user', async () => {
    const formData = new FormData();
    formData.append('email', testEmail);
    formData.append('password', 'TestPassword123!');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('university', 'City Tech');

    const result = await registerUser(formData);

    expect(result.success).toBe(true);
    // Should mention email verification
    expect(
      result.message?.toLowerCase().includes('verify') ||
        result.message?.toLowerCase().includes('email')
    ).toBe(true);
  });

  it('should reject duplicate email', async () => {
    // Create user first
    const formData1 = new FormData();
    formData1.append('email', testEmail);
    formData1.append('password', 'TestPassword123!');
    formData1.append('firstName', 'Test');
    formData1.append('lastName', 'User');
    formData1.append('university', 'City Tech');
    await registerUser(formData1);

    // Try to register again
    const formData2 = new FormData();
    formData2.append('email', testEmail);
    formData2.append('password', 'TestPassword123!');
    formData2.append('firstName', 'Test');
    formData2.append('lastName', 'User');
    formData2.append('university', 'City Tech');

    const result = await registerUser(formData2);

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });

  it('should reject non-.edu email', async () => {
    const formData = new FormData();
    formData.append('email', 'test@gmail.com');
    formData.append('password', 'TestPassword123!');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('university', 'City Tech');

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(
      result.errors && typeof result.errors === 'object' && 'email' in result.errors
    ).toBe(true);
  });

  it('should reject missing required fields', async () => {
    const formData = new FormData();
    formData.append('email', testEmail);
    // Missing password, firstName, lastName, university

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject short password', async () => {
    const formData = new FormData();
    formData.append('email', testEmail);
    formData.append('password', 'short'); // Less than 8 chars
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('university', 'City Tech');

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(
      result.errors &&
        typeof result.errors === 'object' &&
        'password' in result.errors
    ).toBe(true);
  });

  it('should reject invalid email format', async () => {
    const formData = new FormData();
    formData.append('email', 'not-an-email');
    formData.append('password', 'TestPassword123!');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('university', 'City Tech');

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(
      result.errors && typeof result.errors === 'object' && 'email' in result.errors
    ).toBe(true);
  });
});
