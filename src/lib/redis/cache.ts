import { redis } from './connection'

/**
 * Redis caching service for Campus Connect
 */

export class CacheService {
  // Default TTL values (in seconds)
  private static readonly TTL = {
    MATCH_RESULTS: 300, // 5 minutes
    USER_PROFILE: 900, // 15 minutes
    COURSES: 3600, // 1 hour
    SESSIONS: 2592000, // 30 days
    RATE_LIMIT: 3600, // 1 hour
  }

  // Match results caching
  static async getMatches(userId: string, courseId: string) {
    try {
      const key = `matches:${userId}:${courseId}`
      const cached = await redis.get(key)
      
      if (cached) {
        return JSON.parse(cached as string)
      }
      
      return null
    } catch (error) {
      console.error('Failed to get matches from cache:', error)
      return null
    }
  }

  static async setMatches(userId: string, courseId: string, matches: any[], ttl = this.TTL.MATCH_RESULTS) {
    try {
      const key = `matches:${userId}:${courseId}`
      await redis.setex(key, ttl, JSON.stringify(matches))
      return true
    } catch (error) {
      console.error('Failed to set matches in cache:', error)
      return false
    }
  }

  // User profile caching
  static async getUserProfile(userId: string) {
    try {
      const key = `profile:${userId}`
      const cached = await redis.get(key)
      
      if (cached) {
        return JSON.parse(cached as string)
      }
      
      return null
    } catch (error) {
      console.error('Failed to get user profile from cache:', error)
      return null
    }
  }

  static async setUserProfile(userId: string, profile: any, ttl = this.TTL.USER_PROFILE) {
    try {
      const key = `profile:${userId}`
      await redis.setex(key, ttl, JSON.stringify(profile))
      return true
    } catch (error) {
      console.error('Failed to set user profile in cache:', error)
      return false
    }
  }

  // Course data caching
  static async getCourses(universityId?: string) {
    try {
      const key = universityId ? `courses:${universityId}` : 'courses:all'
      const cached = await redis.get(key)
      
      if (cached) {
        return JSON.parse(cached as string)
      }
      
      return null
    } catch (error) {
      console.error('Failed to get courses from cache:', error)
      return null
    }
  }

  static async setCourses(courses: any[], universityId?: string, ttl = this.TTL.COURSES) {
    try {
      const key = universityId ? `courses:${universityId}` : 'courses:all'
      await redis.setex(key, ttl, JSON.stringify(courses))
      return true
    } catch (error) {
      console.error('Failed to set courses in cache:', error)
      return false
    }
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, maxRequests = 100, windowSeconds = 3600) {
    try {
      const key = `rate_limit:${identifier}`
      const current = await redis.incr(key)
      
      if (current === 1) {
        await redis.expire(key, windowSeconds)
      }
      
      return {
        allowed: current <= maxRequests,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (windowSeconds * 1000)
      }
    } catch (error) {
      console.error('Failed to check rate limit:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + (windowSeconds * 1000)
      }
    }
  }

  // Cache invalidation
  static async invalidateUserCache(userId: string) {
    try {
      const patterns = [
        `matches:${userId}:*`,
        `profile:${userId}`,
        `user:${userId}:*`
      ]
      
      for (const pattern of patterns) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to invalidate user cache:', error)
      return false
    }
  }

  static async invalidateCourseCache(courseId: string) {
    try {
      const pattern = `matches:*:${courseId}`
      const keys = await redis.keys(pattern)
      
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      
      return true
    } catch (error) {
      console.error('Failed to invalidate course cache:', error)
      return false
    }
  }

  static async invalidateAllCache() {
    try {
      await redis.flushdb()
      return true
    } catch (error) {
      console.error('Failed to invalidate all cache:', error)
      return false
    }
  }

  // Utility methods
  static async getCacheStats() {
    try {
      const info = await redis.info('memory')
      const keyspace = await redis.info('keyspace')
      
      return {
        memory: info,
        keyspace: keyspace,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return null
    }
  }

  static async isHealthy(): Promise<boolean> {
    try {
      const result = await redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Cache health check failed:', error)
      return false
    }
  }
}
