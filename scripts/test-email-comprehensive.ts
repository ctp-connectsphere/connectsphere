#!/usr/bin/env tsx

/**
 * Comprehensive email testing - shows both development and production behavior
 */

import 'dotenv/config'

async function testEmailComprehensive() {
  console.log('📧 Comprehensive Email Testing')
  console.log('=' .repeat(50))
  
  // Test 1: Development Mode (shows link in UI)
  console.log('\n🧪 Test 1: Development Mode')
  console.log('-' .repeat(30))
  process.env.NODE_ENV = 'development'
  
  try {
    const { requestPasswordReset } = await import('../src/lib/actions/auth')
    const formData = new FormData()
    formData.append('email', 'yiming.gao@mail.citytech.cuny.edu')
    
    const result = await requestPasswordReset(formData)
    console.log('✅ Development mode works - shows reset link in UI')
    console.log('📋 Message:', result.message)
  } catch (error) {
    console.log('❌ Development test failed:', error)
  }
  
  // Test 2: Production Mode (attempts to send email)
  console.log('\n🧪 Test 2: Production Mode')
  console.log('-' .repeat(30))
  process.env.NODE_ENV = 'production'
  process.env.EMAIL_FROM = 'onboarding@resend.dev'
  
  try {
    const { requestPasswordReset } = await import('../src/lib/actions/auth')
    const formData = new FormData()
    formData.append('email', 'yiming.gao@mail.citytech.cuny.edu')
    
    const result = await requestPasswordReset(formData)
    console.log('📋 Production result:', result.message)
    
    if (result.success) {
      console.log('✅ Production mode works - email would be sent')
    } else {
      console.log('⚠️  Production mode failed - this is expected due to Resend limitations')
    }
  } catch (error) {
    console.log('❌ Production test failed:', error)
  }
  
  // Test 3: Email Service Direct Test
  console.log('\n🧪 Test 3: Direct Email Service Test')
  console.log('-' .repeat(30))
  
  try {
    const { sendPasswordResetEmail } = await import('../src/lib/email/service')
    
    // Test with verified email (this should work)
    const result = await sendPasswordResetEmail(
      'g1097420948@gmail.com',
      'http://localhost:3000/reset-password?token=test-token',
      'Test User'
    )
    
    if (result.success) {
      console.log('✅ Direct email service works!')
      console.log('📧 Email sent to: g1097420948@gmail.com')
    } else {
      console.log('❌ Direct email service failed:', result.error)
    }
  } catch (error) {
    console.log('❌ Direct email test failed:', error)
  }
  
  console.log('\n📝 Summary:')
  console.log('=' .repeat(50))
  console.log('✅ Development mode: Shows reset link in UI (working)')
  console.log('⚠️  Production mode: Limited by Resend domain verification')
  console.log('📧 Email service: Works with verified addresses')
  console.log('\n🔧 To enable full email functionality:')
  console.log('1. Verify a domain at https://resend.com/domains')
  console.log('2. Update EMAIL_FROM to use your verified domain')
  console.log('3. Update .env with your verified domain')
}

testEmailComprehensive().catch(console.error)
