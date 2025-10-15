import { NextRequest, NextResponse } from 'next/server'
import { SessionValidation } from '@/lib/auth/session-validation'

export async function POST(request: NextRequest) {
  try {
    const validation = await SessionValidation.validateSession()
    
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      }, { status: 401 })
    }

    // If session needs refresh, update it
    if (validation.shouldRefresh && validation.session) {
      await SessionValidation.refreshSession(
        validation.session.user?.id || '',
        validation.session
      )
    }

    return NextResponse.json({
      isValid: true,
      session: {
        user: validation.session?.user,
        expires: validation.session?.expires
      },
      refreshed: validation.shouldRefresh
    })
  } catch (error) {
    return NextResponse.json({
      isValid: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST method for session validation'
  }, { status: 405 })
}
