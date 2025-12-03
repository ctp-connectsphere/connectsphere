'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GlowingButton } from '@/components/ui/glowing-button';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'expired' | 'already-verified' | 'idle'
  >('idle');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (verificationToken: string) => {
    setLoading(true);
    setStatus('verifying');

    try {
      const formData = new FormData();
      formData.append('token', verificationToken);
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(
          result.message || 'Your email has been verified successfully!'
        );
      } else {
        if (result.errorType === 'EXPIRED') {
          setStatus('expired');
        } else if (result.errorType === 'ALREADY_VERIFIED') {
          setStatus('already-verified');
        } else {
          setStatus('error');
        }
        setMessage(result.message || 'Verification failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage('Email address is required to resend verification.');
      return;
    }
    setResending(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setMessage(
          result.message ||
            'Verification email has been sent. Please check your inbox.'
        );
      } else {
        setMessage(
          result.message ||
            'Failed to resend verification email. Please try again.'
        );
      }
    } catch {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="glass-panel p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-white/10">
          <div className="text-center mb-6 sm:mb-8">
            {status === 'success' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-green-500/50">
                <CheckCircle
                  size={36}
                  className="text-green-400 sm:w-12 sm:h-12"
                />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-red-500/50">
                <XCircle size={36} className="text-red-400 sm:w-12 sm:h-12" />
              </div>
            )}
            {status === 'expired' && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-yellow-500/50">
                <Clock size={36} className="text-yellow-400 sm:w-12 sm:h-12" />
              </div>
            )}
            {(status === 'idle' || status === 'verifying') && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-indigo-500/50">
                <Mail size={36} className="text-indigo-400 sm:w-12 sm:h-12" />
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3">
              Email Verification
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              {status === 'verifying' && 'Verifying your email address...'}
              {status === 'success' && 'Verification Successful'}
              {status === 'error' && 'Verification Failed'}
              {status === 'expired' && 'Link Expired'}
              {status === 'already-verified' && 'Already Verified'}
              {status === 'idle' && 'Verify your email address'}
            </p>
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-400">Verifying...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-6">
                <p className="text-gray-300 text-lg">{message}</p>
                <GlowingButton href="/login" className="w-full">
                  Go to Login
                </GlowingButton>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="space-y-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-sm text-red-400">{message}</p>
                </div>
                {email && (
                  <GlowingButton
                    onClick={handleResend}
                    className="w-full"
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </GlowingButton>
                )}
                <Link
                  href="/login"
                  className="block text-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            )}

            {status === 'already-verified' && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-blue-400">{message}</p>
                </div>
                <GlowingButton href="/login" className="w-full">
                  Go to Login
                </GlowingButton>
              </div>
            )}

            {status === 'idle' && !token && (
              <div className="space-y-6">
                <p className="text-gray-300 text-center">
                  No verification token found. Please check your email for the
                  verification link.
                </p>
                {email && (
                  <GlowingButton
                    onClick={handleResend}
                    className="w-full"
                    disabled={resending}
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </GlowingButton>
                )}
                <Link
                  href="/login"
                  className="block text-center text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050508]">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
