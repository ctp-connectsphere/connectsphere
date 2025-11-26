'use client';
import { resetPassword } from '@/lib/actions/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { GlowingButton } from '@/components/nexus';
import { ArrowLeft, Lock } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('token', token!);
      formData.append('password', password);
      const result = await resetPassword(formData);

      if (result.success) {
        setMessage(result.message);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508] py-12 px-4">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl border border-white/10">
          <h1 className="text-4xl font-black text-white mb-6 text-center">Invalid Reset Link</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <a href="/forgot-password" className="block text-center text-indigo-400 hover:text-indigo-300 font-medium">
            Request a new password reset
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="glass-panel p-10 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Set New Password</h1>
            <p className="text-gray-400">Enter your new password below</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                placeholder="New password (min 8 characters)"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
                placeholder="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
                <p className="text-xs text-green-300 mt-2">Redirecting to login page in 3 seconds...</p>
              </div>
            )}

            <GlowingButton type="submit" className="w-full" disabled={loading || !!message}>
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
