/**
 * Production Demo Data Seeding Script
 *
 * This script seeds production database with comprehensive demo data.
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
import { readFileSync } from 'fs';
import { resolve } from 'path';

// IMPORTANT: Clear any existing DATABASE_URL from environment
// and load ONLY from .env-pro file
delete process.env.DATABASE_URL;

// Load .env-pro file for production database connection (override: true)
const envProPath = resolve(process.cwd(), '.env-pro');
config({ path: envProPath, override: true });

// Read the DATABASE_URL directly from .env-pro file to ensure we get the correct one
const envProContent = readFileSync(envProPath, 'utf-8');
const dbUrlMatch = envProContent.match(/DATABASE_URL=['"]([^'"]+)['"]/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL || '';

// Force set the DATABASE_URL from .env-pro
process.env.DATABASE_URL = dbUrl;

// Log which database we're connecting to
const dbType = dbUrl.includes('ep-spring-glade-ah133wuj-pooler')
  ? 'PRODUCTION'
  : 'DEV';
console.log(`\n🔍 Database Connection Info:`);
console.log(`   Type: ${dbType}`);
console.log(`   Source: .env-pro file`);
console.log(`   URL: ${dbUrl.substring(0, 50)}...`);
console.log(`   Full URL: ${dbUrl}\n`);

if (!dbUrl.includes('ep-spring-glade-ah133wuj-pooler')) {
  console.error('❌ ERROR: Not using production database!');
  console.error('   Expected: ep-spring-glade-ah133wuj-pooler');
  console.error('   Got: ' + dbUrl);
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

// 课程模板 - 这些是系统建议的课程
const courseTemplates = [
  // Computer Science
  { code: 'CS 161', name: 'Data Structures and Algorithms', department: 'CS' },
  { code: 'CS 189', name: 'Machine Learning', department: 'CS' },
  { code: 'CS 186', name: 'Database Systems', department: 'CS' },
  {
    code: 'CS 170',
    name: 'Efficient Algorithms and Intractable Problems',
    department: 'CS',
  },
  {
    code: 'CS 188',
    name: 'Introduction to Artificial Intelligence',
    department: 'CS',
  },
  {
    code: 'CS 162',
    name: 'Operating Systems and System Programming',
    department: 'CS',
  },
  {
    code: 'CS 61C',
    name: 'Great Ideas in Computer Architecture',
    department: 'CS',
  },
  {
    code: 'CS 70',
    name: 'Discrete Mathematics and Probability Theory',
    department: 'CS',
  },

  // Math
  { code: 'MATH 53', name: 'Multivariable Calculus', department: 'MATH' },
  {
    code: 'MATH 54',
    name: 'Linear Algebra and Differential Equations',
    department: 'MATH',
  },
  { code: 'MATH 55', name: 'Discrete Mathematics', department: 'MATH' },
  { code: 'MATH 104', name: 'Introduction to Analysis', department: 'MATH' },

  // Physics
  {
    code: 'PHYS 7A',
    name: 'Physics for Scientists and Engineers',
    department: 'PHYS',
  },
  {
    code: 'PHYS 7B',
    name: 'Physics for Scientists and Engineers',
    department: 'PHYS',
  },

  // Engineering
  {
    code: 'EECS 16A',
    name: 'Designing Information Devices and Systems I',
    department: 'EECS',
  },
  {
    code: 'EECS 16B',
    name: 'Designing Information Devices and Systems II',
    department: 'EECS',
  },

  // Business
  { code: 'BUS 101', name: 'Introduction to Business', department: 'BUS' },
  { code: 'BUS 201', name: 'Financial Accounting', department: 'BUS' },
];

// CUNY Course Templates (using CUNY course codes)
const cunyCourseTemplates = [
  // Computer Science
  { code: 'CSC 220', name: 'Data Structures', department: 'CSC' },
  { code: 'CSC 221', name: 'Computer Organization', department: 'CSC' },
  { code: 'CSC 332', name: 'Operating Systems', department: 'CSC' },
  { code: 'CSC 430', name: 'Database Systems', department: 'CSC' },
  { code: 'CSC 490', name: 'Software Engineering', department: 'CSC' },
  { code: 'CSC 598', name: 'Machine Learning', department: 'CSC' },

  // Math
  { code: 'MATH 201', name: 'Calculus I', department: 'MATH' },
  { code: 'MATH 202', name: 'Calculus II', department: 'MATH' },
  { code: 'MATH 301', name: 'Linear Algebra', department: 'MATH' },
  { code: 'MATH 350', name: 'Discrete Mathematics', department: 'MATH' },

  // Business (Baruch/Hunter focus)
  { code: 'ACC 2101', name: 'Financial Accounting', department: 'ACC' },
  { code: 'MGT 3120', name: 'Principles of Management', department: 'MGT' },
  { code: 'MKT 3000', name: 'Marketing Management', department: 'MKT' },

  // Psychology
  { code: 'PSY 100', name: 'Introduction to Psychology', department: 'PSY' },
  { code: 'PSY 201', name: 'Research Methods', department: 'PSY' },

  // English
  { code: 'ENG 101', name: 'Composition I', department: 'ENG' },
  { code: 'ENG 102', name: 'Composition II', department: 'ENG' },
];

// CUNY Universities
const cunyUniversities = [
  { name: 'Baruch College', domain: 'baruch.cuny.edu' },
  { name: 'Brooklyn College', domain: 'brooklyn.cuny.edu' },
  { name: 'City College', domain: 'ccny.cuny.edu' },
  { name: 'Hunter College', domain: 'hunter.cuny.edu' },
  { name: 'John Jay College', domain: 'jjay.cuny.edu' },
  { name: 'Lehman College', domain: 'lehman.cuny.edu' },
  { name: 'Queens College', domain: 'qc.cuny.edu' },
  { name: 'York College', domain: 'york.cuny.edu' },
];

// CUNY User Templates
const cunyUserTemplates = [
  // Baruch College
  {
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@baruch.cuny.edu',
    major: 'Business Administration',
    university: 'Baruch College',
  },
  {
    firstName: 'Kevin',
    lastName: 'Chen',
    email: 'kevin.chen@baruch.cuny.edu',
    major: 'Finance',
    university: 'Baruch College',
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    email: 'priya.patel@baruch.cuny.edu',
    major: 'Accounting',
    university: 'Baruch College',
  },

  // Brooklyn College
  {
    firstName: 'Jasmine',
    lastName: 'Williams',
    email: 'jasmine.williams@brooklyn.cuny.edu',
    major: 'Computer Science',
    university: 'Brooklyn College',
  },
  {
    firstName: 'Carlos',
    lastName: 'Martinez',
    email: 'carlos.martinez@brooklyn.cuny.edu',
    major: 'Mathematics',
    university: 'Brooklyn College',
  },
  {
    firstName: 'Aisha',
    lastName: 'Johnson',
    email: 'aisha.johnson@brooklyn.cuny.edu',
    major: 'Psychology',
    university: 'Brooklyn College',
  },

  // City College
  {
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@ccny.cuny.edu',
    major: 'Electrical Engineering',
    university: 'City College',
  },
  {
    firstName: 'Sofia',
    lastName: 'Garcia',
    email: 'sofia.garcia@ccny.cuny.edu',
    major: 'Computer Science',
    university: 'City College',
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@ccny.cuny.edu',
    major: 'Mechanical Engineering',
    university: 'City College',
  },

  // Hunter College
  {
    firstName: 'Rachel',
    lastName: 'Green',
    email: 'rachel.green@hunter.cuny.edu',
    major: 'Psychology',
    university: 'Hunter College',
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@hunter.cuny.edu',
    major: 'Biology',
    university: 'Hunter College',
  },
  {
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@hunter.cuny.edu',
    major: 'Nursing',
    university: 'Hunter College',
  },

  // John Jay College
  {
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@jjay.cuny.edu',
    major: 'Criminal Justice',
    university: 'John Jay College',
  },
  {
    firstName: 'Nicole',
    lastName: 'Taylor',
    email: 'nicole.taylor@jjay.cuny.edu',
    major: 'Forensic Science',
    university: 'John Jay College',
  },

  // Lehman College
  {
    firstName: 'Roberto',
    lastName: 'Lopez',
    email: 'roberto.lopez@lehman.cuny.edu',
    major: 'Social Work',
    university: 'Lehman College',
  },
  {
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@lehman.cuny.edu',
    major: 'Education',
    university: 'Lehman College',
  },

  // Queens College
  {
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'jennifer.lee@qc.cuny.edu',
    major: 'Computer Science',
    university: 'Queens College',
  },
  {
    firstName: 'Daniel',
    lastName: 'Smith',
    email: 'daniel.smith@qc.cuny.edu',
    major: 'Data Science',
    university: 'Queens College',
  },
  {
    firstName: 'Amanda',
    lastName: 'Davis',
    email: 'amanda.davis@qc.cuny.edu',
    major: 'Mathematics',
    university: 'Queens College',
  },

  // York College
  {
    firstName: 'Tyler',
    lastName: 'Moore',
    email: 'tyler.moore@york.cuny.edu',
    major: 'Business Administration',
    university: 'York College',
  },
  {
    firstName: 'Nina',
    lastName: 'Singh',
    email: 'nina.singh@york.cuny.edu',
    major: 'Health Sciences',
    university: 'York College',
  },
];

// Topics/Skills 数据
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
      { name: 'MongoDB', description: 'MongoDB database' },
      { name: 'PostgreSQL', description: 'PostgreSQL database' },
      { name: 'Docker', description: 'Containerization' },
      { name: 'AWS', description: 'Amazon Web Services' },
      { name: 'Git', description: 'Version control' },
      { name: 'LeetCode', description: 'Algorithm practice' },
      { name: 'Data Structures', description: 'Data structures knowledge' },
      { name: 'Algorithms', description: 'Algorithm design' },
      { name: 'Machine Learning', description: 'ML concepts and models' },
      { name: 'Deep Learning', description: 'Neural networks' },
      { name: 'Computer Vision', description: 'Image processing' },
      { name: 'NLP', description: 'Natural Language Processing' },
    ],
  },
  {
    category: 'interest',
    topics: [
      { name: 'Web Development', description: 'Building web applications' },
      { name: 'Mobile Development', description: 'iOS/Android apps' },
      { name: 'Data Science', description: 'Data analysis and visualization' },
      { name: 'Cybersecurity', description: 'Security and cryptography' },
      { name: 'Game Development', description: 'Game design and programming' },
      { name: 'Open Source', description: 'Contributing to open source' },
      { name: 'Startups', description: 'Entrepreneurship' },
      { name: 'Research', description: 'Academic research' },
    ],
  },
];

// 用户数据模板
const userTemplates = [
  {
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@berkeley.edu',
    major: 'Computer Science',
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@berkeley.edu',
    major: 'Data Science',
  },
  {
    firstName: 'Michael',
    lastName: 'Zhang',
    email: 'michael.z@berkeley.edu',
    major: 'Computer Science',
  },
  {
    firstName: 'Emily',
    lastName: 'Wang',
    email: 'emily.w@berkeley.edu',
    major: 'Electrical Engineering',
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.k@berkeley.edu',
    major: 'Computer Science',
  },
  {
    firstName: 'Jessica',
    lastName: 'Liu',
    email: 'jessica.l@berkeley.edu',
    major: 'Mathematics',
  },
  {
    firstName: 'Ryan',
    lastName: 'Patel',
    email: 'ryan.p@berkeley.edu',
    major: 'Computer Science',
  },
  {
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.m@berkeley.edu',
    major: 'Data Science',
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.a@berkeley.edu',
    major: 'Computer Science',
  },
  {
    firstName: 'Olivia',
    lastName: 'Brown',
    email: 'olivia.b@berkeley.edu',
    major: 'Electrical Engineering',
  },
];

async function seedProductionDemoData() {
  console.log('🌱 Starting production demo data seeding...\n');
  console.log('⚠️  Using production database from .env-pro\n');

  try {
    // 1. 创建或获取大学
    console.log('📚 Step 1: Creating universities...');
    const university = await prisma.university.upsert({
      where: { domain: 'berkeley.edu' },
      update: {},
      create: {
        name: 'University of California, Berkeley',
        domain: 'berkeley.edu',
        isActive: true,
      },
    });
    console.log(`✅ University: ${university.name}`);

    // Create CUNY universities
    const cunyUnis = [];
    for (const cunyUni of cunyUniversities) {
      const created = await prisma.university.upsert({
        where: { domain: cunyUni.domain },
        update: {},
        create: {
          name: cunyUni.name,
          domain: cunyUni.domain,
          isActive: true,
        },
      });
      cunyUnis.push(created);
      console.log(`✅ University: ${created.name}`);
    }
    console.log(`✅ Created ${cunyUnis.length + 1} universities total\n`);

    // 2. 创建课程（多个学期和 section）
    console.log('📖 Step 2: Creating courses...');
    const semesters = ['Spring 2024']; // Only current semester for faster seeding
    const sections = ['001']; // Only one section for faster seeding
    const courses = [];
    let courseCount = 0;

    // Create UC Berkeley courses with progress logging
    console.log('   Creating UC Berkeley courses...');
    for (const template of courseTemplates) {
      for (const semester of semesters) {
        for (const section of sections) {
          const course = await prisma.course.upsert({
            where: {
              code_section_semester_universityId: {
                code: template.code,
                section,
                semester,
                universityId: university.id,
              },
            },
            update: {},
            create: {
              name: template.name,
              code: template.code,
              section,
              semester,
              instructor: `Dr. ${template.department} Instructor`,
              schedule: 'MWF 10:00-11:00 AM',
              universityId: university.id,
              isActive: true,
            },
          });
          courses.push(course);
          courseCount++;
          if (courseCount % 10 === 0) {
            process.stdout.write(
              `   Progress: ${courseCount} courses created...\r`
            );
          }
        }
      }
    }

    // Create CUNY courses with progress logging
    console.log(
      `\n   Creating CUNY courses for ${cunyUnis.length} colleges...`
    );
    for (const cunyUni of cunyUnis) {
      for (const template of cunyCourseTemplates) {
        for (const semester of semesters) {
          for (const section of sections) {
            const course = await prisma.course.upsert({
              where: {
                code_section_semester_universityId: {
                  code: template.code,
                  section,
                  semester,
                  universityId: cunyUni.id,
                },
              },
              update: {},
              create: {
                name: template.name,
                code: template.code,
                section,
                semester,
                instructor: `Prof. ${template.department} Instructor`,
                schedule: 'MWF 10:00-11:00 AM',
                universityId: cunyUni.id,
                isActive: true,
              },
            });
            courses.push(course);
            courseCount++;
            if (courseCount % 20 === 0) {
              process.stdout.write(
                `   Progress: ${courseCount} courses created...\r`
              );
            }
          }
        }
      }
    }
    console.log(
      `\n✅ Created ${courses.length} courses across ${semesters.length} semesters\n`
    );

    // 3. 创建 Topics (skip if table doesn't exist)
    console.log('🏷️  Step 3: Creating topics...');
    const allTopics = [];
    try {
      // Check if topics table exists
      await prisma.$queryRaw`SELECT 1 FROM topics LIMIT 1`;

      for (const category of topicCategories) {
        for (const topic of category.topics) {
          const createdTopic = await prisma.topic.upsert({
            where: {
              name_category: {
                name: topic.name,
                category: category.category,
              },
            },
            update: {},
            create: {
              name: topic.name,
              category: category.category,
              description: topic.description,
              isActive: true,
            },
          });
          allTopics.push(createdTopic);
        }
      }
      console.log(`✅ Created ${allTopics.length} topics\n`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log(
          `⚠️  Topics table does not exist in production database. Skipping topics creation.\n`
        );
      } else {
        throw error;
      }
    }

    // 4. 创建用户
    console.log('👥 Step 4: Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = [];

    // Create UC Berkeley users
    for (const template of userTemplates) {
      const user = await prisma.user.upsert({
        where: { email: template.email },
        update: {},
        create: {
          email: template.email,
          passwordHash: hashedPassword,
          firstName: template.firstName,
          lastName: template.lastName,
          university: university.name,
          major: template.major,
          profileImageUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          isVerified: true,
          isActive: true,
          emailVerifiedAt: new Date(),
          settings: {
            darkMode: Math.random() > 0.5,
            notifications: true,
          },
        },
      });
      users.push(user);
    }

    // Create CUNY users
    for (const template of cunyUserTemplates) {
      const user = await prisma.user.upsert({
        where: { email: template.email },
        update: {},
        create: {
          email: template.email,
          passwordHash: hashedPassword,
          firstName: template.firstName,
          lastName: template.lastName,
          university: template.university,
          major: template.major,
          profileImageUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          isVerified: true,
          isActive: true,
          emailVerifiedAt: new Date(),
          settings: {
            darkMode: Math.random() > 0.5,
            notifications: true,
          },
        },
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // 5. 创建用户资料
    console.log('👤 Step 5: Creating user profiles...');
    const studyLocations = ['Library', 'Cafe', 'Study Room', 'Home', 'Any'];
    const studyStyles = ['Solo', 'Pair', 'Small (3-4)', 'Large (5+)'];
    const studyPaces = ['Relaxed', 'Moderate', 'Intense'];

    for (const user of users) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          bio: `${user.firstName} is studying ${user.major}. Looking for study partners!`,
          preferredLocation:
            studyLocations[Math.floor(Math.random() * studyLocations.length)],
          studyStyle:
            studyStyles[Math.floor(Math.random() * studyStyles.length)],
          studyPace: studyPaces[Math.floor(Math.random() * studyPaces.length)],
          // onboardingCompleted: true, // Column doesn't exist in production
        },
      });
    }
    console.log(`✅ Created ${users.length} user profiles\n`);

    // 6. 用户选课
    console.log('📚 Step 6: Creating course enrollments...');
    const currentSemester = 'Spring 2024';
    let enrollmentCount = 0;

    for (const user of users) {
      // Find user's university
      const userUni = await prisma.university.findFirst({
        where: {
          OR: [{ name: user.university }, { domain: user.email.split('@')[1] }],
        },
      });

      if (!userUni) continue;

      // Get courses for user's university
      const userUniCourses = courses.filter(
        c => c.universityId === userUni.id && c.semester === currentSemester
      );

      // 每个用户随机选 2-4 门课
      const numCourses = Math.floor(Math.random() * 3) + 2;
      const selectedCourses = userUniCourses
        .sort(() => Math.random() - 0.5)
        .slice(0, numCourses);

      for (const course of selectedCourses) {
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
            // status: Math.random() > 0.2 ? 'Enrolled' : 'Waitlist', // Column doesn't exist in production
            isActive: true,
          },
        });
        enrollmentCount++;
      }
    }
    console.log(`✅ Created ${enrollmentCount} course enrollments\n`);

    // 7. 用户 Topics/Skills (skip if topics table doesn't exist)
    console.log('🎯 Step 7: Creating user topics...');
    let userTopicCount = 0;

    if (allTopics.length === 0) {
      console.log(`⚠️  Skipping user topics (topics table not available)\n`);
    } else {
      try {
        for (const user of users) {
          // 每个用户随机选择 5-10 个 topics
          const numTopics = Math.floor(Math.random() * 6) + 5;
          const selectedTopics = allTopics
            .sort(() => Math.random() - 0.5)
            .slice(0, numTopics);

          for (const topic of selectedTopics) {
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
                proficiency:
                  topic.category === 'skill'
                    ? ['beginner', 'intermediate', 'advanced'][
                        Math.floor(Math.random() * 3)
                      ]
                    : null,
                interest:
                  topic.category === 'interest'
                    ? ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
                    : null,
              },
            });
            userTopicCount++;
          }
        }
        console.log(`✅ Created ${userTopicCount} user-topic relationships\n`);
      } catch (error: any) {
        if (
          error.code === 'P2021' ||
          error.message?.includes('does not exist')
        ) {
          console.log(`⚠️  User topics table does not exist. Skipping.\n`);
        } else {
          throw error;
        }
      }
    }

    // 8. 创建空闲时间
    console.log('⏰ Step 8: Creating availability...');
    const days = [1, 2, 3, 4, 5]; // Mon-Fri
    const timeSlots = [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '16:00' },
      { start: '18:00', end: '21:00' },
    ];
    let availabilityCount = 0;

    for (const user of users) {
      // 每个用户随机选择 3-5 个时间段
      const numSlots = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numSlots; i++) {
        const day = days[Math.floor(Math.random() * days.length)];
        const slot = timeSlots[Math.floor(Math.random() * timeSlots.length)];

        await prisma.availability.create({
          data: {
            userId: user.id,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
          },
        });
        availabilityCount++;
      }
    }
    console.log(`✅ Created ${availabilityCount} availability entries\n`);

    // 9. 创建一些匹配数据 (skip if table doesn't exist)
    console.log('💕 Step 9: Creating matches...');
    let matchCount = 0;
    try {
      // Check if matches table exists
      await prisma.$queryRaw`SELECT 1 FROM matches LIMIT 1`;

      for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
          if (Math.random() > 0.7) {
            // 30% 概率创建匹配
            const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
            await prisma.match.upsert({
              where: {
                userId1_userId2: {
                  userId1: users[i].id,
                  userId2: users[j].id,
                },
              },
              update: {},
              create: {
                userId1: users[i].id,
                userId2: users[j].id,
                status: ['Pending', 'Accepted', 'Rejected'][
                  Math.floor(Math.random() * 3)
                ],
                matchScore,
              },
            });
            matchCount++;
          }
        }
      }
      console.log(`✅ Created ${matchCount} matches\n`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log(
          `⚠️  Matches table does not exist. Skipping matches creation.\n`
        );
      } else {
        throw error;
      }
    }

    // 10. 创建一些连接 (skip if table doesn't exist)
    console.log('🔗 Step 10: Creating connections...');
    let connectionCount = 0;
    try {
      // Check if connections table exists
      await prisma.$queryRaw`SELECT 1 FROM connections LIMIT 1`;

      const userCourses = await prisma.userCourse.findMany({
        where: { isActive: true },
        include: { course: true, user: true },
      });

      // 找到有共同课程的用户对
      const commonCourses = new Map<string, string[]>();
      for (const uc of userCourses) {
        const key = uc.courseId;
        if (!commonCourses.has(key)) {
          commonCourses.set(key, []);
        }
        commonCourses.get(key)!.push(uc.userId);
      }

      for (const [courseId, userIds] of commonCourses.entries()) {
        if (userIds.length >= 2) {
          // 为有共同课程的用户创建连接
          for (let i = 0; i < userIds.length; i++) {
            for (let j = i + 1; j < userIds.length; j++) {
              if (Math.random() > 0.5) {
                await prisma.connection.create({
                  data: {
                    requesterId: userIds[i],
                    targetId: userIds[j],
                    courseId,
                    status: ['pending', 'accepted'][
                      Math.floor(Math.random() * 2)
                    ],
                  },
                });
                connectionCount++;
              }
            }
          }
        }
      }
      console.log(`✅ Created ${connectionCount} connections\n`);
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.log(
          `⚠️  Connections table does not exist. Skipping connections creation.\n`
        );
      } else {
        throw error;
      }
    }

    // 总结
    console.log('🎉 Production demo data seeding completed!\n');
    console.log('📊 Summary:');
    console.log(
      `   - Universities: ${cunyUnis.length + 1} (1 UC Berkeley + ${cunyUnis.length} CUNY colleges)`
    );
    console.log(
      `   - Courses: ${courses.length} (${courseTemplates.length} UC Berkeley + ${cunyCourseTemplates.length} CUNY courses × ${semesters.length} semesters × ${sections.length} sections × ${cunyUnis.length + 1} universities)`
    );
    console.log(`   - Topics: ${allTopics.length}`);
    console.log(
      `   - Users: ${users.length} (${userTemplates.length} UC Berkeley + ${cunyUserTemplates.length} CUNY)`
    );
    console.log(`   - User Profiles: ${users.length}`);
    console.log(`   - Course Enrollments: ${enrollmentCount}`);
    console.log(`   - User Topics: ${userTopicCount}`);
    console.log(`   - Availability Slots: ${availabilityCount}`);
    console.log(`   - Matches: ${matchCount}`);
    console.log(`   - Connections: ${connectionCount}\n`);
    console.log('💡 All users have password: password123');
    console.log('💡 CUNY Colleges included:');
    cunyUnis.forEach(uni => {
      console.log(`   - ${uni.name}`);
    });
    console.log(
      '\n💡 Users can also input their own courses, but system will suggest from the course catalog.\n'
    );
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
    console.log('🎉 Production seeding process completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Production seeding process failed:', error);
    process.exit(1);
  });
