import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard, {session.user?.name}!
              </h1>
              <p className="text-gray-600 mb-6">
                You are successfully authenticated and logged in.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Authentication Status
                </h2>
                <p className="text-green-700">
                  Your session is active and secure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">User Information</h3>
                  <p className="text-blue-700"><strong>Email:</strong> {session.user?.email}</p>
                  <p className="text-blue-700"><strong>Name:</strong> {session.user?.name}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Session Details</h3>
                  <p className="text-purple-700"><strong>User ID:</strong> {session.user?.id}</p>
                  <p className="text-purple-700"><strong>Role:</strong> {session.user?.role || 'Student'}</p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="/api/auth/signout"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
