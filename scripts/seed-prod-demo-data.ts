/**
 * Production Demo Data Seeding Script
 * 
 * This script seeds production database with demo data.
 * It uses the DATABASE_URL from .env-pro file.
 * 
 * Usage:
 *   NODE_ENV=production tsx scripts/seed-prod-demo-data.ts
 *   or
 *   npm run db:seed:prod
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env-pro file
config({ path: resolve(process.cwd(), '.env-pro') });

const prisma = new PrismaClient();

// Course templates - should include section, semester, universityId
const courseTemplates = [
  { code: 'CS 161', name: 'Data Structures and Algorithms', section: '001', semester: 'Spring 2025' },
  { code: 'CS 189', name: 'Machine Learning', section: '001', semester: 'Spring 2025' },
  { code: 'CS 186', name: 'Database Systems', section: '001', semester: 'Spring 2025' },
  { code: 'CS 170', name: 'Efficient Algorithms and Intractable Problems', section: '001', semester: 'Spring 2025' },
  { code: 'CS 188', name: 'Introduction to Artificial Intelligence', section: '001', semester: 'Spring 2025' },
  { code: 'CS 162', name: 'Operating Systems and System Programming', section: '001', semester: 'Spring 2025' },
  { code: 'MATH 53', name: 'Multivariable Calculus', section: '001', semester: 'Spring 2025' },
  { code: 'MATH 54', name: 'Linear Algebra and Differential Equations', section: '001', semester: 'Spring 2025' },
  { code: 'PHYS 7A', name: 'Physics for Scientists and Engineers', section: '001', semester: 'Spring 2025' },
  { code: 'EECS 16A', name: 'Designing Information Devices and Systems I', section: '001', semester: 'Spring 2025' },
];

// Topics/Skills data
const topicCategories = [
  {
    category: 'skill',
    topics: [
      { name: 'React', description: 'React.js framework' },
      { name: 'Python', description: 'Python programming language' },
      { name: 'JavaScript', description: 'JavaScript programming' },
      { name: 'TypeScript', description: 'TypeScript programming' },
      { name: 'Node.js', description: 'Node.js runtime' },
      { name: 'SQL', description: 'Structured Query Language' },
      { name: 'PostgreSQL', description: 'PostgreSQL database' },
      { name: 'Docker', description: 'Containerization' },
      { name: 'AWS', description: 'Amazon Web Services' },
      { name: 'Git', description: 'Version control' },
    ],
  },
  {
    category: 'interest',
    topics: [
      { name: 'Web Development', description: 'Building web applications' },
      { name: 'Machine Learning', description: 'ML and AI technologies' },
      { name: 'Data Science', description: 'Data analysis and visualization' },
      { name: 'Cybersecurity', description: 'Security and encryption' },
      { name: 'Mobile Development', description: 'iOS and Android apps' },
    ],
  },
];

// Demo user data
const demoUsers = [
  {
    email: 'alice.johnson@university.edu',
    firstName: 'Alice',
    lastName: 'Johnson',
    university: 'University of California',
    bio: 'Computer Science major passionate about machine learning and data science.',
    studyStyle: 'Small (3-4)',
    studyPace: 'Intense',
    preferredLocation: 'Library',
  },
  {
    email: 'bob.smith@university.edu',
    firstName: 'Bob',
    lastName: 'Smith',
    university: 'University of California',
    bio: 'Full-stack developer, love building web applications with React and Node.js.',
    studyStyle: 'Pair',
    studyPace: 'Moderate',
    preferredLocation: 'Cafe',
  },
  {
    email: 'charlie.brown@university.edu',
    firstName: 'Charlie',
    lastName: 'Brown',
    university: 'University of California',
    bio: 'Math major interested in algorithms and theoretical computer science.',
    studyStyle: 'Solo',
    studyPace: 'Relaxed',
    preferredLocation: 'Library',
  },
  {
    email: 'diana.prince@university.edu',
    firstName: 'Diana',
    lastName: 'Prince',
    university: 'University of California',
    bio: 'Software engineering student, focused on system design and distributed systems.',
    studyStyle: 'Small (3-4)',
    studyPace: 'Intense',
    preferredLocation: 'Cafe',
  },
  {
    email: 'eve.wilson@university.edu',
    firstName: 'Eve',
    lastName: 'Wilson',
    university: 'University of California',
    bio: 'Data science enthusiast, working on ML projects and data visualization.',
    studyStyle: 'Pair',
    studyPace: 'Moderate',
    preferredLocation: 'Library',
  },
];

async function seedProductionDemoData() {
  console.log('🌱 Starting production demo data seeding...\n');

  try {
    // 0. Create or get university
    console.log('🏫 Creating university...');
    const university = await prisma.university.upsert({
      where: { domain: 'university.edu' },
      update: {},
      create: {
        name: 'University of California',
        domain: 'university.edu',
        isActive: true,
      },
    });
    console.log(`  ✓ ${university.name}\n`);

    // 1. Create or get courses
    console.log('📚 Creating courses...');
    const courses = [];
    for (const template of courseTemplates) {
      const course = await prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: template.code,
            section: template.section,
            semester: template.semester,
            universityId: university.id,
          },
        },
        update: {},
        create: {
          code: template.code,
          name: template.name,
          section: template.section,
          semester: template.semester,
          universityId: university.id,
          isActive: true,
        },
      });
      courses.push(course);
      console.log(`  ✓ ${course.code} ${course.section}: ${course.name}`);
    }

    // 2. Create or get topics
    console.log('\n🏷️  Creating topics...');
    const allTopics = [];
    for (const category of topicCategories) {
      for (const topicData of category.topics) {
        const topic = await prisma.topic.upsert({
          where: {
            name_category: {
              name: topicData.name,
              category: category.category,
            },
          },
          update: {},
          create: {
            name: topicData.name,
            description: topicData.description,
            category: category.category,
            isActive: true,
          },
        });
        allTopics.push(topic);
        console.log(`  ✓ ${topic.name} (${topic.category})`);
      }
    }

    // 3. Create demo users
    console.log('\n👥 Creating demo users...');
    const users = [];
    const passwordHash = await bcrypt.hash('Demo123!', 12);

    for (const userData of demoUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          university: userData.university,
          passwordHash,
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Create user profile
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: userData.bio,
          studyStyle: userData.studyStyle,
          studyPace: userData.studyPace,
          preferredLocation: userData.preferredLocation,
        },
        create: {
          userId: user.id,
          bio: userData.bio,
          studyStyle: userData.studyStyle,
          studyPace: userData.studyPace,
          preferredLocation: userData.preferredLocation,
        },
      });

      users.push(user);
      console.log(`  ✓ ${user.firstName} ${user.lastName} (${user.email})`);
    }

    // 4. Assign courses to users
    console.log('\n📖 Enrolling users in courses...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Each user is randomly assigned 2-4 courses
      const numCourses = 2 + Math.floor(Math.random() * 3);
      const userCourses = courses
        .sort(() => Math.random() - 0.5)
        .slice(0, numCourses);

      for (const course of userCourses) {
        await prisma.userCourse.upsert({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            courseId: course.id,
          },
        });
        console.log(`  ✓ ${user.firstName} enrolled in ${course.code}`);
      }
    }

    // 5. Assign topics to users
    console.log('\n🎯 Assigning topics to users...');
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Each user is randomly assigned 3-6 topics
      const numTopics = 3 + Math.floor(Math.random() * 4);
      const userTopics = allTopics
        .sort(() => Math.random() - 0.5)
        .slice(0, numTopics);

      for (const topic of userTopics) {
        await prisma.userTopic.upsert({
          where: {
            userId_topicId: {
              userId: user.id,
              topicId: topic.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            topicId: topic.id,
          },
        });
        console.log(`  ✓ ${user.firstName} interested in ${topic.name}`);
      }
    }

    // 6. Create some availability records
    console.log('\n📅 Creating availability records...');
    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '16:00' },
      { start: '18:00', end: '21:00' },
    ];
    const days = [1, 2, 3, 4, 5]; // Mon-Fri

    for (const user of users) {
      // Each user is randomly assigned 2-3 time slots
      const numSlots = 2 + Math.floor(Math.random() * 2);
      const selectedSlots = timeSlots
        .sort(() => Math.random() - 0.5)
        .slice(0, numSlots);

      for (const slot of selectedSlots) {
        // Each time slot is randomly assigned 2-4 days
        const numDays = 2 + Math.floor(Math.random() * 3);
        const selectedDays = days
          .sort(() => Math.random() - 0.5)
          .slice(0, numDays);

        for (const day of selectedDays) {
          await prisma.availability.create({
            data: {
              userId: user.id,
              dayOfWeek: day,
              startTime: slot.start,
              endTime: slot.end,
            },
          });
        }
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const dayLabels = selectedDays.map(d => dayNames[d - 1]).join(', ');
        console.log(`  ✓ ${user.firstName} available ${slot.start}-${slot.end} on ${dayLabels}`);
      }
    }

    console.log('\n✅ Production demo data seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Topics: ${allTopics.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`\n🔑 Demo user credentials (all use password: Demo123!):`);
    users.forEach((user) => {
      console.log(`   - ${user.email}`);
    });
  } catch (error) {
    console.error('❌ Error seeding production demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedProductionDemoData()
  .then(() => {
    console.log('\n🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });

