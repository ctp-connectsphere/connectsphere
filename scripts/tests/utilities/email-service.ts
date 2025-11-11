#!/usr/bin/env tsx

/**
 * Test email service functionality
 */

import 'dotenv/config';
import { sendPasswordResetEmail } from '../../../src/lib/email/service';

async function testEmailService() {
  console.log('📧 Testing email service...');

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
  }

  try {
    console.log('\n📤 Sending test password reset email...');

    const result = await sendPasswordResetEmail(
      testEmail,
      'http://localhost:3000/reset-password?token=test-token-123',
      'Yiming Gao'
    );

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your email inbox for the password reset email');
    } else {
      console.log('❌ Email sending failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Email service error:', error);
  }
}

testEmailService().catch(console.error);
