# CRUD & Feature Coverage Analysis

## Summary

This document analyzes all features to verify:

1. Each feature has complete CRUD operations (Create, Read, Update, Delete)
2. Each feature has corresponding database tables
3. Missing operations or tables are identified

## 📋 Feature-by-Feature Analysis

### 1. ✅ Dashboard (`/dashboard`)

**Required Tables:**

- `users` ✅
- `user_courses` ✅
- `user_topics` ✅
- `connections` ✅
- `study_sessions` ✅
- `groups` ✅

**CRUD Operations:**

- ✅ **Read**: `getDashboardStats()` - Reads stats from multiple tables
- ✅ **Read**: `getRecommendedPeers()` - Reads users with matching topics
- ✅ **Read**: `getActiveGroups()` - Reads groups
- ✅ **Read**: `getUpcomingSessions()` - Reads study sessions

**Status**: ✅ Complete - Dashboard is read-only, no CRUD needed

---

### 2. ✅ Courses (`/courses`)

**Required Tables:**

- `universities` ✅
- `courses` ✅
- `user_courses` ✅

**CRUD Operations:**

- ✅ **Read**: `searchCourses()` - Search courses
- ✅ **Read**: `getUserCourses()` - Get user's enrolled courses
- ✅ **Read**: `getCourseDetails()` - Get course details
- ✅ **Create**: `enrollInCourse()` - Enroll in course (creates `user_courses`)
- ✅ **Update**: `enrollInCourse()` - Reactivates enrollment if inactive
- ✅ **Delete**: `dropCourse()` - Drop course (soft delete via `isActive = false`)

**Missing Operations:**

- ❌ **Create**: No admin function to create courses
- ❌ **Update**: No admin function to update courses
- ❌ **Delete**: No admin function to delete/deactivate courses

**Status**: ✅ User CRUD complete, ⚠️ Admin CRUD missing (may be intentional)

---

### 3. ✅ Topics (`/topics`)

**Required Tables:**

- `topics` ✅
- `user_topics` ✅

**CRUD Operations:**

- ✅ **Read**: `searchTopics()` - Search topics
- ✅ **Read**: `getUserTopics()` - Get user's topics
- ✅ **Create**: `addUserTopic()` - Add topic to user (creates `user_topics`)
- ✅ **Delete**: `removeUserTopic()` - Remove topic from user

**Missing Operations:**

- ❌ **Create**: No admin function to create topics (topics are seeded)
- ❌ **Update**: No function to update user topic proficiency/interest
- ❌ **Delete**: No admin function to delete topics

**Status**: ✅ User CRUD mostly complete, ⚠️ Missing update user topic, Admin CRUD missing

---

### 4. ✅ Matches (`/matches`)

**Required Tables:**

- `users` ✅
- `user_courses` ✅
- `user_topics` ✅
- `availability` ✅
- `connections` ✅

**CRUD Operations:**

- ✅ **Read**: `findMatches()` - Find matching users (real-time calculation)
- ✅ **Create**: `sendConnectionRequest()` - Send connection request (creates `connections`)

**Status**: ✅ Complete - Matches are calculated, not stored

---

### 5. ✅ Connections (`/connections`)

**Required Tables:**

- `connections` ✅
- `users` ✅
- `messages` ✅

**CRUD Operations:**

- ✅ **Read**: `getUserConnections()` - Get user's connections
- ✅ **Read**: `getPendingConnectionRequests()` - Get pending requests
- ✅ **Create**: `sendConnectionRequest()` - Send request (creates `connections`)
- ✅ **Update**: `acceptConnectionRequest()` - Accept request (updates `connections.status`)
- ✅ **Delete**: `declineConnectionRequest()` - Decline/delete request

**Status**: ✅ Complete CRUD

---

### 6. ✅ Chat (`/chat`)

**Required Tables:**

- `connections` ✅
- `messages` ✅
- `users` ✅

**CRUD Operations:**

- ✅ **Read**: `getMessages()` - Get messages for a connection
- ✅ **Read**: `getConversations()` - Get all conversations (connections with messages)
- ✅ **Create**: `sendMessage()` - Send message (creates `messages`)
- ✅ **Update**: `markMessagesAsRead()` - Mark messages as read (updates `messages.is_read`)
- ❌ **Delete**: No function to delete messages

**Status**: ⚠️ Missing delete message operation

---

### 7. ✅ Groups (`/groups`)

**Required Tables:**

- `groups` ✅
- `group_members` ✅
- `courses` ✅

**CRUD Operations:**

- ✅ **Read**: `getAllGroups()` - Get all groups
- ✅ **Read**: `getUserGroups()` - Get user's groups
- ✅ **Create**: `createGroup()` - Create group (creates `groups` and `group_members`)
- ✅ **Create**: `joinGroup()` - Join group (creates `group_members`)
- ✅ **Delete**: `leaveGroup()` - Leave group (deletes `group_members`)
- ❌ **Update**: No function to update group details
- ❌ **Delete**: No function to delete group

**Status**: ⚠️ Missing update and delete group operations

---

### 8. ✅ Availability (`/availability`)

**Required Tables:**

- `availability` ✅
- `users` ✅

**CRUD Operations:**

- ✅ **Read**: `getUserAvailability()` - Get user's availability
- ✅ **Read**: `getUserAvailabilityById()` - Get specific user's availability
- ✅ **Create**: `createAvailability()` - Create availability slots
- ✅ **Update**: `updateAvailability()` - Update availability slot
- ✅ **Delete**: `deleteAvailability()` - Delete availability slot

**Status**: ✅ Complete CRUD

---

### 9. ✅ Profile (`/profile`)

**Required Tables:**

- `users` ✅
- `user_profiles` ✅

**CRUD Operations:**

- ✅ **Read**: `getUserProfile()` - Get user profile
- ✅ **Create/Update**: `createOrUpdateProfile()` - Upsert profile
- ✅ **Update**: User can update profile image via settings
- ❌ **Delete**: No function to delete profile (cascade delete with user)

**Status**: ✅ Complete (delete handled by user deletion)

---

### 10. ✅ Settings (`/settings`)

**Required Tables:**

- `users` ✅ (settings stored in `users.settings` JSON field)

**CRUD Operations:**

- ✅ **Read**: `getUserSettings()` - Get user settings
- ✅ **Update**: `updateNotifications()` - Update notification settings
- ✅ **Update**: `updatePrivacy()` - Update privacy settings
- ✅ **Update**: `updateAppearance()` - Update appearance settings
- ✅ **Delete**: `deleteAccount()` - Delete user account

**Status**: ✅ Complete CRUD

---

### 11. ✅ Onboarding (`/onboarding`)

**Required Tables:**

- `user_profiles` ✅
- `users` ✅

**CRUD Operations:**

- ✅ **Read**: `hasCompletedOnboarding()` - Check onboarding status
- ✅ **Create/Update**: `completeOnboarding()` - Complete onboarding (updates `user_profiles.onboarding_completed`)

**Status**: ✅ Complete

---

### 12. ⚠️ Study Sessions (via Dashboard)

**Required Tables:**

- `study_sessions` ✅
- `study_session_participants` ✅
- `courses` ✅

**CRUD Operations:**

- ✅ **Read**: `getUpcomingSessions()` - Get upcoming sessions
- ❌ **Create**: No function to create study session
- ❌ **Update**: No function to update study session
- ❌ **Delete**: No function to delete/cancel study session
- ❌ **Create**: No function to join study session (create participant)
- ❌ **Update**: No function to update participant status

**Status**: ❌ Missing all CRUD operations (only read exists)

---

## 📊 Summary Table

| Feature        | Table                                          | Create       | Read | Update  | Delete       | Status |
| -------------- | ---------------------------------------------- | ------------ | ---- | ------- | ------------ | ------ |
| Dashboard      | Multiple                                       | N/A          | ✅   | N/A     | N/A          | ✅     |
| Courses        | `courses`, `user_courses`                      | ✅ User      | ✅   | ✅ User | ✅ User      | ✅     |
| Topics         | `topics`, `user_topics`                        | ⚠️ User only | ✅   | ❌      | ⚠️ User only | ⚠️     |
| Matches        | Calculated                                     | N/A          | ✅   | N/A     | N/A          | ✅     |
| Connections    | `connections`                                  | ✅           | ✅   | ✅      | ✅           | ✅     |
| Chat           | `messages`                                     | ✅           | ✅   | ✅      | ❌           | ⚠️     |
| Groups         | `groups`, `group_members`                      | ✅           | ✅   | ❌      | ❌           | ⚠️     |
| Availability   | `availability`                                 | ✅           | ✅   | ✅      | ✅           | ✅     |
| Profile        | `users`, `user_profiles`                       | ✅           | ✅   | ✅      | ✅           | ✅     |
| Settings       | `users`                                        | N/A          | ✅   | ✅      | ✅           | ✅     |
| Onboarding     | `user_profiles`                                | ✅           | ✅   | ✅      | N/A          | ✅     |
| Study Sessions | `study_sessions`, `study_session_participants` | ❌           | ✅   | ❌      | ❌           | ❌     |

## 🚨 Missing CRUD Operations

### High Priority

1. **Study Sessions** - Missing all operations except read
   - ❌ `createStudySession()` - Create study session
   - ❌ `updateStudySession()` - Update study session details
   - ❌ `deleteStudySession()` - Cancel/delete study session
   - ❌ `joinStudySession()` - Join as participant
   - ❌ `updateParticipantStatus()` - Accept/decline/leave session

### Medium Priority

2. **Topics** - Missing update operation
   - ❌ `updateUserTopic()` - Update proficiency/interest level

3. **Chat** - Missing delete operation
   - ❌ `deleteMessage()` - Delete message

4. **Groups** - Missing update and delete operations
   - ❌ `updateGroup()` - Update group details
   - ❌ `deleteGroup()` - Delete group

### Low Priority (Admin Functions)

5. **Courses** - Missing admin CRUD
   - ❌ `createCourse()` - Admin create course
   - ❌ `updateCourse()` - Admin update course
   - ❌ `deleteCourse()` - Admin delete/deactivate course

6. **Topics** - Missing admin CRUD
   - ❌ `createTopic()` - Admin create topic
   - ❌ `updateTopic()` - Admin update topic
   - ❌ `deleteTopic()` - Admin delete topic

## ✅ Tables with Complete CRUD

1. ✅ `availability` - Full CRUD
2. ✅ `connections` - Full CRUD
3. ✅ `user_profiles` - Full CRUD
4. ✅ `users` - Full CRUD (via settings)

## ⚠️ Tables with Partial CRUD

1. ⚠️ `user_courses` - Create, Read, Update, Delete (soft delete via isActive)
2. ⚠️ `user_topics` - Create, Read, Delete (no update)
3. ⚠️ `messages` - Create, Read, Update (no delete)
4. ⚠️ `groups` - Create, Read (no update, delete)
5. ⚠️ `group_members` - Create, Delete (no update)

## ❌ Tables with Only Read

1. ❌ `study_sessions` - Only Read (no Create, Update, Delete)
2. ❌ `study_session_participants` - Only Read (no Create, Update, Delete)

## 🎯 Recommendations

### Immediate Actions

1. **Implement Study Sessions CRUD** - This is a core feature but missing all operations
   - Create `src/lib/actions/study-sessions.ts`
   - Implement all CRUD operations

2. **Add Update User Topic** - Allow users to update proficiency/interest
   - Add `updateUserTopic()` to `src/lib/actions/topics.ts`

3. **Add Delete Message** - Allow users to delete their messages
   - Add `deleteMessage()` to `src/lib/actions/messages.ts`

4. **Add Group Update/Delete** - Allow group owners to manage groups
   - Add `updateGroup()` and `deleteGroup()` to `src/lib/actions/groups.ts`

### Future Enhancements

5. **Admin Panel** - Create admin functions for courses and topics management
6. **Unenroll from Course** - Add explicit unenroll function (currently only update status)
