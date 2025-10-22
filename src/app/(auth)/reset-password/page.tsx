'use client'
import { resetPassword } from '@/lib/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.')
        }
    }, [token])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append('token', token!)
            formData.append('password', password)

            const result = await resetPassword(formData)

            if (result.success) {
                setMessage(result.message)
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
                            Invalid Reset Link
                        </h1>
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                        <div className="mt-6 text-center">
                            <a href="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
                                Request a new password reset
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
                        Set new password
                    </h1>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        Enter your new password below.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="New password (min 8 characters)"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm text-green-600">{message}</p>
                                <p className="text-xs text-green-500 mt-1">
                                    Redirecting to login page in 3 seconds...
                                </p>
                            </div>
                        )}

                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !!message}
                        >
                            {loading ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Sign in here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
