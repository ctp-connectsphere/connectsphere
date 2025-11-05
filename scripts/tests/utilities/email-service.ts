#!/usr/bin/env tsx

/**
 * Test email service functionality
 * 
 * Tests all email types: verification, password reset, welcome
 * 
 * Usage:
 *   npm run test:email
 *   TEST_EMAIL_TO=your-email@example.com npm run test:email
 */

import 'dotenv/config';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../../../src/lib/email/service';

async function testEmailService() {
  console.log('📧 Testing email service...\n');

  // Check environment variables
  console.log('🔧 Environment check:');
  console.log(
    '  RESEND_API_KEY:',
    process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'
  );
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  console.log(
    '  EMAIL_FROM:',
    emailFrom,
    process.env.EMAIL_FROM ? '(from .env)' : '(default: test domain)'
  );
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');

  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ Resend API key not configured!');
    console.log('📝 To set up email service:');
    console.log('1. Go to https://resend.com and create an account');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Add to .env file: RESEND_API_KEY=your_api_key_here');
    console.log(
      '4. Add to .env file: EMAIL_FROM=your-verified-domain@example.com'
    );
    console.log('\n📚 See docs/EMAIL_DOMAIN_SETUP.md for full setup guide');
    return;
  }

  // For testing with onboarding@resend.dev, must send to account email
  const testEmail = process.env.TEST_EMAIL_TO || 'g1097420948@gmail.com';

  if (emailFrom === 'onboarding@resend.dev') {
    console.log('\n⚠️  Using test domain (onboarding@resend.dev)');
    console.log(
      '   Note: Test domain only works with your Resend account email'
    );
    console.log(`   Sending to: ${testEmail}`);
    console.log(
      '   💡 To send to other emails, verify a domain: https://resend.com/domains'
    );
    console.log('   📚 See docs/EMAIL_DOMAIN_SETUP.md for domain verification');
  } else {
    console.log(`\n✅ Using verified domain: ${emailFrom}`);
    console.log(`   Sending to: ${testEmail}`);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const testUserName = 'Test User';

  // Test 1: Verification Email
  console.log('\n📤 Test 1: Sending verification email...');
  try {
    const verifyResult = await sendVerificationEmail(
      testEmail,
      `${baseUrl}/verify-email?token=test-verification-token-123`,
      testUserName
    );

    if (verifyResult.success) {
      console.log('✅ Verification email sent successfully!');
    } else {
      console.log('❌ Verification email failed:', verifyResult.error);
    }
  } catch (error) {
    console.error('❌ Verification email error:', error);
  }

  // Test 2: Password Reset Email
  console.log('\n📤 Test 2: Sending password reset email...');
  try {
    const resetResult = await sendPasswordResetEmail(
      testEmail,
      `${baseUrl}/reset-password?token=test-reset-token-123`,
      testUserName
    );

    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully!');
    } else {
      console.log('❌ Password reset email failed:', resetResult.error);
    }
  } catch (error) {
    console.error('❌ Password reset email error:', error);
  }

  // Test 3: Welcome Email
  console.log('\n📤 Test 3: Sending welcome email...');
  try {
    const welcomeResult = await sendWelcomeEmail(testEmail, testUserName);

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }

  console.log('\n📧 Check your email inbox for all test emails!');
  console.log('📊 Check Resend dashboard → Logs to see delivery status');
  console.log('\n💡 Tips:');
  console.log('  - If emails don\'t arrive, check spam folder');
  console.log('  - Verify domain for better deliverability');
  console.log('  - See docs/EMAIL_DOMAIN_SETUP.md for full setup guide');
}

testEmailService().catch(console.error);
