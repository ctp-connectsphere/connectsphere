#!/usr/bin/env tsx

/**
 * Test email sending with .edu address
 */

import 'dotenv/config'

// Set production mode and proper email configuration
process.env.NODE_ENV = 'production'
process.env.EMAIL_FROM = 'onboarding@resend.dev'

async function testEmailWithEdu() {
    console.log('📧 Testing email sending with .edu address...')
    console.log('🔧 Environment:', process.env.NODE_ENV)
    console.log('📤 From Address:', process.env.EMAIL_FROM)

    try {
        const { requestPasswordReset } = await import('../src/lib/actions/auth')

        // Test with a .edu email that should work
        const formData = new FormData()
        formData.append('email', 'test@citytech.cuny.edu')

        console.log('📤 Sending password reset to: test@citytech.cuny.edu')
        const result = await requestPasswordReset(formData)

        console.log('📋 Result:', JSON.stringify(result, null, 2))

        if (result.success) {
            console.log('✅ Password reset email sent successfully!')
            console.log('📧 Check the email inbox for the reset link')
        } else {
            console.log('❌ Password reset failed:', result.message)
        }
    } catch (error) {
        console.error('❌ Test error:', error)
    }
}

testEmailWithEdu().catch(console.error)
