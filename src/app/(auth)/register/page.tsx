export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </a>
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-500">
            Registration form will be implemented here
          </p>
        </div>
      </div>
    </div>
  );
}
'use client'
import { registerUser } from '@/src/lib/actions/auth';
import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    university: ''
  })
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null)
  const [loading, setLoading] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setErrors(null)

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    const res = await registerUser(fd)
    if (res.success) setMessage(res.message!)
    if ((res as any).errors) setErrors((res as any).errors)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">Create an account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" name="firstName" placeholder="First name" onChange={onChange} required />
        <input className="w-full border rounded px-3 py-2" name="lastName" placeholder="Last name" onChange={onChange} required />
        <input className="w-full border rounded px-3 py-2" name="email" type="email" placeholder="University email" onChange={onChange} required />
        <input className="w-full border rounded px-3 py-2" name="password" type="password" placeholder="Password" onChange={onChange} required />
        <input className="w-full border rounded px-3 py-2" name="university" placeholder="University" onChange={onChange} required />
        {errors && <pre className="text-sm text-red-600">{JSON.stringify(errors, null, 2)}</pre>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button className="w-full bg-black text-white rounded py-2" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}