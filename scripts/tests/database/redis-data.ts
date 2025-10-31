#!/usr/bin/env tsx

/**
 * Test Redis data script
 * Add some test data to Redis for demonstration
 */

import 'dotenv/config';
import { redis } from '../../../src/lib/redis/connection';

async function addTestData() {
  console.log('🧪 Adding test data to Redis...\n');

  try {
    // Add some test data
    await redis.set('test:string', 'Hello Redis!');
    await redis.setex('test:expiring', 60, 'This will expire in 60 seconds');
    await redis.hset('test:user:1', {
      name: 'Yiming Gao',
      email: 'yiminggao@mail.citytech.cuny.edu',
      university: 'City Tech',
    });
    await redis.lpush('test:recent_logins', 'user1', 'user2', 'user3');
    await redis.sadd('test:online_users', 'user1', 'user2', 'user3', 'user4');

    // Add some session data
    await redis.setex(
      'session:abc123',
      3600,
      JSON.stringify({
        userId: 'user123',
        email: 'test@university.edu',
        loginTime: new Date().toISOString(),
      })
    );

    // Add some cache data
    await redis.setex(
      'cache:matches:user123',
      300,
      JSON.stringify([
        { id: 'match1', name: 'Alice Smith', compatibility: 95 },
        { id: 'match2', name: 'Bob Johnson', compatibility: 87 },
      ])
    );

    console.log('✅ Test data added successfully!');
    console.log('📊 Added keys:');
    console.log('   - test:string (string)');
    console.log('   - test:expiring (string, expires in 60s)');
    console.log('   - test:user:1 (hash)');
    console.log('   - test:recent_logins (list)');
    console.log('   - test:online_users (set)');
    console.log('   - session:abc123 (string, expires in 1h)');
    console.log('   - cache:matches:user123 (string, expires in 5m)');

    console.log('\n🔍 Now run: npm run redis:browse');
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    console.log('\n✅ Test data script completed!');
  }
}

addTestData().catch(console.error);
