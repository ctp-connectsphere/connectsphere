/**
 * Stack Auth (Neon Auth) Configuration
 *
 * This file configures Stack Auth for Neon Auth integration.
 * Stack Auth automatically syncs user data to neon_auth.users_sync table.
 *
 * NOTE: The package name may need to be updated once the correct npm package is identified.
 * Check Neon Auth documentation or example repos for the correct package name.
 */

import { logger } from '@/lib/utils/logger';

// TODO: Update import once correct package is installed
// Possible package names:
// - @stackframejs/nextjs
// - stack-auth
// - @stackframejs/core
// - github:stackframejs/stack-auth-nextjs

// For now, we'll use a placeholder that will need to be updated
// import { StackServerApp } from '@stackframejs/nextjs';

if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_STACK_PROJECT_ID is not set');
}

if (!process.env.STACK_SECRET_SERVER_KEY) {
  throw new Error('STACK_SECRET_SERVER_KEY is not set');
}

// TODO: Uncomment and update once the correct package is installed
/*
export const stackServerApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  urls: {
    signIn: '/login',
    signUp: '/register',
    afterSignIn: '/dashboard',
    afterSignUp: '/onboarding',
  },
});
*/

// Placeholder export - will be replaced once package is installed
export const stackServerApp = null as any;

/**
 * Get the current user from Stack Auth
 */
export async function getStackUser() {
  try {
    const user = await stackServerApp.getUser();
    return user;
  } catch (error) {
    logger.error('Error getting Stack user', error);
    return null;
  }
}

/**
 * Get user by ID from neon_auth.users_sync table
 * This queries the automatically synced user data
 */
export async function getSyncedUser(_userId: string) {
  const { prisma } = await import('@/lib/db/connection');

  try {
    // Query the neon_auth.users_sync table
    const result = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string | null;
        email: string;
        createdAt: Date;
        updatedAt: Date | null;
        deletedAt: Date | null;
        raw_json: any;
      }>
    >`
      SELECT * FROM neon_auth.users_sync 
      WHERE id = $1::text AND deleted_at IS NULL
    `;

    return result[0] || null;
  } catch (error) {
    logger.error('Error getting synced user', error);
    return null;
  }
}
