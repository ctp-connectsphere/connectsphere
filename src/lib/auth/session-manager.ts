'use server'
import { prisma } from '@/lib/db/connection'
import { SessionService } from '@/lib/redis/session'
import { headers } from 'next/headers'

export class SessionManager {
    /**
     * Get current session information
     */
    static async getCurrentSession(sessionToken: string) {
        try {
            const session = await prisma.session.findUnique({
                where: { sessionToken },
                include: { user: true }
            })

            if (!session || session.expires < new Date()) {
                return null
            }

            return session
        } catch (error) {
            console.error('Error getting current session:', error)
            return null
        }
    }

    /**
     * Validate session and check for security issues
     */
    static async validateSession(sessionToken: string) {
        try {
            const session = await this.getCurrentSession(sessionToken)
            if (!session) {
                return { valid: false, reason: 'SESSION_NOT_FOUND' }
            }

            // Check if session is expired
            if (session.expires < new Date()) {
                await this.invalidateSession(sessionToken)
                return { valid: false, reason: 'SESSION_EXPIRED' }
            }

            // Check for suspicious activity
            const headersList = await headers()
            const userAgent = headersList.get('user-agent') || ''
            const forwardedFor = headersList.get('x-forwarded-for')
            const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Unknown'

            // TODO: Check if user agent changed (potential session hijacking)
            // This would require storing userAgent in the session table
            console.log(`Session validation for ${sessionToken} from ${clientIP}`)

            // TODO: Check if IP changed (potential session hijacking)
            // This would require storing ipAddress in the session table

            return { valid: true, session }
        } catch (error) {
            console.error('Error validating session:', error)
            return { valid: false, reason: 'VALIDATION_ERROR' }
        }
    }

    /**
     * Refresh session expiry time
     */
    static async refreshSession(sessionToken: string) {
        try {
            const session = await this.getCurrentSession(sessionToken)
            if (!session) {
                return { success: false, reason: 'SESSION_NOT_FOUND' }
            }

            const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

            await prisma.session.update({
                where: { sessionToken },
                data: { expires: newExpiry }
            })

            // Update Redis cache
            await SessionService.updateSession(session.userId, {
                ...session,
                expires: newExpiry
            })

            return { success: true, newExpiry }
        } catch (error) {
            console.error('Error refreshing session:', error)
            return { success: false, reason: 'REFRESH_ERROR' }
        }
    }

    /**
     * Invalidate a specific session
     */
    static async invalidateSession(sessionToken: string) {
        try {
            // Remove from database
            await prisma.session.deleteMany({
                where: { sessionToken }
            })

            // Remove from Redis
            const session = await prisma.session.findUnique({
                where: { sessionToken },
                select: { userId: true }
            })

            if (session) {
                await SessionService.deleteSession(session.userId)
            }

            return { success: true }
        } catch (error) {
            console.error('Error invalidating session:', error)
            return { success: false, reason: 'INVALIDATION_ERROR' }
        }
    }

    /**
     * Invalidate all sessions for a user
     */
    static async invalidateAllUserSessions(userId: string) {
        try {
            // Remove from database
            await prisma.session.deleteMany({
                where: { userId }
            })

            // Remove from Redis
            await SessionService.deleteSession(userId)

            return { success: true }
        } catch (error) {
            console.error('Error invalidating user sessions:', error)
            return { success: false, reason: 'INVALIDATION_ERROR' }
        }
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpiredSessions() {
        try {
            const expiredSessions = await prisma.session.findMany({
                where: {
                    expires: { lt: new Date() }
                },
                select: { sessionToken: true, userId: true }
            })

            // Delete expired sessions
            await prisma.session.deleteMany({
                where: {
                    expires: { lt: new Date() }
                }
            })

            // Clean up Redis cache
            for (const session of expiredSessions) {
                await SessionService.deleteSession(session.userId)
            }

            return {
                success: true,
                cleanedCount: expiredSessions.length
            }
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error)
            return { success: false, reason: 'CLEANUP_ERROR' }
        }
    }

    /**
     * Get session statistics
     */
    static async getSessionStats() {
        try {
            const totalSessions = await prisma.session.count()
            const activeSessions = await prisma.session.count({
                where: {
                    expires: { gt: new Date() }
                }
            })
            const expiredSessions = totalSessions - activeSessions

            return {
                total: totalSessions,
                active: activeSessions,
                expired: expiredSessions
            }
        } catch (error) {
            console.error('Error getting session stats:', error)
            return null
        }
    }

    /**
     * Check if session is expiring soon (within 24 hours)
     */
    static async isSessionExpiringSoon(sessionToken: string) {
        try {
            const session = await this.getCurrentSession(sessionToken)
            if (!session) return false

            const twentyFourHours = 24 * 60 * 60 * 1000
            const timeUntilExpiry = session.expires.getTime() - Date.now()

            return timeUntilExpiry <= twentyFourHours
        } catch (error) {
            console.error('Error checking session expiry:', error)
            return false
        }
    }
}
