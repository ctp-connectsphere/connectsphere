'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/nexus';
import { addUserTopic, removeUserTopic, searchTopics } from '@/lib/actions/topics';

interface Topic {
  id: string;
  name: string;
  category: string;
  description: string | null;
  icon: string | null;
}

interface UserTopic {
  id: string;
  topicId: string;
  proficiency: string | null;
  interest: string | null;
  topic: Topic;
}

interface TopicSelectorProps {
  selectedTopics?: UserTopic[];
  onSelectionChange?: (selected: UserTopic[]) => void;
  multiSelect?: boolean;
  showCategories?: boolean;
}

export function TopicSelector({ 
  selectedTopics = [], 
  onSelectionChange,
  multiSelect = true,
  showCategories = true 
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userTopics, setUserTopics] = useState<UserTopic[]>(selectedTopics);

  useEffect(() => {
    loadTopics();
    if (selectedTopics.length > 0) {
      setUserTopics(selectedTopics);
    }
  }, []);

  useEffect(() => {
    filterTopics();
  }, [searchQuery, selectedCategory, topics]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('limit', '100');
      const result = await searchTopics(formData);
      if (result.success && result.data) {
        setTopics(result.data.topics);
        setFilteredTopics(result.data.topics);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTopics = () => {
    let filtered = topics;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    setFilteredTopics(filtered);
  };

  const isSelected = (topicId: string) => {
    return userTopics.some(ut => ut.topicId === topicId);
  };

  const handleTopicToggle = async (topic: Topic) => {
    const isCurrentlySelected = isSelected(topic.id);

    if (isCurrentlySelected) {
      // Remove topic
      try {
        const formData = new FormData();
        formData.append('topicId', topic.id);
        const result = await removeUserTopic(formData);
        if (result.success) {
          setUserTopics(prev => prev.filter(ut => ut.topicId !== topic.id));
          if (onSelectionChange) {
            onSelectionChange(userTopics.filter(ut => ut.topicId !== topic.id));
          }
        }
      } catch (error) {
        console.error('Failed to remove topic:', error);
      }
    } else {
      // Add topic
      try {
        const formData = new FormData();
        formData.append('topicId', topic.id);
        const result = await addUserTopic(formData);
        if (result.success && result.data) {
          setUserTopics(prev => [...prev, result.data.userTopic]);
          if (onSelectionChange) {
            onSelectionChange([...userTopics, result.data.userTopic]);
          }
        }
      } catch (error) {
        console.error('Failed to add topic:', error);
      }
    }
  };

  const categories = ['all', 'skill', 'interest', 'subject'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-400">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {showCategories && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Topics */}
      {userTopics.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Selected ({userTopics.length})</h3>
          <div className="flex flex-wrap gap-2">
            {userTopics.map((ut) => (
              <Badge
                key={ut.id}
                color={ut.topic.category === 'skill' ? 'cyan' : ut.topic.category === 'interest' ? 'pink' : 'indigo'}
                className="cursor-pointer hover:opacity-80"
                onClick={() => handleTopicToggle(ut.topic)}
              >
                {ut.topic.name}
                <X size={14} className="ml-2" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTopics.map((topic) => {
          const selected = isSelected(topic.id);
          const getColorClasses = (category: string, isSelected: boolean) => {
            if (!isSelected) {
              return 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-indigo-400/50';
            }
            switch (category) {
              case 'skill':
                return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105';
              case 'interest':
                return 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50 scale-105';
              case 'subject':
                return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105';
              default:
                return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105';
            }
          };

          return (
            <button
              key={topic.id}
              onClick={() => handleTopicToggle(topic)}
              className={`p-4 rounded-2xl font-semibold transition-all duration-300 text-left ${getColorClasses(topic.category, selected)}`}
            >
              <div className="text-sm font-bold mb-1">{topic.name}</div>
              {topic.description && (
                <div className={`text-xs opacity-80 ${selected ? 'text-white' : 'text-gray-500'}`}>
                  {topic.description.length > 50 ? topic.description.substring(0, 50) + '...' : topic.description}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No topics found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}

