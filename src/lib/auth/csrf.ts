import { randomBytes } from 'crypto';

/**
 * CSRF protection utilities for NextAuth.js
 */
export class CSRFProtection {
  private static readonly CSRF_TOKEN_LENGTH = 32;
  private static readonly CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Generate a secure CSRF token
   */
  static generateToken(): string {
    return randomBytes(this.CSRF_TOKEN_LENGTH).toString('hex');
  }

  /**
   * Validate CSRF token format
   */
  static validateTokenFormat(token: string): boolean {
    return (
      typeof token === 'string' &&
      token.length === this.CSRF_TOKEN_LENGTH * 2 &&
      /^[a-f0-9]+$/.test(token)
    );
  }

  /**
   * Create CSRF token with expiry
   */
  static createTokenWithExpiry(): { token: string; expires: number } {
    return {
      token: this.generateToken(),
      expires: Date.now() + this.CSRF_TOKEN_EXPIRY,
    };
  }

  /**
   * Check if CSRF token is expired
   */
  static isTokenExpired(expires: number): boolean {
    return Date.now() > expires;
  }

  /**
   * Verify CSRF token (basic format validation)
   * In production, you'd want to store and verify tokens against a session
   */
  static verifyToken(token: string): boolean {
    return this.validateTokenFormat(token);
  }

  /**
   * Generate CSRF token for forms
   */
  static getFormToken(): string {
    return this.generateToken();
  }

  /**
   * Validate form submission CSRF token
   */
  static validateFormToken(token: string, expectedToken: string): boolean {
    return this.verifyToken(token) && token === expectedToken;
  }
}

/**
 * CSRF middleware for API routes
 */
export function withCSRF(handler: Function) {
  return async (req: any, res: any) => {
    // Skip CSRF for GET requests and NextAuth routes
    if (req.method === 'GET' || req.url?.startsWith('/api/auth/')) {
      return handler(req, res);
    }

    // For POST/PUT/DELETE requests, validate CSRF token
    const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;
    const sessionToken = req.headers['x-session-token'];

    if (!csrfToken || !CSRFProtection.verifyToken(csrfToken)) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID',
      });
    }

    // Additional session validation could be added here
    if (!sessionToken) {
      return res.status(401).json({
        error: 'Session token required',
        code: 'SESSION_TOKEN_MISSING',
      });
    }

    return handler(req, res);
  };
}

/**
 * Generate CSRF token for client-side forms
 */
export function getClientCSRFToken(): string {
  return CSRFProtection.getFormToken();
}

/**
 * Validate CSRF token from client
 */
export function validateClientCSRF(
  token: string,
  expectedToken: string
): boolean {
  return CSRFProtection.validateFormToken(token, expectedToken);
}
