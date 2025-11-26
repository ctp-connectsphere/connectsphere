'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { TopicSelector } from '@/components/topics/topic-selector';
import { getUserTopics } from '@/lib/actions/topics';
import { Badge } from '@/components/nexus/ui/badge';

export default function TopicsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [userTopics, setUserTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    loadUserTopics();
  }, [status, router]);

  const loadUserTopics = async () => {
    try {
      setLoading(true);
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

  if (status === 'loading' || loading) {
    return (
      <div className="w-full h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">My Topics</h1>
              <p className="text-gray-400">
                Manage your skills, interests, and subjects
              </p>
            </div>
          </div>
        </div>

        {/* Current Topics */}
        {userTopics.length > 0 && (
          <div className="glass-panel rounded-3xl p-8 mb-8 border border-white/10">
            <h2 className="text-2xl font-black text-white mb-6">
              Your Selected Topics ({userTopics.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {userTopics.map(ut => {
                const getColorClasses = (category: string) => {
                  switch (category) {
                    case 'skill':
                      return 'bg-cyan-500/10 border-cyan-500/20';
                    case 'interest':
                      return 'bg-pink-500/10 border-pink-500/20';
                    case 'subject':
                      return 'bg-indigo-500/10 border-indigo-500/20';
                    default:
                      return 'bg-gray-500/10 border-gray-500/20';
                  }
                };
                const getBadgeColor = (
                  category: string
                ): 'cyan' | 'pink' | 'indigo' | 'gray' => {
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
                const color = getBadgeColor(ut.topic.category);

                return (
                  <div
                    key={ut.id}
                    className={`px-4 py-2 rounded-xl ${getColorClasses(ut.topic.category)} flex items-center gap-2`}
                  >
                    <span className="text-white font-semibold">
                      {ut.topic.name}
                    </span>
                    {ut.proficiency && (
                      <Badge color={color} className="text-xs">
                        {ut.proficiency}
                      </Badge>
                    )}
                    {ut.interest && (
                      <Badge color={color} className="text-xs">
                        {ut.interest}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Topic Selector */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-black text-white mb-6">
            Browse & Add Topics
          </h2>
          <TopicSelector
            selectedTopics={userTopics}
            onSelectionChange={selected => {
              setUserTopics(selected);
            }}
            showCategories={true}
          />
        </div>
      </div>
    </div>
  );
}
