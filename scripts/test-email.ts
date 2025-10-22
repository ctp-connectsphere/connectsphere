#!/usr/bin/env tsx

/**
 * Test email service functionality
 */

import 'dotenv/config'
import { sendPasswordResetEmail } from '../src/lib/email/service'

async function testEmail() {
    console.log('🧪 Testing email service...')

    try {
        const result = await sendPasswordResetEmail(
            'yiming.gao@mail.citytech.cuny.edu',
            'http://localhost:3000/reset-password?token=test-token-123',
            'Yiming Gao'
        )

        if (result.success) {
            console.log('✅ Email sent successfully!')
            console.log('📧 Email ID:', result.data?.id)
        } else {
            console.log('❌ Email failed:', result.error)
        }
    } catch (error) {
        console.error('❌ Email test error:', error)
    }
}

testEmail().catch(console.error)
