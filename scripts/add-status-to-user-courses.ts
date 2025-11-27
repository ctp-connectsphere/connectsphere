/**
 * Script to add status column to user_courses table
 * Run with: npx tsx scripts/add-status-to-user-courses.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addStatusColumn() {
  try {
    console.log('Adding status column to user_courses table...');

    // Add status column with default value
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "user_courses" 
      ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Enrolled'
    `);

    // Update existing rows to have the default status
    await prisma.$executeRawUnsafe(`
      UPDATE "user_courses" 
      SET "status" = 'Enrolled' 
      WHERE "status" IS NULL
    `);

    console.log('✅ status column added successfully to user_courses table!');
  } catch (error) {
    console.error('❌ Error adding status column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addStatusColumn();

