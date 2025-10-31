import { redis } from './connection';

/**
 * Redis session management service
 */

export class SessionService {
  // Session key patterns
  private static readonly KEY_PATTERNS = {
    SESSION: 'session:',
    USER_SESSION: 'user_session:',
    REFRESH_TOKEN: 'refresh_token:',
    DEVICE_SESSION: 'device_session:',
  };

  // TTL values (in seconds)
  private static readonly TTL = {
    SESSION: 2592000, // 30 days
    REFRESH_TOKEN: 2592000, // 30 days
    DEVICE_SESSION: 604800, // 7 days
  };

  // Session management
  static async createSession(
    sessionToken: string,
    sessionData: any,
    ttl = this.TTL.SESSION
  ) {
    try {
      const key = `${this.KEY_PATTERNS.SESSION}${sessionToken}`;
      await redis.setex(key, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Failed to create session:', error);
      return false;
    }
  }

  static async getSession(sessionToken: string) {
    try {
      const key = `${this.KEY_PATTERNS.SESSION}${sessionToken}`;
      const session = await redis.get(key);

      if (session) {
        return JSON.parse(session as string);
      }

      return null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  static async updateSession(
    sessionToken: string,
    sessionData: any,
    ttl = this.TTL.SESSION
  ) {
    try {
      const key = `${this.KEY_PATTERNS.SESSION}${sessionToken}`;
      await redis.setex(key, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Failed to update session:', error);
      return false;
    }
  }

  static async deleteSession(sessionToken: string) {
    try {
      const key = `${this.KEY_PATTERNS.SESSION}${sessionToken}`;
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  // Refresh token management
  static async createRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo: any,
    ttl = this.TTL.REFRESH_TOKEN
  ) {
    try {
      const key = `${this.KEY_PATTERNS.REFRESH_TOKEN}${refreshToken}`;
      const tokenData = {
        userId,
        deviceInfo,
        createdAt: new Date().toISOString(),
      };

      await redis.setex(key, ttl, JSON.stringify(tokenData));
      return true;
    } catch (error) {
      console.error('Failed to create refresh token:', error);
      return false;
    }
  }

  static async getRefreshToken(refreshToken: string) {
    try {
      const key = `${this.KEY_PATTERNS.REFRESH_TOKEN}${refreshToken}`;
      const token = await redis.get(key);

      if (token) {
        return JSON.parse(token as string);
      }

      return null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  static async deleteRefreshToken(refreshToken: string) {
    try {
      const key = `${this.KEY_PATTERNS.REFRESH_TOKEN}${refreshToken}`;
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Failed to delete refresh token:', error);
      return false;
    }
  }

  // User session management
  static async getUserSessions(userId: string) {
    try {
      const pattern = `${this.KEY_PATTERNS.USER_SESSION}${userId}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length === 0) {
        return [];
      }

      const sessions = await redis.mget(...keys);
      return sessions
        .filter(session => session !== null)
        .map(session => JSON.parse(session as string));
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  static async deleteUserSessions(userId: string) {
    try {
      const pattern = `${this.KEY_PATTERNS.USER_SESSION}${userId}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete user sessions:', error);
      return false;
    }
  }

  // Device session management
  static async createDeviceSession(
    userId: string,
    deviceId: string,
    deviceInfo: any,
    ttl = this.TTL.DEVICE_SESSION
  ) {
    try {
      const key = `${this.KEY_PATTERNS.DEVICE_SESSION}${userId}:${deviceId}`;
      const sessionData = {
        userId,
        deviceId,
        deviceInfo,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      await redis.setex(key, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('Failed to create device session:', error);
      return false;
    }
  }

  static async updateDeviceSession(
    userId: string,
    deviceId: string,
    deviceInfo: any,
    ttl = this.TTL.DEVICE_SESSION
  ) {
    try {
      const key = `${this.KEY_PATTERNS.DEVICE_SESSION}${userId}:${deviceId}`;
      const existingSession = await redis.get(key);

      if (existingSession) {
        const sessionData = JSON.parse(existingSession as string);
        sessionData.lastActive = new Date().toISOString();
        sessionData.deviceInfo = { ...sessionData.deviceInfo, ...deviceInfo };

        await redis.setex(key, ttl, JSON.stringify(sessionData));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update device session:', error);
      return false;
    }
  }

  static async getDeviceSession(userId: string, deviceId: string) {
    try {
      const key = `${this.KEY_PATTERNS.DEVICE_SESSION}${userId}:${deviceId}`;
      const session = await redis.get(key);

      if (session) {
        return JSON.parse(session as string);
      }

      return null;
    } catch (error) {
      console.error('Failed to get device session:', error);
      return null;
    }
  }

  static async deleteDeviceSession(userId: string, deviceId: string) {
    try {
      const key = `${this.KEY_PATTERNS.DEVICE_SESSION}${userId}:${deviceId}`;
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Failed to delete device session:', error);
      return false;
    }
  }

  // Session cleanup and maintenance
  static async cleanupExpiredSessions() {
    try {
      // Redis automatically handles TTL expiration, but we can clean up manually if needed
      const patterns = [
        `${this.KEY_PATTERNS.SESSION}*`,
        `${this.KEY_PATTERNS.REFRESH_TOKEN}*`,
        `${this.KEY_PATTERNS.DEVICE_SESSION}*`,
      ];

      let totalCleaned = 0;

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);

        for (const key of keys) {
          const ttl = await redis.ttl(key);
          if (ttl === -1) {
            // Key exists but has no TTL
            await redis.del(key);
            totalCleaned++;
          }
        }
      }

      return totalCleaned;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  // Health check
  static async isHealthy(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Session service health check failed:', error);
      return false;
    }
  }
}
