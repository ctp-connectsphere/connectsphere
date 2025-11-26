/**
 * Stack Auth Sign In Component
 *
 * This component provides a ready-to-use sign-in form using Stack Auth.
 * You can use this to replace the existing login form.
 *
 * NOTE: This component will need to be updated once the correct Stack Auth package is installed.
 */

'use client';

// TODO: Update import once correct package is installed
// import { useStackApp } from '@stackframejs/nextjs';
import { useState } from 'react';
import { GlowingButton } from '@/components/nexus';

export function StackSignIn() {
  // TODO: Uncomment once package is installed
  // const stackApp = useStackApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: Uncomment once package is installed
    // try {
    //   await stackApp.signInWithCredential({
    //     email,
    //     password,
    //   });
    //   // Redirect is handled by Stack Auth configuration
    // } catch (err: any) {
    //   setError(err.message || 'Failed to sign in. Please check your credentials.');
    // } finally {
    //   setLoading(false);
    // }

    // Placeholder - show error for now
    setError(
      'Stack Auth package not installed. Please install the correct package first.'
    );
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
          placeholder="your.email@university.edu"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      <GlowingButton type="submit" loading={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </GlowingButton>
    </form>
  );
}
