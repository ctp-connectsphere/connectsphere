import { validateEnvironment, config } from '../src/lib/config'

async function validateConfig() {
  console.log('🔍 Validating environment configuration...')
  
  try {
    validateEnvironment()
    console.log('✅ All required environment variables are present and valid')
    
    // Display configuration summary
    console.log('\n📋 Configuration Summary:')
    console.log(`   Environment: ${config.app.environment}`)
    console.log(`   App Name: ${config.app.name}`)
    console.log(`   App URL: ${config.app.url}`)
    console.log(`   Database: ${config.database.url ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Redis: ${config.redis.url ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Auth: ${config.auth.url ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Email: ${config.email.apiKey ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Storage: ${config.storage.cloudName ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Pusher: ${config.pusher.appId ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Analytics: ${config.features.analytics ? '✅ Enabled' : '❌ Disabled'}`)
    console.log(`   Real-time: ${config.features.realTime ? '✅ Enabled' : '❌ Disabled'}`)
    console.log(`   Notifications: ${config.features.notifications ? '✅ Enabled' : '❌ Disabled'}`)
    
    console.log('\n🎉 Configuration validation completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Configuration validation failed:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

validateConfig()
