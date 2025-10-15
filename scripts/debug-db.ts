#!/usr/bin/env tsx

/**
 * Database debugging utility script
 * Run this script to test database connections and operations
 */

import { config } from '../src/lib/config/env'
import { checkDatabaseConnection, getDatabaseHealth, prisma } from '../src/lib/db/connection'
import { devRedisUtils } from '../src/lib/redis/connection'

async function debugDatabase() {
    console.log('🔍 Starting database debugging session...')
    console.log('Environment:', config.app.environment)
    console.log('Database URL:', config.database.url ? 'Set' : 'Not set')
    console.log('Redis URL:', config.redis.url ? 'Set' : 'Not set')
    console.log('')

    try {
        // Test database connection
        console.log('1. Testing database connection...')
        const isConnected = await checkDatabaseConnection()
        console.log('✅ Database connection:', isConnected ? 'Success' : 'Failed')
        console.log('')

        // Get database health
        console.log('2. Getting database health...')
        const health = await getDatabaseHealth()
        console.log('📊 Database Health:', JSON.stringify(health, null, 2))
        console.log('')

        // Test basic database operations
        console.log('3. Testing basic database operations...')

        // Test user count
        try {
            const userCount = await prisma.user.count()
            console.log('👥 User count:', userCount)
        } catch (error) {
            console.log('❌ User count failed:', error instanceof Error ? error.message : error)
        }

        // Test course count
        try {
            const courseCount = await prisma.course.count()
            console.log('📚 Course count:', courseCount)
        } catch (error) {
            console.log('❌ Course count failed:', error instanceof Error ? error.message : error)
        }

        // Test university count
        try {
            const universityCount = await prisma.university.count()
            console.log('🏫 University count:', universityCount)
        } catch (error) {
            console.log('❌ University count failed:', error instanceof Error ? error.message : error)
        }

        console.log('')

        // Test Redis connection
        console.log('4. Testing Redis connection...')
        try {
            const redisHealth = await devRedisUtils.getCacheStats()
            console.log('✅ Redis connection:', 'Success')
            console.log('📊 Redis stats:', JSON.stringify(redisHealth, null, 2))
        } catch (error) {
            console.log('❌ Redis connection failed:', error instanceof Error ? error.message : error)
        }

        console.log('')

        // Test environment validation
        console.log('5. Validating environment configuration...')
        try {
            config.validateEnvironment()
            console.log('✅ Environment validation:', 'Passed')
        } catch (error) {
            console.log('❌ Environment validation failed:', error instanceof Error ? error.message : error)
        }

        console.log('')
        console.log('🎉 Database debugging completed!')

    } catch (error) {
        console.error('❌ Database debugging failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the debug function
debugDatabase().catch(console.error)
