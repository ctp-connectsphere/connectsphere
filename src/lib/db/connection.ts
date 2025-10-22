import { config } from '@/lib/config/env'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Development-specific configuration
const isDevelopment = config.isDevelopment
const isProduction = config.isProduction

// Connection pool configuration optimized for different environments
const connectionPoolConfig = {
  connectionLimit: isDevelopment ? 5 : config.database.poolSize,
  acquireTimeoutMillis: isDevelopment ? 30000 : config.database.connectionTimeout,
  timeout: isDevelopment ? 30000 : config.database.connectionTimeout,
  reconnect: true,
  idleTimeoutMillis: isDevelopment ? 10000 : config.database.idleTimeout,
  maxUses: isDevelopment ? 1000 : 7500
}

// Enhanced Prisma client configuration with better error handling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: config.database.url
    }
  },
  log: isDevelopment
    ? [
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' }
    ]
    : [
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' }
    ],
  errorFormat: isDevelopment ? 'pretty' : 'minimal'
})

// Development query logging (disabled for now due to type issues)
// if (isDevelopment) {
//   prisma.$on('query', (e: any) => {
//     console.log('Query: ' + e.query)
//     console.log('Params: ' + e.params)
//     console.log('Duration: ' + e.duration + 'ms')
//   })
// }

// Enhanced error handling for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw new DatabaseError(
      'Failed to connect to database',
      'CONNECTION_ERROR',
      error
    )
  }
}

// Graceful shutdown with error handling
async function gracefulShutdown() {
  try {
    console.log('🔄 Disconnecting from database...')
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error during database shutdown:', error)
  }
}

// Handle different exit signals (only in Node.js runtime, not Edge Runtime)
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production' && typeof window === 'undefined') {
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  process.on('beforeExit', gracefulShutdown)
}

// Prevent multiple instances in development
if (isDevelopment && typeof global !== 'undefined') {
  globalForPrisma.prisma = prisma
}

// Connection retry logic for development
if (isDevelopment) {
  let retryCount = 0
  const maxRetries = 3

  const connectWithRetry = async () => {
    try {
      await checkDatabaseConnection()
      retryCount = 0
    } catch (error) {
      retryCount++
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying database connection (${retryCount}/${maxRetries})...`)
        setTimeout(connectWithRetry, 2000 * retryCount)
      } else {
        console.error('❌ Max retry attempts reached. Please check your database connection.')
        throw error
      }
    }
  }

  // Initial connection check
  connectWithRetry().catch(console.error)
}

export default prisma
