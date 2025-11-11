import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../src/lib/config/env';

const prisma = new PrismaClient();

// Check if we're in development mode
if (config.isProduction) {
  console.error('❌ Development seeding is not allowed in production');
  process.exit(1);
}

async function seedDevelopment() {
  console.log('🌱 Starting development database seeding...');

  // Clear existing data (development only)
  console.log('🧹 Clearing existing data...');
  await prisma.matchCache.deleteMany();
  await prisma.message.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.userCourse.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();
  await prisma.university.deleteMany();

  // Create universities
  console.log('📚 Creating universities...');
  const universities = await Promise.all([
    prisma.university.create({
      data: {
        name: 'University of California, Berkeley',
        domain: 'berkeley.edu',
        isActive: true,
      },
    }),
    prisma.university.create({
      data: {
        name: 'Stanford University',
        domain: 'stanford.edu',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${universities.length} universities`);

  // Create courses
  console.log('📖 Creating courses...');
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Data Structures and Algorithms',
        code: 'CS 161',
        section: '001',
        semester: 'Spring 2024',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00 AM',
        universityId: universities[0].id,
        isActive: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'Machine Learning',
        code: 'CS 189',
        section: '001',
        semester: 'Spring 2024',
        instructor: 'Dr. Johnson',
        schedule: 'TTh 2:00-3:30 PM',
        universityId: universities[0].id,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${courses.length} courses`);

  // Create test users
  console.log('👥 Creating test users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'test@berkeley.edu',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        university: 'University of California, Berkeley',
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo@berkeley.edu',
        passwordHash: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        university: 'University of California, Berkeley',
        isVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} test users`);

  // Create user profiles
  console.log('👤 Creating user profiles...');
  await Promise.all([
    prisma.userProfile.create({
      data: {
        userId: users[0].id,
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate',
        bio: 'Test user for development and testing purposes.',
      },
    }),
    prisma.userProfile.create({
      data: {
        userId: users[1].id,
        preferredLocation: 'cafe',
        studyStyle: 'quiet',
        studyPace: 'fast',
        bio: 'Demo user for showcasing application features.',
      },
    }),
  ]);

  console.log('✅ Created user profiles');

  // Create course enrollments
  console.log('📚 Creating course enrollments...');
  await Promise.all([
    prisma.userCourse.create({
      data: {
        userId: users[0].id,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    prisma.userCourse.create({
      data: {
        userId: users[1].id,
        courseId: courses[0].id,
        isActive: true,
      },
    }),
    prisma.userCourse.create({
      data: {
        userId: users[1].id,
        courseId: courses[1].id,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created course enrollments');

  // Create availability
  console.log('⏰ Creating availability data...');
  await Promise.all([
    prisma.availability.create({
      data: {
        userId: users[0].id,
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '12:00',
      },
    }),
    prisma.availability.create({
      data: {
        userId: users[1].id,
        dayOfWeek: 1, // Monday
        startTime: '11:00',
        endTime: '13:00',
      },
    }),
  ]);

  console.log('✅ Created availability data');

  console.log('🎉 Development seeding completed!');
  console.log('');
  console.log('📧 Test credentials:');
  console.log('   - test@berkeley.edu / password123');
  console.log('   - demo@berkeley.edu / password123');
  console.log('');
  console.log('🔗 Useful links:');
  console.log('   - Prisma Studio: npm run db:studio');
  console.log('   - Database Manager: npm run db:manager');
  console.log('   - Debug Database: npm run debug:db');
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Use these credentials to test the application');
  console.log('   - Check Prisma Studio to explore the data');
  console.log('   - Run npm run db:reset:dev to reset and reseed');
}

seedDevelopment()
  .catch(e => {
    console.error('❌ Development seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
