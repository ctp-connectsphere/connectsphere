import { auth } from '@/lib/auth/config';
import { SessionValidation } from '@/lib/auth/session-validation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active session found',
        },
        { status: 401 }
      );
    }

    // Refresh the session in Redis
    const success = await SessionValidation.refreshSession(
      session.user.id || '',
      session
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to refresh session',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      expires: SessionValidation.getSessionExpiryTime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Refresh failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Use POST method for session refresh',
    },
    { status: 405 }
  );
}
