'use client';

import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/input';
import { createOrUpdateProfile } from '@/lib/actions/profile';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
  initialData?: {
    bio?: string | null;
    preferredLocation?: string | null;
    studyStyle?: string | null;
    studyPace?: string | null;
  };
  onSuccess?: () => void;
}

const studyLocations = [
  { value: '', label: 'Select location...' },
  { value: 'library', label: 'Library' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'dorm', label: 'Dorm Room' },
  { value: 'online', label: 'Online' },
  { value: 'other', label: 'Other' },
];

const studyStyles = [
  { value: '', label: 'Select style...' },
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'quiet', label: 'Quiet' },
  { value: 'mixed', label: 'Mixed' },
];

const studyPaces = [
  { value: '', label: 'Select pace...' },
  { value: 'fast', label: 'Fast' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'slow', label: 'Slow' },
];

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setSuccess(false);

    startTransition(async () => {
      const result = await createOrUpdateProfile(formData);

      if (result.success) {
        setSuccess(true);
        // Refresh the page data
        router.refresh();
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setErrors({
          general: result.error || 'Failed to save profile',
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Profile saved successfully!
        </div>
      )}

      <div>
        <Textarea
          label="Bio"
          name="bio"
          placeholder="Tell us about yourself and your study goals..."
          rows={4}
          defaultValue={initialData?.bio || ''}
          error={errors.bio}
          helperText="Optional: Share a bit about yourself (max 500 characters)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            label="Preferred Study Location"
            name="preferredLocation"
            options={studyLocations}
            defaultValue={initialData?.preferredLocation || ''}
            error={errors.preferredLocation}
            helperText="Where do you prefer to study?"
          />
        </div>

        <div>
          <Select
            label="Study Style"
            name="studyStyle"
            options={studyStyles}
            defaultValue={initialData?.studyStyle || ''}
            error={errors.studyStyle}
            helperText="How do you like to study?"
          />
        </div>

        <div>
          <Select
            label="Study Pace"
            name="studyPace"
            options={studyPaces}
            defaultValue={initialData?.studyPace || ''}
            error={errors.studyPace}
            helperText="What's your preferred pace?"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isPending} fullWidth={false}>
          Save Profile
        </Button>
      </div>
    </form>
  );
}
