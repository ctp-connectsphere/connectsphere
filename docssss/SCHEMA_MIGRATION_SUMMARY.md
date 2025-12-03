# Prisma Schema Migration Summary

## 迁移概览

将 Prisma schema 从 snake_case 命名转换为 PascalCase（模型名）和 camelCase（字段名），使用 `@@map` 映射到数据库表名。

## 需要修复的模式

### 1. 模型名转换 (prisma.[model])

**旧 → 新:**

- `prisma.users` → `prisma.user`
- `prisma.user_courses` → `prisma.userCourse`
- `prisma.user_profiles` → `prisma.userProfile`
- `prisma.user_topics` → `prisma.userTopic`
- `prisma.courses` → `prisma.course`
- `prisma.universities` → `prisma.university`
- `prisma.connections` → `prisma.connection`
- `prisma.conversations` → `prisma.conversation`
- `prisma.conversation_participants` → `prisma.conversationParticipant`
- `prisma.groups` → `prisma.group`
- `prisma.group_members` → `prisma.groupMember`
- `prisma.topics` → `prisma.topic`
- `prisma.messages` → `prisma.message`
- `prisma.matches` → `prisma.match`
- `prisma.accounts` → `prisma.account`
- `prisma.sessions` → `prisma.session`
- `prisma.availability` → `prisma.availability` (不变)
- `prisma.match_cache` → `prisma.matchCache`
- `prisma.topic_match_cache` → `prisma.topicMatchCache`
- `prisma.password_resets` → `prisma.passwordReset`
- `prisma.verification_tokens` → `prisma.verificationToken`
- `prisma.study_sessions` → `prisma.studySession`
- `prisma.study_session_participants` → `prisma.studySessionParticipant`

### 2. 字段名转换

**ID 字段:**

- `user_id` → `userId`
- `course_id` → `courseId`
- `university_id` → `universityId`
- `topic_id` → `topicId`
- `group_id` → `groupId`
- `session_id` → `sessionId`
- `conversation_id` → `conversationId`
- `connection_id` → `connectionId`
- `sender_id` → `senderId`
- `requester_id` → `requesterId`
- `target_id` → `targetId`
- `organizer_id` → `organizerId`

**布尔字段:**

- `is_active` → `isActive`
- `is_verified` → `isVerified`
- `is_read` → `isRead`

**字符串字段:**

- `first_name` → `firstName`
- `last_name` → `lastName`
- `password_hash` → `passwordHash`
- `profile_image_url` → `profileImageUrl`
- `preferred_location` → `preferredLocation`
- `study_style` → `studyStyle`
- `study_pace` → `studyPace`
- `message_type` → `messageType`
- `match_score` → `matchScore`

**时间字段:**

- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- `enrolled_at` → `enrolledAt`
- `joined_at` → `joinedAt`
- `requested_at` → `requestedAt`
- `responded_at` → `respondedAt`
- `calculated_at` → `calculatedAt`
- `expires_at` → `expiresAt`
- `email_verified_at` → `emailVerifiedAt`
- `last_login_at` → `lastLoginAt`
- `start_time` → `startTime`
- `end_time` → `endTime`
- `last_read_at` → `lastReadAt`

**其他字段:**

- `day_of_week` → `dayOfWeek`
- `onboarding_completed` → `onboardingCompleted`
- `max_members` → `maxMembers`
- `match_results` → `matchResults`
- `provider_account_id` → `providerAccountId`
- `refresh_token` → `refreshToken`
- `access_token` → `accessToken`
- `session_token` → `sessionToken`
- `token_type` → `tokenType`
- `id_token` → `idToken`
- `session_state` → `sessionState`

### 3. 关系字段名转换

**include/select 中的关系:**

- `users` → `user`
- `courses` → `course`
- `universities` → `university`
- `topics` → `topic`
- `groups` → `group`
- `conversations` → `conversation`
- `messages` → `message`
- `connections` → `connection`
- `userCourses` → `userCourse` (已经是复数，但需要检查)
- `profile` → `userProfile`

### 4. 复合唯一键名转换

- `user_id_course_id` → `userId_courseId`
- `user_id_topic_id` → `userId_topicId`
- `group_id_user_id` → `groupId_userId`
- `conversation_id_user_id` → `conversationId_userId`
- `session_id_user_id` → `sessionId_userId`
- `user_id_1_user_id_2` → `userId1_userId2`

### 5. 需要特别处理的情况

1. **Account 模型字段**: `account.refreshToken`, `account.accessToken` 等需要类型转换（可能是 JsonValue）
2. **关系查询**: `include: { profile: true }` → `include: { userProfile: true }`
3. **访问关系数据**: `user.profile?.bio` → `user.userProfile?.bio`
4. **复合键查询**: `where: { userId_courseId: {...} }`

## 需要修复的文件列表

根据搜索，以下文件需要修复：

1. `src/lib/auth/config.ts` - Account 字段、User 关系
2. `src/lib/actions/dashboard.ts` - profile → userProfile
3. `src/lib/db/utils.ts` - 模型名
4. `src/lib/actions/availability.ts` - 模型名和字段名
5. `src/lib/actions/matches.ts` - 字段名
6. `src/components/nexus/views/match-view.tsx` - 字段名
7. `src/lib/redis/session.ts` - 字段名
8. `src/lib/auth/stack-auth.ts` - 字段名
9. 其他所有使用 Prisma 的文件

## 迁移步骤

1. 运行迁移脚本批量替换
2. 手动检查并修复特殊情况
3. 运行构建测试
4. 修复类型错误
5. 验证功能
