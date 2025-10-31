'use client';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

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

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Required field validation
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';

    // Email format validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // University email validation
    if (email && !email.endsWith('.edu')) {
      newErrors.email = 'Please use your university email address (.edu)';
    }

    // Password length validation
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

    // Clear specific field error when user starts typing
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

    // Client-side validation
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

      console.log('SignIn response:', res); // Debug log

      if (res?.error) {
        console.error('SignIn error:', res.error); // Debug log
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (res?.ok) {
        console.log('SignIn successful, redirecting...'); // Debug log
        // Redirect manually on success
        window.location.href = '/dashboard';
      } else {
        console.log('SignIn unknown response:', res); // Debug log
        setErrors({ general: 'An unexpected response. Please try again.' });
      }
    } catch (error) {
      console.error('SignIn exception:', error); // Debug log
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card variant="elevated" className="p-8">
          <div className="text-center mb-8">
            <Logo size="large" variant="full" className="justify-center mb-6" />
            <h1 className="text-title-1 text-primary mb-2">Welcome back</h1>
            <p className="text-body text-tertiary">
              Sign in to your ConnectSphere account
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email"
                type="email"
                value={email}
                onChange={e =>
                  handleInputChange('email', e.target.value.toLocaleLowerCase())
                }
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.toLowerCase()}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Password"
                type="password"
                value={password}
                onChange={e =>
                  handleInputChange(
                    'password',
                    e.target.value.toLocaleLowerCase()
                  )
                }
                required
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.toLowerCase()}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </a>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">
                  {errors.general.toLowerCase()}
                </p>
              </div>
            )}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Create one here
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
