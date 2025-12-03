'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface ProfileDisplayProps {
  profile: {
    bio?: string | null;
    preferredLocation?: string | null;
    studyStyle?: string | null;
    studyPace?: string | null;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      university: string;
      profileImageUrl?: string | null;
    };
  };
}

const locationLabels: Record<string, string> = {
  library: 'Library',
  cafe: 'Cafe',
  dorm: 'Dorm Room',
  online: 'Online',
  other: 'Other',
};

const styleLabels: Record<string, string> = {
  collaborative: 'Collaborative',
  quiet: 'Quiet',
  mixed: 'Mixed',
};

const paceLabels: Record<string, string> = {
  fast: 'Fast',
  moderate: 'Moderate',
  slow: 'Slow',
};

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const user = profile.user;
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <Card className="p-6 bg-white text-gray-900 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {user?.profileImageUrl ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={user.profileImageUrl}
                alt={fullName}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
            {user?.email && (
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
            )}
            {user?.university && (
              <p className="text-gray-600 text-sm">{user.university}</p>
            )}
          </div>

          {profile.bio && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Study Preferences */}
          {(profile.preferredLocation ||
            profile.studyStyle ||
            profile.studyPace) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {profile.preferredLocation && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Study Location
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {locationLabels[profile.preferredLocation] ||
                      profile.preferredLocation}
                  </p>
                </div>
              )}

              {profile.studyStyle && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Study Style
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {styleLabels[profile.studyStyle] || profile.studyStyle}
                  </p>
                </div>
              )}

              {profile.studyPace && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Study Pace
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {paceLabels[profile.studyPace] || profile.studyPace}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
