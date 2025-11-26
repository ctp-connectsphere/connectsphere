'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { GlowingButton } from '@/components/nexus';

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as keyof typeof errorMessages;

  return (
    <div className="min-h-screen flex bg-[#050508] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-white mb-3">
                Authentication Error
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Something went wrong during the authentication process.
              </p>

              {/* Error Message Card */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-300 font-medium text-sm">
                  {errorMessages[error] || errorMessages.Default}
                </p>
              </div>

              {/* Help Text */}
              <p className="text-gray-500 text-sm mb-8">
                Please try again or contact support if the problem persists.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <GlowingButton
                  href="/login"
                  className="w-full flex items-center justify-center gap-2"
                  variant="primary"
                >
                  Try Again
                  <ArrowRight size={16} />
                </GlowingButton>
                <a
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Create Account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
