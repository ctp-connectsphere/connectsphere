// export default function RegisterPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Or{' '}
//             <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
//               sign in to your existing account
//             </a>
//           </p>
//         </div>
//         <div className="bg-white p-8 rounded-lg shadow">
//           <p className="text-center text-gray-500">
//             Registration form will be implemented here
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import { registerUser } from '@/lib/actions/auth';
import { useState } from 'react';

interface FormErrors {
  [key: string]: string[];
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    university: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [loading, setLoading] = useState(false);

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!form.firstName.trim())
      newErrors.firstName = ['First name is required'];
    if (!form.lastName.trim()) newErrors.lastName = ['Last name is required'];
    if (!form.email.trim()) newErrors.email = ['Email is required'];
    if (!form.password.trim()) newErrors.password = ['Password is required'];
    if (!form.university.trim())
      newErrors.university = ['University is required'];

    // Email format validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    // University email validation
    if (form.email && !form.email.endsWith('.edu')) {
      newErrors.email = ['Please use a university email address (.edu)'];
    }

    // Password strength validation
    if (form.password && form.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters long'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors(null);
    return true;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear specific field error when user starts typing
    if (errors && errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(Object.keys(newErrors).length > 0 ? newErrors : null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors(null);

    // Client-side validation
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await registerUser(fd);

      if (res.success) {
        setMessage(res.message || 'Account created successfully!');
        // Clear form on success
        setForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          university: '',
        });
      } else {
        setErrors(
          (res as any).errors || {
            general: ['Registration failed. Please try again.'],
          }
        );
      }
    } catch (error) {
      setErrors({
        general: ['An unexpected error occurred. Please try again.'],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Create an account
          </h1>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors?.firstName ? 'border-red-500' : 'border-gray-300'}`}
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={onChange}
                required
              />
              {errors?.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.firstName[0]}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors?.lastName ? 'border-red-500' : 'border-gray-300'}`}
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={onChange}
                required
              />
              {errors?.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.lastName[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors?.email ? 'border-red-500' : 'border-gray-300'}`}
                name="email"
                type="email"
                placeholder="University email (.edu)"
                value={form.email}
                onChange={onChange}
                required
              />
              {errors?.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors?.password ? 'border-red-500' : 'border-gray-300'}`}
                name="password"
                type="password"
                placeholder="Password (min 8 characters)"
                value={form.password}
                onChange={onChange}
                required
              />
              {errors?.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            {/* University */}
            <div>
              <input
                className={`w-full border rounded px-3 py-2 ${errors?.university ? 'border-red-500' : 'border-gray-300'}`}
                name="university"
                placeholder="University"
                value={form.university}
                onChange={onChange}
                required
              />
              {errors?.university && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.university[0]}
                </p>
              )}
            </div>

            {/* General Errors */}
            {errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">{errors.general[0]}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-600">{message}</p>
              </div>
            )}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
