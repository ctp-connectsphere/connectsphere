#!/usr/bin/env node

/**
 * Migration script to convert Prisma queries from snake_case to camelCase
 */

const fs = require('fs');
const path = require('path');

// Helper to find all TypeScript files recursively
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, dist, etc.
      if (!['node_modules', '.next', 'dist', '.turbo', '.git'].includes(file)) {
        findTsFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function replaceAll(text, mappings) {
  let result = text;
  // Sort by key length (longest first) to avoid partial matches
  const sortedMappings = Object.entries(mappings).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [oldValue, newValue] of sortedMappings) {
    // Use word boundaries for better matching
    const regex = new RegExp(
      `\\b${oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'g'
    );
    result = result.replace(regex, newValue);
  }
  return result;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Model name mappings
  const MODEL_MAPPINGS = {
    'prisma.users': 'prisma.user',
    'prisma.user_courses': 'prisma.userCourse',
    'prisma.user_profiles': 'prisma.userProfile',
    'prisma.user_topics': 'prisma.userTopic',
    'prisma.courses': 'prisma.course',
    'prisma.universities': 'prisma.university',
    'prisma.connections': 'prisma.connection',
    'prisma.conversations': 'prisma.conversation',
    'prisma.conversation_participants': 'prisma.conversationParticipant',
    'prisma.groups': 'prisma.group',
    'prisma.group_members': 'prisma.groupMember',
    'prisma.topics': 'prisma.topic',
    'prisma.messages': 'prisma.message',
    'prisma.matches': 'prisma.match',
    'prisma.accounts': 'prisma.account',
    'prisma.sessions': 'prisma.session',
    'prisma.match_cache': 'prisma.matchCache',
    'prisma.topic_match_cache': 'prisma.topicMatchCache',
    'prisma.password_resets': 'prisma.passwordReset',
    'prisma.verification_tokens': 'prisma.verificationToken',
    'prisma.study_sessions': 'prisma.studySession',
    'prisma.study_session_participants': 'prisma.studySessionParticipant',
  };

  // Field name mappings
  const FIELD_MAPPINGS = {
    'user_id:': 'userId:',
    'course_id:': 'courseId:',
    'university_id:': 'universityId:',
    'topic_id:': 'topicId:',
    'group_id:': 'group_id:', // Keep this for now
    'session_id:': 'sessionId:',
    'conversation_id:': 'conversationId:',
    'connection_id:': 'connectionId:',
    'sender_id:': 'senderId:',
    'requester_id:': 'requesterId:',
    'target_id:': 'targetId:',
    'organizer_id:': 'organizerId:',
    'is_active:': 'isActive:',
    'is_verified:': 'isVerified:',
    'is_read:': 'isRead:',
    'onboarding_completed:': 'onboardingCompleted:',
    'first_name:': 'firstName:',
    'last_name:': 'lastName:',
    'password_hash:': 'passwordHash:',
    'profile_image_url:': 'profileImageUrl:',
    'preferred_location:': 'preferredLocation:',
    'study_style:': 'studyStyle:',
    'study_pace:': 'studyPace:',
    'message_type:': 'messageType:',
    'match_score:': 'matchScore:',
    'max_members:': 'maxMembers:',
    'match_results:': 'matchResults:',
    'provider_account_id:': 'providerAccountId:',
    'refresh_token:': 'refreshToken:',
    'access_token:': 'accessToken:',
    'session_token:': 'sessionToken:',
    'token_type:': 'tokenType:',
    'id_token:': 'idToken:',
    'session_state:': 'sessionState:',
    'created_at:': 'createdAt:',
    'updated_at:': 'updatedAt:',
    'enrolled_at:': 'enrolledAt:',
    'joined_at:': 'joinedAt:',
    'requested_at:': 'requestedAt:',
    'responded_at:': 'respondedAt:',
    'calculated_at:': 'calculatedAt:',
    'expires_at:': 'expiresAt:',
    'email_verified_at:': 'emailVerifiedAt:',
    'last_login_at:': 'lastLoginAt:',
    'start_time:': 'startTime:',
    'end_time:': 'endTime:',
    'last_read_at:': 'lastReadAt:',
    'day_of_week:': 'dayOfWeek:',
  };

  // Apply replacements
  content = replaceAll(content, MODEL_MAPPINGS);
  content = replaceAll(content, FIELD_MAPPINGS);

  // Fix common patterns
  content = content.replace(/\buser\.profile\b/g, 'user.userProfile');
  content = content.replace(/\bprofile:\s*true\b/g, 'userProfile: true');
  content = content.replace(
    /include:\s*{\s*profile:/g,
    'include: { userProfile:'
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function main() {
  console.log('Starting Prisma schema migration...\n');

  const srcDir = path.join(process.cwd(), 'src');
  const files = findTsFiles(srcDir);

  console.log(`Found ${files.length} files to check\n`);

  let changedCount = 0;
  files.forEach(file => {
    if (migrateFile(file)) {
      console.log(`✓ Updated: ${path.relative(process.cwd(), file)}`);
      changedCount++;
    }
  });

  console.log(`\n✓ Migration complete!`);
  console.log(`  - Files checked: ${files.length}`);
  console.log(`  - Files updated: ${changedCount}`);
}

main();
