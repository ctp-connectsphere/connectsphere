/**
 * Script to add all missing indexes to database tables
 * Run with: npx tsx scripts/add-all-indexes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAllIndexes() {
  try {
    console.log('🔍 Adding indexes to all tables...\n');

    // 1. users table indexes
    console.log('📊 Adding indexes to users table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
      CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "users"("is_active");
      CREATE INDEX IF NOT EXISTS "users_is_verified_idx" ON "users"("is_verified");
      CREATE INDEX IF NOT EXISTS "users_university_idx" ON "users"("university");
      CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");
    `);
    console.log('  ✅ users indexes added\n');

    // 2. accounts table indexes
    console.log('📊 Adding indexes to accounts table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");
      CREATE INDEX IF NOT EXISTS "accounts_provider_idx" ON "accounts"("provider");
      CREATE INDEX IF NOT EXISTS "accounts_provider_account_id_idx" ON "accounts"("provider_account_id");
    `);
    console.log('  ✅ accounts indexes added\n');

    // 3. sessions table indexes
    console.log('📊 Adding indexes to sessions table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
      CREATE INDEX IF NOT EXISTS "sessions_expires_idx" ON "sessions"("expires");
      CREATE INDEX IF NOT EXISTS "sessions_session_token_idx" ON "sessions"("session_token");
    `);
    console.log('  ✅ sessions indexes added\n');

    // 4. verification_tokens table indexes
    console.log('📊 Adding indexes to verification_tokens table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");
      CREATE INDEX IF NOT EXISTS "verification_tokens_token_idx" ON "verification_tokens"("token");
      CREATE INDEX IF NOT EXISTS "verification_tokens_expires_idx" ON "verification_tokens"("expires");
    `);
    console.log('  ✅ verification_tokens indexes added\n');

    // 5. password_resets table indexes
    console.log('📊 Adding indexes to password_resets table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "password_resets_email_idx" ON "password_resets"("email");
      CREATE INDEX IF NOT EXISTS "password_resets_token_idx" ON "password_resets"("token");
      CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets"("expires_at");
    `);
    console.log('  ✅ password_resets indexes added\n');

    // 6. user_profiles table indexes
    console.log('📊 Adding indexes to user_profiles table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_profiles_user_id_idx" ON "user_profiles"("user_id");
      CREATE INDEX IF NOT EXISTS "user_profiles_onboarding_completed_idx" ON "user_profiles"("onboarding_completed");
    `);
    console.log('  ✅ user_profiles indexes added\n');

    // 7. availability table indexes
    console.log('📊 Adding indexes to availability table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "availability_user_id_idx" ON "availability"("user_id");
      CREATE INDEX IF NOT EXISTS "availability_day_of_week_idx" ON "availability"("day_of_week");
      CREATE INDEX IF NOT EXISTS "availability_user_day_idx" ON "availability"("user_id", "day_of_week");
    `);
    console.log('  ✅ availability indexes added\n');

    // 8. universities table indexes
    console.log('📊 Adding indexes to universities table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "universities_domain_idx" ON "universities"("domain");
      CREATE INDEX IF NOT EXISTS "universities_is_active_idx" ON "universities"("is_active");
    `);
    console.log('  ✅ universities indexes added\n');

    // 9. courses table indexes
    console.log('📊 Adding indexes to courses table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "courses_university_id_idx" ON "courses"("university_id");
      CREATE INDEX IF NOT EXISTS "courses_code_idx" ON "courses"("code");
      CREATE INDEX IF NOT EXISTS "courses_semester_idx" ON "courses"("semester");
      CREATE INDEX IF NOT EXISTS "courses_is_active_idx" ON "courses"("is_active");
      CREATE INDEX IF NOT EXISTS "courses_university_semester_idx" ON "courses"("university_id", "semester");
    `);
    console.log('  ✅ courses indexes added\n');

    // 10. user_courses table indexes
    console.log('📊 Adding indexes to user_courses table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_courses_user_id_idx" ON "user_courses"("user_id");
      CREATE INDEX IF NOT EXISTS "user_courses_course_id_idx" ON "user_courses"("course_id");
      CREATE INDEX IF NOT EXISTS "user_courses_is_active_idx" ON "user_courses"("is_active");
      CREATE INDEX IF NOT EXISTS "user_courses_status_idx" ON "user_courses"("status");
      CREATE INDEX IF NOT EXISTS "user_courses_user_active_idx" ON "user_courses"("user_id", "is_active");
    `);
    console.log('  ✅ user_courses indexes added\n');

    // 11. topics table indexes
    console.log('📊 Adding indexes to topics table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "topics_category_idx" ON "topics"("category");
      CREATE INDEX IF NOT EXISTS "topics_is_active_idx" ON "topics"("is_active");
      CREATE INDEX IF NOT EXISTS "topics_name_category_idx" ON "topics"("name", "category");
    `);
    console.log('  ✅ topics indexes added\n');

    // 12. user_topics table indexes
    console.log('📊 Adding indexes to user_topics table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_topics_user_id_idx" ON "user_topics"("user_id");
      CREATE INDEX IF NOT EXISTS "user_topics_topic_id_idx" ON "user_topics"("topic_id");
      CREATE INDEX IF NOT EXISTS "user_topics_proficiency_idx" ON "user_topics"("proficiency");
      CREATE INDEX IF NOT EXISTS "user_topics_interest_idx" ON "user_topics"("interest");
    `);
    console.log('  ✅ user_topics indexes added\n');

    // 13. connections table indexes
    console.log('📊 Adding indexes to connections table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "connections_requester_id_idx" ON "connections"("requester_id");
      CREATE INDEX IF NOT EXISTS "connections_target_id_idx" ON "connections"("target_id");
      CREATE INDEX IF NOT EXISTS "connections_course_id_idx" ON "connections"("course_id");
      CREATE INDEX IF NOT EXISTS "connections_topic_id_idx" ON "connections"("topic_id");
      CREATE INDEX IF NOT EXISTS "connections_status_idx" ON "connections"("status");
      CREATE INDEX IF NOT EXISTS "connections_requester_status_idx" ON "connections"("requester_id", "status");
      CREATE INDEX IF NOT EXISTS "connections_target_status_idx" ON "connections"("target_id", "status");
      CREATE INDEX IF NOT EXISTS "connections_created_at_idx" ON "connections"("created_at");
    `);
    console.log('  ✅ connections indexes added\n');

    // 14. messages table indexes
    console.log('📊 Adding indexes to messages table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "messages_sender_id_idx" ON "messages"("sender_id");
      CREATE INDEX IF NOT EXISTS "messages_connection_id_idx" ON "messages"("connection_id");
      CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
      CREATE INDEX IF NOT EXISTS "messages_is_read_idx" ON "messages"("is_read");
      CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages"("created_at");
      CREATE INDEX IF NOT EXISTS "messages_connection_created_idx" ON "messages"("connection_id", "created_at");
    `);
    console.log('  ✅ messages indexes added\n');

    // 15. groups table indexes
    console.log('📊 Adding indexes to groups table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "groups_course_id_idx" ON "groups"("course_id");
      CREATE INDEX IF NOT EXISTS "groups_created_at_idx" ON "groups"("created_at");
    `);
    console.log('  ✅ groups indexes added\n');

    // 16. group_members table indexes
    console.log('📊 Adding indexes to group_members table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "group_members_group_id_idx" ON "group_members"("group_id");
      CREATE INDEX IF NOT EXISTS "group_members_user_id_idx" ON "group_members"("user_id");
      CREATE INDEX IF NOT EXISTS "group_members_role_idx" ON "group_members"("role");
    `);
    console.log('  ✅ group_members indexes added\n');

    // 17. study_sessions table indexes
    console.log('📊 Adding indexes to study_sessions table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "study_sessions_organizer_id_idx" ON "study_sessions"("organizer_id");
      CREATE INDEX IF NOT EXISTS "study_sessions_course_id_idx" ON "study_sessions"("course_id");
      CREATE INDEX IF NOT EXISTS "study_sessions_status_idx" ON "study_sessions"("status");
      CREATE INDEX IF NOT EXISTS "study_sessions_start_time_idx" ON "study_sessions"("start_time");
      CREATE INDEX IF NOT EXISTS "study_sessions_status_start_time_idx" ON "study_sessions"("status", "start_time");
    `);
    console.log('  ✅ study_sessions indexes added\n');

    // 18. study_session_participants table indexes
    console.log('📊 Adding indexes to study_session_participants table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "study_session_participants_session_id_idx" ON "study_session_participants"("session_id");
      CREATE INDEX IF NOT EXISTS "study_session_participants_user_id_idx" ON "study_session_participants"("user_id");
      CREATE INDEX IF NOT EXISTS "study_session_participants_status_idx" ON "study_session_participants"("status");
    `);
    console.log('  ✅ study_session_participants indexes added\n');

    // 19. matches table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to matches table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "matches_user_id_1_idx" ON "matches"("user_id_1");
      CREATE INDEX IF NOT EXISTS "matches_user_id_2_idx" ON "matches"("user_id_2");
      CREATE INDEX IF NOT EXISTS "matches_status_idx" ON "matches"("status");
      CREATE INDEX IF NOT EXISTS "matches_created_at_idx" ON "matches"("created_at");
    `);
    console.log('  ✅ matches indexes added\n');

    // 20. match_cache table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to match_cache table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "match_cache_user_id_idx" ON "match_cache"("user_id");
      CREATE INDEX IF NOT EXISTS "match_cache_course_id_idx" ON "match_cache"("course_id");
      CREATE INDEX IF NOT EXISTS "match_cache_expires_at_idx" ON "match_cache"("expires_at");
    `);
    console.log('  ✅ match_cache indexes added\n');

    // 21. topic_match_cache table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to topic_match_cache table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "topic_match_cache_user_id_idx" ON "topic_match_cache"("user_id");
      CREATE INDEX IF NOT EXISTS "topic_match_cache_topic_id_idx" ON "topic_match_cache"("topic_id");
      CREATE INDEX IF NOT EXISTS "topic_match_cache_expires_at_idx" ON "topic_match_cache"("expires_at");
    `);
    console.log('  ✅ topic_match_cache indexes added\n');

    // 22. conversations table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to conversations table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "conversations_type_idx" ON "conversations"("type");
      CREATE INDEX IF NOT EXISTS "conversations_group_id_idx" ON "conversations"("group_id");
      CREATE INDEX IF NOT EXISTS "conversations_created_at_idx" ON "conversations"("created_at");
      CREATE INDEX IF NOT EXISTS "conversations_updated_at_idx" ON "conversations"("updated_at");
    `);
    console.log('  ✅ conversations indexes added\n');

    // 23. conversation_participants table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to conversation_participants table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "conversation_participants_conversation_id_idx" ON "conversation_participants"("conversation_id");
      CREATE INDEX IF NOT EXISTS "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");
      CREATE INDEX IF NOT EXISTS "conversation_participants_last_read_at_idx" ON "conversation_participants"("last_read_at");
    `);
    console.log('  ✅ conversation_participants indexes added\n');

    // 24. user_sessions table indexes (even though not used, add for future)
    console.log('📊 Adding indexes to user_sessions table...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_sessions_user_id_idx" ON "user_sessions"("user_id");
      CREATE INDEX IF NOT EXISTS "user_sessions_refresh_token_idx" ON "user_sessions"("refresh_token");
      CREATE INDEX IF NOT EXISTS "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");
    `);
    console.log('  ✅ user_sessions indexes added\n');

    console.log('✅ All indexes added successfully!');
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAllIndexes()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
