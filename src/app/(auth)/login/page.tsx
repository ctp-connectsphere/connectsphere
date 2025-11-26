'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { GlowingButton } from '@/components/nexus';
import { ArrowRight, Sparkles, BookOpen, Github } from 'lucide-react';

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (email && !email.endsWith('.edu')) {
      newErrors.email = 'Please use your university email address (.edu)';
    }
    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });
      if (res?.error) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (res?.ok) {
        // Redirect to dashboard, which will check onboarding status
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: 'An unexpected response. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050508] relative overflow-hidden">
      {/* Artistic Split - Left Panel (Visual) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl">
            <Sparkles size={20} className="text-indigo-400" />
            <span className="text-white font-medium">Welcome Back</span>
          </div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Ready to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              Connect?
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Join thousands of students finding their perfect study partners
          </p>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-white/10">
                <BookOpen size={24} className="text-indigo-400" />
                <div className="text-left">
                  <div className="text-white font-semibold">Smart Matching</div>
                  <div className="text-gray-400 text-sm">AI-powered compatibility</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white mb-3">
              Sign In
            </h1>
            <p className="text-gray-400">Enter your ConnectSphere credentials</p>
          </div>

          {/* OAuth Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm group"
            >
              <Github size={20} className="text-gray-300 group-hover:text-white transition-colors" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#050508] text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                University Email
              </label>
              <input
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm`}
                placeholder="you@university.edu"
                type="email"
                value={email}
                onChange={e => handleInputChange('email', e.target.value.toLowerCase())}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm`}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-400 mt-2">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400">{errors.general}</p>
              </div>
            )}

            <GlowingButton type="submit" onClick={() => {}} className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </GlowingButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
