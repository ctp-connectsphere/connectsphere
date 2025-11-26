'use client';
import { requestPasswordReset } from '@/lib/actions/auth';
import { useState } from 'react';
import { GlowingButton } from '@/components/nexus';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('email', email);
      const result = await requestPasswordReset(formData);

      if (result.success) {
        setMessage(result.message);
        if (result.resetLink) {
          console.log('Reset link:', result.resetLink);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="glass-panel p-10 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Mail size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Reset Password</h1>
            <p className="text-gray-400">
              Enter your university email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                placeholder="University email (.edu)"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-sm text-green-400">{message}</p>
                {message.includes('/reset-password?token=') && (
                  <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <p className="text-sm text-indigo-300 font-medium mb-2">Reset Link:</p>
                    <a
                      href={(message.match(/https?:\/\/[^\s]+\/reset-password\?token=[^\s]+/) || [])[0] || '#'}
                      className="text-sm text-indigo-400 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {(message.match(/https?:\/\/[^\s]+\/reset-password\?token=[^\s]+/) || [])[0] || 'Link unavailable'}
                    </a>
                  </div>
                )}
              </div>
            )}

            <GlowingButton type="submit" onClick={() => {}} className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </GlowingButton>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
