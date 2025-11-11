import { describe, expect, it } from 'vitest';
import { logoutUser } from '@/lib/actions/auth';

describe('logoutUser', () => {
  it('should logout successfully', async () => {
    const result = await logoutUser();

    expect(result.success).toBe(true);
    expect(result.message).toContain('successfully');
  });

  it('should return correct structure', async () => {
    const result = await logoutUser();

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });
});
