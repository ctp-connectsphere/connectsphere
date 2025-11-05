import { Card } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profile-form';
import { getUserProfile } from '@/lib/actions/profile';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const profileResult = await getUserProfile();
  const profile = profileResult.success ? profileResult.data : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Settings
          </h1>

          <Card className="p-6 bg-white text-gray-900 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Study Preferences
              </h2>
              <p className="text-sm text-gray-600">
                Update your profile to help us find the best study partners for
                you.
              </p>
            </div>

            <ProfileForm
              initialData={{
                bio: profile?.bio || null,
                preferredLocation: profile?.preferredLocation || null,
                studyStyle: profile?.studyStyle || null,
                studyPace: profile?.studyPace || null,
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
