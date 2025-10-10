import { Redis } from '@upstash/redis'

// Redis connection configuration
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
})

// Redis connection with pooling for serverless
export const redisWithPooling = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
})

// Health check for Redis connection
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

// Get Redis connection info
export async function getRedisInfo() {
  try {
    const info = await redis.info()
    return info
  } catch (error) {
    console.error('Failed to get Redis info:', error)
    return null
  }
}

export default redis
