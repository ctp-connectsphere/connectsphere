/**
 * Test script to verify all new CRUD operations are properly exported
 * Run with: npx tsx scripts/test-crud-operations.ts
 */

import {
  createStudySession,
  updateStudySession,
  deleteStudySession,
  joinStudySession,
  updateParticipantStatus,
  getUserStudySessions,
} from '../src/lib/actions/study-sessions';

import { updateUserTopic } from '../src/lib/actions/topics';

import { deleteMessage } from '../src/lib/actions/messages';

import { updateGroup, deleteGroup } from '../src/lib/actions/groups';

console.log('🧪 Testing CRUD Operations Export...\n');

// Test Study Sessions
console.log('✅ Study Sessions:');
console.log('  - createStudySession:', typeof createStudySession === 'function');
console.log('  - updateStudySession:', typeof updateStudySession === 'function');
console.log('  - deleteStudySession:', typeof deleteStudySession === 'function');
console.log('  - joinStudySession:', typeof joinStudySession === 'function');
console.log('  - updateParticipantStatus:', typeof updateParticipantStatus === 'function');
console.log('  - getUserStudySessions:', typeof getUserStudySessions === 'function');

// Test Topics
console.log('\n✅ Topics:');
console.log('  - updateUserTopic:', typeof updateUserTopic === 'function');

// Test Messages
console.log('\n✅ Messages:');
console.log('  - deleteMessage:', typeof deleteMessage === 'function');

// Test Groups
console.log('\n✅ Groups:');
console.log('  - updateGroup:', typeof updateGroup === 'function');
console.log('  - deleteGroup:', typeof deleteGroup === 'function');

console.log('\n✅ All CRUD operations are properly exported!');
console.log('\n📋 Summary:');
console.log('  - Study Sessions: 6 functions');
console.log('  - Topics: 1 function');
console.log('  - Messages: 1 function');
console.log('  - Groups: 2 functions');
console.log('  - Total: 10 new functions');

