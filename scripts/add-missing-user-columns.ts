/**
 * Script to add missing columns (major and settings) to the users table
 * This fixes the error: "The column `users.major` does not exist in the current database."
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to users table...');

    // Add major column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "major" TEXT;
    `);
    console.log('✅ Added "major" column to users table');

    // Add settings column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "settings" JSONB;
    `);
    console.log('✅ Added "settings" column to users table');

    console.log('✅ All missing columns have been added successfully');
  } catch (error) {
    console.error('❌ Failed to add missing columns', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMissingColumns()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed', error);
    process.exit(1);
  });

