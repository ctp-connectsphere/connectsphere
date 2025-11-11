# Campus Connect Performance Optimization Guide

## Table of Contents

1. [Overview](#overview)
2. [Performance Targets](#performance-targets)
3. [Frontend Optimization](#frontend-optimization)
4. [Backend Optimization](#backend-optimization)
5. [Database Optimization](#database-optimization)
6. [Caching Strategy](#caching-strategy)
7. [CDN & Edge Optimization](#cdn--edge-optimization)
8. [Monitoring & Metrics](#monitoring--metrics)
9. [Performance Testing](#performance-testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive strategies for optimizing Campus Connect's performance across all layers of the application. Our goal is to deliver a fast, responsive user experience while maintaining scalability and reliability.

**Performance Philosophy:**

- **User Experience First:** Optimize for perceived performance
- **Measure Everything:** Establish baseline metrics and track improvements
- **Progressive Enhancement:** Core functionality works fast, enhanced features load progressively
- **Scalable Architecture:** Performance optimizations should scale with user growth

---

## Performance Targets

### Core Web Vitals

| Metric                             | Target  | Good    | Needs Improvement |
| ---------------------------------- | ------- | ------- | ----------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | < 2.5s  | > 4.0s            |
| **FID** (First Input Delay)        | < 100ms | < 100ms | > 300ms           |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | < 0.1   | > 0.25            |

### Application Metrics

| Metric                  | Target  | Measurement              |
| ----------------------- | ------- | ------------------------ |
| **API Response Time**   | < 200ms | 95th percentile          |
| **Database Query Time** | < 100ms | 95th percentile          |
| **Match Algorithm**     | < 500ms | For 1000+ users          |
| **Page Load Time**      | < 2s    | First contentful paint   |
| **Time to Interactive** | < 3s    | Fully interactive        |
| **Cache Hit Ratio**     | > 80%   | Frequently accessed data |

### Infrastructure Metrics

| Metric                          | Target  | Measurement          |
| ------------------------------- | ------- | -------------------- |
| **Uptime**                      | > 99.9% | Monthly availability |
| **Error Rate**                  | < 0.1%  | 4xx/5xx responses    |
| **Connection Pool Utilization** | < 80%   | Under normal load    |
| **Memory Usage**                | < 70%   | Serverless functions |

---

## Frontend Optimization

### 1. Next.js App Router Optimizations

**Server Components for Data Fetching:**

```typescript
// app/matches/[courseId]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { MatchList } from '@/components/matches/MatchList'

export default async function MatchesPage({ params }: { params: { courseId: string } }) {
  const session = await auth()

  // Server-side data fetching - no client-side loading states
  const matches = await prisma.$queryRaw`
    -- Optimized matching query (see Database Optimization)
    SELECT * FROM mv_active_enrollments WHERE course_id = ${params.courseId}
  `

  return (
    <div>
      <h1>Study Matches</h1>
      <MatchList matches={matches} />
    </div>
  )
}

// Generate static params for popular courses
export async function generateStaticParams() {
  const popularCourses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  })

  return popularCourses.map((course) => ({
    courseId: course.id,
  }))
}
```

**Client Components with Suspense:**

```typescript
// components/matches/MatchList.tsx
'use client'

import { Suspense } from 'react'
import { MatchCard } from './MatchCard'
import { MatchCardSkeleton } from './MatchCardSkeleton'

interface MatchListProps {
  matches: Match[]
}

export function MatchList({ matches }: MatchListProps) {
  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <Suspense key={match.id} fallback={<MatchCardSkeleton />}>
          <MatchCard match={match} />
        </Suspense>
      ))}
    </div>
  )
}
```

### 2. Image Optimization

**Next.js Image Component:**

```typescript
// components/ui/ProfileImage.tsx
import Image from 'next/image'
import { useState } from 'react'

interface ProfileImageProps {
  src: string
  alt: string
  size?: number
}

export function ProfileImage({ src, alt, size = 40 }: ProfileImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden rounded-full ${isLoading ? 'bg-gray-200 animate-pulse' : ''}`}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  )
}
```

**Cloudinary Integration:**

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function getOptimizedImageUrl(publicId: string, options: any = {}) {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    ...options
  }

  return cloudinary.url(publicId, defaultOptions)
}

// Usage in components
export function OptimizedProfileImage({ publicId, alt, size = 40 }: { publicId: string; alt: string; size?: number }) {
  const imageUrl = getOptimizedImageUrl(publicId, {
    width: size * 2, // 2x for retina displays
    height: size * 2,
    quality: 'auto',
    fetch_format: 'auto'
  })

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      priority={size > 80} // Prioritize larger images
    />
  )
}
```

### 3. Code Splitting & Lazy Loading

**Dynamic Imports:**

```typescript
// components/lazy/ChatWindow.tsx
import dynamic from 'next/dynamic'
import { ChatWindowSkeleton } from './ChatWindowSkeleton'

// Lazy load heavy chat component
const ChatWindow = dynamic(() => import('./ChatWindow'), {
  loading: () => <ChatWindowSkeleton />,
  ssr: false // Client-side only for real-time features
})

// Lazy load matching algorithm visualization
const MatchingVisualization = dynamic(() => import('./MatchingVisualization'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
  ssr: false
})

export { ChatWindow, MatchingVisualization }
```

**Route-based Code Splitting:**

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
}

// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}
```

### 4. State Management Optimization

**Zustand Store with Selectors:**

```typescript
// lib/stores/matchesStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

interface Match {
  id: string;
  user: User;
  compatibilityScore: number;
  connectionStatus: 'none' | 'pending' | 'connected';
}

interface MatchesState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  selectedCourseId: string | null;
}

interface MatchesActions {
  setMatches: (matches: Match[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedCourse: (courseId: string | null) => void;
  updateMatchStatus: (
    matchId: string,
    status: Match['connectionStatus']
  ) => void;
}

export const useMatchesStore = create<MatchesState & MatchesActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      matches: [],
      loading: false,
      error: null,
      selectedCourseId: null,

      setMatches: matches => set({ matches, error: null }),
      setLoading: loading => set({ loading }),
      setError: error => set({ error, loading: false }),
      setSelectedCourse: selectedCourseId => set({ selectedCourseId }),

      updateMatchStatus: (matchId, status) =>
        set(state => ({
          matches: state.matches.map(match =>
            match.id === matchId
              ? { ...match, connectionStatus: status }
              : match
          ),
        })),
    })),
    { name: 'matches-store' }
  )
);

// Optimized selectors
export const useMatches = () => useMatchesStore(state => state.matches);
export const useMatchesLoading = () => useMatchesStore(state => state.loading);
export const useSelectedCourseMatches = () =>
  useMatchesStore(state =>
    state.matches.filter(match =>
      match.user.courses.includes(state.selectedCourseId)
    )
  );
```

### 5. Bundle Analysis & Optimization

**Bundle Analyzer Configuration:**

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@headlessui/react', '@heroicons/react'],
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

**Package Optimization:**

```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0"
  },
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "build": "next build",
    "build:analyze": "npm run analyze"
  }
}
```

---

## Backend Optimization

### 1. Server Actions Performance

**Optimized Server Actions:**

```typescript
// lib/actions/matching.ts
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export async function findMatchesOptimized(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const courseId = formData.get('courseId') as string;
  const limit = Math.min(Number(formData.get('limit')) || 20, 50);

  // Check cache first
  const cacheKey = `matches:${session.user.id}:${courseId}`;
  const cachedMatches = await CacheService.getMatches(
    session.user.id,
    courseId
  );

  if (cachedMatches) {
    return { success: true, matches: cachedMatches.slice(0, limit) };
  }

  try {
    // Use read replica for read-heavy operations
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
      -- Optimized availability overlap calculation
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
    `;

    // Cache results for 5 minutes
    await CacheService.setMatches(session.user.id, courseId, matches, 300);

    revalidatePath(`/matches/${courseId}`);
    return { success: true, matches };
  } catch (error) {
    console.error('Error finding matches:', error);
    return { success: false, message: 'Failed to find matches' };
  }
}
```

### 2. Database Connection Optimization

**Connection Pooling:**

```typescript
// lib/db/connection.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  });

// Production connection pool configuration
if (process.env.NODE_ENV === 'production') {
  // Connection pool settings for serverless
  prisma.$connect();
}

// Read replica for read-heavy operations
export const readReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL || process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 3. API Route Optimization

**Optimized API Routes:**

```typescript
// app/api/matches/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { readReplica } from '@/lib/db/connection';
import { CacheService } from '@/lib/cache/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const minScore = Number(searchParams.get('minScore')) || 30;

    // Check cache first
    const cachedMatches = await CacheService.getMatches(
      session.user.id,
      params.courseId
    );

    if (cachedMatches) {
      return NextResponse.json({
        success: true,
        data: {
          matches: cachedMatches
            .filter(m => m.compatibilityScore >= minScore)
            .slice(0, limit),
          totalMatches: cachedMatches.length,
        },
      });
    }

    // Use optimized query with read replica
    const matches = await readReplica.$queryRaw`
      -- Optimized matching query (see above)
      SELECT * FROM mv_active_enrollments WHERE course_id = ${params.courseId}
    `;

    // Cache results
    await CacheService.setMatches(
      session.user.id,
      params.courseId,
      matches,
      300
    );

    return NextResponse.json({
      success: true,
      data: {
        matches: matches.slice(0, limit),
        totalMatches: matches.length,
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Database Optimization

### 1. Query Optimization

**Materialized Views for Performance:**

```sql
-- Create materialized view for active enrollments
CREATE MATERIALIZED VIEW mv_active_enrollments AS
SELECT
  uc.user_id,
  uc.course_id,
  c.name as course_name,
  c.code as course_code,
  c.section,
  c.semester,
  u.university,
  u.first_name,
  u.last_name,
  u.profile_image_url,
  up.preferred_location,
  up.study_style,
  up.study_pace,
  up.bio
FROM user_courses uc
JOIN courses c ON uc.course_id = c.id
JOIN users u ON uc.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE uc.is_active = TRUE
  AND c.is_active = TRUE
  AND u.is_active = TRUE
  AND u.is_verified = TRUE;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_mv_active_enrollments_unique ON mv_active_enrollments(user_id, course_id);
CREATE INDEX idx_mv_active_enrollments_course ON mv_active_enrollments(course_id);
CREATE INDEX idx_mv_active_enrollments_user ON mv_active_enrollments(user_id);
CREATE INDEX idx_mv_active_enrollments_preferences ON mv_active_enrollments(preferred_location, study_style, study_pace);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_enrollments()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_enrollments;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every hour
SELECT cron.schedule('refresh-enrollments', '0 * * * *', 'SELECT refresh_active_enrollments();');
```

### 2. Indexing Strategy

**Advanced Indexes:**

```sql
-- Composite indexes for complex queries
CREATE INDEX idx_users_active_verified ON users(is_active, is_verified)
  WHERE is_active = TRUE AND is_verified = TRUE;

CREATE INDEX idx_user_courses_active_enrollment ON user_courses(user_id, course_id, is_active)
  WHERE is_active = TRUE;

CREATE INDEX idx_connections_course_status_time ON connections(course_id, status, requested_at)
  WHERE status IN ('pending', 'accepted');

CREATE INDEX idx_messages_connection_read_time ON messages(connection_id, is_read, created_at DESC);

-- Partial indexes for frequently filtered data
CREATE INDEX idx_courses_current_semester ON courses(university_id, code, section)
  WHERE semester = 'Spring 2024' AND is_active = TRUE;

CREATE INDEX idx_users_university_domain ON users(university, email)
  WHERE is_active = TRUE AND is_verified = TRUE;

-- GIN indexes for JSON data
CREATE INDEX idx_match_cache_results ON match_cache USING GIN (match_results);

-- Expression indexes for computed values
CREATE INDEX idx_users_full_name ON users USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);
```

### 3. Partitioning Strategy

**Availability Table Partitioning:**

```sql
-- Partitioned availability table
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
) PARTITION BY RANGE (day_of_week);

-- Create partitions for each day
CREATE TABLE availability_monday PARTITION OF availability FOR VALUES FROM (1) TO (2);
CREATE TABLE availability_tuesday PARTITION OF availability FOR VALUES FROM (2) TO (3);
CREATE TABLE availability_wednesday PARTITION OF availability FOR VALUES FROM (3) TO (4);
CREATE TABLE availability_thursday PARTITION OF availability FOR VALUES FROM (4) TO (5);
CREATE TABLE availability_friday PARTITION OF availability FOR VALUES FROM (5) TO (6);
CREATE TABLE availability_saturday PARTITION OF availability FOR VALUES FROM (6) TO (7);
CREATE TABLE availability_sunday PARTITION OF availability FOR VALUES FROM (0) TO (1);

-- Indexes on each partition
CREATE INDEX idx_availability_monday_user_time ON availability_monday(user_id, start_time, end_time);
CREATE INDEX idx_availability_tuesday_user_time ON availability_tuesday(user_id, start_time, end_time);
-- ... continue for other days
```

---

## Caching Strategy

### 1. Redis Caching Implementation

**Cache Service:**

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class CacheService {
  // Match results caching
  static async getMatches(userId: string, courseId: string) {
    const key = `matches:${userId}:${courseId}`;
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async setMatches(
    userId: string,
    courseId: string,
    matches: any[],
    ttl = 300
  ) {
    const key = `matches:${userId}:${courseId}`;
    try {
      await redis.setex(key, ttl, JSON.stringify(matches));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // User profile caching
  static async getUserProfile(userId: string) {
    const key = `profile:${userId}`;
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async setUserProfile(userId: string, profile: any, ttl = 900) {
    const key = `profile:${userId}`;
    try {
      await redis.setex(key, ttl, JSON.stringify(profile));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Course data caching
  static async getCourses(universityId?: string) {
    const key = universityId ? `courses:${universityId}` : 'courses:all';
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async setCourses(courses: any[], universityId?: string, ttl = 3600) {
    const key = universityId ? `courses:${universityId}` : 'courses:all';
    try {
      await redis.setex(key, ttl, JSON.stringify(courses));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Cache invalidation
  static async invalidateUserCache(userId: string) {
    try {
      const pattern = `*:${userId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  static async invalidateCourseCache(courseId: string) {
    try {
      const pattern = `matches:*:${courseId}`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Cache warming
  static async warmPopularCourses() {
    try {
      const popularCourses = await prisma.course.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      await this.setCourses(popularCourses, undefined, 3600);
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }
}
```

### 2. Next.js Caching

**Server Component Caching:**

```typescript
// lib/cache/nextjs.ts
import { unstable_cache } from 'next/cache';

export const getCachedMatches = unstable_cache(
  async (userId: string, courseId: string) => {
    // Expensive matching query
    return await prisma.$queryRaw`
      SELECT * FROM mv_active_enrollments WHERE course_id = ${courseId}
    `;
  },
  ['matches'],
  {
    revalidate: 300, // 5 minutes
    tags: ['matches'],
  }
);

export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  },
  ['user-profile'],
  {
    revalidate: 900, // 15 minutes
    tags: ['user-profile'],
  }
);
```

### 3. Cache Invalidation Strategy

**Smart Cache Invalidation:**

```typescript
// lib/cache/invalidation.ts
import { revalidateTag } from 'next/cache';
import { CacheService } from './redis';

export async function invalidateUserCaches(userId: string) {
  // Invalidate Next.js cache
  revalidateTag('user-profile');
  revalidateTag('matches');

  // Invalidate Redis cache
  await CacheService.invalidateUserCache(userId);
}

export async function invalidateCourseCaches(courseId: string) {
  // Invalidate Next.js cache
  revalidateTag('matches');
  revalidateTag('courses');

  // Invalidate Redis cache
  await CacheService.invalidateCourseCache(courseId);
}

export async function invalidateAllCaches() {
  // Invalidate all Next.js cache tags
  revalidateTag('matches');
  revalidateTag('user-profile');
  revalidateTag('courses');

  // Clear Redis cache
  await redis.flushall();
}
```

---

## CDN & Edge Optimization

### 1. Vercel Edge Configuration

**Edge Runtime Optimization:**

```typescript
// app/api/health/route.ts
export const runtime = 'edge';

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'unknown',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    }
  );
}
```

### 2. Static Asset Optimization

**Image Optimization:**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=300' },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
};

module.exports = nextConfig;
```

### 3. Edge Functions

**Edge-based Matching:**

```typescript
// app/api/edge/matches/[courseId]/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  try {
    // Use edge-optimized query
    const matches = await fetch(`${process.env.DATABASE_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DATABASE_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
          SELECT * FROM mv_active_enrollments 
          WHERE course_id = $1 
          LIMIT $2
        `,
        params: [params.courseId, limit],
      }),
    });

    const data = await matches.json();

    return new Response(
      JSON.stringify({
        success: true,
        data: { matches: data.rows },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

---

## Monitoring & Metrics

### 1. Performance Monitoring

**Custom Metrics:**

```typescript
// lib/monitoring/metrics.ts
export class PerformanceMonitor {
  static async trackApiCall(
    endpoint: string,
    duration: number,
    status: number
  ) {
    // Track API performance
    console.log('API_METRIC', {
      endpoint,
      duration,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackDatabaseQuery(
    query: string,
    duration: number,
    rows: number
  ) {
    // Track database performance
    console.log('DB_METRIC', {
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      rows,
      timestamp: new Date().toISOString(),
    });
  }

  static async trackCacheHit(key: string, hit: boolean) {
    // Track cache performance
    console.log('CACHE_METRIC', {
      key: key.substring(0, 50), // Truncate for privacy
      hit,
      timestamp: new Date().toISOString(),
    });
  }
}

// Middleware for automatic tracking
export function withPerformanceTracking(handler: any) {
  return async (request: any, context: any) => {
    const start = Date.now();

    try {
      const response = await handler(request, context);
      const duration = Date.now() - start;

      await PerformanceMonitor.trackApiCall(
        request.nextUrl.pathname,
        duration,
        response.status || 200
      );

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      await PerformanceMonitor.trackApiCall(
        request.nextUrl.pathname,
        duration,
        500
      );

      throw error;
    }
  };
}
```

### 2. Real User Monitoring

**Web Vitals Tracking:**

```typescript
// lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric: any) {
  // Send to analytics service
  if (typeof window !== 'undefined') {
    // PostHog
    if (window.posthog) {
      window.posthog.capture('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.rating,
        value: Math.round(metric.value),
        non_interaction: true,
      });
    }
  }
}

// Initialize web vitals tracking
export function initWebVitals() {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);
}
```

### 3. Error Tracking

**Error Boundary with Monitoring:**

```typescript
// components/ErrorBoundary.tsx
'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo)

    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('error_boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Performance Testing

### 1. Load Testing with Artillery

**Load Testing Configuration:**

```yaml
# artillery-config.yml
config:
  target: 'https://campusconnect.app'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'User Registration and Login Flow'
    weight: 30
    flow:
      - post:
          url: '/api/auth/register'
          json:
            email: 'test{{ $randomString() }}@berkeley.edu'
            password: 'TestPassword123!'
            firstName: 'Test'
            lastName: 'User'
            university: 'University of California, Berkeley'
      - post:
          url: '/api/auth/login'
          json:
            email: '{{ email }}'
            password: 'TestPassword123!'

  - name: 'Get Study Matches'
    weight: 50
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'existing@berkeley.edu'
            password: 'TestPassword123!'
      - get:
          url: '/api/matches/course_123'
          headers:
            Authorization: 'Bearer {{ accessToken }}'

  - name: 'Send Message'
    weight: 20
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'existing@berkeley.edu'
            password: 'TestPassword123!'
      - post:
          url: '/api/messages/connection_123'
          json:
            content: 'Hello! When should we study?'
          headers:
            Authorization: 'Bearer {{ accessToken }}'
```

### 2. Performance Testing Scripts

**Automated Performance Tests:**

```typescript
// tests/performance/api-performance.test.ts
import { test, expect } from '@playwright/test';

test.describe('API Performance Tests', () => {
  test('matches API should respond within 500ms', async ({ request }) => {
    const start = Date.now();

    const response = await request.get('/api/matches/course_123', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const duration = Date.now() - start;

    expect(response.ok()).toBe(true);
    expect(duration).toBeLessThan(500);
  });

  test('user profile API should respond within 200ms', async ({ request }) => {
    const start = Date.now();

    const response = await request.get('/api/users/profile', {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    const duration = Date.now() - start;

    expect(response.ok()).toBe(true);
    expect(duration).toBeLessThan(200);
  });

  test('database queries should be optimized', async ({ request }) => {
    const queries = [
      '/api/matches/course_123',
      '/api/users/profile',
      '/api/courses',
      '/api/connections',
    ];

    for (const query of queries) {
      const start = Date.now();
      const response = await request.get(query);
      const duration = Date.now() - start;

      expect(response.ok()).toBe(true);
      expect(duration).toBeLessThan(1000); // 1 second max
    }
  });
});
```

---

## Troubleshooting

### 1. Common Performance Issues

**Slow Database Queries:**

```sql
-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Unused indexes
ORDER BY idx_scan DESC;
```

**Memory Issues:**

```typescript
// Monitor memory usage
export function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`,
  });
}
```

### 2. Performance Debugging Tools

**Development Tools:**

```typescript
// lib/debug/performance.ts
export function debugPerformance() {
  if (process.env.NODE_ENV === 'development') {
    // Enable Prisma query logging
    prisma.$on('query', e => {
      console.log('Query: ' + e.query);
      console.log('Params: ' + e.params);
      console.log('Duration: ' + e.duration + 'ms');
    });

    // Monitor API response times
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const start = Date.now();
      const response = await originalFetch(...args);
      const duration = Date.now() - start;

      console.log(`Fetch: ${args[0]} - ${duration}ms`);
      return response;
    };
  }
}
```

### 3. Performance Optimization Checklist

**Regular Performance Audits:**

- [ ] Monitor Core Web Vitals weekly
- [ ] Check database query performance monthly
- [ ] Review cache hit ratios weekly
- [ ] Analyze bundle size after major updates
- [ ] Test API response times under load
- [ ] Monitor error rates and fix issues
- [ ] Update dependencies for performance improvements
- [ ] Review and optimize images quarterly
- [ ] Check for unused code and dependencies
- [ ] Validate CDN configuration

---

_Last Updated: Oct. 2025_  
_Performance Guide Version: 1.0.0_
