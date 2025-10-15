#!/usr/bin/env tsx

/**
 * Prisma Studio management script
 * Provides enhanced database management capabilities
 */

import { spawn } from 'child_process'
import { config } from '../src/lib/config/env'
import { checkDatabaseConnection } from '../src/lib/db/connection'

async function startPrismaStudio() {
  console.log('🔍 Starting Prisma Studio...')
  console.log('Environment:', config.app.environment)
  console.log('Database URL:', config.database.url ? 'Set' : 'Not set')
  console.log('')

  try {
    // Check database connection before starting Studio
    console.log('1. Checking database connection...')
    const isConnected = await checkDatabaseConnection()
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your DATABASE_URL.')
      process.exit(1)
    }
    
    console.log('✅ Database connection successful')
    console.log('')

    // Start Prisma Studio
    console.log('2. Starting Prisma Studio...')
    console.log('📊 Prisma Studio will be available at: http://localhost:5555')
    console.log('')
    console.log('🎉 Prisma Studio started successfully!')
    console.log('')
    console.log('💡 Tips:')
    console.log('   - Use the browser to access the database interface')
    console.log('   - All tables and relationships are available')
    console.log('   - Changes are reflected in real-time')
    console.log('   - Press Ctrl+C to stop')
    console.log('')

    const studioProcess = spawn('npx', ['prisma', 'studio'], {
      stdio: 'inherit',
      shell: true,
    })

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🔄 Shutting down Prisma Studio...')
      studioProcess.kill('SIGINT')
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('\n🔄 Shutting down Prisma Studio...')
      studioProcess.kill('SIGTERM')
      process.exit(0)
    })

    studioProcess.on('error', (error) => {
      console.error('❌ Failed to start Prisma Studio:', error)
      process.exit(1)
    })

  } catch (error) {
    console.error('❌ Prisma Studio startup failed:', error)
    process.exit(1)
  }
}

// Run the function
startPrismaStudio().catch(console.error)
