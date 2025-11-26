import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'indigo' | 'purple' | 'pink' | 'cyan' | 'emerald' | 'orange' | 'blue' | 'amber' | 'gray';
}

const colorClasses: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  gray: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
};

export const Badge = ({ children, color = 'indigo' }: BadgeProps) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide backdrop-blur-md border ${colorClasses[color]}`}>
    {children}
  </span>
);

