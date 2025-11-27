# Database Table Usage Analysis

## Summary

This document analyzes which database tables are actually used in the codebase and which ones may be unused or need to be created.

## ✅ Tables Currently Used in Code

### Core User & Authentication
1. **users** ✅ - Extensively used
   - User authentication, profiles, OAuth
   - Used in: `auth/config.ts`, `actions/auth.ts`, `actions/settings.ts`, `actions/profile.ts`

2. **accounts** ✅ - Used for OAuth
   - OAuth provider accounts (Google, GitHub)
   - Used in: `auth/config.ts`

3. **sessions** ✅ - Used for NextAuth sessions
   - Session management
   - Used in: `auth/session-manager.ts`

4. **verification_tokens** ✅ - Email verification
   - Email verification tokens
   - Used in: `actions/auth.ts`

5. **password_resets** ✅ - Password reset
   - Password reset tokens
   - Used in: `actions/auth.ts`

6. **user_profiles** ✅ - User profile data
   - User preferences, bio, study style
   - Used in: `actions/profile.ts`, `actions/onboarding.ts`, `auth/config.ts`

### Academic Data
7. **universities** ✅ - University information
   - University names and domains
   - Used in: `actions/courses.ts`

8. **courses** ✅ - Course information
   - Course details, sections, instructors
   - Used in: `actions/courses.ts`, `api/user/courses/route.ts`

9. **user_courses** ✅ - User course enrollments
   - User enrollments in courses
   - Used in: `actions/courses.ts`, `actions/matches.ts`, `actions/dashboard.ts`

10. **topics** ✅ - Topic/Skill/Interest definitions
    - Topics, skills, interests, subjects
    - Used in: `actions/topics.ts`

11. **user_topics** ✅ - User topic associations
    - User's selected topics with proficiency/interest
    - Used in: `actions/topics.ts`, `actions/matches.ts`, `actions/dashboard.ts`

### Social & Matching
12. **connections** ✅ - User connections
    - Friend/study partner connections
    - Used in: `actions/matches.ts`, `actions/messages.ts`, `actions/dashboard.ts`

13. **messages** ✅ - Direct messages
    - Messages between users via connections
    - Used in: `actions/messages.ts`

14. **availability** ✅ - User availability
    - User's available time slots
    - Used in: `actions/availability.ts`, `actions/matches.ts`

### Groups & Study Sessions
15. **groups** ✅ - Study groups
    - Study groups for courses
    - Used in: `actions/groups.ts`

16. **group_members** ✅ - Group membership
    - Users in groups
    - Used in: `actions/groups.ts`

17. **study_sessions** ✅ - Study session scheduling
    - Scheduled study sessions
    - Used in: `actions/dashboard.ts`

18. **study_session_participants** ✅ - Session participants
    - Users participating in study sessions
    - Used in: `actions/dashboard.ts` (via include)

## ❌ Tables Defined but NOT Used in Code

### Matching & Caching (Replaced by Real-time Queries & Redis)
19. **matches** ❌ - User matches
    - **Status**: NOT USED - Matching is done via real-time raw SQL queries in `actions/matches.ts`
    - **Finding**: The `findMatches()` function uses `$queryRaw` to calculate matches on-the-fly
    - **Recommendation**: Can be removed from schema (or kept for future use if you want to store match history)

20. **match_cache** ❌ - Match result caching
    - **Status**: NOT USED - Replaced by Redis caching
    - **Finding**: `lib/redis/cache.ts` handles match caching with `getMatches()` and `setMatches()`
    - **Recommendation**: Can be removed from schema

21. **topic_match_cache** ❌ - Topic match caching
    - **Status**: NOT USED - Replaced by Redis caching
    - **Finding**: Same as `match_cache`, Redis is used instead
    - **Recommendation**: Can be removed from schema

### Chat System (Not Used - Direct Connection-Based Messaging)
22. **conversations** ❌ - Conversation threads
    - **Status**: NOT USED - Chat uses `connections` + `messages` directly
    - **Finding**: `actions/messages.ts` uses `Connection` model with `messages` relation
    - **Finding**: `getConversations()` returns connections formatted as conversations
    - **Recommendation**: Can be removed (or kept for future group chat feature)

23. **conversation_participants** ❌ - Conversation participants
    - **Status**: NOT USED - Not needed for current connection-based chat
    - **Finding**: Chat is 1-on-1 via connections, not group conversations
    - **Recommendation**: Can be removed (or kept for future group chat feature)

### Legacy/Alternative Session Management
24. **user_sessions** ❌ - Alternative session storage
    - **Status**: NOT USED - NextAuth uses `sessions` table instead
    - **Finding**: No code references to `user_sessions` table
    - **Finding**: `auth/session-manager.ts` uses `prisma.session` (NextAuth sessions)
    - **Recommendation**: Can be removed from schema

## 🔍 Detailed Usage by Feature

### Authentication & User Management
- ✅ `users` - Core user data
- ✅ `accounts` - OAuth accounts
- ✅ `sessions` - NextAuth sessions
- ✅ `verification_tokens` - Email verification
- ✅ `password_resets` - Password reset flow
- ✅ `user_profiles` - Extended user profile

### Course Management
- ✅ `universities` - University data
- ✅ `courses` - Course catalog
- ✅ `user_courses` - Enrollments

### Topic & Interest Management
- ✅ `topics` - Topic definitions
- ✅ `user_topics` - User topic associations

### Matching & Connections
- ✅ `connections` - User connections
- ✅ `availability` - Time availability
- ⚠️ `matches` - Match records (check usage)
- ⚠️ `match_cache` - Match caching (may use Redis instead)
- ⚠️ `topic_match_cache` - Topic match caching (may use Redis instead)

### Messaging
- ✅ `messages` - Direct messages
- ⚠️ `conversations` - Conversation threads (future feature?)
- ⚠️ `conversation_participants` - Conversation participants (future feature?)

### Groups & Study Sessions
- ✅ `groups` - Study groups
- ✅ `group_members` - Group membership
- ✅ `study_sessions` - Scheduled sessions
- ✅ `study_session_participants` - Session participants

### Legacy/Unused
- ⚠️ `user_sessions` - Alternative session storage (check if needed)

## 📋 Recommendations

### ✅ Confirmed: Safe to Remove (Not Used)
1. **matches** - Can be removed (matching is real-time via SQL)
2. **match_cache** - Can be removed (Redis is used instead)
3. **topic_match_cache** - Can be removed (Redis is used instead)
4. **conversations** - Can be removed (chat uses connections directly)
5. **conversation_participants** - Can be removed (not needed for 1-on-1 chat)
6. **user_sessions** - Can be removed (NextAuth uses `sessions` table)

### ⚠️ Optional: Keep for Future Features
- **conversations** + **conversation_participants** - Keep if planning group chat feature
- **matches** - Keep if you want to store match history (currently calculated on-the-fly)

## 🛠️ Next Steps

### Option 1: Clean Up Schema (Recommended)
Remove unused tables to simplify schema:
```sql
-- These tables are safe to drop (not used in code):
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS match_cache CASCADE;
DROP TABLE IF EXISTS topic_match_cache CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
```

### Option 2: Keep for Future
If you plan to use these tables in the future, keep them in the schema but document that they're not currently used.

## 📊 Summary

**Total Tables in Schema**: 24
**Tables Actually Used**: 18 ✅
**Tables Not Used**: 6 ❌

**Used Tables (18)**:
1. users ✅
2. accounts ✅
3. sessions ✅
4. verification_tokens ✅
5. password_resets ✅
6. user_profiles ✅
7. universities ✅
8. courses ✅
9. user_courses ✅
10. topics ✅
11. user_topics ✅
12. connections ✅
13. messages ✅
14. availability ✅
15. groups ✅
16. group_members ✅
17. study_sessions ✅
18. study_session_participants ✅

**Unused Tables (6)**:
1. matches ❌
2. match_cache ❌
3. topic_match_cache ❌
4. conversations ❌
5. conversation_participants ❌
6. user_sessions ❌

