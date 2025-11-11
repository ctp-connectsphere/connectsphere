import { config } from '@/lib/config/env';
import { Redis } from '@upstash/redis';

// Development-specific configuration
const isDevelopment = config.isDevelopment;
const isProduction = config.isProduction;

// Enhanced Redis connection configuration
const redisConfig = {
  url: config.redis.url,
  token: config.redis.token,
};

// Main Redis connection
const redis = new Redis(redisConfig);

// Export redis as named export for compatibility
export { redis };

// Redis connection with pooling for serverless (production optimized)
export const redisWithPooling = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

// Redis error handling class
export class RedisError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RedisError';
  }
}

// Enhanced health check for Redis connection
export async function checkRedisHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
  timestamp: string;
}> {
  try {
    const startTime = Date.now();
    const result = await redis.ping();
    const responseTime = Date.now() - startTime;

    if (result === 'PONG') {
      console.log(`✅ Redis connection healthy (${responseTime}ms)`);
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      throw new Error('Unexpected PING response');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Redis health check failed:', errorMessage);

    return {
      status: 'unhealthy',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };
  }
}

// Get Redis connection info with error handling
export async function getRedisInfo() {
  try {
    // Upstash Redis REST API doesn't support INFO command
    // Return basic connection info instead
    const keyCount = await redis.dbsize();

    return {
      keyCount,
      connectionStatus: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to get Redis info:', error);
    throw new RedisError(
      'Failed to get Redis information',
      'INFO_ERROR',
      error
    );
  }
}

// Redis connection retry logic for development
if (isDevelopment) {
  let retryCount = 0;
  const maxRetries = 3;

  const connectWithRetry = async () => {
    try {
      const health = await checkRedisHealth();
      if (health.status === 'healthy') {
        retryCount = 0;
        console.log('✅ Redis connection established');
      } else {
        throw new Error(health.error || 'Health check failed');
      }
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(
          `🔄 Retrying Redis connection (${retryCount}/${maxRetries})...`
        );
        setTimeout(connectWithRetry, 1000 * retryCount);
      } else {
        console.error(
          '❌ Max Redis retry attempts reached. Please check your Redis connection.'
        );
        throw new RedisError(
          'Max retry attempts reached',
          'MAX_RETRY_ERROR',
          error
        );
      }
    }
  };

  // Initial connection check
  connectWithRetry().catch(error => {
    console.error('❌ Redis connection failed:', error);
  });
}

// Redis operation wrapper with error handling
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    console.error(`❌ Redis operation failed (${operationName}):`, error);

    // In development, log the error but don't fail the application
    if (isDevelopment) {
      console.warn(`⚠️  Using fallback value for ${operationName}`);
      return fallbackValue;
    }

    // In production, throw the error
    throw new RedisError(
      `Redis operation failed: ${operationName}`,
      'OPERATION_ERROR',
      error
    );
  }
}

// Development Redis utilities
export const devRedisUtils = {
  // Clear all cache for development
  async clearAllCache(): Promise<boolean> {
    if (!isDevelopment) {
      throw new RedisError('Cache clearing is only allowed in development');
    }

    try {
      await redis.flushdb();
      console.log('🗑️  Redis cache cleared for development');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear Redis cache:', error);
      throw new RedisError('Failed to clear cache', 'CLEAR_ERROR', error);
    }
  },

  // Get cache statistics for development
  async getCacheStats() {
    try {
      const keyCount = await redis.dbsize();

      return {
        keyCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      throw new RedisError('Failed to get cache stats', 'STATS_ERROR', error);
    }
  },

  // Monitor Redis operations in development
  async monitorOperations() {
    if (!isDevelopment) return;

    // Simple operation monitoring
    const originalGet = redis.get.bind(redis);
    const originalSet = redis.set.bind(redis);
    const originalDel = redis.del.bind(redis);

    redis.get = async (key: string) => {
      const start = Date.now();
      try {
        const result = await originalGet(key);
        console.log(`🔍 GET ${key} (${Date.now() - start}ms)`);
        return result as any;
      } catch (error) {
        console.error(`❌ GET ${key} failed:`, error);
        throw error;
      }
    };

    redis.set = async (key: string, value: any, options?: any) => {
      const start = Date.now();
      try {
        const result = await originalSet(key, value, options);
        console.log(`💾 SET ${key} (${Date.now() - start}ms)`);
        return result;
      } catch (error) {
        console.error(`❌ SET ${key} failed:`, error);
        throw error;
      }
    };

    redis.del = async (...keys: string[]) => {
      const start = Date.now();
      try {
        const result = await originalDel(...keys);
        console.log(`🗑️  DEL ${keys.join(', ')} (${Date.now() - start}ms)`);
        return result;
      } catch (error) {
        console.error(`❌ DEL ${keys.join(', ')} failed:`, error);
        throw error;
      }
    };
  },
};

// Initialize development monitoring if in development mode
if (isDevelopment) {
  devRedisUtils.monitorOperations();
}

export default redis;
