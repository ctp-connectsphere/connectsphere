import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
    schoolYear: 'Junior',
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@berkeley.edu',
    major: 'Data Science',
    schoolYear: 'Senior',
  },
  {
    firstName: 'Michael',
    lastName: 'Zhang',
    email: 'michael.z@berkeley.edu',
    major: 'Computer Science',
    schoolYear: 'Sophomore',
  },
  {
    firstName: 'Emily',
    lastName: 'Wang',
    email: 'emily.w@berkeley.edu',
    major: 'Electrical Engineering',
    schoolYear: 'Junior',
  },
  {
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.k@berkeley.edu',
    major: 'Computer Science',
    schoolYear: 'Senior',
  },
  {
    firstName: 'Jessica',
    lastName: 'Liu',
    email: 'jessica.l@berkeley.edu',
    major: 'Mathematics',
    schoolYear: 'Junior',
  },
  {
    firstName: 'Ryan',
    lastName: 'Patel',
    email: 'ryan.p@berkeley.edu',
    major: 'Computer Science',
    schoolYear: 'Sophomore',
  },
  {
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.m@berkeley.edu',
    major: 'Data Science',
    schoolYear: 'Senior',
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.a@berkeley.edu',
    major: 'Computer Science',
    schoolYear: 'Junior',
  },
  {
    firstName: 'Olivia',
    lastName: 'Brown',
    email: 'olivia.b@berkeley.edu',
    major: 'Electrical Engineering',
    schoolYear: 'Sophomore',
  },
];

async function seedDemoData() {
  console.log('🌱 Starting comprehensive demo data seeding...\n');

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
  console.log(`✅ University: ${university.name}\n`);

  // 2. 创建课程（多个学期和 section）
  console.log('📖 Step 2: Creating courses...');
  const semesters = ['Fall 2024', 'Spring 2024', 'Fall 2023', 'Spring 2023'];
  const sections = ['001', '002', '003'];
  const courses = [];

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
            room: `${template.department} Building Room ${section}`,
            universityId: university.id,
            isActive: true,
          },
        });
        courses.push(course);
      }
    }
  }
  console.log(
    `✅ Created ${courses.length} courses across ${semesters.length} semesters\n`
  );

  // 3. 创建 Topics
  console.log('🏷️  Step 3: Creating topics...');
  const allTopics = [];
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

  // 4. 创建用户
  console.log('👥 Step 4: Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);
  const users = [];

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
        schoolYear: template.schoolYear,
        profileImageUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        isVerified: true,
        isActive: true,
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
        bio: `${user.firstName} is a ${user.schoolYear} studying ${user.major}. Looking for study partners!`,
        preferredLocation:
          studyLocations[Math.floor(Math.random() * studyLocations.length)],
        studyStyle: studyStyles[Math.floor(Math.random() * studyStyles.length)],
        studyPace: studyPaces[Math.floor(Math.random() * studyPaces.length)],
        onboardingCompleted: true,
      },
    });
  }
  console.log(`✅ Created ${users.length} user profiles\n`);

  // 6. 用户选课
  console.log('📚 Step 6: Creating course enrollments...');
  const currentSemester = 'Spring 2024';
  const currentCourses = courses.filter(c => c.semester === currentSemester);
  let enrollmentCount = 0;

  for (const user of users) {
    // 每个用户随机选 2-4 门课
    const numCourses = Math.floor(Math.random() * 3) + 2;
    const selectedCourses = currentCourses
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
          status: Math.random() > 0.2 ? 'Enrolled' : 'Waitlist',
          isActive: true,
        },
      });
      enrollmentCount++;
    }
  }
  console.log(`✅ Created ${enrollmentCount} course enrollments\n`);

  // 7. 用户 Topics/Skills
  console.log('🎯 Step 7: Creating user topics...');
  let userTopicCount = 0;

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

  // 9. 创建一些匹配数据
  console.log('💕 Step 9: Creating matches...');
  let matchCount = 0;
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      if (Math.random() > 0.7) {
        // 30% 概率创建匹配
        const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100
        await prisma.match.create({
          data: {
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

  // 10. 创建一些连接
  console.log('🔗 Step 10: Creating connections...');
  let connectionCount = 0;
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
                status: ['pending', 'accepted'][Math.floor(Math.random() * 2)],
              },
            });
            connectionCount++;
          }
        }
      }
    }
  }
  console.log(`✅ Created ${connectionCount} connections\n`);

  // 总结
  console.log('🎉 Demo data seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   - University: 1`);
  console.log(
    `   - Courses: ${courses.length} (${courseTemplates.length} unique courses × ${semesters.length} semesters × ${sections.length} sections)`
  );
  console.log(`   - Topics: ${allTopics.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - User Profiles: ${users.length}`);
  console.log(`   - Course Enrollments: ${enrollmentCount}`);
  console.log(`   - User Topics: ${userTopicCount}`);
  console.log(`   - Availability Slots: ${availabilityCount}`);
  console.log(`   - Matches: ${matchCount}`);
  console.log(`   - Connections: ${connectionCount}\n`);
  console.log('💡 All users have password: password123');
  console.log(
    '💡 Users can also input their own courses, but system will suggest from the course catalog.\n'
  );
}

seedDemoData()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
