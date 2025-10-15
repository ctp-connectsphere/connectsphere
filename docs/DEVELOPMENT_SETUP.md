# Development Setup Guide

This guide provides detailed instructions for setting up the Campus Connect development environment with optimized hot reload and debugging capabilities.

## Quick Start

```bash
# Clone and install dependencies
git clone <repository-url>
cd connectsphere
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server with Turbo
npm run dev
```

## Development Scripts

### Core Development Commands

```bash
# Start development server with Turbo (faster builds)
npm run dev

# Start with debugging enabled
npm run dev:debug

# Start with Turbo mode explicitly
npm run dev:turbo
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed development data
npm run db:seed:dev

# Reset database (development only)
npm run db:reset:dev
```

### Debugging Commands

```bash
# Debug database connection
npm run debug:db

# Debug Redis connection
npm run debug:redis

# Debug both database and Redis
npm run debug:all
```

### Code Quality Commands

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Run type checking in watch mode
npm run type-check:watch

# Format code
npm run format

# Check formatting
npm run format:check
```

### Build Commands

```bash
# Build for production
npm run build

# Build with bundle analysis
npm run build:analyze

# Clean build artifacts
npm run clean

# Clean all cache and build artifacts
npm run clean:all
```

## Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/connectsphere_dev"
DATABASE_POOL_SIZE=5
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=10000

# Redis Configuration
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"

# Security Configuration
BCRYPT_ROUNDS=10
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"

# Rate Limiting Configuration
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=900000

# Application Configuration
NEXT_PUBLIC_APP_NAME="Campus Connect (Dev)"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Development Features
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

## VS Code Setup

### Required Extensions

Install the recommended extensions from `.vscode/extensions.json`:

- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- Prisma
- Thunder Client (for API testing)
- Error Lens
- Todo Tree

### Debugging Configuration

The project includes comprehensive debugging configurations:

1. **Next.js: debug server-side** - Debug server-side code
2. **Next.js: debug client-side** - Debug client-side code in Chrome
3. **Next.js: debug full stack** - Debug both server and client
4. **Debug Jest Tests** - Debug unit tests
5. **Debug Prisma Studio** - Debug database operations
6. **Debug Database Operations** - Run database debugging script
7. **Debug Redis Operations** - Run Redis debugging script
8. **Attach to Next.js Process** - Attach to running Next.js process

### Hot Reload Optimizations

The development environment is optimized for fast hot reload:

- **Turbo Mode**: Enabled by default for faster builds
- **Webpack Optimizations**: Configured for development speed
- **Source Maps**: Optimized for debugging
- **File Watching**: Configured for optimal performance
- **Module Resolution**: Optimized for faster imports

## Database Setup

### Local PostgreSQL Setup

1. Install PostgreSQL locally
2. Create a development database:
   ```sql
   CREATE DATABASE connectsphere_dev;
   ```
3. Update `DATABASE_URL` in `.env.local`

### Using Docker (Alternative)

```bash
# Start PostgreSQL with Docker
docker run --name postgres-dev \
  -e POSTGRES_DB=connectsphere_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### Database Migrations

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset:dev
```

## Redis Setup

### Local Redis Setup

1. Install Redis locally
2. Start Redis server:
   ```bash
   redis-server
   ```
3. Update Redis configuration in `.env.local`

### Using Upstash (Recommended)

1. Create an account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token to `.env.local`

## Development Tips

### Performance Optimization

1. **Use Turbo Mode**: Always use `npm run dev` (includes Turbo)
2. **Enable Debug Mode**: Use `npm run dev:debug` for debugging
3. **Monitor Bundle Size**: Use `npm run build:analyze` to analyze bundles
4. **Clean Regularly**: Use `npm run clean:all` to clear caches

### Debugging Tips

1. **Database Issues**: Use `npm run debug:db` to test database connection
2. **Redis Issues**: Use `npm run debug:redis` to test Redis connection
3. **Type Errors**: Use `npm run type-check:watch` for continuous type checking
4. **Linting Issues**: Use `npm run lint:fix` to auto-fix issues

### Code Quality

1. **Pre-commit Hooks**: Configured to run linting and type checking
2. **Pre-push Hooks**: Configured to run full build validation
3. **Format on Save**: Configured in VS Code settings
4. **Auto-imports**: Configured for better developer experience

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` in `.env.local`
   - Ensure PostgreSQL is running
   - Run `npm run debug:db` for diagnostics

2. **Redis Connection Failed**
   - Check Redis configuration in `.env.local`
   - Ensure Redis server is running
   - Run `npm run debug:redis` for diagnostics

3. **Build Failures**
   - Run `npm run clean:all` to clear caches
   - Check TypeScript errors with `npm run type-check`
   - Check linting errors with `npm run lint`

4. **Hot Reload Not Working**
   - Restart development server
   - Clear `.next` cache with `npm run clean`
   - Check file watching permissions

### Performance Issues

1. **Slow Builds**
   - Ensure Turbo mode is enabled
   - Check for circular dependencies
   - Monitor bundle size with `npm run build:analyze`

2. **Memory Issues**
   - Restart development server periodically
   - Check for memory leaks in components
   - Monitor database connection pool

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
