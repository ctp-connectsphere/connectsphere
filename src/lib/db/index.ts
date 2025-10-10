// Database exports
export { prisma, default as db } from './connection'

// Database utilities
export * from './utils'

// Database types
export type { User, Course, University, Connection, Message } from '@prisma/client'
