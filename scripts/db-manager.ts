#!/usr/bin/env tsx

/**
 * Database management utility script
 * Provides comprehensive database management capabilities
 */

import { spawn } from 'child_process'
import { config } from '../src/lib/config/env'
import { checkDatabaseConnection, prisma } from '../src/lib/db/connection'
import { devRedisUtils } from '../src/lib/redis/connection'

interface Command {
    name: string
    description: string
    action: () => Promise<void>
}

const commands: Command[] = [
    {
        name: 'status',
        description: 'Check database and Redis connection status',
        action: async () => {
            console.log('🔍 Checking system status...')

            // Check database
            const isConnected = await checkDatabaseConnection()
            console.log('📊 Database Status:', isConnected ? 'Connected' : 'Disconnected')

            // Check Redis
            try {
                const redisStats = await devRedisUtils.getCacheStats()
                console.log('📊 Redis Status:', JSON.stringify(redisStats, null, 2))
            } catch (error) {
                console.log('❌ Redis Status: Failed to connect')
            }
        }
    },

    {
        name: 'studio',
        description: 'Start Prisma Studio',
        action: async () => {
            console.log('🚀 Starting Prisma Studio...')
            const studioProcess = spawn('npx', ['prisma', 'studio'], {
                stdio: 'inherit',
                shell: true,
            })

            process.on('SIGINT', () => {
                console.log('\n🔄 Shutting down Prisma Studio...')
                studioProcess.kill('SIGINT')
                process.exit(0)
            })
        }
    },

    {
        name: 'migrate',
        description: 'Run database migrations',
        action: async () => {
            console.log('🔄 Running database migrations...')
            const migrateProcess = spawn('npx', ['prisma', 'migrate', 'dev'], {
                stdio: 'inherit',
                shell: true,
            })

            migrateProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Migrations completed successfully')
                } else {
                    console.error('❌ Migrations failed')
                }
                process.exit(code || 0)
            })
        }
    },

    {
        name: 'reset',
        description: 'Reset database (development only)',
        action: async () => {
            if (config.isProduction) {
                console.error('❌ Database reset is not allowed in production')
                process.exit(1)
            }

            console.log('⚠️  Resetting database...')
            const resetProcess = spawn('npx', ['prisma', 'migrate', 'reset'], {
                stdio: 'inherit',
                shell: true,
            })

            resetProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Database reset completed')
                } else {
                    console.error('❌ Database reset failed')
                }
                process.exit(code || 0)
            })
        }
    },

    {
        name: 'seed',
        description: 'Seed database with development data',
        action: async () => {
            console.log('🌱 Seeding database...')
            const seedProcess = spawn('npx', ['tsx', 'prisma/seed.ts'], {
                stdio: 'inherit',
                shell: true,
            })

            seedProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Database seeding completed')
                } else {
                    console.error('❌ Database seeding failed')
                }
                process.exit(code || 0)
            })
        }
    },

    {
        name: 'generate',
        description: 'Generate Prisma client',
        action: async () => {
            console.log('🔧 Generating Prisma client...')
            const generateProcess = spawn('npx', ['prisma', 'generate'], {
                stdio: 'inherit',
                shell: true,
            })

            generateProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Prisma client generated successfully')
                } else {
                    console.error('❌ Prisma client generation failed')
                }
                process.exit(code || 0)
            })
        }
    },

    {
        name: 'clear-cache',
        description: 'Clear Redis cache (development only)',
        action: async () => {
            if (config.isProduction) {
                console.error('❌ Cache clearing is not allowed in production')
                process.exit(1)
            }

            console.log('🗑️  Clearing Redis cache...')
            try {
                await devRedisUtils.clearAllCache()
                console.log('✅ Redis cache cleared successfully')
            } catch (error) {
                console.error('❌ Failed to clear Redis cache:', error)
                process.exit(1)
            }
        }
    },

    {
        name: 'stats',
        description: 'Show database and cache statistics',
        action: async () => {
            console.log('📊 Gathering statistics...')

            try {
                // Database stats
                const [userCount, courseCount, universityCount, connectionCount] = await Promise.all([
                    prisma.user.count(),
                    prisma.course.count(),
                    prisma.university.count(),
                    prisma.connection.count(),
                ])

                console.log('📊 Database Statistics:')
                console.log(`   Users: ${userCount}`)
                console.log(`   Courses: ${courseCount}`)
                console.log(`   Universities: ${universityCount}`)
                console.log(`   Connections: ${connectionCount}`)

                // Redis stats
                const redisStats = await devRedisUtils.getCacheStats()
                console.log('📊 Redis Statistics:')
                console.log(`   Keys: ${redisStats.keyCount}`)

            } catch (error) {
                console.error('❌ Failed to gather statistics:', error)
                process.exit(1)
            }
        }
    }
]

async function main() {
    const commandName = process.argv[2]

    if (!commandName) {
        console.log('🔧 Database Management Utility')
        console.log('')
        console.log('Available commands:')
        commands.forEach(cmd => {
            console.log(`   ${cmd.name.padEnd(15)} - ${cmd.description}`)
        })
        console.log('')
        console.log('Usage: npm run db:manager <command>')
        console.log('Example: npm run db:manager status')
        process.exit(0)
    }

    const command = commands.find(cmd => cmd.name === commandName)

    if (!command) {
        console.error(`❌ Unknown command: ${commandName}`)
        console.log('Available commands:', commands.map(cmd => cmd.name).join(', '))
        process.exit(1)
    }

    try {
        await command.action()
    } catch (error) {
        console.error('❌ Command failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run the main function
main().catch(console.error)
