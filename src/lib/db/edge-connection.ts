/**
 * Edge Runtime compatible database connection
 * This file is optimized for Edge Runtime and doesn't include Node.js-specific APIs
 *
 * For Neon database, we use the connection pooler URL to prevent connection closed errors.
 * The pooler manages connections automatically and handles reconnection.
 */

import { config } from '@/lib/config/env';
import { PrismaClient } from '@prisma/client';

// Global singleton for Prisma client in Edge Runtime
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Edge Runtime compatible Prisma client
// Using singleton pattern to prevent multiple instances and connection pool exhaustion
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: config.database.url,
      },
    },
    log: config.isDevelopment ? ['error', 'warn', 'info'] : ['error'],
    // Neon connection pooler handles connection management automatically
    // No additional connection pool configuration needed when using pooler URL
  });

// Prevent multiple instances in development (Next.js hot reload)
if (config.isDevelopment && typeof global !== 'undefined') {
  globalForPrisma.prisma = prisma;
}

// Connection retry helper for transient connection errors
export async function withConnectionRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delay = 500
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.message?.includes('Closed') ||
        error?.message?.includes('connection') ||
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P1008'; // Operations timed out

      if (isConnectionError && attempt < maxRetries) {
        console.warn(
          `⚠️ Database connection error (attempt ${attempt}/${maxRetries}), retrying...`
        );
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Operation failed after retries');
}

export { prisma };
