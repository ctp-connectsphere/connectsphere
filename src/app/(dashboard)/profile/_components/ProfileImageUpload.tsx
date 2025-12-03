'use client';

import { Button } from '@/components/ui/button';
import { uploadProfileImage } from '@/lib/actions/profile';
import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  userName: string;
  userId: string;
}

export function ProfileImageUpload({
  currentImageUrl,
  userName,
  userId: _userId,
}: ProfileImageUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(
        'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      );
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('image', file);

      const result = await uploadProfileImage(formData);

      if (result.success) {
        setSuccess(true);
        setPreview(null); // Clear preview after successful upload
        setTimeout(() => setSuccess(false), 3000);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Failed to upload image');
        setPreview(null);
      }
    });
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentImageUrl;
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image
        </label>

        {/* Image Preview/Display */}
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 flex-shrink-0">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={userName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="profile-image-input"
            />
            <label
              htmlFor="profile-image-input"
              className="inline-block cursor-pointer"
            >
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview
                  ? 'Change Image'
                  : currentImageUrl
                    ? 'Change Image'
                    : 'Upload Image'}
              </Button>
            </label>
            {preview && (
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={handleUpload}
                  loading={isPending}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  size="small"
                  onClick={handleRemove}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            Image uploaded successfully!
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500">
          JPEG, PNG, GIF, or WebP. Maximum size: 10MB
        </p>
      </div>
    </div>
  );
}
