# Campus Connect - Project Description for AI Assistants

## Project Title

**Campus Connect (ConnectSphere)** - A Study Partner Matching Platform for University Students

---

## Executive Summary

Campus Connect is a full-stack web application designed to help university students find compatible study partners based on shared courses, availability schedules, study preferences, and academic interests. The platform uses intelligent matching algorithms to connect students who share similar academic goals and study habits, facilitating productive study sessions and academic collaboration.

**Tagline:** "Connecting Students, One Study Session at a Time"

---

## Problem Statement

University students often struggle to find compatible study partners who:

- Share the same courses
- Have overlapping availability schedules
- Match their study style preferences (collaborative vs. independent, fast-paced vs. methodical)
- Share similar academic interests and goals

Traditional methods (social media, class forums) are inefficient and don't consider compatibility factors, leading to mismatched partnerships and wasted time.

---

## Core Objectives

1. **Intelligent Matching**: Connect students based on multiple compatibility factors (courses, availability, study preferences, topics of interest)

2. **User Experience**: Provide an intuitive, modern interface for discovering and connecting with study partners
3. **Communication**: Enable real-time messaging between matched students
4. **Study Management**: Allow students to organize study sessions, form groups, and track their academic connections
5. **Scalability**: Build a platform that can scale across multiple universities

---

## Key Features & Functionality

### Phase 1 - MVP (Current Focus)

#### 1. User Authentication & Profile Management

- **Email/Password Authentication**: Secure registration and login system

- **OAuth Integration**: Stack Auth integration for social login options
- **Email Verification**: Email verification system for account security
- **Password Reset**: Forgot password and reset functionality
- **User Profiles**:
  - Basic information (name, university, major)

  - Profile images (Cloudinary integration)
  - Study preferences (study style, pace, preferred location)
  - Bio and personal information
  - Onboarding flow for new users

#### 2. Course Management

- **Course Enrollment**: Students can enroll in courses
- **Course Discovery**: Browse and search available courses
- **Course Information**: Course details including code, section, semester, instructor, schedule, room
- **University Support**: Multi-university support with university-specific courses

#### 3. Intelligent Matching System

- **Multi-Factor Matching Algorithm**:
  - Shared courses matching
  - Availability overlap analysis
  - Study preference compatibility
  - Topic interest matching
- **Match Scoring**: Calculated compatibility scores between users
- **Match Caching**: Redis-based caching for performance optimization
- **Match Display**: View potential study partners with compatibility scores

#### 4. Connection System

- **Connection Requests**: Send and receive connection requests
- **Request Context**: Include initial message and course/topic context
- **Status Management**: Pending, accepted, rejected connection states
- **Connection History**: Track all connections and their status

#### 5. Real-Time Messaging

- **1-on-1 Chat**: Direct messaging between connected students
- **Message History**: Persistent message storage
- **Read Receipts**: Message read status tracking
- **Connection-Based Chat**: Messages linked to connections

#### 6. Availability Management

- **Weekly Schedule**: Set availability for each day of the week
- **Time Slots**: Define start and end times for availability
- **Schedule Matching**: Algorithm considers availability overlap

#### 7. Topics & Interests

- **Topic Selection**: Students can select topics of interest
- **Proficiency Levels**: Indicate proficiency and interest levels
- **Topic-Based Matching**: Match students with similar topic interests
- **Topic Categories**: Organized topic system with categories

### Phase 2 - Enhanced Features (Planned)

- **Advanced Filtering**: More granular filtering options for matches

- **Study Session Scheduling**: Schedule and organize study sessions
- **Notification System**: Real-time notifications for matches, messages, requests
- **Mobile Optimization**: Responsive design improvements
- **Improved Matching Algorithm**: Enhanced scoring and compatibility metrics

### Phase 3 - Group Features (Planned)

- **Study Groups**: Form and join study groups

- **Group Chat**: Multi-participant group messaging
- **Group Matching**: Match students into study groups
- **Group Study Sessions**: Schedule group study sessions
- **Group Management**: Roles, permissions, and group settings

---

## Technical Architecture

### Technology Stack

#### Frontend

- **Next.js 15+**: React framework with App Router
- **React 18+**: UI library
- **TypeScript 5.7+**: Type safety
- **Tailwind CSS 3.x**: Utility-first CSS framework
- **Shadcn/ui**: Component library
- **Custom Nexus UI**: Custom component library for dashboard

#### Backend

- **Next.js Server Actions**: Server-side logic (preferred over API routes)
- **Next.js Server Components**: Server-side rendering
- **TypeScript**: Full-stack type safety

#### Database & ORM

- **PostgreSQL 15+**: Primary relational database
- **Prisma 6+**: Type-safe ORM with migrations
- **Neon**: Serverless PostgreSQL hosting

#### Authentication & Security

- **NextAuth.js v5 (Auth.js)**: Authentication framework
- **Stack Auth**: Additional auth provider integration
- **JWT**: Session tokens
- **CSRF Protection**: Built-in security
- **Middleware**: Route protection

#### Caching & Sessions

- **Upstash Redis**: Serverless Redis for:
  - Session management
  - Match result caching
  - Performance optimization

#### Storage

- **Cloudinary**: Image storage and optimization for profile images

#### Infrastructure

- **Vercel**: Hosting platform (frontend + backend + edge functions)
- **GitHub Actions**: CI/CD pipeline

### Architecture Patterns

#### Server Actions (Preferred)

- Direct server function calls from components
- Type-safe with automatic type inference
- No serialization needed
- Automatic caching and revalidation

#### Component Architecture

```text
components/
  nexus/
    ui/          # Reusable UI components (Button, Badge, Card)
    views/       # Business view components (DashboardView, MatchView)
```

#### Data Validation

- **Zod**: Runtime validation and type inference
- Server Actions validate all input data
- Type-safe forms and API interactions

#### Logging

- Custom logger system (replaces console.log)
- Environment-aware (dev vs. production)
- Structured logging with context

---

## Database Schema Overview

### Core Models

- **User**: User accounts with authentication, profile, and preferences
- **UserProfile**: Extended profile information (study style, pace, bio)
- **University**: University information
- **Course**: Course details (code, section, semester, instructor)
- **UserCourse**: User-course enrollment relationships
- **Topic**: Study topics and interests
- **UserTopic**: User-topic relationships with proficiency/interest
- **Availability**: User weekly availability schedules
- **Match**: Calculated matches between users with scores
- **MatchCache**: Cached match results for performance
- **TopicMatchCache**: Cached topic-based matches
- **Connection**: Connection requests between users
- **Conversation**: Chat conversations (direct or group)
- **Message**: Individual messages in conversations
- **Group**: Study groups
- **GroupMember**: Group membership relationships
- **StudySession**: Scheduled study sessions
- **StudySessionParticipant**: Study session participants

### Key Relationships

- Users can enroll in multiple courses
- Users can have multiple topics of interest
- Users can have multiple availability slots
- Connections link two users, optionally via course or topic
- Messages belong to connections or conversations
- Groups can be course-based or topic-based
- Study sessions can be course-based

---

## Current Implementation Status

### ✅ Completed

- Project foundation and setup
- Next.js 15 application with App Router
- TypeScript configuration
- Prisma schema and database setup
- Authentication system (NextAuth.js v5 + Stack Auth)
- User registration and login
- Email verification system
- Password reset functionality
- User profile management
- Course enrollment system
- Topic selection system
- Availability management
- Basic matching infrastructure
- Connection request system
- Chat/messaging foundation
- Dashboard UI with Nexus components
- Onboarding flow
- Settings page
- Database migrations
- Redis integration for sessions
- Cloudinary integration for images
- Logging system
- Environment configuration

### 🚧 In Progress

- Matching algorithm refinement
- Real-time chat implementation
- Study session scheduling
- Group features

### 📋 Planned

- Real-time features (WebSocket integration)
- Notification system
- Advanced filtering
- Mobile optimization
- Performance optimizations

---

## Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled, full type coverage
- **ESLint + Prettier**: Code quality and formatting
- **Server Actions**: Preferred over API routes
- **Zod Validation**: All user input validated
- **Custom Logger**: No console.log, use logger utility
- **Component Separation**: UI components vs. view components

### File Structure

```text
connectsphere/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   └── api/               # API routes (minimal)
│   ├── components/            # React components
│   │   ├── nexus/            # Nexus UI library
│   │   ├── auth/             # Auth components
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── actions/          # Server Actions
│   │   ├── auth/             # Auth configuration
│   │   ├── db/               # Database utilities
│   │   ├── redis/            # Redis utilities
│   │   └── utils/            # Utility functions
│   └── hooks/                # React hooks
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── scripts/                  # Utility scripts
└── docs/                     # Documentation
```

### Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct PostgreSQL connection (for migrations)
- `REDIS_URL`: Upstash Redis connection
- `NEXTAUTH_SECRET`: NextAuth secret key
- `NEXTAUTH_URL`: Application URL
- `CLOUDINARY_*`: Cloudinary configuration
- `STACK_AUTH_*`: Stack Auth configuration
- Email service configuration

---

## User Flows

### New User Registration Flow

1. User visits registration page
2. Enters email, password, name, university
3. Account created, verification email sent
4. User verifies email
5. User completes onboarding:
   - Select courses
   - Set availability
   - Select topics of interest
   - Complete profile
6. User sees dashboard with potential matches

### Matching Flow

1. User views matches page
2. System calculates matches based on:
   - Shared courses
   - Availability overlap
   - Study preferences
   - Topic interests
3. Matches displayed with compatibility scores
4. User can send connection request
5. Target user receives notification
6. If accepted, connection established
7. Users can start messaging

### Study Session Flow

1. User creates study session
2. Selects course, time, location
3. Invites connections or group members
4. Participants receive invitations
5. Participants accept/decline
6. Session scheduled and tracked

---

## Success Metrics

### User Engagement

- Number of active users
- Connection request acceptance rate
- Messages sent per user
- Study sessions created

### Matching Quality

- Match score distribution
- Connection success rate (requests → accepted)
- User satisfaction with matches

### Technical Performance

- Page load times
- Database query performance
- Cache hit rates
- API response times

---

## Future Enhancements

### Short Term

- Real-time chat with WebSocket
- Push notifications
- Mobile app (React Native)
- Advanced search and filtering

### Long Term

- University SSO integration
- Integration with university course systems
- AI-powered study recommendations
- Study analytics and insights
- Video call integration
- Study material sharing

---

## Team Information

- **Lead Developer**: Yiming Gao
- **Frontend Developer**: Camilo Mason
- **Backend Developer**: Jolyon Burgess
- **DevOps Engineer**: Shaine Lomenario

---

## Additional Context for AI Assistants

### When Building Features

1. **Always use Server Actions** instead of API routes when possible
2. **Validate all input** with Zod schemas
3. **Use TypeScript types** from Prisma schema
4. **Follow existing patterns** in the codebase
5. **Use the logger utility** instead of console.log
6. **Maintain type safety** throughout the stack
7. **Consider caching** for expensive operations (use Redis)
8. **Follow the component architecture** (UI vs. Views)
9. **Update Prisma schema** when adding database changes
10. **Run migrations** after schema changes

### Code Style Preferences

- Use functional components with TypeScript
- Prefer async/await over promises
- Use descriptive variable and function names
- Add comments for complex logic
- Keep components focused and reusable
- Use Tailwind classes for styling
- Follow Next.js 15 App Router conventions

### Testing Approach

- Manual testing scripts in `/scripts` directory
- Database seeding scripts for test data
- Environment validation scripts
- Focus on integration testing

---

## Project Goals for AI Assistance

When working with AI assistants on this project, the primary goals are:

1. **Feature Development**: Build new features following existing patterns
2. **Bug Fixes**: Identify and fix issues in the codebase
3. **Code Improvements**: Refactor and optimize existing code
4. **Documentation**: Maintain and update documentation
5. **Testing**: Create test data and validation scripts
6. **Performance**: Optimize queries, caching, and rendering

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Active Development
