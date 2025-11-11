#!/usr/bin/env node

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Campus Connect Environment Setup\n');

// Generate random secrets
const generateSecret = () => crypto.randomBytes(32).toString('base64');

const envTemplate = `# Campus Connect Environment Configuration
# Generated on ${new Date().toISOString()}

# Database Configuration (REQUIRED)
# Option 1: Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/connectsphere_dev"

# Option 2: Docker PostgreSQL (uncomment if using Docker)
# DATABASE_URL="postgresql://postgres:password@localhost:5432/connectsphere_dev"

# Option 3: Cloud Database (Neon/Supabase - uncomment and replace)
# DATABASE_URL="postgresql://user:pass@host:port/database"

# Redis Configuration (REQUIRED for session storage)
# Get these from https://upstash.com (free tier available)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token_here"

# NextAuth.js Configuration (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateSecret()}"
JWT_SECRET="${generateSecret()}"

# Development Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# Optional: Email Service (for future use)
# RESEND_API_KEY="your_resend_api_key"

# Optional: File Storage (for future use)
# CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
# CLOUDINARY_API_KEY="your_cloudinary_api_key"
# CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Optional: Real-time Communication (for future use)
# PUSHER_APP_ID="your_pusher_app_id"
# PUSHER_SECRET="your_pusher_secret"
# NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
# NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('   Backing up to .env.local.backup');
  fs.copyFileSync(envPath, envPath + '.backup');
}

fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env.local with template configuration');
console.log('\n📋 Next Steps:');
console.log('1. Edit .env.local and configure your database URL');
console.log('2. Set up Redis at https://upstash.com (free tier)');
console.log('3. Run: npm run validate:config');
console.log('4. Run: npm run db:migrate');
console.log('5. Run: npm run db:seed');
console.log('6. Run: npm run dev');
console.log('\n🔗 Quick Links:');
console.log('   PostgreSQL: https://www.postgresql.org/download/');
console.log('   Docker: https://docs.docker.com/get-docker/');
console.log('   Neon (Cloud DB): https://neon.tech');
console.log('   Upstash (Redis): https://upstash.com');
