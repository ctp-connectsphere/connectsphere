#!/usr/bin/env tsx

/**
 * Session cleanup script
 * Run this script periodically to clean up expired sessions
 */

import 'dotenv/config'
import { SessionManager } from '../src/lib/auth/session-manager'

async function cleanupSessions() {
    console.log('🧹 Starting session cleanup...')

    try {
        const result = await SessionManager.cleanupExpiredSessions()

        if (result.success) {
            console.log(`✅ Cleaned up ${result.cleanedCount} expired sessions`)
        } else {
            console.error(`❌ Session cleanup failed: ${result.reason}`)
        }

        // Get session statistics
        const stats = await SessionManager.getSessionStats()
        if (stats) {
            console.log('\n📊 Session Statistics:')
            console.log(`   Total sessions: ${stats.total}`)
            console.log(`   Active sessions: ${stats.active}`)
            console.log(`   Expired sessions: ${stats.expired}`)
        }

    } catch (error) {
        console.error('❌ Error during session cleanup:', error)
    } finally {
        console.log('\n✅ Session cleanup completed!')
    }
}

cleanupSessions().catch(console.error)
