import { prisma } from './connection'

/**
 * Database utility functions
 */

// Health check for database connection
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Get database statistics
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY n_live_tup DESC
    `
    return stats
  } catch (error) {
    console.error('Failed to get database stats:', error)
    return null
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// Batch operations helper
export async function batchOperation<T>(
  operations: Array<() => Promise<T>>,
  batchSize = 100
): Promise<T[]> {
  const results: T[] = []
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(op => op()))
    results.push(...batchResults)
  }
  
  return results
}

// Connection cleanup
export async function cleanupDatabase() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Database cleanup failed:', error)
  }
}
