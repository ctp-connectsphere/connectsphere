import { Prisma } from '@prisma/client'
import { DatabaseError, prisma } from './connection'

/**
 * Database utility functions for common operations
 */

// Transaction wrapper with error handling
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(fn)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(
        `Database operation failed: ${error.message}`,
        error.code,
        error
      )
    }
    throw error
  }
}

// Safe database operation wrapper
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`❌ ${operationName} failed:`, error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002':
          throw new DatabaseError(
            'A record with this information already exists',
            'UNIQUE_CONSTRAINT_ERROR',
            error
          )
        case 'P2025':
          throw new DatabaseError(
            'Record not found',
            'NOT_FOUND_ERROR',
            error
          )
        case 'P2003':
          throw new DatabaseError(
            'Foreign key constraint failed',
            'FOREIGN_KEY_ERROR',
            error
          )
        default:
          throw new DatabaseError(
            `Database operation failed: ${error.message}`,
            error.code,
            error
          )
      }
    }

    throw new DatabaseError(
      `Unexpected error during ${operationName}`,
      'UNKNOWN_ERROR',
      error
    )
  }
}

// Pagination helper
export interface PaginationOptions {
  page?: number
  limit?: number
  orderBy?: Record<string, 'asc' | 'desc'>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function paginate<T>(
  model: any,
  options: PaginationOptions = {},
  where?: any
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy,
    }),
    model.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// Database health check with detailed information
export async function getDatabaseHealth() {
  try {
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime

    // Get database statistics
    const [userCount, connectionCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`
        .then((result: any) => result[0]?.count || 0)
        .catch(() => 0),
    ])

    return {
      status: 'healthy',
      responseTime,
      userCount,
      activeConnections: connectionCount,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

// Development database reset utility
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new DatabaseError('Database reset is not allowed in production')
  }

  try {
    console.log('🔄 Resetting database...')

    // Delete all data in reverse dependency order
    await prisma.message.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.userCourse.deleteMany()
    await prisma.course.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.university.deleteMany()

    console.log('✅ Database reset completed')
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    throw new DatabaseError('Failed to reset database', 'RESET_ERROR', error)
  }
}

// Database seeding helper
export async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new DatabaseError('Database seeding is not allowed in production')
  }

  try {
    console.log('🌱 Seeding database...')

    // Import and run seed script
    const { seed } = await import('../../../prisma/seed')
    await seed()

    console.log('✅ Database seeding completed')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw new DatabaseError('Failed to seed database', 'SEED_ERROR', error)
  }
}

// Connection pool monitoring
export async function getConnectionPoolStatus() {
  try {
    const poolStatus = await prisma.$queryRaw`
      SELECT 
        state,
        count(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `

    return {
      poolStatus,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    throw new DatabaseError('Failed to get connection pool status', 'POOL_STATUS_ERROR', error)
  }
}