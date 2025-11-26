import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample data arrays
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Sage', 'River', 'Skyler', 'Phoenix', 'Blake', 'Cameron', 'Dakota', 'Emery',
  'Finley', 'Harper', 'Hayden', 'Jamie', 'Kai', 'Logan', 'Marley', 'Noah',
  'Parker', 'Reese', 'Rowan', 'Sam', 'Sawyer', 'Sloane'
];

const lastNames = [
  'Anderson', 'Brown', 'Davis', 'Garcia', 'Harris', 'Jackson', 'Johnson',
  'Jones', 'Lee', 'Martinez', 'Miller', 'Moore', 'Robinson', 'Smith',
  'Taylor', 'Thomas', 'Thompson', 'White', 'Williams', 'Wilson', 'Young',
  'Adams', 'Baker', 'Clark', 'Collins', 'Cook', 'Cooper', 'Evans', 'Green',
  'Hall', 'Hill', 'King', 'Lewis', 'Martin', 'Mitchell', 'Nelson', 'Parker',
  'Phillips', 'Roberts', 'Rodriguez', 'Scott', 'Stewart', 'Turner', 'Walker'
];

const universities = [
  { name: 'University of California, Berkeley', domain: 'berkeley.edu' },
  { name: 'Stanford University', domain: 'stanford.edu' },
  { name: 'Massachusetts Institute of Technology', domain: 'mit.edu' },
  { name: 'Harvard University', domain: 'harvard.edu' },
  { name: 'University of California, Los Angeles', domain: 'ucla.edu' },
  { name: 'Yale University', domain: 'yale.edu' },
  { name: 'Princeton University', domain: 'princeton.edu' },
  { name: 'Columbia University', domain: 'columbia.edu' },
];

const courseNames = [
  { name: 'Data Structures and Algorithms', code: 'CS 161' },
  { name: 'Machine Learning', code: 'CS 189' },
  { name: 'Database Systems', code: 'CS 186' },
  { name: 'Computer Networks', code: 'CS 168' },
  { name: 'Operating Systems', code: 'CS 162' },
  { name: 'Software Engineering', code: 'CS 169' },
  { name: 'Artificial Intelligence', code: 'CS 188' },
  { name: 'Multivariable Calculus', code: 'MATH 53' },
  { name: 'Linear Algebra', code: 'MATH 54' },
  { name: 'Physics for Scientists and Engineers', code: 'PHYS 7A' },
  { name: 'Organic Chemistry', code: 'CHEM 3A' },
  { name: 'Introduction to Biology', code: 'BIO 1A' },
  { name: 'Introduction to Psychology', code: 'PSYCH 1' },
  { name: 'Microeconomics', code: 'ECON 1' },
  { name: 'Introduction to Statistics', code: 'STAT 2' },
];

const studyLocations = ['library', 'cafe', 'study_room', 'home', 'any'];
const studyStyles = ['collaborative', 'quiet', 'mixed', 'group'];
const studyPaces = ['fast', 'moderate', 'slow'];

const bios = [
  'Computer Science student passionate about algorithms and data structures.',
  'Graduate student in Machine Learning. Love discussing AI concepts.',
  'Undergraduate studying Computer Science. Looking for study partners.',
  'MIT student interested in physics and mathematics. Enjoy problem-solving.',
  'Harvard student studying various subjects. Flexible with study arrangements.',
  'Passionate about software engineering and building scalable systems.',
  'Math major with a focus on applied mathematics and statistics.',
  'Biology student interested in research and collaborative learning.',
  'Economics major exploring data science and analytics.',
  'Psychology student with interest in cognitive science and research.',
];

const timeSlots = [
  { start: '08:00', end: '10:00' },
  { start: '09:00', end: '11:00' },
  { start: '10:00', end: '12:00' },
  { start: '13:00', end: '15:00' },
  { start: '14:00', end: '16:00' },
  { start: '15:00', end: '17:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
];

const connectionMessages = [
  'Hey! I saw we\'re in the same class. Would love to study together!',
  'Hi! Looking for a study partner for this course. Interested?',
  'Hello! I noticed we have similar availability. Want to connect?',
  'Hey there! Would be great to have someone to study with.',
  'Hi! I\'m looking to form a study group. Are you interested?',
];

const chatMessages = [
  'Hey! How\'s the studying going?',
  'I found some great resources for the midterm. Want me to share?',
  'Are you free to meet up this week?',
  'I\'m struggling with chapter 5. Any tips?',
  'Thanks for the help earlier! Really appreciate it.',
  'When are you planning to review for the exam?',
  'I created a study guide. Want to collaborate on it?',
  'Great session today! Let\'s do it again soon.',
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Starting comprehensive test data seeding...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Ensure universities exist
  console.log('📚 Ensuring universities exist...');
  const universityRecords = await Promise.all(
    universities.map(uni =>
      prisma.university.upsert({
        where: { domain: uni.domain },
        update: {},
        create: {
          name: uni.name,
          domain: uni.domain,
          isActive: true,
        },
      })
    )
  );
  console.log(`✅ ${universityRecords.length} universities ready`);

  // Create courses for each university
  console.log('📖 Creating courses...');
  const allCourses = [];
  for (const university of universityRecords) {
    const sections = ['001', '002', '003'];
    const semesters = ['Spring 2024', 'Fall 2024', 'Spring 2025'];
    
    for (const course of courseNames) {
      for (const section of sections) {
        for (const semester of semesters) {
          try {
            const created = await prisma.course.upsert({
              where: {
                code_section_semester_universityId: {
                  code: course.code,
                  section,
                  semester,
                  universityId: university.id,
                },
              },
              update: {},
              create: {
                name: course.name,
                code: course.code,
                section,
                semester,
                instructor: `Dr. ${randomElement(lastNames)}`,
                schedule: `${randomElement(['MWF', 'TTh'])} ${randomElement(timeSlots).start}-${randomElement(timeSlots).end}`,
                universityId: university.id,
                isActive: true,
              },
            });
            allCourses.push(created);
          } catch (error) {
            // Skip duplicates
          }
        }
      }
    }
  }
  console.log(`✅ Created ${allCourses.length} courses`);

  // Create 30 random users
  console.log('👥 Creating users...');
  const users = [];
  for (let i = 0; i < 30; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const university = randomElement(universityRecords);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${university.domain}`;

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          university: university.name,
          isVerified: Math.random() > 0.2, // 80% verified
          isActive: true,
          emailVerifiedAt: Math.random() > 0.2 ? new Date() : null,
          lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000) : null,
        },
      });
      users.push(user);
    } catch (error) {
      // Skip duplicates
      console.log(`Skipped duplicate user: ${email}`);
    }
  }
  console.log(`✅ Created ${users.length} users`);

  // Create user profiles
  console.log('👤 Creating user profiles...');
  const profiles = [];
  for (const user of users) {
    try {
      const profile = await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          preferredLocation: randomElement(studyLocations),
          studyStyle: randomElement(studyStyles),
          studyPace: randomElement(studyPaces),
          bio: randomElement(bios),
        },
      });
      profiles.push(profile);
    } catch (error) {
      // Profile might already exist
    }
  }
  console.log(`✅ Created ${profiles.length} user profiles`);

  // Create course enrollments (each user enrolled in 2-5 courses)
  console.log('📚 Creating course enrollments...');
  const enrollments = [];
  for (const user of users) {
    const userUniversity = universityRecords.find(u => u.name === user.university);
    if (!userUniversity) continue;

    const universityCourses = allCourses.filter(c => c.universityId === userUniversity.id);
    const coursesToEnroll = randomElements(universityCourses, randomInt(2, 5));

    for (const course of coursesToEnroll) {
      try {
        const enrollment = await prisma.userCourse.create({
          data: {
            userId: user.id,
            courseId: course.id,
            isActive: true,
          },
        });
        enrollments.push(enrollment);
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  console.log(`✅ Created ${enrollments.length} course enrollments`);

  // Create availability slots
  console.log('⏰ Creating availability data...');
  const availabilitySlots = [];
  for (const user of users) {
    const days = randomElements([0, 1, 2, 3, 4, 5, 6], randomInt(2, 5)); // 2-5 days per week
    for (const day of days) {
      const timeSlot = randomElement(timeSlots);
      try {
        const availability = await prisma.availability.create({
          data: {
            userId: user.id,
            dayOfWeek: day,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
          },
        });
        availabilitySlots.push(availability);
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  console.log(`✅ Created ${availabilitySlots.length} availability entries`);

  // Create connections (some users connect with each other)
  console.log('🤝 Creating connections...');
  const connections = [];
  const connectionStatuses = ['pending', 'accepted', 'rejected'];
  
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length && connections.length < 50; j++) {
      const user1 = users[i];
      const user2 = users[j];

      // Find a common course
      const user1Courses = enrollments.filter(e => e.userId === user1.id).map(e => e.courseId);
      const user2Courses = enrollments.filter(e => e.userId === user2.id).map(e => e.courseId);
      const commonCourses = user1Courses.filter(c => user2Courses.includes(c));

      if (commonCourses.length > 0 && Math.random() > 0.7) { // 30% chance to connect
        const courseId = randomElement(commonCourses);
        const status = randomElement(connectionStatuses);
        
        try {
          const connection = await prisma.connection.create({
            data: {
              requesterId: user1.id,
              targetId: user2.id,
              courseId,
              status,
              initialMessage: randomElement(connectionMessages),
              requestedAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000),
              respondedAt: status !== 'pending' ? new Date() : null,
            },
          });
          connections.push(connection);
        } catch (error) {
          // Skip duplicates
        }
      }
    }
  }
  console.log(`✅ Created ${connections.length} connections`);

  // Create messages for accepted connections
  console.log('💬 Creating messages...');
  const messages = [];
  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  
  for (const connection of acceptedConnections.slice(0, 20)) { // Limit to 20 conversations
    const messageCount = randomInt(3, 10);
    const participants = [connection.requesterId, connection.targetId];
    
    for (let i = 0; i < messageCount; i++) {
      const senderId = randomElement(participants);
      const createdAt = new Date(Date.now() - (messageCount - i) * 60 * 60 * 1000); // Messages spread over hours
      
      try {
        const message = await prisma.message.create({
          data: {
            connectionId: connection.id,
            senderId,
            content: randomElement(chatMessages),
            messageType: 'text',
            isRead: Math.random() > 0.3, // 70% read
            createdAt,
          },
        });
        messages.push(message);
      } catch (error) {
        // Skip errors
      }
    }
  }
  console.log(`✅ Created ${messages.length} messages`);

  // Create match cache entries
  console.log('🎯 Creating match cache entries...');
  const matchCaches = [];
  for (const user of users.slice(0, 15)) { // Limit to 15 users
    const userCourses = enrollments.filter(e => e.userId === user.id).map(e => e.courseId);
    const courseId = randomElement(userCourses);
    
    // Find potential matches
    const otherUsers = users.filter(u => u.id !== user.id);
    const matches = otherUsers.slice(0, 5).map((u, index) => ({
      userId: u.id,
      matchScore: randomInt(60, 98),
      commonCourses: 1,
      availabilityOverlap: randomInt(2, 8),
    }));

    try {
      const matchCache = await prisma.matchCache.create({
        data: {
          userId: user.id,
          courseId,
          matchResults: matches as any,
          calculatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        },
      });
      matchCaches.push(matchCache);
    } catch (error) {
      // Skip duplicates
    }
  }
  console.log(`✅ Created ${matchCaches.length} match cache entries`);

  console.log('\n🎉 Test data seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Universities: ${universityRecords.length}`);
  console.log(`   - Courses: ${allCourses.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Profiles: ${profiles.length}`);
  console.log(`   - Enrollments: ${enrollments.length}`);
  console.log(`   - Availability: ${availabilitySlots.length}`);
  console.log(`   - Connections: ${connections.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Match Cache: ${matchCaches.length}`);
  console.log(`\n🔑 All users have password: password123`);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

