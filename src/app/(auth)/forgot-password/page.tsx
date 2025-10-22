'use client'
import { requestPasswordReset } from '@/lib/actions/auth'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('email', email)

      const result = await requestPasswordReset(formData)

      if (result.success) {
        setMessage(result.message)
        if (result.resetLink) {
          console.log('Reset link:', result.resetLink)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Reset your password
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your university email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="University email (.edu)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {message.includes('http://localhost:3000/reset-password') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium mb-2">🔗 Reset Link (Development Mode):</p>
                    <a 
                      href={message.split('Check the console for the link: ')[1]} 
                      className="text-sm text-blue-600 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {message.split('Check the console for the link: ')[1]}
                    </a>
                    <p className="text-xs text-blue-600 mt-2">Click the link above to reset your password</p>
                  </div>
                )}
              </div>
            )}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send reset link'}
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