#!/usr/bin/env tsx

/**
 * Redis debugging utility script
 * Run this script to test Redis connections and operations
 */

import { config } from '../src/lib/config/env'
import { redis, checkRedisHealth, getRedisInfo, devRedisUtils } from '../src/lib/redis/connection'
import { CacheService } from '../src/lib/redis/cache'

async function debugRedis() {
  console.log('🔍 Starting Redis debugging session...')
  console.log('Environment:', config.app.environment)
  console.log('Redis URL:', config.redis.url ? 'Set' : 'Not set')
  console.log('Redis Token:', config.redis.token ? 'Set' : 'Not set')
  console.log('')

  try {
    // Test Redis connection
    console.log('1. Testing Redis connection...')
    const health = await checkRedisHealth()
    console.log('📊 Redis Health:', JSON.stringify(health, null, 2))
    console.log('')

    // Get Redis information
    console.log('2. Getting Redis information...')
    try {
      const info = await getRedisInfo()
      console.log('📊 Redis Info:', JSON.stringify(info, null, 2))
    } catch (error) {
      console.log('❌ Failed to get Redis info:', error instanceof Error ? error.message : error)
    }
    console.log('')

    // Test basic Redis operations
    console.log('3. Testing basic Redis operations...')
    
    // Test SET/GET
    try {
      await redis.set('debug:test', 'Hello Redis!')
      const value = await redis.get('debug:test')
      console.log('✅ SET/GET test:', value === 'Hello Redis!' ? 'Success' : 'Failed')
      await redis.del('debug:test')
    } catch (error) {
      console.log('❌ SET/GET test failed:', error instanceof Error ? error.message : error)
    }

    // Test EXPIRE
    try {
      await redis.setex('debug:expire', 5, 'This will expire')
      const ttl = await redis.ttl('debug:expire')
      console.log('✅ EXPIRE test:', ttl > 0 ? 'Success' : 'Failed', `(TTL: ${ttl}s)`)
      await redis.del('debug:expire')
    } catch (error) {
      console.log('❌ EXPIRE test failed:', error instanceof Error ? error.message : error)
    }

    // Test INCR
    try {
      await redis.set('debug:counter', '0')
      const count1 = await redis.incr('debug:counter')
      const count2 = await redis.incr('debug:counter')
      console.log('✅ INCR test:', count1 === 1 && count2 === 2 ? 'Success' : 'Failed', `(${count1}, ${count2})`)
      await redis.del('debug:counter')
    } catch (error) {
      console.log('❌ INCR test failed:', error instanceof Error ? error.message : error)
    }

    console.log('')

    // Test CacheService operations
    console.log('4. Testing CacheService operations...')
    
    // Test match caching
    try {
      const testMatches = [
        { id: '1', name: 'Test Match 1', score: 95 },
        { id: '2', name: 'Test Match 2', score: 87 }
      ]
      
      await CacheService.setMatches('test-user', 'test-course', testMatches)
      const cached = await CacheService.getMatches('test-user', 'test-course')
      console.log('✅ Match caching:', JSON.stringify(cached) === JSON.stringify(testMatches) ? 'Success' : 'Failed')
      
      // Clean up
      await CacheService.invalidateUserCache('test-user')
    } catch (error) {
      console.log('❌ Match caching failed:', error instanceof Error ? error.message : error)
    }

    // Test profile caching
    try {
      const testProfile = { id: 'test-user', name: 'Test User', email: 'test@example.com' }
      
      await CacheService.setUserProfile('test-user', testProfile)
      const cached = await CacheService.getUserProfile('test-user')
      console.log('✅ Profile caching:', JSON.stringify(cached) === JSON.stringify(testProfile) ? 'Success' : 'Failed')
      
      // Clean up
      await CacheService.invalidateUserCache('test-user')
    } catch (error) {
      console.log('❌ Profile caching failed:', error instanceof Error ? error.message : error)
    }

    // Test rate limiting
    try {
      const rateLimit = await CacheService.checkRateLimit('test-ip', 5, 60)
      console.log('✅ Rate limiting:', rateLimit.allowed ? 'Success' : 'Failed', `(Remaining: ${rateLimit.remaining})`)
    } catch (error) {
      console.log('❌ Rate limiting failed:', error instanceof Error ? error.message : error)
    }

    console.log('')

    // Test cache statistics
    console.log('5. Getting cache statistics...')
    try {
      const stats = await devRedisUtils.getCacheStats()
      console.log('📊 Cache Stats:', JSON.stringify(stats, null, 2))
    } catch (error) {
      console.log('❌ Failed to get cache stats:', error instanceof Error ? error.message : error)
    }

    console.log('')

    // Test cache clearing (development only)
    if (config.isDevelopment) {
      console.log('6. Testing cache clearing...')
      try {
        await devRedisUtils.clearAllCache()
        console.log('✅ Cache clearing:', 'Success')
      } catch (error) {
        console.log('❌ Cache clearing failed:', error instanceof Error ? error.message : error)
      }
    }

    console.log('')
    console.log('🎉 Redis debugging completed!')

  } catch (error) {
    console.error('❌ Redis debugging failed:', error)
    process.exit(1)
  }
}

// Run the debug function
debugRedis().catch(console.error)
