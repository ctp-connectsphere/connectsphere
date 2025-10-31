'use client';

import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    } catch (error) {
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
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === 'verifying' && 'Verifying your email address...'}
            {status === 'success' && 'Verification Successful'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Verification Link Expired'}
            {status === 'already-verified' && 'Already Verified'}
            {status === 'idle' && 'Verify your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-secondary">Verifying...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-body text-primary">{message}</p>
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 text-center transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{message}</p>
              </div>
              {email && (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              <Link
                href="/login"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded py-2 px-4 text-center transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">{message}</p>
              </div>
              {email && (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              <Link
                href="/login"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded py-2 px-4 text-center transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === 'already-verified' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 text-center transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'idle' && !token && (
            <div className="space-y-4">
              <p className="text-body text-secondary">
                No verification token found. Please check your email for the
                verification link.
              </p>
              {email && (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
              <Link
                href="/login"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded py-2 px-4 text-center transition-colors"
              >
                Back to Login
              </Link>
            </div>
          )}

          {status === 'idle' && token && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-secondary">Processing...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
