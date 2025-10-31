import { SessionService } from '@/lib/redis/session';
import { NextRequest } from 'next/server';
import { auth } from './config';

export interface SessionValidationResult {
  isValid: boolean;
  session?: any;
  error?: string;
  shouldRefresh?: boolean;
}

/**
 * Session validation and refresh utilities
 */
export class SessionValidation {
  private static readonly SESSION_REFRESH_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days before expiry

  /**
   * Validate current session and check if refresh is needed
   */
  static async validateSession(): Promise<SessionValidationResult> {
    try {
      const session = await auth();

      if (!session?.user) {
        return {
          isValid: false,
          error: 'No active session found',
        };
      }

      // Check if session exists in Redis
      if (session.user.id) {
        const redisSession = await SessionService.getSession(session.user.id);
        if (!redisSession) {
          return {
            isValid: false,
            error: 'Session expired or invalid',
          };
        }

        // Check if session needs refresh
        const now = Date.now();
        const shouldRefresh =
          redisSession.exp &&
          redisSession.exp * 1000 - now < this.SESSION_REFRESH_THRESHOLD;

        return {
          isValid: true,
          session,
          shouldRefresh,
        };
      }

      return {
        isValid: true,
        session,
      };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : 'Session validation failed',
      };
    }
  }

  /**
   * Refresh session by updating Redis session data
   */
  static async refreshSession(
    sessionToken: string,
    sessionData: any
  ): Promise<boolean> {
    try {
      await SessionService.updateSession(sessionToken, {
        ...sessionData,
        refreshedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  /**
   * Validate session from request headers (for API routes)
   */
  static async validateRequestSession(
    request: NextRequest
  ): Promise<SessionValidationResult> {
    try {
      const authHeader = request.headers.get('authorization');
      const sessionToken =
        request.cookies.get('next-auth.session-token') ||
        request.cookies.get('__Secure-next-auth.session-token');

      if (!authHeader && !sessionToken) {
        return {
          isValid: false,
          error: 'No authentication credentials provided',
        };
      }

      // For API routes, we can validate the session token directly
      if (sessionToken) {
        const redisSession = await SessionService.getSession(
          sessionToken.value
        );
        if (!redisSession) {
          return {
            isValid: false,
            error: 'Invalid or expired session token',
          };
        }

        return {
          isValid: true,
          session: redisSession,
        };
      }

      // Fallback to NextAuth validation
      return await this.validateSession();
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : 'Request session validation failed',
      };
    }
  }

  /**
   * Invalidate session (for logout)
   */
  static async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      await SessionService.deleteSession(sessionToken);
      return true;
    } catch (error) {
      console.error('Failed to invalidate session:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      return await SessionService.cleanupExpiredSessions();
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Check if session is about to expire
   */
  static isSessionExpiringSoon(expiresAt: number): boolean {
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    return timeUntilExpiry < this.SESSION_REFRESH_THRESHOLD;
  }

  /**
   * Get session expiry time in milliseconds
   */
  static getSessionExpiryTime(): number {
    return Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  }
}

/**
 * Higher-order function to wrap API routes with session validation
 */
export function withSessionValidation(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const validation = await SessionValidation.validateRequestSession(request);

    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: validation.error || 'Unauthorized',
          code: 'SESSION_INVALID',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Add session to request context
    (request as any).session = validation.session;

    return handler(request, ...args);
  };
}

/**
 * Client-side session validation hook
 */
export async function validateClientSession(): Promise<SessionValidationResult> {
  try {
    const response = await fetch('/api/auth/session/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        isValid: false,
        error: 'Session validation failed',
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
