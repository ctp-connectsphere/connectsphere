#!/usr/bin/env tsx

/**
 * Redis data browser script
 * Browse and inspect Redis data
 */

import 'dotenv/config'
import { redis } from '../src/lib/redis/connection'

async function browseRedis() {
    console.log('🔍 Browsing Redis data...\n')

    try {
        // Get all keys
        const keys = await redis.keys('*')
        console.log(`📊 Total keys: ${keys.length}\n`)

        if (keys.length === 0) {
            console.log('📭 No data found in Redis')
            return
        }

        // Group keys by pattern
        const keyGroups: { [pattern: string]: string[] } = {}
        keys.forEach(key => {
            const pattern = key.split(':')[0] || 'other'
            if (!keyGroups[pattern]) keyGroups[pattern] = []
            keyGroups[pattern].push(key)
        })

        // Display grouped keys
        Object.entries(keyGroups).forEach(([pattern, patternKeys]) => {
            console.log(`🔑 ${pattern.toUpperCase()} (${patternKeys.length} keys):`)
            patternKeys.forEach(key => {
                console.log(`   - ${key}`)
            })
            console.log('')
        })

        // Show details for first few keys
        console.log('📋 Key Details (first 5 keys):')
        console.log('─'.repeat(50))

        for (let i = 0; i < Math.min(5, keys.length); i++) {
            const key = keys[i]
            try {
                const type = await redis.type(key)
                const ttl = await redis.ttl(key)

                console.log(`\n🔸 Key: ${key}`)
                console.log(`   Type: ${type}`)
                console.log(`   TTL: ${ttl === -1 ? 'No expiration' : `${ttl}s`}`)

                // Get value based on type
                if (type === 'string') {
                    const value = await redis.get(key)
                    console.log(`   Value: ${value}`)
                } else if (type === 'hash') {
                    const hash = await redis.hgetall(key)
                    console.log(`   Hash: ${JSON.stringify(hash, null, 2)}`)
                } else if (type === 'list') {
                    const list = await redis.lrange(key, 0, -1)
                    console.log(`   List: ${JSON.stringify(list)}`)
                } else if (type === 'set') {
                    const set = await redis.smembers(key)
                    console.log(`   Set: ${JSON.stringify(set)}`)
                }
            } catch (error) {
                console.log(`   Error reading key: ${error}`)
            }
        }

    } catch (error) {
        console.error('❌ Error browsing Redis:', error)
    } finally {
        // Upstash Redis doesn't need explicit quit
        console.log('\n✅ Redis browsing completed!')
    }
}

browseRedis().catch(console.error)
