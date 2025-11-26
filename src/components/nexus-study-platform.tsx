'use client';

import { LandingView } from './nexus';

export default function ConnectSpherePlatform() {
  return (
    <div className="w-full h-screen bg-[#050508] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[100px] animate-pulse-glow animation-delay-2000"></div>
        <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[80px] animate-pulse-glow animation-delay-4000"></div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full">
        <LandingView />
      </main>
    </div>
  );
}

// Export other views for use in separate pages
export { ChatView, DashboardView, MatchView, OnboardingView } from './nexus';

