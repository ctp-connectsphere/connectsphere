'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { createOrUpdateProfile } from '@/lib/actions/profile';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface ProfileFormProps {
  initialData?: {
    bio?: string | null;
    preferredLocation?: string | null;
    studyStyle?: string | null;
    studyPace?: string | null;
  };
  onSuccess?: () => void;
}

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
          className="bg-[#1a1a1a] border-white/10 text-white placeholder-gray-500"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isPending} fullWidth={false}>
          Save Profile
        </Button>
      </div>
    </form>
  );
}
