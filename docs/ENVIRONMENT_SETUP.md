# Environment Setup Guide

This guide provides detailed instructions for setting up environment variables and configuration for the Campus Connect application.

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your configuration values**

3. **Validate your configuration:**
   ```bash
   npm run validate:config
   ```

## Environment Variables Reference

### Required Variables

These variables must be set for the application to function:

#### Database Configuration
```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/connectsphere_dev"

# Database connection pool settings
DATABASE_POOL_SIZE=10
DATABASE_CONNECTION_TIMEOUT=60000
DATABASE_IDLE_TIMEOUT=30000
```

#### Redis Configuration
```env
# Upstash Redis REST API URL and token
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

#### Authentication Configuration
```env
# NextAuth.js configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"

# JWT secret for token signing
JWT_SECRET="your-jwt-secret-key-here"
```

#### Security Configuration
```env
# Password hashing rounds (10-15 recommended)
BCRYPT_ROUNDS=12

# File upload settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"

# Rate limiting settings
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Optional Variables

These variables are optional but recommended for full functionality:

#### Email Configuration (Resend)
```env
# Resend API key for sending emails
RESEND_API_KEY="your-resend-api-key"

# Email sender configuration
EMAIL_FROM="noreply@connectsphere.com"
```

#### File Storage Configuration (Cloudinary)
```env
# Cloudinary configuration for image uploads
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

#### Real-time Communication (Pusher)
```env
# Pusher configuration for real-time features
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

#### Analytics Configuration (PostHog)
```env
# PostHog configuration for analytics
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Monitoring Configuration (Sentry)
```env
# Sentry configuration for error monitoring
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""
```

#### Application Configuration
```env
# Application metadata
NEXT_PUBLIC_APP_NAME="Campus Connect"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature flags
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

## Service Setup Instructions

### 1. Database Setup (PostgreSQL)

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb connectsphere_dev

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/connectsphere_dev"
```

#### Option B: Docker PostgreSQL
```bash
# Start PostgreSQL with Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=connectsphere_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/connectsphere_dev"
```

#### Option C: Cloud Database (Neon/Supabase)
1. Create account at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create new database
3. Copy connection string to `DATABASE_URL`

### 2. Redis Setup (Upstash)

1. Create account at [Upstash](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and token to environment variables

### 3. Email Service Setup (Resend)

1. Create account at [Resend](https://resend.com)
2. Generate API key
3. Add to `RESEND_API_KEY`

### 4. File Storage Setup (Cloudinary)

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get cloud name, API key, and API secret
3. Add to environment variables

### 5. Real-time Communication Setup (Pusher)

1. Create account at [Pusher](https://pusher.com)
2. Create new app
3. Get app ID, secret, key, and cluster
4. Add to environment variables

## Environment Validation

The application includes a configuration validation script:

```bash
# Validate all environment variables
npm run validate:config

# Debug database connection
npm run debug:db

# Debug Redis connection
npm run debug:redis

# Debug all services
npm run debug:all
```

## Development vs Production

### Development Configuration
```env
NODE_ENV=development
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Production Configuration
```env
NODE_ENV=production
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_DEVTOOLS=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Security Considerations

### Secret Generation
Generate strong secrets for production:

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32
```

### Environment File Security
- Never commit `.env.local` to version control
- Use different secrets for each environment
- Rotate secrets regularly in production
- Use environment-specific configuration files

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure database server is running
   - Verify credentials and permissions

2. **Redis Connection Failed**
   - Check `UPSTASH_REDIS_REST_URL` and token
   - Verify Upstash account status
   - Check network connectivity

3. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your domain
   - Check `NEXTAUTH_SECRET` is set
   - Ensure `JWT_SECRET` is configured

4. **File Upload Issues**
   - Check Cloudinary configuration
   - Verify file size limits
   - Check allowed file types

### Validation Errors

The validation script will check for:
- Required variables are set
- URL formats are valid
- Numeric values are within acceptable ranges
- Database and Redis connections work

### Debug Commands

```bash
# Check database health
npm run debug:db

# Check Redis health
npm run debug:redis

# Check all services
npm run debug:all

# Validate configuration
npm run validate:config
```

## Additional Resources

- [NextAuth.js Configuration](https://next-auth.js.org/configuration)
- [Prisma Database Setup](https://www.prisma.io/docs/getting-started)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Resend API Documentation](https://resend.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Pusher Documentation](https://pusher.com/docs)
