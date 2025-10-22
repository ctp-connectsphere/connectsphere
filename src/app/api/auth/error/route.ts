import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get('error')

    // Redirect to the error page with the error parameter
    const errorPageUrl = new URL('/auth/error', request.url)
    if (error) {
        errorPageUrl.searchParams.set('error', error)
    }

    return NextResponse.redirect(errorPageUrl)
}

export async function POST(request: NextRequest) {
    return GET(request)
}
