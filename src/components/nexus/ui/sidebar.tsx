'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useSidebarSafe } from './sidebar-context';
import {
  Search,
  Settings,
  LogOut,
  User,
  LayoutDashboard,
  Users,
  BookOpen,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className = '' }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [localCollapsed, setLocalCollapsed] = useState(false);

  // Use context if available, otherwise use local state
  const context = useSidebarSafe();
  const isCollapsed = context?.isCollapsed ?? localCollapsed;
  const setIsCollapsed = context?.setIsCollapsed ?? setLocalCollapsed;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Matches', href: '/matches', icon: Heart, badge: 3 },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userName = session?.user?.name?.split(' ')[0] || 'User';
  const userEmail = session?.user?.email || '';
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`fixed left-0 top-0 h-full glass-panel border-r border-white/10 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-72'} ${className}`}
      style={
        {
          '--sidebar-width': isCollapsed ? '5rem' : '18rem',
        } as React.CSSProperties
      }
    >
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all flex-shrink-0">
                  <span className="text-white font-black text-lg">C</span>
                </div>
                <span className="text-xl font-black text-white">
                  Connect
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                    Sphere
                  </span>
                </span>
              </Link>
            )}
            {isCollapsed && (
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all">
                  <span className="text-white font-black text-lg">C</span>
                </div>
              </Link>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Search - Only show when expanded */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'text-white bg-white/10 shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full min-w-[24px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && item.badge > 0 && (
                  <span className="absolute left-8 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section - Drop-up Menu */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-indigo-500/50 transition-all flex-shrink-0">
                {userInitials}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </div>
                  </div>
                  <MoreVertical
                    size={16}
                    className="text-gray-500 group-hover:text-white transition flex-shrink-0"
                  />
                </>
              )}
            </button>

            {/* Drop-up Menu - Appears above the user button */}
            {showUserMenu && !isCollapsed && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                {/* Menu - Positioned above with bottom-full */}
                <div className="absolute bottom-full left-0 right-0 mb-2 glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={18} />
                      <span className="font-medium text-sm">Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={18} />
                      <span className="font-medium text-sm">Settings</span>
                    </Link>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={18} />
                      <span className="font-medium text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
