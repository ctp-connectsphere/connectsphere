# Campus Connect Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Database Deployment](#database-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Rollback Procedures](#rollback-procedures)
10. [Security Considerations](#security-considerations)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete deployment process for Campus Connect using Next.js 14+ with modern serverless architecture. The deployment strategy follows a unified, cloud-native approach using Vercel for hosting, serverless databases, and automated CI/CD pipelines.

**Deployment Architecture:**

- **Application:** Vercel (Next.js App Router with Edge Runtime)
- **Database:** Neon or Supabase (Serverless PostgreSQL)
- **Caching:** Upstash Redis (Serverless Redis)
- **CDN:** Vercel Edge Network (global content delivery)
- **Monitoring:** Vercel Analytics + custom monitoring

---

## Environment Configuration

### Environment Variables

**Vercel Environment Variables:**

```bash
# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://campusconnect.app
NEXT_PUBLIC_APP_NAME="Campus Connect"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Database Configuration (Neon or Supabase)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
DIRECT_URL=postgresql://user:password@host:port/database?sslmode=require

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# NextAuth.js Configuration
NEXTAUTH_URL=https://campusconnect.app
NEXTAUTH_SECRET=your-super-secure-nextauth-secret

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@campusconnect.app

# File Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL_RATELIMIT=https://your-ratelimit-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN_RATELIMIT=your-ratelimit-token

# Security
CORS_ORIGIN=https://campusconnect.app

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Environment-Specific Configurations

**Development:**

```bash
# Local development
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/campusconnect_dev
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

**Staging:**

```bash
# Staging environment
NODE_ENV=staging
DATABASE_URL=postgresql://staging-db-url
REDIS_URL=redis://staging-redis-url
CORS_ORIGIN=https://staging.campusconnect.app
LOG_LEVEL=info
```

**Production:**

```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://production-db-url
REDIS_URL=redis://production-redis-url
CORS_ORIGIN=https://campusconnect.app
LOG_LEVEL=warn
```

---

## Infrastructure Setup

### Railway Setup

**1. Create Railway Project:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init campus-connect-api

# Link to existing project
railway link <project-id>
```

**2. Configure Services:**

```bash
# Add PostgreSQL service
railway add postgresql

# Add Redis service
railway add redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret-key
# ... other variables
```

**3. Railway Configuration File:**

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "api"
source = "."

[services.variables]
NODE_ENV = "production"
```

### Vercel Setup

**1. Install Vercel CLI:**

```bash
npm install -g vercel
```

**2. Configure Vercel:**

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Configure environment variables
vercel env add VITE_API_BASE_URL
vercel env add VITE_WS_URL
# ... other variables
```

**3. Vercel Configuration File:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url",
    "VITE_WS_URL": "@ws-url"
  }
}
```

### Cloudflare Configuration

**1. DNS Setup:**

```dns
# A records
campusconnect.app        A    76.76.19.19
www.campusconnect.app    A    76.76.19.19
api.campusconnect.app    A    76.76.19.19

# CNAME records
staging.campusconnect.app CNAME staging.vercel.app
```

**2. Security Rules:**

```javascript
// Cloudflare Workers script for security headers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const response = await fetch(request);

  // Add security headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return newResponse;
}
```

---

## Frontend Deployment

### Vercel Deployment

**1. Build Configuration:**

```javascript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api-base-url",
    "VITE_WS_URL": "@ws-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**2. Build Script:**

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    "preview": "vite preview",
    "deploy": "vercel --prod",
    "deploy:staging": "vercel"
  }
}
```

**3. Environment-Specific Builds:**

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@headlessui/react', '@heroicons/react'],
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
```

### Deployment Commands

```bash
# Deploy to staging
npm run build:staging
vercel --target staging

# Deploy to production
npm run build:production
vercel --prod

# Deploy with specific environment
vercel env pull .env.production
npm run build
vercel --prod
```

---

## Backend Deployment

### Railway Deployment

**1. Dockerfile:**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

ENV PORT=3001

CMD ["npm", "run", "start:prod"]
```

**2. Railway Configuration:**

```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[services.variables]
NODE_ENV = "production"
PORT = "3001"
```

**3. Package.json Scripts:**

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "build": "tsc",
    "build:prod": "npm run build && npm prune --production",
    "dev": "nodemon src/index.ts",
    "migrate": "npx prisma migrate deploy",
    "migrate:dev": "npx prisma migrate dev",
    "seed": "npx prisma db seed",
    "studio": "npx prisma studio"
  }
}
```

### Database Migrations

**1. Migration Script:**

```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

**2. Pre-deployment Migration:**

```bash
# Add to Railway deployment hook
npm run migrate
```

---

## Database Deployment

### PostgreSQL Setup

**1. Database Initialization:**

```sql
-- Create database and user
CREATE DATABASE campusconnect_prod;
CREATE USER campusconnect_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE campusconnect_prod TO campusconnect_user;

-- Enable required extensions
\c campusconnect_prod;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**2. Connection Pooling:**

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  errorFormat: 'pretty',
});

// Connection pool configuration
const dbConfig = {
  connectionLimit: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
  acquireTimeoutMillis: 60000,
  timeout: 60000,
  reconnect: true,
};

export default prisma;
```

### Database Backup Strategy

**1. Automated Backups:**

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="campusconnect_backup_$DATE.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to cloud storage
aws s3 cp $BACKUP_FILE.gz s3://campusconnect-backups/

# Cleanup local file
rm $BACKUP_FILE.gz

echo "Backup completed: $BACKUP_FILE.gz"
```

**2. Backup Schedule:**

```yaml
# GitHub Actions scheduled backup
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} | gzip > backup.sql.gz
          aws s3 cp backup.sql.gz s3://campusconnect-backups/
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: campus-connect-api

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_campusconnect
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Run tests
        run: |
          npm run test
          cd backend && npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_campusconnect

      - name: Build frontend
        run: npm run build

      - name: Build backend
        run: |
          cd backend
          npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build:production
        env:
          VITE_API_BASE_URL: https://api.campusconnect.app/api/v1
          VITE_WS_URL: wss://api.campusconnect.app/ws

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: |
          cd backend
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  health-check:
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    steps:
      - name: Health Check Frontend
        run: |
          curl -f https://campusconnect.app || exit 1

      - name: Health Check Backend
        run: |
          curl -f https://api.campusconnect.app/health || exit 1

      - name: Notify Deployment Success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Campus Connect deployed successfully!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Staging Deployment

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  pull_request:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build:staging
        env:
          VITE_API_BASE_URL: https://staging-api.campusconnect.app/api/v1
          VITE_WS_URL: wss://staging-api.campusconnect.app/ws

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--target staging'
```

---

## Monitoring & Health Checks

### Health Check Endpoints

```typescript
// src/routes/health.ts
import { Router } from 'express';
import prisma from '../config/database';
import redis from '../config/redis';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: 'unknown',
        redis: 'unknown',
        external: 'unknown',
      },
    };

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.services.database = 'healthy';
    } catch (error) {
      checks.services.database = 'unhealthy';
      checks.status = 'unhealthy';
    }

    // Check Redis
    try {
      await redis.ping();
      checks.services.redis = 'healthy';
    } catch (error) {
      checks.services.redis = 'unhealthy';
      checks.status = 'unhealthy';
    }

    // Check external services
    try {
      // Check SendGrid
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
      });
      checks.services.external = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      checks.services.external = 'unhealthy';
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
```

### Monitoring Dashboard

```typescript
// src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';

interface Metrics {
  requests: number;
  errors: number;
  responseTime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

const metrics: Metrics = {
  requests: 0,
  errors: 0,
  responseTime: 0,
  memoryUsage: process.memoryUsage(),
};

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.requests++;
    metrics.responseTime = duration;

    if (res.statusCode >= 400) {
      metrics.errors++;
    }

    // Update memory usage
    metrics.memoryUsage = process.memoryUsage();
  });

  next();
};

export const getMetrics = () => metrics;
```

### Alerting Configuration

```typescript
// src/services/alerting.ts
import { WebhookClient } from 'discord.js';
import fetch from 'node-fetch';

class AlertingService {
  private discordWebhook: WebhookClient;
  private slackWebhookUrl: string;

  constructor() {
    this.discordWebhook = new WebhookClient({
      url: process.env.DISCORD_WEBHOOK_URL!,
    });
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL!;
  }

  async sendAlert(
    level: 'info' | 'warning' | 'error',
    message: string,
    details?: any
  ) {
    const alert = {
      level,
      message,
      details,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Send to Discord
    try {
      await this.discordWebhook.send({
        content: `🚨 **${level.toUpperCase()}** - ${message}`,
        embeds: [
          {
            color: this.getColor(level),
            fields: [
              {
                name: 'Environment',
                value: process.env.NODE_ENV,
                inline: true,
              },
              { name: 'Timestamp', value: alert.timestamp, inline: true },
              {
                name: 'Details',
                value: JSON.stringify(details, null, 2),
                inline: false,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }

    // Send to Slack
    try {
      await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${level.toUpperCase()}: ${message}`,
          attachments: [
            {
              color: this.getColor(level),
              fields: [
                {
                  title: 'Environment',
                  value: process.env.NODE_ENV,
                  short: true,
                },
                { title: 'Timestamp', value: alert.timestamp, short: true },
                {
                  title: 'Details',
                  value: JSON.stringify(details, null, 2),
                  short: false,
                },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private getColor(level: string): number {
    switch (level) {
      case 'info':
        return 0x3498db;
      case 'warning':
        return 0xf39c12;
      case 'error':
        return 0xe74c3c;
      default:
        return 0x95a5a6;
    }
  }
}

export const alertingService = new AlertingService();
```

---

## Rollback Procedures

### Automated Rollback Triggers

```typescript
// src/middleware/rollback.ts
import { Request, Response, NextFunction } from 'express';
import { alertingService } from '../services/alerting';

interface RollbackMetrics {
  errorRate: number;
  responseTime: number;
  requests: number;
  errors: number;
}

class RollbackService {
  private metrics: RollbackMetrics = {
    errorRate: 0,
    responseTime: 0,
    requests: 0,
    errors: 0,
  };

  private readonly ERROR_RATE_THRESHOLD = 0.05; // 5%
  private readonly RESPONSE_TIME_THRESHOLD = 2000; // 2 seconds

  checkRollbackConditions(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      this.metrics.requests++;
      this.metrics.responseTime = duration;

      if (res.statusCode >= 400) {
        this.metrics.errors++;
      }

      this.metrics.errorRate = this.metrics.errors / this.metrics.requests;

      // Check rollback conditions
      if (this.shouldRollback()) {
        this.initiateRollback();
      }
    });

    next();
  }

  private shouldRollback(): boolean {
    return (
      this.metrics.errorRate > this.ERROR_RATE_THRESHOLD ||
      this.metrics.responseTime > this.RESPONSE_TIME_THRESHOLD
    );
  }

  private async initiateRollback() {
    console.log('🚨 Rollback conditions met, initiating rollback...');

    await alertingService.sendAlert('error', 'Automatic rollback initiated', {
      errorRate: this.metrics.errorRate,
      responseTime: this.metrics.responseTime,
      requests: this.metrics.requests,
    });

    // Trigger rollback via Railway API
    try {
      const response = await fetch(
        `https://backboard.railway.app/projects/${process.env.RAILWAY_PROJECT_ID}/deployments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RAILWAY_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rollback: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Rollback failed: ${response.statusText}`);
      }

      console.log('✅ Rollback initiated successfully');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      await alertingService.sendAlert('error', 'Automatic rollback failed', {
        error: error.message,
      });
    }
  }
}

export const rollbackService = new RollbackService();
```

### Manual Rollback Process

```bash
#!/bin/bash
# rollback.sh

echo "🚨 Initiating manual rollback..."

# 1. Check current deployment status
echo "📊 Current deployment status:"
railway status

# 2. Get list of recent deployments
echo "📋 Recent deployments:"
railway deployments

# 3. Rollback to previous deployment
echo "🔄 Rolling back to previous deployment..."
railway rollback

# 4. Wait for deployment to complete
echo "⏳ Waiting for rollback to complete..."
sleep 30

# 5. Run health checks
echo "🏥 Running health checks..."
curl -f https://api.campusconnect.app/health || {
  echo "❌ Health check failed"
  exit 1
}

# 6. Verify database connectivity
echo "🗄️ Verifying database connectivity..."
railway run npx prisma db push

# 7. Send notification
echo "📢 Rollback completed successfully"

echo "✅ Rollback process completed"
```

---

## Security Considerations

### Environment Security

```bash
# Generate secure secrets
openssl rand -base64 32  # JWT secret
openssl rand -hex 32     # API keys

# Rotate secrets regularly
# JWT secrets should be rotated monthly
# Database passwords should be rotated quarterly
```

### SSL/TLS Configuration

```nginx
# nginx.conf (if using custom nginx)
server {
    listen 443 ssl http2;
    server_name campusconnect.app;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

### Database Security

```sql
-- Create read-only user for analytics
CREATE USER campusconnect_readonly WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO campusconnect_readonly;

-- Enable row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY user_isolation ON users
    FOR ALL TO campusconnect_user
    USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY message_isolation ON messages
    FOR ALL TO campusconnect_user
    USING (
        sender_id = current_setting('app.current_user_id')::uuid OR
        connection_id IN (
            SELECT id FROM connections
            WHERE requester_id = current_setting('app.current_user_id')::uuid
               OR target_id = current_setting('app.current_user_id')::uuid
        )
    );
```

---

## Troubleshooting

### Common Deployment Issues

**1. Database Connection Issues:**

```bash
# Check database connectivity
railway run npx prisma db push

# Verify environment variables
railway variables

# Check database logs
railway logs --service postgresql
```

**2. Build Failures:**

```bash
# Check build logs
railway logs --service api

# Verify dependencies
npm ci

# Check TypeScript compilation
npm run build
```

**3. Environment Variable Issues:**

```bash
# List all environment variables
railway variables

# Set missing variables
railway variables set NODE_ENV=production

# Verify variable format
echo $DATABASE_URL
```

### Debugging Commands

```bash
# Connect to production database
railway connect postgresql

# View application logs
railway logs --service api --tail

# Check service status
railway status

# Access application shell
railway shell
```

### Performance Monitoring

```bash
# Monitor database performance
railway run npx prisma studio

# Check Redis performance
railway run redis-cli --latency

# Monitor application metrics
curl https://api.campusconnect.app/metrics
```

---

_Last Updated: Oct 2025_  
_Deployment Guide Version: 1.0.0_
