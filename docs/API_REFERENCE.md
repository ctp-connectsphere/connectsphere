# Campus Connect API Reference

## Table of Contents

1. [Overview](#overview)
2. [Next.js Architecture](#nextjs-architecture)
3. [Authentication](#authentication)
4. [API Routes](#api-routes)
5. [Server Actions](#server-actions)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Route Handlers](#route-handlers)
   - [Authentication Routes](#authentication-routes)
   - [User Profile Routes](#user-profile-routes)
   - [Course Management Routes](#course-management-routes)
   - [Matching Routes](#matching-routes)
   - [Connection Routes](#connection-routes)
10. [Server Actions](#server-actions-1)
11. [Real-time Communication](#real-time-communication)
12. [Client-Side Usage](#client-side-usage)

---

## Overview

Campus Connect uses Next.js 14+ App Router architecture with Server Components, Server Actions, and API Route Handlers. The application provides a unified full-stack experience with server-side rendering, type-safe API calls, and modern React patterns.

**Base URL:** `https://campusconnect.app`

**Authentication:** NextAuth.js v5 with JWT sessions

**Architecture:** Next.js App Router with Server Components and Server Actions

## Next.js Architecture

### Route Handlers (`app/api/*/route.ts`)
- RESTful API endpoints for external integrations
- Webhook handlers for third-party services
- File upload/download endpoints

### Server Actions (`lib/actions/*.ts`)
- Type-safe server mutations
- Form submissions and data updates
- Database operations with automatic revalidation

### Server Components
- Direct database access without API calls
- Server-side rendering with automatic caching
- SEO-optimized content delivery

---

## Authentication

Campus Connect uses NextAuth.js v5 for authentication with JWT sessions stored in Redis.

### Session Access

**Server Components:**
```typescript
import { auth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>Welcome, {session.user.email}!</div>
}
```

**Client Components:**
```typescript
'use client'
import { useSession } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Please sign in</div>
  
  return <div>Hello, {session?.user?.email}!</div>
}
```

### Authentication Providers

- **Credentials Provider:** Email/password authentication
- **Email Provider:** Magic link authentication (planned)
- **University SSO:** Integration with university systems (planned)

---

## API Routes

### Route Handlers (`app/api/*/route.ts`)

**Production:** `https://campusconnect.app/api/*`  
**Staging:** `https://staging.campusconnect.app/api/*`  
**Development:** `http://localhost:3000/api/*`

### Server Actions (`lib/actions/*.ts`)

Server Actions are imported directly into components and provide type-safe server-side mutations.

## Server Actions

Server Actions are the primary way to handle mutations in Next.js App Router. They provide type-safe server-side mutations with automatic revalidation and error handling.

### Authentication Actions

```typescript
// lib/actions/auth.ts
'use server'

import { auth, signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  university: z.string().min(1, 'University is required')
})

export async function registerUser(formData: FormData) {
  try {
    const validatedData = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      university: formData.get('university')
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        university: validatedData.university,
        isVerified: false
      }
    })

    // Send verification email
    await resend.emails.send({
      from: 'noreply@campusconnect.app',
      to: user.email,
      subject: 'Verify your Campus Connect account',
      html: `
        <h1>Welcome to Campus Connect!</h1>
        <p>Click the link below to verify your account:</p>
        <a href="${process.env.NEXTAUTH_URL}/api/auth/verify?token=${user.id}">
          Verify Account
        </a>
      `
    })

    return { success: true, message: 'Registration successful. Please check your email.' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, message: error.message }
  }
}

export async function loginUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    redirect('/dashboard')
  } catch (error) {
    return { success: false, message: 'Invalid credentials' }
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' })
}
```

### User Profile Actions

```typescript
// lib/actions/user.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { uploadToCloudinary } from '@/lib/cloudinary'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferredLocation: z.enum(['library', 'cafe', 'home', 'study_room', 'any']).optional(),
  studyStyle: z.enum(['collaborative', 'quiet', 'mixed']).optional(),
  studyPace: z.enum(['slow', 'moderate', 'fast']).optional()
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  try {
    const validatedData = updateProfileSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      bio: formData.get('bio'),
      preferredLocation: formData.get('preferredLocation'),
      studyStyle: formData.get('studyStyle'),
      studyPace: formData.get('studyPace')
    })

    // Update user profile
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      },
      include: { profile: true }
    })

    // Update or create user profile
    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: {
          bio: validatedData.bio,
          preferredLocation: validatedData.preferredLocation,
          studyStyle: validatedData.studyStyle,
          studyPace: validatedData.studyPace
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          bio: validatedData.bio,
          preferredLocation: validatedData.preferredLocation,
          studyStyle: validatedData.studyStyle,
          studyPace: validatedData.studyPace
        }
      })
    }
    
    revalidatePath('/profile')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, message: error.message }
  }
}

export async function uploadProfileImage(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('image') as File
  
  if (!file) {
    return { success: false, message: 'No image provided' }
  }

  try {
    // Upload to Cloudinary
    const buffer = await file.arrayBuffer()
    const result = await uploadToCloudinary(Buffer.from(buffer), {
      folder: 'profiles',
      public_id: session.user.id,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    })

    // Update user profile image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImageUrl: result.secure_url }
    })

    revalidatePath('/profile')
    return { success: true, imageUrl: result.secure_url }
  } catch (error) {
    return { success: false, message: 'Failed to upload image' }
  }
}
```

### Course Management Actions

```typescript
// lib/actions/courses.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const enrollCourseSchema = z.object({
  courseId: z.string().uuid('Invalid course ID')
})

export async function enrollInCourse(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const { courseId } = enrollCourseSchema.parse({
      courseId: formData.get('courseId')
    })

    // Check if already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (existingEnrollment) {
      return { success: false, message: 'Already enrolled in this course' }
    }

    // Enroll in course
    await prisma.userCourse.create({
      data: {
        userId: session.user.id,
        courseId
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    return { success: true, message: 'Successfully enrolled in course' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, message: error.message }
  }
}

export async function unenrollFromCourse(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const { courseId } = enrollCourseSchema.parse({
      courseId: formData.get('courseId')
    })

    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    return { success: true, message: 'Successfully unenrolled from course' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
```

### Availability Management Actions

```typescript
// lib/actions/availability.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
})

export async function updateAvailability(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const availabilityData = JSON.parse(formData.get('availability') as string)
    
    // Clear existing availability
    await prisma.availability.deleteMany({
      where: { userId: session.user.id }
    })

    // Add new availability slots
    const availabilitySlots = availabilityData.map((slot: any) => ({
      userId: session.user.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime
    }))

    await prisma.availability.createMany({
      data: availabilitySlots
    })

    revalidatePath('/profile')
    revalidatePath('/matches')
    return { success: true, message: 'Availability updated successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to update availability' }
  }
}
```

### Matching Actions

```typescript
// lib/actions/matching.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const findMatchesSchema = z.object({
  courseId: z.string().uuid(),
  limit: z.number().min(1).max(50).default(20)
})

export async function findMatches(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const { courseId, limit } = findMatchesSchema.parse({
      courseId: formData.get('courseId'),
      limit: Number(formData.get('limit')) || 20
    })

    // Check if user is enrolled in the course
    const userEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    })

    if (!userEnrollment) {
      return { success: false, message: 'You are not enrolled in this course' }
    }

    // Find potential matches using raw SQL for performance
    const matches = await prisma.$queryRaw`
      WITH user_course_mates AS (
        SELECT uc2.user_id
        FROM user_courses uc1
        JOIN user_courses uc2 ON uc1.course_id = uc2.course_id
        WHERE uc1.user_id = ${session.user.id}
          AND uc1.course_id = ${courseId}
          AND uc2.user_id != ${session.user.id}
          AND uc2.is_active = TRUE
      ),
      availability_overlaps AS (
        SELECT 
          ucm.user_id,
          COUNT(*) as overlap_count,
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'day', a1.day_of_week,
              'start', a1.start_time,
              'end', a1.end_time
            )
          ) as common_slots
        FROM user_course_mates ucm
        JOIN availability a1 ON ucm.user_id = a1.user_id
        JOIN availability a2 ON a1.day_of_week = a2.day_of_week
        WHERE a2.user_id = ${session.user.id}
          AND a1.start_time < a2.end_time
          AND a1.end_time > a2.start_time
        GROUP BY ucm.user_id
      )
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        up.preferred_location,
        up.study_style,
        up.study_pace,
        up.bio,
        COALESCE(ao.overlap_count, 0) as availability_score,
        COALESCE(ao.common_slots, '{}') as common_availability,
        CASE 
          WHEN c.id IS NOT NULL THEN 'connected'
          WHEN c2.id IS NOT NULL THEN 'pending'
          ELSE 'none'
        END as connection_status
      FROM user_course_mates ucm
      JOIN users u ON ucm.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN availability_overlaps ao ON u.id = ao.user_id
      LEFT JOIN connections c ON (
        (c.requester_id = ${session.user.id} AND c.target_id = u.id AND c.course_id = ${courseId} AND c.status = 'accepted') OR
        (c.target_id = ${session.user.id} AND c.requester_id = u.id AND c.course_id = ${courseId} AND c.status = 'accepted')
      )
      LEFT JOIN connections c2 ON (
        (c2.requester_id = ${session.user.id} AND c2.target_id = u.id AND c2.course_id = ${courseId} AND c2.status = 'pending') OR
        (c2.target_id = ${session.user.id} AND c2.requester_id = u.id AND c2.course_id = ${courseId} AND c2.status = 'pending')
      )
      WHERE u.is_active = TRUE
        AND u.is_verified = TRUE
      ORDER BY availability_score DESC, u.created_at ASC
      LIMIT ${limit}
    `

    return { success: true, matches }
  } catch (error) {
    return { success: false, message: 'Failed to find matches' }
  }
}
```

### Connection Actions

```typescript
// lib/actions/connections.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const connectionRequestSchema = z.object({
  targetUserId: z.string().uuid(),
  courseId: z.string().uuid(),
  message: z.string().max(500, 'Message too long').optional()
})

export async function sendConnectionRequest(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const { targetUserId, courseId, message } = connectionRequestSchema.parse({
      targetUserId: formData.get('targetUserId'),
      courseId: formData.get('courseId'),
      message: formData.get('message')
    })

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        requesterId: session.user.id,
        targetId: targetUserId,
        courseId
      }
    })

    if (existingConnection) {
      return { success: false, message: 'Connection request already sent' }
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        requesterId: session.user.id,
        targetId: targetUserId,
        courseId,
        status: 'pending',
        initialMessage: message
      }
    })

    // TODO: Send real-time notification via Pusher

    revalidatePath('/matches')
    revalidatePath('/connections')
    return { success: true, message: 'Connection request sent successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, message: error.message }
  }
}

export async function respondToConnection(formData: FormData) {
  const session = await auth()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  try {
    const connectionId = formData.get('connectionId') as string
    const action = formData.get('action') as 'accept' | 'decline'

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        targetId: session.user.id,
        status: 'pending'
      }
    })

    if (!connection) {
      return { success: false, message: 'Connection request not found' }
    }

    await prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: action,
        respondedAt: new Date()
      }
    })

    revalidatePath('/connections')
    return { success: true, message: `Connection ${action}ed successfully` }
  } catch (error) {
    return { success: false, message: 'Failed to respond to connection' }
  }
}
```

**Usage in Components:**
```typescript
// components/ProfileForm.tsx
import { updateProfile } from '@/lib/actions/user'
import { useState } from 'react'

export default function ProfileForm() {
  const [isPending, startTransition] = useState(false)

  return (
    <form action={updateProfile}>
      <input name="firstName" placeholder="First Name" required />
      <input name="lastName" placeholder="Last Name" required />
      <textarea name="bio" placeholder="Tell us about yourself" maxLength={500} />
      <select name="preferredLocation">
        <option value="">Select preferred location</option>
        <option value="library">Library</option>
        <option value="cafe">Cafe</option>
        <option value="home">Home</option>
        <option value="study_room">Study Room</option>
        <option value="any">Any</option>
      </select>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}
```

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Invalid credentials or token |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `RESOURCE_CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server internal error |

---

## Security Implementation

### Authentication & Authorization

**NextAuth.js Configuration:**
```typescript
// lib/auth/config.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true }
        })

        if (!user || !user.isVerified) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.profileImageUrl
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error'
  }
}

export const { auth, signIn, signOut } = NextAuth(authConfig)
```

### Rate Limiting

Rate limiting is implemented using Upstash Redis with Next.js middleware:

- **Unauthenticated requests:** 100 requests per minute per IP
- **Authenticated requests:** 1000 requests per hour per user
- **Auth endpoints:** 10 requests per minute per IP
- **API endpoints:** 500 requests per hour per user

**Enhanced Middleware Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Different rate limits for different endpoints
const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

const apiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(500, '1 h'), // 500 requests per hour
})

const generalRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { pathname } = request.nextUrl

  // Determine which rate limit to apply
  let ratelimit
  let identifier = ip

  if (pathname.startsWith('/api/auth/')) {
    ratelimit = authRatelimit
  } else if (pathname.startsWith('/api/')) {
    ratelimit = apiRatelimit
    // For API routes, use user ID if available
    const token = request.cookies.get('next-auth.session-token')?.value
    if (token) {
      // In production, decode JWT to get user ID
      // For now, use IP as fallback
      identifier = ip
    }
  } else {
    ratelimit = generalRatelimit
  }

  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  const response = NextResponse.next()

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())

  if (!success) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
        'Retry-After': Math.round((reset - Date.now()) / 1000).toString()
      }
    })
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
```

### Input Validation & Sanitization

**Zod Schema Validation:**
```typescript
// lib/validations/schemas.ts
import { z } from 'zod'

export const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .regex(/^[^@]+@[^@]+\.[^@]+$/, 'Must be a valid email address')
    .refine(email => email.endsWith('.edu'), 'Must use university email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name contains invalid characters'),
  university: z.string()
    .min(1, 'University is required')
    .max(100, 'University name must be less than 100 characters')
})

export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name contains invalid characters'),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  preferredLocation: z.enum(['library', 'cafe', 'home', 'study_room', 'any'])
    .optional(),
  studyStyle: z.enum(['collaborative', 'quiet', 'mixed'])
    .optional(),
  studyPace: z.enum(['slow', 'moderate', 'fast'])
    .optional()
})

export const messageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .refine(content => {
      // Basic XSS prevention
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ]
      return !dangerousPatterns.some(pattern => pattern.test(content))
    }, 'Message contains potentially harmful content')
})
```

**Input Sanitization:**
```typescript
// lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeInput(input: string): string {
  // Remove HTML tags and dangerous content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }).trim()
}

export function sanitizeHtmlInput(input: string): string {
  // Allow some safe HTML tags for rich content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }
  
  return { valid: true }
}
```

### CSRF Protection

**CSRF Token Implementation:**
```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto'

const csrfTokens = new Map<string, { token: string; expires: number }>()

export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex')
  const expires = Date.now() + 3600000 // 1 hour
  
  csrfTokens.set(token, { token, expires })
  
  // Clean up expired tokens
  cleanupExpiredTokens()
  
  return token
}

export function validateCSRFToken(token: string): boolean {
  const tokenData = csrfTokens.get(token)
  
  if (!tokenData) {
    return false
  }
  
  if (Date.now() > tokenData.expires) {
    csrfTokens.delete(token)
    return false
  }
  
  return true
}

function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token)
    }
  }
}
```

### Password Security

**Password Hashing:**
```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

### Session Security

**Session Configuration:**
```typescript
// lib/auth/session.ts
import { NextRequest } from 'next/server'

export function createSecureSession(userId: string, request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.ip ?? '127.0.0.1'
  
  return {
    userId,
    userAgent: hashUserAgent(userAgent),
    ip: hashIP(ip),
    createdAt: new Date(),
    lastActivity: new Date()
  }
}

export function validateSession(session: any, request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ip = request.ip ?? '127.0.0.1'
  
  // Check if user agent matches
  if (session.userAgent !== hashUserAgent(userAgent)) {
    return false
  }
  
  // Check if IP matches (allow some IP changes for mobile users)
  if (session.ip !== hashIP(ip)) {
    // Log suspicious activity
    console.warn('Session IP mismatch', { sessionId: session.id, expectedIP: session.ip, actualIP: hashIP(ip) })
  }
  
  // Check if session is not too old
  const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
  if (Date.now() - session.createdAt.getTime() > maxAge) {
    return false
  }
  
  return true
}

function hashUserAgent(userAgent: string): string {
  // Simple hash for user agent (in production, use proper hashing)
  return Buffer.from(userAgent).toString('base64').slice(0, 16)
}

function hashIP(ip: string): string {
  // Simple hash for IP (in production, use proper hashing)
  return Buffer.from(ip).toString('base64').slice(0, 16)
}
```

### API Security Headers

**Security Headers Configuration:**
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
Retry-After: 3600
```

---

## Endpoints

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "university": "University of California"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "university": "University of California",
      "isVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "message": "Registration successful. Please check your email for verification."
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@university.edu",
      "firstName": "John",
      "lastName": "Doe",
      "university": "University of California",
      "isVerified": true,
      "profileComplete": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

#### Verify Email

```http
GET /api/v1/auth/verify?token={verification_token}
```

#### Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

#### Forgot Password

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@university.edu"
}
```

#### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

---

### User Profile Endpoints

#### Get User Profile

```http
GET /api/v1/users/profile
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "university": "University of California",
    "profileImage": "https://cloudinary.com/image.jpg",
    "studyProfile": {
      "preferredLocation": "library",
      "studyStyle": "collaborative",
      "studyPace": "moderate",
      "bio": "I'm a computer science student looking for study partners."
    },
    "courses": [
      {
        "id": "course_456",
        "name": "Data Structures and Algorithms",
        "code": "CS 161",
        "section": "001",
        "semester": "Spring 2024"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update User Profile

```http
PUT /api/v1/users/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "studyProfile": {
    "preferredLocation": "library",
    "studyStyle": "collaborative",
    "studyPace": "moderate",
    "bio": "Updated bio"
  }
}
```

#### Upload Profile Image

```http
POST /api/v1/users/profile/image
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <image-file>
```

---

### Course Management Endpoints

#### Get Available Courses

```http
GET /api/v1/courses
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `university` (optional): Filter by university
- `semester` (optional): Filter by semester
- `search` (optional): Search by course name or code

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_456",
        "name": "Data Structures and Algorithms",
        "code": "CS 161",
        "section": "001",
        "semester": "Spring 2024",
        "university": "University of California",
        "instructor": "Dr. Smith",
        "schedule": "MWF 10:00-11:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### Add Course to Profile

```http
POST /api/v1/users/courses
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "courseId": "course_456"
}
```

#### Remove Course from Profile

```http
DELETE /api/v1/users/courses/{courseId}
Authorization: Bearer <access-token>
```

#### Get User's Courses

```http
GET /api/v1/users/courses
Authorization: Bearer <access-token>
```

---

### Availability Endpoints

#### Get Availability Grid

```http
GET /api/v1/users/availability
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availability": {
      "monday": [
        {"start": "09:00", "end": "12:00"},
        {"start": "14:00", "end": "17:00"}
      ],
      "tuesday": [
        {"start": "10:00", "end": "13:00"}
      ],
      // ... other days
    },
    "timezone": "America/Los_Angeles",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Availability Grid

```http
PUT /api/v1/users/availability
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "availability": {
    "monday": [
      {"start": "09:00", "end": "12:00"},
      {"start": "14:00", "end": "17:00"}
    ],
    "tuesday": [
      {"start": "10:00", "end": "13:00"}
    ],
    "wednesday": [],
    "thursday": [
      {"start": "09:00", "end": "11:00"}
    ],
    "friday": [
      {"start": "13:00", "end": "16:00"}
    ],
    "saturday": [
      {"start": "10:00", "end": "15:00"}
    ],
    "sunday": []
  },
  "timezone": "America/Los_Angeles"
}
```

---

### Matching Endpoints

#### Get Study Matches

```http
GET /api/v1/matches/{courseId}
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `limit` (optional): Number of matches to return (default: 20, max: 50)
- `minScore` (optional): Minimum compatibility score (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "course_456",
      "name": "Data Structures and Algorithms",
      "code": "CS 161"
    },
    "matches": [
      {
        "user": {
          "id": "user_789",
          "firstName": "Jane",
          "lastName": "Smith",
          "profileImage": "https://cloudinary.com/image.jpg",
          "studyProfile": {
            "preferredLocation": "library",
            "studyStyle": "collaborative",
            "studyPace": "moderate"
          }
        },
        "compatibilityScore": 85,
        "matchingReasons": [
          "Same course section",
          "Overlapping availability",
          "Similar study preferences"
        ],
        "commonAvailability": [
          {
            "day": "monday",
            "start": "10:00",
            "end": "12:00"
          }
        ],
        "connectionStatus": "none" // "none", "pending", "accepted"
      }
    ],
    "totalMatches": 15
  }
}
```

#### Get Match Details

```http
GET /api/v1/matches/{courseId}/user/{userId}
Authorization: Bearer <access-token>
```

---

### Connection Endpoints

#### Send Connection Request

```http
POST /api/v1/connections/request
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "targetUserId": "user_789",
  "courseId": "course_456",
  "message": "Hi! I'd love to study together for CS 161."
}
```

#### Get Connection Requests

```http
GET /api/v1/connections/requests
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `type` (optional): "sent" or "received" (default: "received")

#### Accept Connection Request

```http
PUT /api/v1/connections/{connectionId}/accept
Authorization: Bearer <access-token>
```

#### Decline Connection Request

```http
PUT /api/v1/connections/{connectionId}/decline
Authorization: Bearer <access-token>
```

#### Get Connections

```http
GET /api/v1/connections
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `courseId` (optional): Filter by course
- `status` (optional): "accepted", "pending" (default: "accepted")

#### Remove Connection

```http
DELETE /api/v1/connections/{connectionId}
Authorization: Bearer <access-token>
```

---

### Chat/Messaging Endpoints

#### Get Chat Messages

```http
GET /api/v1/messages/{connectionId}
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `before` (optional): Get messages before this message ID

**Response:**
```json
{
  "success": true,
  "data": {
    "connection": {
      "id": "conn_123",
      "users": [
        {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe"
        },
        {
          "id": "user_789",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      ],
      "course": {
        "id": "course_456",
        "name": "Data Structures and Algorithms"
      }
    },
    "messages": [
      {
        "id": "msg_456",
        "senderId": "user_123",
        "content": "Hi Jane! When would you like to meet up to study?",
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "text"
      },
      {
        "id": "msg_457",
        "senderId": "user_789",
        "content": "How about tomorrow at 2 PM in the library?",
        "timestamp": "2024-01-15T10:35:00Z",
        "type": "text"
      }
    ],
    "hasMore": false
  }
}
```

#### Send Message

```http
POST /api/v1/messages/{connectionId}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "content": "That sounds perfect! See you tomorrow.",
  "type": "text"
}
```

#### Mark Messages as Read

```http
PUT /api/v1/messages/{connectionId}/read
Authorization: Bearer <access-token>
```

#### Get Unread Message Count

```http
GET /api/v1/messages/unread-count
Authorization: Bearer <access-token>
```

---

## WebSocket Events

### Connection

Connect to WebSocket for real-time updates:

```
wss://api.campusconnect.app/ws?token=<access-token>
```

### Events

#### Message Received

```json
{
  "event": "message:received",
  "data": {
    "connectionId": "conn_123",
    "message": {
      "id": "msg_789",
      "senderId": "user_789",
      "content": "Hey! Are you free to study today?",
      "timestamp": "2024-01-15T11:00:00Z",
      "type": "text"
    }
  }
}
```

#### Connection Request Received

```json
{
  "event": "connection:request",
  "data": {
    "id": "conn_456",
    "fromUser": {
      "id": "user_789",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "course": {
      "id": "course_456",
      "name": "Data Structures and Algorithms"
    },
    "message": "Hi! I'd love to study together.",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

#### Connection Status Changed

```json
{
  "event": "connection:status_changed",
  "data": {
    "connectionId": "conn_123",
    "status": "accepted",
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class CampusConnectAPI {
  private baseURL = 'https://api.campusconnect.app/api/v1';
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User profile methods
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Matching methods
  async getMatches(courseId: string, limit = 20) {
    return this.request(`/matches/${courseId}?limit=${limit}`);
  }

  // Connection methods
  async sendConnectionRequest(targetUserId: string, courseId: string, message?: string) {
    return this.request('/connections/request', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, courseId, message }),
    });
  }

  // Message methods
  async getMessages(connectionId: string, limit = 50) {
    return this.request(`/messages/${connectionId}?limit=${limit}`);
  }

  async sendMessage(connectionId: string, content: string) {
    return this.request(`/messages/${connectionId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type: 'text' }),
    });
  }
}

// Usage example
const api = new CampusConnectAPI();
const { data } = await api.login('user@university.edu', 'password');
api.setAccessToken(data.tokens.accessToken);

const matches = await api.getMatches('course_456');
console.log(matches.data.matches);
```

### Python

```python
import requests
from typing import Dict, Any, Optional

class CampusConnectAPI:
    def __init__(self, base_url: str = "https://api.campusconnect.app/api/v1"):
        self.base_url = base_url
        self.access_token: Optional[str] = None

    def set_access_token(self, token: str) -> None:
        self.access_token = token

    def _request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        response = requests.request(
            method=method,
            url=url,
            json=data,
            headers=headers
        )
        
        response.raise_for_status()
        return response.json()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        return self._request("POST", "/auth/login", {
            "email": email,
            "password": password
        })

    def get_profile(self) -> Dict[str, Any]:
        return self._request("GET", "/users/profile")

    def get_matches(self, course_id: str, limit: int = 20) -> Dict[str, Any]:
        return self._request("GET", f"/matches/{course_id}?limit={limit}")

    def send_message(self, connection_id: str, content: str) -> Dict[str, Any]:
        return self._request("POST", f"/messages/{connection_id}", {
            "content": content,
            "type": "text"
        })

# Usage example
api = CampusConnectAPI()
response = api.login("user@university.edu", "password")
api.set_access_token(response["data"]["tokens"]["accessToken"])

matches = api.get_matches("course_456")
print(matches["data"]["matches"])
```

---

## Rate Limits & Best Practices

### Rate Limiting Guidelines

1. **Implement exponential backoff** for rate-limited requests
2. **Cache responses** when appropriate to reduce API calls
3. **Use WebSocket connections** for real-time features instead of polling
4. **Batch requests** when possible to reduce overhead

### Error Handling Best Practices

1. **Always check response status** before processing data
2. **Implement retry logic** for transient errors (5xx status codes)
3. **Handle authentication errors** by refreshing tokens
4. **Log errors** for debugging and monitoring

### Security Best Practices

1. **Never expose access tokens** in client-side code
2. **Use HTTPS** for all API requests
3. **Validate all user inputs** before sending to API
4. **Implement proper token refresh** logic

---

*Last Updated: Oct. 2025*  
*API Version: 1.0.0*
