import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create universities
  console.log('📚 Creating universities...')
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { domain: 'berkeley.edu' },
      update: {},
      create: {
        name: 'University of California, Berkeley',
        domain: 'berkeley.edu',
        isActive: true,
      },
    }),
    prisma.university.upsert({
      where: { domain: 'stanford.edu' },
      update: {},
      create: {
        name: 'Stanford University',
        domain: 'stanford.edu',
        isActive: true,
      },
    }),
    prisma.university.upsert({
      where: { domain: 'mit.edu' },
      update: {},
      create: {
        name: 'Massachusetts Institute of Technology',
        domain: 'mit.edu',
        isActive: true,
      },
    }),
    prisma.university.upsert({
      where: { domain: 'harvard.edu' },
      update: {},
      create: {
        name: 'Harvard University',
        domain: 'harvard.edu',
        isActive: true,
      },
    }),
    prisma.university.upsert({
      where: { domain: 'ucla.edu' },
      update: {},
      create: {
        name: 'University of California, Los Angeles',
        domain: 'ucla.edu',
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${universities.length} universities`)

  // Create courses for each university
  console.log('📖 Creating courses...')
  const courses = []

  for (const university of universities) {
    const universityCourses = await Promise.all([
      // Computer Science courses
      prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: 'CS 161',
            section: '001',
            semester: 'Spring 2024',
            universityId: university.id,
          },
        },
        update: {},
        create: {
          name: 'Data Structures and Algorithms',
          code: 'CS 161',
          section: '001',
          semester: 'Spring 2024',
          instructor: 'Dr. Smith',
          schedule: 'MWF 10:00-11:00 AM',
          universityId: university.id,
          isActive: true,
        },
      }),
      prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: 'CS 189',
            section: '001',
            semester: 'Spring 2024',
            universityId: university.id,
          },
        },
        update: {},
        create: {
          name: 'Machine Learning',
          code: 'CS 189',
          section: '001',
          semester: 'Spring 2024',
          instructor: 'Dr. Johnson',
          schedule: 'TTh 2:00-3:30 PM',
          universityId: university.id,
          isActive: true,
        },
      }),
      prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: 'CS 186',
            section: '001',
            semester: 'Spring 2024',
            universityId: university.id,
          },
        },
        update: {},
        create: {
          name: 'Database Systems',
          code: 'CS 186',
          section: '001',
          semester: 'Spring 2024',
          instructor: 'Dr. Williams',
          schedule: 'MWF 1:00-2:00 PM',
          universityId: university.id,
          isActive: true,
        },
      }),
      // Additional courses
      prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: 'MATH 53',
            section: '001',
            semester: 'Spring 2024',
            universityId: university.id,
          },
        },
        update: {},
        create: {
          name: 'Multivariable Calculus',
          code: 'MATH 53',
          section: '001',
          semester: 'Spring 2024',
          instructor: 'Dr. Brown',
          schedule: 'TTh 9:00-10:30 AM',
          universityId: university.id,
          isActive: true,
        },
      }),
      prisma.course.upsert({
        where: {
          code_section_semester_universityId: {
            code: 'PHYS 7A',
            section: '001',
            semester: 'Spring 2024',
            universityId: university.id,
          },
        },
        update: {},
        create: {
          name: 'Physics for Scientists and Engineers',
          code: 'PHYS 7A',
          section: '001',
          semester: 'Spring 2024',
          instructor: 'Dr. Davis',
          schedule: 'MWF 11:00-12:00 PM',
          universityId: university.id,
          isActive: true,
        },
      }),
    ])

    courses.push(...universityCourses)
  }

  console.log(`✅ Created ${courses.length} courses`)

  // Create sample users
  console.log('👥 Creating sample users...')
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@berkeley.edu' },
      update: {},
      create: {
        email: 'john.doe@berkeley.edu',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        university: 'University of California, Berkeley',
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@berkeley.edu' },
      update: {},
      create: {
        email: 'jane.smith@berkeley.edu',
        passwordHash: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        university: 'University of California, Berkeley',
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.wilson@stanford.edu' },
      update: {},
      create: {
        email: 'bob.wilson@stanford.edu',
        passwordHash: hashedPassword,
        firstName: 'Bob',
        lastName: 'Wilson',
        university: 'Stanford University',
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice.johnson@mit.edu' },
      update: {},
      create: {
        email: 'alice.johnson@mit.edu',
        passwordHash: hashedPassword,
        firstName: 'Alice',
        lastName: 'Johnson',
        university: 'Massachusetts Institute of Technology',
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie.brown@harvard.edu' },
      update: {},
      create: {
        email: 'charlie.brown@harvard.edu',
        passwordHash: hashedPassword,
        firstName: 'Charlie',
        lastName: 'Brown',
        university: 'Harvard University',
        isVerified: true,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create user profiles
  console.log('👤 Creating user profiles...')
  const profiles = await Promise.all([
    prisma.userProfile.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate',
        bio: 'Computer Science student passionate about algorithms and data structures. Looking for study partners for challenging courses.',
      },
    }),
    prisma.userProfile.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        preferredLocation: 'cafe',
        studyStyle: 'quiet',
        studyPace: 'fast',
        bio: 'Graduate student in Machine Learning. Love discussing AI concepts and implementations.',
      },
    }),
    prisma.userProfile.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        preferredLocation: 'study_room',
        studyStyle: 'mixed',
        studyPace: 'slow',
        bio: 'Undergraduate studying Computer Science. Looking for study partners for challenging courses.',
      },
    }),
    prisma.userProfile.upsert({
      where: { userId: users[3].id },
      update: {},
      create: {
        userId: users[3].id,
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'fast',
        bio: 'MIT student interested in physics and mathematics. Enjoy problem-solving sessions.',
      },
    }),
    prisma.userProfile.upsert({
      where: { userId: users[4].id },
      update: {},
      create: {
        userId: users[4].id,
        preferredLocation: 'any',
        studyStyle: 'mixed',
        studyPace: 'moderate',
        bio: 'Harvard student studying various subjects. Flexible with study arrangements.',
      },
    }),
  ])

  console.log(`✅ Created ${profiles.length} user profiles`)

  // Create course enrollments
  console.log('📚 Creating course enrollments...')
  const berkeleyUniversity = universities.find(u => u.domain === 'berkeley.edu')!
  const berkeleyCourses = courses.filter(c => c.universityId === berkeleyUniversity.id)
  
  const enrollments = await Promise.all([
    // John Doe enrollments
    prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: users[0].id,
          courseId: berkeleyCourses[0].id, // CS 161
        },
      },
      update: {},
      create: {
        userId: users[0].id,
        courseId: berkeleyCourses[0].id,
        isActive: true,
      },
    }),
    prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: users[0].id,
          courseId: berkeleyCourses[1].id, // CS 189
        },
      },
      update: {},
      create: {
        userId: users[0].id,
        courseId: berkeleyCourses[1].id,
        isActive: true,
      },
    }),
    // Jane Smith enrollments
    prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: users[1].id,
          courseId: berkeleyCourses[1].id, // CS 189
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        courseId: berkeleyCourses[1].id,
        isActive: true,
      },
    }),
    prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: users[1].id,
          courseId: berkeleyCourses[2].id, // CS 186
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        courseId: berkeleyCourses[2].id,
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${enrollments.length} course enrollments`)

  // Create availability data
  console.log('⏰ Creating availability data...')
  const availability = await Promise.all([
    // John Doe availability
    prisma.availability.create({
      data: {
        userId: users[0].id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '12:00',
      },
    }),
    prisma.availability.create({
      data: {
        userId: users[0].id,
        dayOfWeek: 1, // Monday
        startTime: '14:00',
        endTime: '17:00',
      },
    }),
    prisma.availability.create({
      data: {
        userId: users[0].id,
        dayOfWeek: 3, // Wednesday
        startTime: '10:00',
        endTime: '13:00',
      },
    }),
    // Jane Smith availability
    prisma.availability.create({
      data: {
        userId: users[1].id,
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '12:00',
      },
    }),
    prisma.availability.create({
      data: {
        userId: users[1].id,
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '11:00',
      },
    }),
    // Bob Wilson availability
    prisma.availability.create({
      data: {
        userId: users[2].id,
        dayOfWeek: 2, // Tuesday
        startTime: '13:00',
        endTime: '16:00',
      },
    }),
    prisma.availability.create({
      data: {
        userId: users[2].id,
        dayOfWeek: 4, // Thursday
        startTime: '14:00',
        endTime: '17:00',
      },
    }),
  ])

  console.log(`✅ Created ${availability.length} availability entries`)

  console.log('🎉 Database seeding completed successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - Universities: ${universities.length}`)
  console.log(`   - Courses: ${courses.length}`)
  console.log(`   - Users: ${users.length}`)
  console.log(`   - Profiles: ${profiles.length}`)
  console.log(`   - Enrollments: ${enrollments.length}`)
  console.log(`   - Availability: ${availability.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
