'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  User, Bell, Lock, Monitor, ShieldAlert, 
  ChevronRight, LogOut, Trash2, Mail, Key, Eye, EyeOff
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { 
  changePassword, 
  deleteAccount, 
  getUserSettings,
  updateNotifications,
  updatePrivacy,
  updateAppearance 
} from '@/lib/actions/settings';
import { GlowingButton } from '@/components/nexus';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    newMatches: true,
    sessionReminders: true,
    marketingEmails: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showOnlineStatus: true,
    allowMatching: true,
  });
  const [appearance, setAppearance] = useState({
    darkMode: true,
    animations: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      loadSettings();
    }
  }, [status, router]);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const result = await getUserSettings();
      if (result.success && result.data) {
        setNotifications(result.data.notifications);
        setPrivacy(result.data.privacy);
        setAppearance(result.data.appearance);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const menuItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert, danger: true },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      const formData = new FormData();
      formData.append('currentPassword', passwordForm.currentPassword);
      formData.append('newPassword', passwordForm.newPassword);
      
      const result = await changePassword(formData);
      
      if (result.success) {
        setPasswordSuccess(result.message || 'Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      const formData = new FormData();
      formData.append('confirm', deleteConfirm);
      
      const result = await deleteAccount(formData);
      
      if (result.success) {
        // Sign out and redirect
        await signOut({ callbackUrl: '/login' });
      } else {
        setDeleteError(result.error || 'Failed to delete account');
      }
    } catch (error) {
      setDeleteError('An unexpected error occurred');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      
      {/* --- Layout Container --- */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        
        {/* 1. Settings Sidebar (左侧导航) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-500 text-sm mb-8">Manage your preferences</p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-[#1a1a1a] text-white shadow-md border border-gray-800' 
                      : 'text-gray-400 hover:text-white hover:bg-[#121212]'
                  } ${item.danger && activeTab !== item.id ? 'text-red-400 hover:text-red-300' : ''}`}
                >
                  <Icon size={18} className={item.danger && activeTab !== item.id ? 'text-red-500' : ''} />
                  {item.label}
                  {activeTab === item.id && <ChevronRight size={14} className="ml-auto text-gray-500" />}
                </button>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="mt-8 pt-8 border-t border-gray-900">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 text-sm text-gray-500 hover:text-white transition"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* 2. Content Area (右侧内容区) */}
        <main className="flex-1 bg-[#121212] border border-gray-900 rounded-3xl p-6 md:p-8 min-h-[600px]">
          
          {/* --- Tab: Account --- */}
          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Account Information</h2>
                <p className="text-gray-500 text-sm">Update your login details and email.</p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <div className="flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3">
                    <Mail size={18} className="text-gray-500"/>
                    <input 
                      type="email" 
                      value={session?.user?.email || ''} 
                      disabled
                      className="bg-transparent flex-1 outline-none text-white text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Password</label>
                    <div className="relative flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3">
                      <Key size={18} className="text-gray-500"/>
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'} 
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="••••••••" 
                        className="bg-transparent flex-1 outline-none text-white text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-gray-500 hover:text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">New Password</label>
                    <div className="relative flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3">
                      <Key size={18} className="text-gray-500"/>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="At least 8 characters" 
                        className="bg-transparent flex-1 outline-none text-white text-sm"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-gray-500 hover:text-gray-400"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Confirm New Password</label>
                    <div className="flex items-center gap-3 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3">
                      <Key size={18} className="text-gray-500"/>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password" 
                        className="bg-transparent flex-1 outline-none text-white text-sm"
                        required
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-red-400 text-sm">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-400 text-sm">{passwordSuccess}</div>
                  )}

                  <div className="pt-4">
                    <GlowingButton 
                      type="submit"
                      disabled={passwordLoading}
                      loading={passwordLoading}
                    >
                      Save Changes
                    </GlowingButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- Tab: Notifications --- */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Notifications</h2>
                <p className="text-gray-500 text-sm">Choose what you want to be notified about.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                {/* Toggle Item */}
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-white font-medium">New Matches</h3>
                    <p className="text-gray-500 text-sm">Get notified when someone swipes right on you.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !notifications.newMatches;
                      setNotifications({ ...notifications, newMatches: newValue });
                      const formData = new FormData();
                      formData.append('newMatches', String(newValue));
                      formData.append('sessionReminders', String(notifications.sessionReminders));
                      formData.append('marketingEmails', String(notifications.marketingEmails));
                      await updateNotifications(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      notifications.newMatches ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      notifications.newMatches ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-white font-medium">Study Session Reminders</h3>
                    <p className="text-gray-500 text-sm">Receive alerts 15 minutes before a session starts.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !notifications.sessionReminders;
                      setNotifications({ ...notifications, sessionReminders: newValue });
                      const formData = new FormData();
                      formData.append('newMatches', String(notifications.newMatches));
                      formData.append('sessionReminders', String(newValue));
                      formData.append('marketingEmails', String(notifications.marketingEmails));
                      await updateNotifications(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      notifications.sessionReminders ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      notifications.sessionReminders ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-white font-medium">Marketing Emails</h3>
                    <p className="text-gray-500 text-sm">Receive news about new features and updates.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !notifications.marketingEmails;
                      setNotifications({ ...notifications, marketingEmails: newValue });
                      const formData = new FormData();
                      formData.append('newMatches', String(notifications.newMatches));
                      formData.append('sessionReminders', String(notifications.sessionReminders));
                      formData.append('marketingEmails', String(newValue));
                      await updateNotifications(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      notifications.marketingEmails ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      notifications.marketingEmails ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Tab: Privacy --- */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Privacy Settings</h2>
                <p className="text-gray-500 text-sm">Control who can see your information.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-white font-medium">Profile Visibility</h3>
                    <p className="text-gray-500 text-sm">Allow others to find and view your profile.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !privacy.profileVisibility;
                      setPrivacy({ ...privacy, profileVisibility: newValue });
                      const formData = new FormData();
                      formData.append('profileVisibility', String(newValue));
                      formData.append('showOnlineStatus', String(privacy.showOnlineStatus));
                      formData.append('allowMatching', String(privacy.allowMatching));
                      await updatePrivacy(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      privacy.profileVisibility ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      privacy.profileVisibility ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-white font-medium">Show Online Status</h3>
                    <p className="text-gray-500 text-sm">Display when you're active on the platform.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !privacy.showOnlineStatus;
                      setPrivacy({ ...privacy, showOnlineStatus: newValue });
                      const formData = new FormData();
                      formData.append('profileVisibility', String(privacy.profileVisibility));
                      formData.append('showOnlineStatus', String(newValue));
                      formData.append('allowMatching', String(privacy.allowMatching));
                      await updatePrivacy(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      privacy.showOnlineStatus ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      privacy.showOnlineStatus ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-white font-medium">Allow Matching</h3>
                    <p className="text-gray-500 text-sm">Let others discover you through matching.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !privacy.allowMatching;
                      setPrivacy({ ...privacy, allowMatching: newValue });
                      const formData = new FormData();
                      formData.append('profileVisibility', String(privacy.profileVisibility));
                      formData.append('showOnlineStatus', String(privacy.showOnlineStatus));
                      formData.append('allowMatching', String(newValue));
                      await updatePrivacy(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      privacy.allowMatching ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      privacy.allowMatching ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Tab: Appearance --- */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1">Appearance</h2>
                <p className="text-gray-500 text-sm">Customize how ConnectSphere looks.</p>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-white font-medium">Dark Mode</h3>
                    <p className="text-gray-500 text-sm">Use dark theme (always enabled).</p>
                  </div>
                  <div className="w-11 h-6 bg-indigo-600 rounded-full relative cursor-not-allowed opacity-50">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-white font-medium">Animations</h3>
                    <p className="text-gray-500 text-sm">Enable smooth transitions and animations.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const newValue = !appearance.animations;
                      setAppearance({ ...appearance, animations: newValue });
                      const formData = new FormData();
                      formData.append('darkMode', String(appearance.darkMode));
                      formData.append('animations', String(newValue));
                      await updateAppearance(formData);
                    }}
                    className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                      appearance.animations ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      appearance.animations ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Tab: Danger Zone --- */}
          {activeTab === 'danger' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <h2 className="text-xl font-bold mb-1 text-red-500">Danger Zone</h2>
                <p className="text-gray-500 text-sm">Irreversible actions. Please proceed with caution.</p>
              </div>

              <div className="border border-red-900/30 bg-red-900/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-900/20 rounded-xl text-red-500">
                    <Trash2 size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">Delete Account</h3>
                    <p className="text-red-200/60 text-sm mt-1 mb-4">
                      Once you delete your account, there is no going back. All your matches, messages, and data will be permanently removed.
                    </p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => {
                          setDeleteConfirm(e.target.value);
                          setDeleteError('');
                        }}
                        placeholder="Type DELETE to confirm"
                        className="w-full px-4 py-2 bg-[#0a0a0a] border border-red-900/50 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                      />
                      {deleteError && (
                        <div className="text-red-400 text-sm">{deleteError}</div>
                      )}
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
