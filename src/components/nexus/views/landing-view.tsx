'use client';

import { ArrowRight, Sparkles, BookOpen, Users, Zap } from 'lucide-react';
import { GlowingButton } from '../ui/glowing-button';
import { useState, useEffect } from 'react';

interface FloatingBubble {
  id: number;
  x: number;
  y: number;
  size: number;
  course: string;
  delay: number;
}

export const LandingView = () => {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);

  useEffect(() => {
    const courses = ['CS 301', 'MATH 240', 'PHYS 101', 'CHEM 201', 'BIO 150', 'ENG 200'];
    const newBubbles = courses.map((course, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 60 + Math.random() * 40,
      course,
      delay: Math.random() * 5,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Flowing Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[700px] h-[700px] bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Floating Course Bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute glass-panel rounded-full flex items-center justify-center text-white font-bold text-sm animate-float"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDelay: `${bubble.delay}s`,
            }}
          >
            {bubble.course}
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="z-10 text-center max-w-5xl px-6 relative">
        {/* Status Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
          <span className="text-sm text-gray-200 font-medium">ConnectSphere v2.0 • Live</span>
        </div>

        {/* Main Hero Text */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-none">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-2">
            Find Your
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 via-pink-400 to-cyan-400 neon-text animate-gradient-x bg-[length:200%_auto]">
            Study Sync
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
          Stop studying alone. Our neural matching algorithm connects you with peers who share your major, vibe, and caffeine addiction.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <GlowingButton href="/login" className="text-lg px-8 py-4">
            Sign In <ArrowRight size={20} className="ml-2" />
          </GlowingButton>
          <GlowingButton href="/register" variant="secondary" className="text-lg px-8 py-4">
            Get Started <Sparkles size={20} className="ml-2" />
          </GlowingButton>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: Users, text: 'Smart Matching' },
            { icon: BookOpen, text: 'Study Groups' },
            { icon: Zap, text: 'Instant Connect' },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 border border-white/10 hover:border-indigo-400/50 transition-all group"
            >
              <feature.icon size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Stats Cards */}
      <div className="absolute left-10 bottom-20 hidden lg:block animate-float glass-panel p-6 rounded-3xl w-72 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
            AS
          </div>
          <div>
            <div className="text-white font-bold text-lg">Alex S.</div>
            <div className="text-xs text-gray-400">CS Major • Night Owl</div>
          </div>
        </div>
        <div className="w-full bg-gray-800/50 h-2 rounded-full mb-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-[94%] h-full rounded-full shadow-lg shadow-green-400/30"></div>
        </div>
        <div className="text-right text-sm text-green-400 font-mono font-bold">94% Match</div>
      </div>

      <div className="absolute right-10 top-32 hidden lg:block animate-float-delayed glass-panel p-6 rounded-3xl w-64 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300 text-sm font-bold">Study Streak</span>
          <Zap size={20} className="text-yellow-400" />
        </div>
        <div className="text-4xl font-black text-white mb-1">12</div>
        <div className="text-xs text-gray-500">Days • Top 5%</div>
      </div>
    </div>
  );
};
