/**
 * Test Stack Auth Configuration
 *
 * This script tests if Stack Auth environment variables are properly configured.
 *
 * Usage:
 *   tsx scripts/test-stack-auth.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env-pro file
config({ path: resolve(process.cwd(), '.env-pro') });

async function testStackAuthConfig() {
  console.log('🔍 Testing Stack Auth Configuration...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check environment variables
  console.log('📋 Checking environment variables:');

  if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID) {
    errors.push('❌ NEXT_PUBLIC_STACK_PROJECT_ID is not set');
  } else {
    console.log(
      `  ✅ NEXT_PUBLIC_STACK_PROJECT_ID: ${process.env.NEXT_PUBLIC_STACK_PROJECT_ID.substring(0, 20)}...`
    );
  }

  if (!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
    errors.push('❌ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY is not set');
  } else {
    console.log(
      `  ✅ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: ${process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY.substring(0, 20)}...`
    );
  }

  if (!process.env.STACK_SECRET_SERVER_KEY) {
    errors.push('❌ STACK_SECRET_SERVER_KEY is not set');
  } else {
    console.log(
      `  ✅ STACK_SECRET_SERVER_KEY: ${process.env.STACK_SECRET_SERVER_KEY.substring(0, 20)}...`
    );
  }

  // Check database connection
  console.log('\n🗄️  Checking database connection:');
  try {
    const { prisma } = await import('../src/lib/db/connection');
    await prisma.$connect();
    console.log('  ✅ Database connection successful');

    // Check if neon_auth schema exists
    try {
      const result = await prisma.$queryRaw<Array<{ schema_name: string }>>`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = 'neon_auth'
      `;

      if (result.length > 0) {
        console.log('  ✅ neon_auth schema exists');

        // Check if users_sync table exists
        try {
          const tableResult = await prisma.$queryRaw<
            Array<{ table_name: string }>
          >`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'neon_auth' 
            AND table_name = 'users_sync'
          `;

          if (tableResult.length > 0) {
            console.log('  ✅ neon_auth.users_sync table exists');

            // Count users in sync table
            try {
              const countResult = await prisma.$queryRaw<
                Array<{ count: bigint }>
              >`
                SELECT COUNT(*) as count 
                FROM neon_auth.users_sync 
                WHERE deleted_at IS NULL
              `;
              const count = Number(countResult[0]?.count || 0);
              console.log(`  📊 Synced users: ${count}`);
            } catch (error) {
              warnings.push(
                '⚠️  Could not count users in neon_auth.users_sync table'
              );
            }
          } else {
            warnings.push(
              '⚠️  neon_auth.users_sync table does not exist yet (will be created by Stack Auth)'
            );
          }
        } catch (error) {
          warnings.push('⚠️  Could not check for users_sync table');
        }
      } else {
        warnings.push(
          '⚠️  neon_auth schema does not exist yet (will be created by Stack Auth)'
        );
      }
    } catch (error) {
      warnings.push('⚠️  Could not check for neon_auth schema');
    }

    await prisma.$disconnect();
  } catch (error) {
    errors.push(
      `❌ Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Check Stack Auth package
  console.log('\n📦 Checking Stack Auth package:');
  try {
    // Try to import the package
    await import('@stackframejs/nextjs');
    console.log('  ✅ @stackframejs/nextjs package is installed');
  } catch (error) {
    warnings.push('⚠️  @stackframejs/nextjs package is not installed');
    console.log('  ⚠️  Package not installed - you may need to install it');
    console.log('     Run: npm install @stackframejs/nextjs');
  }

  // Summary
  console.log('\n📊 Summary:');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('  ✅ All checks passed! Stack Auth is properly configured.');
  } else {
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  ${error}`));
    }
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
  }

  return errors.length === 0;
}

// Run the test
testStackAuthConfig()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
