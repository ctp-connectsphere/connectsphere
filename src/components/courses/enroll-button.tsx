'use client';

import { useState } from 'react';
import { GlowingButton } from '@/components/nexus';
import { enrollInCourse } from '@/lib/actions/courses';

interface EnrollButtonProps {
  courseId: string;
  onEnroll?: () => void;
}

export function EnrollButton({ courseId, onEnroll }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('courseId', courseId);
      const result = await enrollInCourse(formData);
      if (result.success) {
        if (onEnroll) {
          onEnroll();
        }
      } else {
        alert(result.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowingButton
      variant="outline"
      onClick={handleEnroll}
      loading={loading}
      className="text-sm py-2 px-4"
    >
      {loading ? 'Enrolling...' : 'Enroll'}
    </GlowingButton>
  );
}
