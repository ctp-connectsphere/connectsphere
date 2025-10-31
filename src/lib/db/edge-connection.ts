/**
 * Edge Runtime compatible database connection
 * This file is optimized for Edge Runtime and doesn't include Node.js-specific APIs
 */

import { config } from '@/lib/config/env';
import { PrismaClient } from '@prisma/client';

// Edge Runtime compatible Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
  log: config.isDevelopment ? ['error', 'warn'] : ['error'],
});

export { prisma };
