'use client';

import { useEffect, useState } from 'react';
import { getUserTopics } from '@/lib/actions/topics';
import { Badge } from '@/components/nexus';

export function UserTopicsDisplay() {
  const [userTopics, setUserTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const result = await getUserTopics();
      if (result.success && result.data) {
        setUserTopics(result.data.userTopics);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading topics...</div>;
  }

  if (userTopics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No topics selected yet</p>
        <a href="/topics" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
          Add topics →
        </a>
      </div>
    );
  }

  const getBadgeColor = (category: string): 'cyan' | 'pink' | 'indigo' | 'gray' => {
    switch (category) {
      case 'skill':
        return 'cyan';
      case 'interest':
        return 'pink';
      case 'subject':
        return 'indigo';
      default:
        return 'gray';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {userTopics.slice(0, 12).map((ut) => {
        const color = getBadgeColor(ut.topic.category);
        return (
          <Badge key={ut.id} color={color}>
            {ut.topic.name}
          </Badge>
        );
      })}
      {userTopics.length > 12 && (
        <Badge color="gray">
          +{userTopics.length - 12} more
        </Badge>
      )}
    </div>
  );
}

