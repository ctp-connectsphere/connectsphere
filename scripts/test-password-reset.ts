#!/usr/bin/env tsx

/**
 * Test password reset functionality
 */

import 'dotenv/config'
import { requestPasswordReset } from '../src/lib/actions/auth'

async function testPasswordReset() {
    console.log('🧪 Testing password reset functionality...')

    try {
        const formData = new FormData()
        formData.append('email', 'yiming.gao@mail.citytech.cuny.edu')

        console.log('📧 Sending password reset request...')
        const result = await requestPasswordReset(formData)

        console.log('📋 Result:', JSON.stringify(result, null, 2))

        if (result.success) {
            console.log('✅ Password reset request successful!')
            if (result.resetLink) {
                console.log('🔗 Reset link:', result.resetLink)
            }
        } else {
            console.log('❌ Password reset failed:', result.message)
        }
    } catch (error) {
        console.error('❌ Test error:', error)
    }
}

testPasswordReset().catch(console.error)
