'use client'
import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}

    // Required field validation
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password.trim()) newErrors.password = 'Password is required'

    // Email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)

    // Clear specific field error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Client-side validation
    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if ((res as any)?.error) {
        setErrors({ general: 'Invalid email or password. Please try again.' })
      } else if (res?.ok) {
        // Redirect manually on success
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Sign in to your account</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email"
                type="email"
                value={email}
                onChange={e => handleInputChange('email', e.target.value)}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}