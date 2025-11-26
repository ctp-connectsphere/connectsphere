'use client';

import { DashboardView } from '@/components/nexus';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasCompletedOnboarding } from '@/lib/actions/onboarding';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      checkOnboardingStatus();
    }
  }, [status, router]);

  const checkOnboardingStatus = async () => {
    try {
      const result = await hasCompletedOnboarding();
      if (result.success && !result.completed) {
        // User hasn't completed onboarding, redirect to onboarding
        router.push('/onboarding');
        return;
      }
      // User has completed onboarding, allow them to see dashboard
      setChecking(false);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // On error, allow user to see dashboard (better UX than blocking)
      setChecking(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <DashboardView userName={session?.user?.name?.split(' ')[0] || 'User'} />
  );
}
