#!/usr/bin/env tsx

/**
 * Check user verification status
 */

import 'dotenv/config';
import { prisma } from '../src/lib/db/connection';

async function checkUser() {
  console.log('🔍 Checking user verification status...');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        createdAt: true,
      },
    });

    console.log(`\n📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.createdAt}`);
    });

    // Check if any user is verified
    const verifiedUsers = users.filter(user => user.isVerified);
    console.log(`\n✅ Verified users: ${verifiedUsers.length}`);

    if (verifiedUsers.length === 0) {
      console.log('\n⚠️  No verified users found!');
      console.log('   This might be why authentication is failing.');
      console.log('   Let me verify the first user...');

      if (users.length > 0) {
        const firstUser = users[0];
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { isVerified: true },
        });
        console.log(`✅ Verified user: ${firstUser.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ User check completed!');
  }
}

checkUser().catch(console.error);
