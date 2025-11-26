import 'dotenv/config';
import { config, validateEnvironment } from '../src/lib/config/env';
import { checkDatabaseConnection } from '../src/lib/db/connection';
import { checkRedisHealth } from '../src/lib/redis/connection';

interface ValidationResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

async function validateConfig() {
  console.log('🔍 Validating environment configuration...');
  console.log('');

  const results: ValidationResult[] = [];

  try {
    // Validate environment variables
    console.log('1. Validating environment variables...');
    try {
      validateEnvironment();
      results.push({
        name: 'Environment Variables',
        status: 'success',
        message: 'All required variables are present and valid',
      });
    } catch (error) {
      results.push({
        name: 'Environment Variables',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test database connection
    console.log('2. Testing database connection...');
    try {
      const isConnected = await checkDatabaseConnection();
      results.push({
        name: 'Database Connection',
        status: isConnected ? 'success' : 'error',
        message: isConnected ? 'Connected successfully' : 'Connection failed',
      });
    } catch (error) {
      results.push({
        name: 'Database Connection',
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Connection test failed',
      });
    }

    // Test Redis connection
    console.log('3. Testing Redis connection...');
    try {
      const redisHealth = await checkRedisHealth();
      results.push({
        name: 'Redis Connection',
        status: redisHealth.status === 'healthy' ? 'success' : 'error',
        message:
          redisHealth.status === 'healthy'
            ? `Connected successfully (${redisHealth.responseTime}ms)`
            : `Connection failed: ${redisHealth.error}`,
      });
    } catch (error) {
      results.push({
        name: 'Redis Connection',
        status: 'error',
        message:
          error instanceof Error ? error.message : 'Connection test failed',
      });
    }

    // Check optional services
    console.log('4. Checking optional services...');

    // File storage
    if (
      config.storage.cloudName &&
      config.storage.apiKey &&
      config.storage.apiSecret
    ) {
      results.push({
        name: 'File Storage',
        status: 'success',
        message: 'Cloudinary configured',
      });
    } else {
      results.push({
        name: 'File Storage',
        status: 'warning',
        message: 'File storage not configured (optional)',
      });
    }

    // Real-time communication
    if (config.pusher.appId && config.pusher.secret && config.pusher.key) {
      results.push({
        name: 'Real-time Communication',
        status: 'success',
        message: 'Pusher configured',
      });
    } else {
      results.push({
        name: 'Real-time Communication',
        status: 'warning',
        message: 'Real-time features not configured (optional)',
      });
    }

    // Analytics
    if (config.features.analytics && config.analytics.key) {
      results.push({
        name: 'Analytics',
        status: 'success',
        message: 'PostHog configured',
      });
    } else {
      results.push({
        name: 'Analytics',
        status: 'warning',
        message: 'Analytics not configured (optional)',
      });
    }

    // Display results
    console.log('');
    console.log('📋 Validation Results:');
    console.log('');

    results.forEach(result => {
      const icon =
        result.status === 'success'
          ? '✅'
          : result.status === 'warning'
            ? '⚠️'
            : '❌';
      console.log(`   ${icon} ${result.name}: ${result.message}`);
    });

    // Configuration summary
    console.log('');
    console.log('📊 Configuration Summary:');
    console.log(`   Environment: ${config.app.environment}`);
    console.log(`   App Name: ${config.app.name}`);
    console.log(`   App URL: ${config.app.url}`);
    console.log(
      `   Debug Mode: ${config.isDevelopment ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `   Real-time Features: ${config.features.realTime ? 'Enabled' : 'Disabled'}`
    );
    console.log(
      `   Notifications: ${config.features.notifications ? 'Enabled' : 'Disabled'}`
    );

    // Check for errors
    const errors = results.filter(r => r.status === 'error');
    const warnings = results.filter(r => r.status === 'warning');

    if (errors.length > 0) {
      console.log('');
      console.log('❌ Configuration validation failed with errors:');
      errors.forEach(error => {
        console.log(`   - ${error.name}: ${error.message}`);
      });
      console.log('');
      console.log('💡 Please fix the errors above before proceeding.');
      process.exit(1);
    } else {
      console.log('');
      if (warnings.length > 0) {
        console.log('⚠️  Configuration validation completed with warnings:');
        warnings.forEach(warning => {
          console.log(`   - ${warning.name}: ${warning.message}`);
        });
        console.log('');
        console.log(
          '💡 Optional services can be configured later for full functionality.'
        );
      } else {
        console.log('🎉 Configuration validation completed successfully!');
        console.log('💡 All services are properly configured.');
      }

      console.log('');
      console.log('🚀 You can now start the development server:');
      console.log('   npm run dev');
      console.log('');
      console.log('🔗 Useful commands:');
      console.log('   - Start development server: npm run dev');
      console.log('   - Open Prisma Studio: npm run db:studio');
      console.log('   - Debug database: npm run debug:db');
      console.log('   - Debug Redis: npm run debug:redis');

      process.exit(0);
    }
  } catch (error) {
    console.error('');
    console.error('❌ Configuration validation failed with unexpected error:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

validateConfig();
