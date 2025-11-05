/**
 * Vitest setup file
 * Loads environment variables before tests run
 */
import { config as loadEnv } from 'dotenv';
import 'dotenv/config';
import { existsSync } from 'fs';

// Ensure DATABASE_URL is available for Prisma during tests.
// Priority: project .env → prisma/.env
if (!process.env.DATABASE_URL) {
    const prismaEnv = 'prisma/.env';
    if (existsSync(prismaEnv)) {
        loadEnv({ path: prismaEnv });
    }
}

// Provide safe defaults for external services during tests
process.env.RESEND_API_KEY =
    process.env.RESEND_API_KEY || 'test_key_do_not_use';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
process.env.NEXTAUTH_SECRET =
    process.env.NEXTAUTH_SECRET || 'test_nextauth_secret';

// Add any global test setup here
// For example, you can mock global objects, set up test databases, etc.
