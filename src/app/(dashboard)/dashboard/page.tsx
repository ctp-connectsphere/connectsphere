import { Sidebar, navigationItems } from '@/components/navigation/sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex items-stretch">
        {/* Sidebar Navigation */}
        <div className="hidden md:block">
          <Sidebar navItems={navigationItems} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-large-title text-primary mb-2">
                Welcome back, {session.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-body text-secondary">
                Here's what's happening with your study connections today.
              </p>
            </div>

            {/* Email Verification Banner */}
            {session.user && !(session as any).user?.emailVerifiedAt && (
              <Card className="mb-6 border-yellow-200 bg-white text-gray-900 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Please verify your email address
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          We've sent a verification email to{' '}
                          <strong>{session.user.email}</strong>. Please check
                          your inbox and click the verification link to activate
                          your account.
                        </p>
                      </div>
                      <div className="mt-4">
                        <form
                          action={async (formData: FormData) => {
                            'use server';
                            const { resendVerificationEmail } = await import(
                              '@/lib/actions/auth'
                            );
                            await resendVerificationEmail(formData);
                          }}
                        >
                          <input
                            type="hidden"
                            name="email"
                            value={session.user?.email || ''}
                          />
                          <Button
                            type="submit"
                            variant="secondary"
                            size="small"
                          >
                            Resend Verification Email
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white text-gray-900 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Your session is active and secure
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white text-gray-900 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    3 courses enrolled this semester
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white text-gray-900 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    5 potential study partners found
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* User Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white text-gray-900 shadow-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-headline font-semibold">
                        {session.user?.name}
                      </p>
                      <p className="text-subhead text-tertiary">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-caption-1 text-tertiary mb-1">Role</p>
                    <p className="text-body font-medium">
                      {(session as any)?.user?.role || 'Student'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white text-gray-900 shadow-sm">
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                  <CardDescription>
                    Your current session information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-caption-1 text-tertiary mb-1">User ID</p>
                    <p className="text-body font-mono text-sm">
                      {session.user?.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption-1 text-tertiary mb-1">
                      Session Status
                    </p>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-body text-green-600 font-medium">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="destructive" size="small" fullWidth>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white text-gray-900 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with ConnectSphere
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="primary" fullWidth>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Complete Profile
                  </Button>
                  <Button variant="secondary" fullWidth>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Add Courses
                  </Button>
                  <Button variant="secondary" fullWidth>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden">
        <Sidebar navItems={navigationItems} className="tab-bar" />
      </div>
    </div>
  );
}
