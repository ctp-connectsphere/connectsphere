/**
 * Environment variable configuration and validation
 */

import 'dotenv/config';

// Database configuration
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL!,
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
  connectionTimeout: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '60000'
  ),
  idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'),
};

// Redis configuration
export const REDIS_CONFIG = {
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
};

// NextAuth.js configuration
export const AUTH_CONFIG = {
  url: process.env.NEXTAUTH_URL!,
  secret: process.env.NEXTAUTH_SECRET!,
};

// File storage configuration (Cloudinary)
export const STORAGE_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
};

// Real-time communication (Pusher)
export const PUSHER_CONFIG = {
  appId: process.env.PUSHER_APP_ID!,
  secret: process.env.PUSHER_SECRET!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
};

// Analytics (PostHog)
export const ANALYTICS_CONFIG = {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  enabled: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// Monitoring (Sentry)
export const MONITORING_CONFIG = {
  dsn: process.env.SENTRY_DSN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Application configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Campus Connect',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
};

// Security configuration
export const SECURITY_CONFIG = {
  jwtSecret: process.env.JWT_SECRET!,
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  allowedFileTypes: (
    process.env.ALLOWED_FILE_TYPES ||
    'image/jpeg,image/png,image/gif,image/webp'
  ).split(','),
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
};

// Feature flags
export const FEATURE_FLAGS = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  realTime: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true',
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
};

// Environment validation
export function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate URLs
  try {
    new URL(DATABASE_CONFIG.url);
    new URL(REDIS_CONFIG.url);
    new URL(AUTH_CONFIG.url);
  } catch {
    throw new Error('Invalid URL format in environment variables');
  }

  // Validate numeric values
  if (DATABASE_CONFIG.poolSize <= 0) {
    throw new Error('DATABASE_POOL_SIZE must be a positive number');
  }

  if (SECURITY_CONFIG.bcryptRounds < 10 || SECURITY_CONFIG.bcryptRounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
  }

  if (RATE_LIMIT_CONFIG.max <= 0) {
    throw new Error('RATE_LIMIT_MAX must be a positive number');
  }

  return true;
}

// Development environment check
export const isDevelopment = APP_CONFIG.environment === 'development';
export const isProduction = APP_CONFIG.environment === 'production';
export const isTest = APP_CONFIG.environment === 'test';

// Configuration object for easy access
export const config = {
  database: DATABASE_CONFIG,
  redis: REDIS_CONFIG,
  auth: AUTH_CONFIG,
  storage: STORAGE_CONFIG,
  pusher: PUSHER_CONFIG,
  analytics: ANALYTICS_CONFIG,
  monitoring: MONITORING_CONFIG,
  app: APP_CONFIG,
  security: SECURITY_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  features: FEATURE_FLAGS,
  isDevelopment,
  isProduction,
  isTest,
};
