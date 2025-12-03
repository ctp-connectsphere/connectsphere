'use client';

import { Badge } from '@/components/ui/badge';
import {
  addUserTopic,
  createTopic,
  removeUserTopic,
  searchTopics,
} from '@/lib/actions/topics';
import { Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  multiSelect: _multiSelect = true,
  showCategories = true,
}: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userTopics, setUserTopics] = useState<UserTopic[]>(selectedTopics);

  // Custom topic creation state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');
  const [customTopicCategory, setCustomTopicCategory] = useState<
    'skill' | 'interest' | 'subject'
  >('skill');
  const [customTopicDescription, setCustomTopicDescription] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

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
      filtered = filtered.filter(
        t =>
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
          const updatedTopics = userTopics.filter(
            ut => ut.topicId !== topic.id
          );
          setUserTopics(updatedTopics);
          if (onSelectionChange) {
            onSelectionChange(updatedTopics);
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
          const updatedTopics = [...userTopics, result.data.userTopic];
          setUserTopics(updatedTopics);
          if (onSelectionChange) {
            onSelectionChange(updatedTopics);
          }
        }
      } catch (error) {
        console.error('Failed to add topic:', error);
      }
    }
  };

  const handleCreateCustomTopic = async () => {
    if (!customTopicName.trim() || customTopicName.trim().length < 2) {
      return;
    }

    setCreatingTopic(true);
    try {
      const formData = new FormData();
      formData.append('name', customTopicName.trim());
      formData.append('category', customTopicCategory);
      if (customTopicDescription.trim()) {
        formData.append('description', customTopicDescription.trim());
      }

      const result = await createTopic(formData);

      if (result.success && result.data) {
        // Add to user topics list
        const updatedTopics = [...userTopics, result.data.userTopic];
        setUserTopics(updatedTopics);
        if (onSelectionChange) {
          onSelectionChange(updatedTopics);
        }

        // Reset form
        setCustomTopicName('');
        setCustomTopicDescription('');
        setShowCustomForm(false);

        // Refresh topics list to show the new one
        await loadTopics();
      } else {
        alert(result.error || 'Failed to create topic');
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Failed to create topic. Please try again.');
    } finally {
      setCreatingTopic(false);
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
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="relative">
          <Search
            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {showCategories && (
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all min-h-[44px] ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 active:bg-white/15'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Topic Creation Form */}
      {showCustomForm ? (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-white/5 border border-indigo-500/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Add Custom Topic
              </h3>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomTopicName('');
                  setCustomTopicDescription('');
                }}
                className="text-gray-400 hover:text-white active:opacity-70 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Topic name (e.g., 'Machine Learning')"
              value={customTopicName}
              onChange={e => setCustomTopicName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[44px]"
              onKeyDown={e => {
                if (e.key === 'Enter' && customTopicName.trim().length >= 2) {
                  handleCreateCustomTopic();
                }
              }}
            />

            <div className="flex gap-2">
              {(['skill', 'interest', 'subject'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCustomTopicCategory(cat)}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
                    customTopicCategory === cat
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 active:bg-white/15'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Optional description"
              value={customTopicDescription}
              onChange={e => setCustomTopicDescription(e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCreateCustomTopic}
                disabled={
                  creatingTopic ||
                  !customTopicName.trim() ||
                  customTopicName.trim().length < 2
                }
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
              >
                {creatingTopic ? 'Creating...' : 'Create & Add'}
              </button>
              <button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomTopicName('');
                  setCustomTopicDescription('');
                }}
                className="px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 active:bg-white/15 text-sm sm:text-base font-semibold transition-all min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCustomForm(true)}
          className="mb-4 sm:mb-6 w-full py-3 sm:py-3.5 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-400 hover:bg-white/10 active:bg-white/15 hover:border-indigo-400/50 hover:text-white transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]"
        >
          <Plus size={18} />
          <span className="hidden xs:inline">
            Add Custom Topic, Skill, or Subject
          </span>
          <span className="xs:hidden">Add Custom Topic</span>
        </button>
      )}

      {/* Selected Topics */}
      {userTopics.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">
            Selected ({userTopics.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {userTopics.map(ut => (
              <Badge
                key={ut.id}
                color={
                  ut.topic.category === 'skill'
                    ? 'cyan'
                    : ut.topic.category === 'interest'
                      ? 'pink'
                      : 'indigo'
                }
                className="cursor-pointer hover:opacity-80 active:opacity-70 transition-opacity text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] flex items-center"
                onClick={() => handleTopicToggle(ut.topic)}
              >
                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                  {ut.topic.name}
                </span>
                <X size={14} className="ml-1.5 sm:ml-2 flex-shrink-0" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {filteredTopics.map(topic => {
          const selected = isSelected(topic.id);
          const getColorClasses = (category: string, isSelected: boolean) => {
            if (!isSelected) {
              return 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 active:bg-white/15 hover:border-indigo-400/50';
            }
            switch (category) {
              case 'skill':
                return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50 sm:scale-105';
              case 'interest':
                return 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50 sm:scale-105';
              case 'subject':
                return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 sm:scale-105';
              default:
                return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 sm:scale-105';
            }
          };

          return (
            <button
              key={topic.id}
              onClick={() => handleTopicToggle(topic)}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-left min-h-[80px] sm:min-h-[100px] ${getColorClasses(topic.category, selected)}`}
            >
              <div className="text-xs sm:text-sm font-bold mb-1 line-clamp-2">
                {topic.name}
              </div>
              {topic.description && (
                <div
                  className={`text-[10px] sm:text-xs opacity-80 line-clamp-2 ${selected ? 'text-white' : 'text-gray-500'}`}
                >
                  {topic.description.length > 50
                    ? topic.description.substring(0, 50) + '...'
                    : topic.description}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredTopics.length === 0 && !showCustomForm && (
        <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
          <div className="text-sm sm:text-base text-gray-500 px-4">
            No topics found. Try adjusting your search or filters.
          </div>
          <button
            onClick={() => setShowCustomForm(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold hover:opacity-90 active:opacity-80 transition-all inline-flex items-center gap-2 min-h-[44px]"
          >
            <Plus size={18} />
            Add Your Own Topic
          </button>
        </div>
      )}
    </div>
  );
}
