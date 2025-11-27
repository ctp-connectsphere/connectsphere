/**
 * Script to create user_topics table in the database
 * Run with: npx tsx scripts/create-user-topics-table.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function createUserTopicsTable() {
  try {
    console.log('Creating user_topics table...');

    // Execute SQL statements one by one
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "user_topics" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL,
        "topic_id" UUID NOT NULL,
        "proficiency" TEXT,
        "interest" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "user_topics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_topics_user_id_topic_id_key" UNIQUE ("user_id", "topic_id")
      )
    `);

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_topics_user_id_idx" ON "user_topics"("user_id")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_topics_topic_id_idx" ON "user_topics"("topic_id")
    `);

    console.log('✅ user_topics table created successfully!');
  } catch (error) {
    console.error('❌ Error creating user_topics table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUserTopicsTable()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

