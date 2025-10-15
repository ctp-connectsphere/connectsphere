#!/usr/bin/env tsx

/**
 * Comprehensive seeding script for development
 * Creates a rich dataset for testing all features
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { config } from '../src/lib/config/env'

const prisma = new PrismaClient()

// Check if we're in development mode
if (config.isProduction) {
  console.error('❌ Comprehensive seeding is not allowed in production')
  process.exit(1)
}

// Sample data
const universities = [
  {
    name: 'University of California, Berkeley',
    domain: 'berkeley.edu',
  },
  {
    name: 'Stanford University',
    domain: 'stanford.edu',
  },
  {
    name: 'Massachusetts Institute of Technology',
    domain: 'mit.edu',
  },
  {
    name: 'Harvard University',
    domain: 'harvard.edu',
  },
  {
    name: 'University of California, Los Angeles',
    domain: 'ucla.edu',
  },
]

const courseTemplates = [
  // Computer Science
  { name: 'Data Structures and Algorithms', code: 'CS 161', instructor: 'Dr. Smith', schedule: 'MWF 10:00-11:00 AM' },
  { name: 'Machine Learning', code: 'CS 189', instructor: 'Dr. Johnson', schedule: 'TTh 2:00-3:30 PM' },
  { name: 'Database Systems', code: 'CS 186', instructor: 'Dr. Williams', schedule: 'MWF 1:00-2:00 PM' },
  { name: 'Computer Networks', code: 'CS 168', instructor: 'Dr. Davis', schedule: 'TTh 11:00-12:30 PM' },
  { name: 'Operating Systems', code: 'CS 162', instructor: 'Dr. Brown', schedule: 'MWF 2:00-3:00 PM' },
  
  // Mathematics
  { name: 'Multivariable Calculus', code: 'MATH 53', instructor: 'Dr. Wilson', schedule: 'TTh 9:00-10:30 AM' },
  { name: 'Linear Algebra', code: 'MATH 54', instructor: 'Dr. Garcia', schedule: 'MWF 11:00-12:00 PM' },
  { name: 'Discrete Mathematics', code: 'MATH 55', instructor: 'Dr. Martinez', schedule: 'TTh 1:00-2:30 PM' },
  
  // Physics
  { name: 'Physics for Scientists and Engineers', code: 'PHYS 7A', instructor: 'Dr. Anderson', schedule: 'MWF 11:00-12:00 PM' },
  { name: 'Quantum Mechanics', code: 'PHYS 137A', instructor: 'Dr. Taylor', schedule: 'TTh 10:00-11:30 AM' },
  
  // Chemistry
  { name: 'General Chemistry', code: 'CHEM 1A', instructor: 'Dr. Moore', schedule: 'MWF 9:00-10:00 AM' },
  { name: 'Organic Chemistry', code: 'CHEM 3A', instructor: 'Dr. White', schedule: 'TTh 2:00-3:30 PM' },
]

const userTemplates = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe', studyStyle: 'collaborative', studyPace: 'moderate' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith', studyStyle: 'quiet', studyPace: 'fast' },
  { firstName: 'Bob', lastName: 'Wilson', email: 'bob.wilson', studyStyle: 'mixed', studyPace: 'slow' },
  { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson', studyStyle: 'collaborative', studyPace: 'fast' },
  { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown', studyStyle: 'mixed', studyPace: 'moderate' },
  { firstName: 'Diana', lastName: 'Davis', email: 'diana.davis', studyStyle: 'quiet', studyPace: 'fast' },
  { firstName: 'Eve', lastName: 'Miller', email: 'eve.miller', studyStyle: 'collaborative', studyPace: 'moderate' },
  { firstName: 'Frank', lastName: 'Garcia', email: 'frank.garcia', studyStyle: 'mixed', studyPace: 'slow' },
  { firstName: 'Grace', lastName: 'Martinez', email: 'grace.martinez', studyStyle: 'quiet', studyPace: 'fast' },
  { firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson', studyStyle: 'collaborative', studyPace: 'moderate' },
]

const locations = ['library', 'cafe', 'study_room', 'any']
const studyStyles = ['collaborative', 'quiet', 'mixed']
const studyPaces = ['slow', 'moderate', 'fast']

async function seedComprehensive() {
  console.log('🌱 Starting comprehensive database seeding...')
  console.log('⚠️  This will clear all existing data!')
  
  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.matchCache.deleteMany()
  await prisma.message.deleteMany()
  await prisma.connection.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.userCourse.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.course.deleteMany()
  await prisma.university.deleteMany()

  // Create universities
  console.log('📚 Creating universities...')
  const createdUniversities = await Promise.all(
    universities.map(uni => 
      prisma.university.create({
        data: {
          name: uni.name,
          domain: uni.domain,
          isActive: true,
        },
      })
    )
  )
  console.log(`✅ Created ${createdUniversities.length} universities`)

  // Create courses for each university
  console.log('📖 Creating courses...')
  const allCourses = []
  
  for (const university of createdUniversities) {
    const universityCourses = await Promise.all(
      courseTemplates.map(course => 
        prisma.course.create({
          data: {
            name: course.name,
            code: course.code,
            section: '001',
            semester: 'Spring 2024',
            instructor: course.instructor,
            schedule: course.schedule,
            universityId: university.id,
            isActive: true,
          },
        })
      )
    )
    allCourses.push(...universityCourses)
  }
  console.log(`✅ Created ${allCourses.length} courses`)

  // Create users for each university
  console.log('👥 Creating users...')
  const hashedPassword = await bcrypt.hash('password123', 12)
  const allUsers = []

  for (const university of createdUniversities) {
    const universityUsers = await Promise.all(
      userTemplates.map((user, index) => 
        prisma.user.create({
          data: {
            email: `${user.email}@${university.domain}`,
            passwordHash: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName,
            university: university.name,
            isVerified: true,
            isActive: true,
          },
        })
      )
    )
    allUsers.push(...universityUsers)
  }
  console.log(`✅ Created ${allUsers.length} users`)

  // Create user profiles
  console.log('👤 Creating user profiles...')
  const allProfiles = await Promise.all(
    allUsers.map((user, index) => 
      prisma.userProfile.create({
        data: {
          userId: user.id,
          preferredLocation: locations[index % locations.length],
          studyStyle: userTemplates[index % userTemplates.length].studyStyle,
          studyPace: userTemplates[index % userTemplates.length].studyPace,
          bio: `${user.firstName} ${user.lastName} is a student at ${user.university}. Looking for study partners for challenging courses.`,
        },
      })
    )
  )
  console.log(`✅ Created ${allProfiles.length} user profiles`)

  // Create course enrollments (random)
  console.log('📚 Creating course enrollments...')
  const enrollments = []
  
  for (const user of allUsers) {
    // Each user enrolls in 2-4 random courses from their university
    const userUniversity = createdUniversities.find(u => u.name === user.university)!
    const universityCourses = allCourses.filter(c => c.universityId === userUniversity.id)
    const numCourses = Math.floor(Math.random() * 3) + 2 // 2-4 courses
    
    const selectedCourses = universityCourses
      .sort(() => 0.5 - Math.random())
      .slice(0, numCourses)
    
    for (const course of selectedCourses) {
      enrollments.push(
        prisma.userCourse.create({
          data: {
            userId: user.id,
            courseId: course.id,
            isActive: true,
          },
        })
      )
    }
  }
  
  await Promise.all(enrollments)
  console.log(`✅ Created ${enrollments.length} course enrollments`)

  // Create availability data (random)
  console.log('⏰ Creating availability data...')
  const availabilityEntries = []
  
  for (const user of allUsers) {
    // Each user has 3-6 availability slots per week
    const numSlots = Math.floor(Math.random() * 4) + 3 // 3-6 slots
    
    for (let i = 0; i < numSlots; i++) {
      const dayOfWeek = Math.floor(Math.random() * 5) + 1 // Monday-Friday
      const startHour = Math.floor(Math.random() * 8) + 8 // 8 AM - 3 PM
      const endHour = startHour + Math.floor(Math.random() * 3) + 1 // 1-3 hour slots
      
      availabilityEntries.push(
        prisma.availability.create({
          data: {
            userId: user.id,
            dayOfWeek,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${endHour.toString().padStart(2, '0')}:00`,
          },
        })
      )
    }
  }
  
  await Promise.all(availabilityEntries)
  console.log(`✅ Created ${availabilityEntries.length} availability entries`)

  // Create some connections (random)
  console.log('🤝 Creating connections...')
  const connections = []
  
  for (let i = 0; i < Math.min(20, allUsers.length / 2); i++) {
    const requester = allUsers[Math.floor(Math.random() * allUsers.length)]
    const target = allUsers[Math.floor(Math.random() * allUsers.length)]
    
    // Don't connect user to themselves
    if (requester.id === target.id) continue
    
    // Random connection status
    const statuses = ['pending', 'accepted', 'declined']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    connections.push(
      prisma.connection.create({
        data: {
          requesterId: requester.id,
          targetId: target.id,
          status,
          message: status === 'pending' ? 'Hi! I saw we have similar courses. Would you like to study together?' : null,
        },
      })
    )
  }
  
  await Promise.all(connections)
  console.log(`✅ Created ${connections.length} connections`)

  // Summary
  console.log('')
  console.log('🎉 Comprehensive seeding completed!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`   - Universities: ${createdUniversities.length}`)
  console.log(`   - Courses: ${allCourses.length}`)
  console.log(`   - Users: ${allUsers.length}`)
  console.log(`   - Profiles: ${allProfiles.length}`)
  console.log(`   - Enrollments: ${enrollments.length}`)
  console.log(`   - Availability: ${availabilityEntries.length}`)
  console.log(`   - Connections: ${connections.length}`)
  console.log('')
  console.log('📧 Test credentials (password: password123):')
  createdUniversities.forEach((uni, index) => {
    if (index < 3) { // Show first 3 universities
      console.log(`   - ${userTemplates[0].email}@${uni.domain}`)
    }
  })
  console.log('')
  console.log('🔗 Useful links:')
  console.log('   - Prisma Studio: npm run db:studio')
  console.log('   - Database Manager: npm run db:manager')
  console.log('   - Debug Database: npm run debug:db')
  console.log('')
  console.log('💡 Tips:')
  console.log('   - This creates a rich dataset for testing all features')
  console.log('   - Users have realistic availability and course enrollments')
  console.log('   - Some connections are already established for testing')
  console.log('   - Run npm run db:reset:dev to reset and reseed')
}

seedComprehensive()
  .catch((e) => {
    console.error('❌ Comprehensive seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
