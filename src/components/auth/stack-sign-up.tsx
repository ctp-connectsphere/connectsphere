/**
 * Stack Auth Sign Up Component
 * 
 * This component provides a ready-to-use sign-up form using Stack Auth.
 * You can use this to replace the existing registration form.
 * 
 * NOTE: This component will need to be updated once the correct Stack Auth package is installed.
 */

'use client';

// TODO: Update import once correct package is installed
// import { useStackApp } from '@stackframejs/nextjs';
import { useState } from 'react';
import { GlowingButton } from '@/components/nexus';

export function StackSignUp() {
  // TODO: Uncomment once package is installed
  // const stackApp = useStackApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: Uncomment once package is installed
    // try {
    //   await stackApp.signUpWithCredential({
    //     email,
    //     password,
    //     displayName: `${firstName} ${lastName}`,
    //   });
    //   // Email verification and redirect is handled by Stack Auth
    // } catch (err: any) {
    //   setError(err.message || 'Failed to create account. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
    
    // Placeholder - show error for now
    setError('Stack Auth package not installed. Please install the correct package first.');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
            placeholder="Doe"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all backdrop-blur-sm"
          placeholder="At least 8 characters"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}
      <GlowingButton type="submit" loading={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create account'}
      </GlowingButton>
    </form>
  );
}

