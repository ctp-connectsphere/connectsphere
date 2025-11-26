import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check OAuth configuration
 * Remove this after confirming everything works
 */
export async function GET() {
  // Check if credentials exist (without exposing secrets)
  const hasGoogle = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const hasGitHub = !!(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  // Get all env var names that start with GOOGLE_ or GITHUB_ to debug
  const allEnvVars = Object.keys(process.env).filter(
    key =>
      key.includes('GOOGLE') ||
      key.includes('GITHUB') ||
      key.includes('NEXTAUTH')
  );

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    message:
      hasGoogle && hasGitHub
        ? '✅ OAuth providers should be configured'
        : '❌ OAuth providers are NOT configured - environment variables missing',
    oauth: {
      google: {
        configured: hasGoogle,
        clientIdPresent: !!process.env.GOOGLE_CLIENT_ID,
        clientSecretPresent: !!process.env.GOOGLE_CLIENT_SECRET,
        clientIdValue: process.env.GOOGLE_CLIENT_ID
          ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`
          : 'MISSING',
        clientSecretValue: process.env.GOOGLE_CLIENT_SECRET
          ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`
          : 'MISSING',
      },
      github: {
        configured: hasGitHub,
        clientIdPresent: !!process.env.GITHUB_CLIENT_ID,
        clientSecretPresent: !!process.env.GITHUB_CLIENT_SECRET,
        clientIdValue: process.env.GITHUB_CLIENT_ID || 'MISSING',
        clientSecretValue: process.env.GITHUB_CLIENT_SECRET
          ? `${process.env.GITHUB_CLIENT_SECRET.substring(0, 10)}...`
          : 'MISSING',
      },
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL || 'NOT SET',
      secretPresent: !!process.env.NEXTAUTH_SECRET,
    },
    vercel: {
      url: process.env.VERCEL_URL || 'NOT SET',
    },
    allOAuthEnvVars: allEnvVars,
  });
}
