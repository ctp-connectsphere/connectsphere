'use server'
import { prisma } from '@/lib/db/connection'
import { sendPasswordResetEmail } from '@/lib/email/service'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email().refine(v => v.endsWith('.edu'), 'Must use university email'),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    university: z.string().min(1)
})

const loginSchema = z.object({
    email: z.string().email().refine(v => v.endsWith('.edu'), 'Must use university email'),
    password: z.string().min(8),
    rememberMe: z.boolean().optional()
})

export async function registerUser(formData: FormData) {
    try {
        const data = registerSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            university: formData.get('university')
        })

        const existing = await prisma.user.findUnique({ where: { email: data.email } })
        if (existing) return { success: false, message: 'User already exists' }

        const hash = await bcrypt.hash(data.password, 12)
        await prisma.user.create({
            data: {
                email: data.email,
                passwordHash: hash,
                firstName: data.firstName,
                lastName: data.lastName,
                university: data.university,
                isVerified: true
            }
        })

        return { success: true, message: 'Registration successful. Please login.' }
    } catch (e: any) {
        if (e instanceof z.ZodError) return { success: false, errors: e.flatten().fieldErrors }
        return { success: false, message: e?.message || 'Registration failed' }
    }
}

export async function loginUser(formData: FormData) {
    try {
        const data = loginSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        })

        // Get client IP and user agent for security tracking
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'Unknown'
        const forwardedFor = headersList.get('x-forwarded-for')
        const clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Unknown'

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (!user) {
            return {
                success: false,
                message: 'Invalid email or password',
                errorType: 'INVALID_CREDENTIALS'
            }
        }

        // TODO: Implement account lockout with loginAttempts table
        // For now, we'll skip the lockout check

        // Verify password
        const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)

        if (!isValidPassword) {
            // TODO: Record failed attempt in loginAttempts table
            console.log(`Failed login attempt for ${data.email} from ${clientIP}`)

            return {
                success: false,
                message: 'Invalid email or password',
                errorType: 'INVALID_CREDENTIALS'
            }
        }

        // Check if user is verified
        if (!user.isVerified) {
            return {
                success: false,
                message: 'Please verify your email address before logging in',
                errorType: 'UNVERIFIED_ACCOUNT'
            }
        }

        // TODO: Record successful login attempt in loginAttempts table
        console.log(`Successful login for ${data.email} from ${clientIP}`)

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        })

        return {
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                university: user.university
            }
        }

    } catch (e: any) {
        if (e instanceof z.ZodError) {
            return {
                success: false,
                errors: e.flatten().fieldErrors,
                errorType: 'VALIDATION_ERROR'
            }
        }
        return {
            success: false,
            message: e?.message || 'Login failed',
            errorType: 'SERVER_ERROR'
        }
    }
}

export async function requestPasswordReset(formData: FormData) {
    try {
        const email = formData.get('email') as string

        if (!email || !email.endsWith('.edu')) {
            return {
                success: false,
                message: 'Please provide a valid university email address'
            }
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            // Don't reveal if user exists for security
            return {
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link.'
            }
        }

        // Generate secure reset token
        const resetToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Store reset token in database
        await prisma.passwordReset.upsert({
            where: { email },
            update: {
                token: resetToken,
                expiresAt,
                createdAt: new Date()
            },
            create: {
                email,
                token: resetToken,
                expiresAt,
                createdAt: new Date()
            }
        })

        // Send password reset email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
        const userName = `${user.firstName} ${user.lastName}`

        // In development, log the reset link and show it to user
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔗 Password reset link for ${email}: ${resetLink}`)
            console.log(`📧 User: ${userName}`)
            console.log(`⏰ Expires at: ${expiresAt.toISOString()}`)
            
            return {
                success: true,
                message: `Password reset link generated! Check the console for the link: ${resetLink}`,
                resetLink // Show link in development
            }
        }

        // In production, send actual email
        const emailResult = await sendPasswordResetEmail(email, resetLink, userName)

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error)
            return {
                success: false,
                message: 'Failed to send password reset email. Please try again.'
            }
        }

        return {
            success: true,
            message: 'Password reset link sent to your email address'
        }

    } catch (e: any) {
        return {
            success: false,
            message: 'Failed to process password reset request'
        }
    }
}

export async function resetPassword(formData: FormData) {
    try {
        const token = formData.get('token') as string
        const password = formData.get('password') as string

        if (!token || !password || password.length < 8) {
            return {
                success: false,
                message: 'Invalid token or password must be at least 8 characters'
            }
        }

        // Find valid reset token
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true }
        })

        if (!resetRecord) {
            return {
                success: false,
                message: 'Invalid reset token'
            }
        }

        // Check if token is expired
        if (resetRecord.expiresAt < new Date()) {
            return {
                success: false,
                message: 'Reset token has expired'
            }
        }

        // Check if token has already been used
        if (resetRecord.usedAt) {
            return {
                success: false,
                message: 'Reset token has already been used'
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: resetRecord.email }
        })

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            }
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12)

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { passwordHash }
            }),
            prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { usedAt: new Date() }
            })
        ])

        // Invalidate all user sessions
        await prisma.session.deleteMany({
            where: { userId: user.id }
        })

        return {
            success: true,
            message: 'Password reset successfully. Please log in with your new password.'
        }

    } catch (e: any) {
        return {
            success: false,
            message: 'Failed to reset password'
        }
    }
}

export async function logoutUser() {
    try {
        // This will be called by NextAuth.js signOut
        // Additional cleanup can be added here if needed
        return {
            success: true,
            message: 'Logged out successfully'
        }
    } catch (e: any) {
        return {
            success: false,
            message: 'Failed to logout'
        }
    }
}


