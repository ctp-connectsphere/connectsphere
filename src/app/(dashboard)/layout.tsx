'use client';

import { Sidebar } from '@/components/nexus';
import {
  SidebarProvider,
  useSidebar,
} from '@/components/nexus/ui/sidebar-context';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="w-full h-screen bg-[#050508] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[80px] animate-pulse-glow animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`relative z-10 h-full overflow-y-auto transition-all duration-300 pl-6 pr-6 ${isCollapsed ? 'ml-20' : 'ml-72'}`}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="w-full h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
