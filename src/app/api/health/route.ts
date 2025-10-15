import { checkDatabaseConnection } from '@/lib/db/connection'
import { checkRedisHealth } from '@/lib/redis/connection'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const [dbHealthy, redisHealth] = await Promise.allSettled([
            checkDatabaseConnection(),
            checkRedisHealth()
        ])

        const dbStatus = dbHealthy.status === 'fulfilled' && dbHealthy.value
        const redisStatus = redisHealth.status === 'fulfilled' && redisHealth.value.status === 'healthy'

        const overallHealth = dbStatus && redisStatus

        return NextResponse.json({
            status: overallHealth ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                database: {
                    status: dbStatus ? 'healthy' : 'unhealthy',
                    error: dbHealthy.status === 'rejected' ? dbHealthy.reason?.message : null
                },
                redis: {
                    status: redisStatus ? 'healthy' : 'unhealthy',
                    responseTime: redisHealth.status === 'fulfilled' ? redisHealth.value.responseTime : null,
                    error: redisHealth.status === 'rejected' ? redisHealth.reason?.message : null
                }
            }
        }, {
            status: overallHealth ? 200 : 503
        })
    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 503
        })
    }
}
