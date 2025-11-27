/**
 * Script to seed demo topics and user topics data
 * Run with: npx tsx scripts/seed-topics-demo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Demo topics data
const demoTopics = [
  // Skills
  { name: 'JavaScript', category: 'skill', description: 'Programming language for web development' },
  { name: 'Python', category: 'skill', description: 'Versatile programming language' },
  { name: 'React', category: 'skill', description: 'JavaScript library for building user interfaces' },
  { name: 'Node.js', category: 'skill', description: 'JavaScript runtime for server-side development' },
  { name: 'TypeScript', category: 'skill', description: 'Typed superset of JavaScript' },
  { name: 'SQL', category: 'skill', description: 'Database query language' },
  { name: 'Git', category: 'skill', description: 'Version control system' },
  { name: 'Docker', category: 'skill', description: 'Containerization platform' },
  
  // Interests
  { name: 'Web Development', category: 'interest', description: 'Building websites and web applications' },
  { name: 'Machine Learning', category: 'interest', description: 'AI and data science' },
  { name: 'Mobile Development', category: 'interest', description: 'iOS and Android app development' },
  { name: 'Cloud Computing', category: 'interest', description: 'AWS, Azure, GCP' },
  { name: 'Cybersecurity', category: 'interest', description: 'Security and ethical hacking' },
  { name: 'UI/UX Design', category: 'interest', description: 'User interface and experience design' },
  { name: 'Data Science', category: 'interest', description: 'Data analysis and visualization' },
  { name: 'DevOps', category: 'interest', description: 'Development and operations' },
  
  // Subjects
  { name: 'Computer Science', category: 'subject', description: 'Core CS fundamentals' },
  { name: 'Mathematics', category: 'subject', description: 'Calculus, algebra, statistics' },
  { name: 'Physics', category: 'subject', description: 'Classical and modern physics' },
  { name: 'Chemistry', category: 'subject', description: 'Organic and inorganic chemistry' },
  { name: 'Biology', category: 'subject', description: 'Life sciences' },
  { name: 'Economics', category: 'subject', description: 'Micro and macro economics' },
  { name: 'Psychology', category: 'subject', description: 'Human behavior and mind' },
  { name: 'Business', category: 'subject', description: 'Business administration and management' },
];

async function seedTopicsDemo() {
  try {
    console.log('🌱 Starting topics demo data seeding...');

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      take: 10, // Limit to first 10 users
    });

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      return;
    }

    console.log(`📝 Found ${users.length} users`);

    // Create topics (skip if already exist)
    console.log('📚 Creating topics...');
    const createdTopics = [];
    
    for (const topic of demoTopics) {
      try {
        const existingTopic = await prisma.topic.findUnique({
          where: {
            name_category: {
              name: topic.name,
              category: topic.category as 'skill' | 'interest' | 'subject' | 'course',
            },
          },
        });

        if (existingTopic) {
          console.log(`  ⏭️  Topic "${topic.name}" already exists, skipping...`);
          createdTopics.push(existingTopic);
        } else {
          const newTopic = await prisma.topic.create({
            data: {
              name: topic.name,
              category: topic.category as 'skill' | 'interest' | 'subject' | 'course',
              description: topic.description,
              isActive: true,
            },
          });
          createdTopics.push(newTopic);
          console.log(`  ✅ Created topic: ${topic.name} (${topic.category})`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating topic "${topic.name}":`, error);
      }
    }

    console.log(`✅ Created/found ${createdTopics.length} topics`);

    // Assign topics to users
    console.log('👥 Assigning topics to users...');
    let userTopicsCount = 0;

    for (const user of users) {
      // Each user gets 3-6 random topics
      const numTopics = Math.floor(Math.random() * 4) + 3; // 3-6 topics
      const shuffledTopics = [...createdTopics].sort(() => Math.random() - 0.5);
      const userTopics = shuffledTopics.slice(0, numTopics);

      for (const topic of userTopics) {
        try {
          // Check if user already has this topic
          const existing = await prisma.userTopic.findUnique({
            where: {
              userId_topicId: {
                userId: user.id,
                topicId: topic.id,
              },
            },
          });

          if (existing) {
            continue; // Skip if already exists
          }

          // Random proficiency and interest
          const proficiencies: ('beginner' | 'intermediate' | 'advanced')[] = [
            'beginner',
            'intermediate',
            'advanced',
          ];
          const interests: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];

          const proficiency =
            topic.category === 'skill'
              ? proficiencies[Math.floor(Math.random() * proficiencies.length)]
              : null;
          const interest =
            topic.category === 'interest'
              ? interests[Math.floor(Math.random() * interests.length)]
              : null;

          await prisma.userTopic.create({
            data: {
              userId: user.id,
              topicId: topic.id,
              proficiency: proficiency || null,
              interest: interest || null,
            },
          });

          userTopicsCount++;
        } catch (error) {
          console.error(
            `  ❌ Error assigning topic "${topic.name}" to user ${user.email}:`,
            error
          );
        }
      }
    }

    console.log(`✅ Assigned ${userTopicsCount} topics to users`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`  - Topics: ${createdTopics.length}`);
    console.log(`  - User-Topic assignments: ${userTopicsCount}`);
    console.log(`  - Users: ${users.length}`);

    console.log('\n✅ Demo data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding topics demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTopicsDemo()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

