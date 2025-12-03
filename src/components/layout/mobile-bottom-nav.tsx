'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Heart,
  Users,
  BookOpen,
  MessageCircle,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Only 3 main navigation items in bottom bar
  const mainNavItems = [
    { name: 'Matches', href: '/matches', icon: Heart },
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  ];

  // Additional items grouped in "More" menu
  const moreNavItems = [
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Groups', href: '/groups', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
  ];

  const userName = session?.user?.name?.split(' ')[0] || 'User';
  const userInitials = userName.charAt(0).toUpperCase();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedOutsideUserMenu =
        userMenuRef.current && !userMenuRef.current.contains(target);
      const clickedOutsideMoreMenu =
        moreMenuRef.current && !moreMenuRef.current.contains(target);

      if (showUserMenu && clickedOutsideUserMenu) {
        setShowUserMenu(false);
      }
      if (showMoreMenu && clickedOutsideMoreMenu) {
        setShowMoreMenu(false);
      }
    };

    if (showUserMenu || showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showUserMenu, showMoreMenu]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const isUserMenuActive =
    pathname === '/profile' ||
    pathname === '/settings' ||
    pathname.startsWith('/profile/') ||
    pathname.startsWith('/settings/');

  const isMoreMenuActive =
    pathname === '/chat' ||
    pathname === '/groups' ||
    pathname === '/courses' ||
    pathname.startsWith('/chat/') ||
    pathname.startsWith('/groups/') ||
    pathname.startsWith('/courses/');

  return (
    <>
      {/* User Menu Popup */}
      {showUserMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setShowUserMenu(false)}
          />
          {/* Menu - Much more opaque */}
          <div
            ref={userMenuRef}
            className="fixed bottom-20 left-4 right-4 z-50 md:hidden rounded-2xl border border-white/30 shadow-2xl shadow-black/90 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{
              background: 'rgba(18, 18, 26, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div className="p-2">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-white/30 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={20} />
                <span className="font-medium text-sm">Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-200 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={20} />
                <span className="font-medium text-sm">Settings</span>
              </Link>
              <div className="h-px bg-white/30 my-1"></div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* More Menu Popup */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          {/* Menu - Much more opaque */}
          <div
            ref={moreMenuRef}
            className="fixed bottom-20 left-4 right-4 z-50 md:hidden rounded-2xl border border-white/30 shadow-2xl shadow-black/90 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{
              background: 'rgba(18, 18, 26, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div className="p-2">
              <div className="px-4 py-2 mb-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  More
                </div>
              </div>
              {moreNavItems.map(item => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-200 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation - Only 3 items */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#121212] border-t border-white/10 backdrop-blur-xl">
        <div className="flex justify-around items-center h-16 px-2">
          {/* Main Navigation Items */}
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={24} className="mb-1" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={() => {
              setShowMoreMenu(!showMoreMenu);
              setShowUserMenu(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isMoreMenuActive || showMoreMenu
                ? 'text-indigo-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <MoreHorizontal
              size={24}
              className={`mb-1 ${showMoreMenu ? 'ring-2 ring-indigo-400/50 rounded-full' : ''}`}
            />
            <span className="text-[10px] font-medium">More</span>
          </button>

          {/* User Menu Button */}
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowMoreMenu(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isUserMenuActive || showUserMenu
                ? 'text-indigo-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg mb-1 ${
                showUserMenu ? 'ring-2 ring-indigo-400/50' : ''
              }`}
            >
              {userInitials}
            </div>
            <span className="text-[10px] font-medium">Me</span>
          </button>
        </div>
      </nav>
    </>
  );
};
