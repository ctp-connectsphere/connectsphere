#!/usr/bin/env tsx

/**
 * Test email sending in production mode
 */

import 'dotenv/config'

// Temporarily set to production mode for testing
process.env.NODE_ENV = 'production'

async function testProductionEmail() {
    console.log('📧 Testing email sending in production mode...')
    console.log('🔧 Environment:', process.env.NODE_ENV)
    console.log('📤 Resend API Key:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set')
    console.log('📧 From Address:', process.env.EMAIL_FROM)

    try {
        // Import after setting NODE_ENV
        const { requestPasswordReset } = await import('../src/lib/actions/auth')

        console.log('\n📤 Sending password reset request (production mode)...')

        const formData = new FormData()
        formData.append('email', 'yiming.gao@mail.citytech.cuny.edu')

        const result = await requestPasswordReset(formData)

        console.log('📋 Result:', JSON.stringify(result, null, 2))

        if (result.success) {
            console.log('✅ Password reset request successful!')
            console.log('📧 Check your email inbox for the password reset email')
            console.log('🔗 Reset link should be in the email, not shown in UI')
        } else {
            console.log('❌ Password reset failed:', result.message)
        }
    } catch (error) {
        console.error('❌ Test error:', error)
    }
}

testProductionEmail().catch(console.error)
