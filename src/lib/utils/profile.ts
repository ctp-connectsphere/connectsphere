/**
 * Profile utility functions
 */

export interface ProfileCompletionData {
  hasBio: boolean;
  hasPreferredLocation: boolean;
  hasStudyStyle: boolean;
  hasStudyPace: boolean;
  hasProfileImage: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  completed: number;
  total: number;
  missing: string[];
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(
  data: ProfileCompletionData
): ProfileCompletionResult {
  const fields = [
    { key: 'hasBio', name: 'Bio', value: data.hasBio },
    {
      key: 'hasPreferredLocation',
      name: 'Study Location',
      value: data.hasPreferredLocation,
    },
    { key: 'hasStudyStyle', name: 'Study Style', value: data.hasStudyStyle },
    { key: 'hasStudyPace', name: 'Study Pace', value: data.hasStudyPace },
    {
      key: 'hasProfileImage',
      name: 'Profile Image',
      value: data.hasProfileImage,
    },
  ];

  const completed = fields.filter(f => f.value).length;
  const total = fields.length;
  const percentage = Math.round((completed / total) * 100);
  const missing = fields.filter(f => !f.value).map(f => f.name);

  return {
    percentage,
    completed,
    total,
    missing,
  };
}

/**
 * Get profile completion status text
 */
export function getCompletionStatus(
  percentage: number
): 'incomplete' | 'partial' | 'complete' {
  if (percentage === 100) return 'complete';
  if (percentage >= 60) return 'partial';
  return 'incomplete';
}

/**
 * Get completion message
 */
export function getCompletionMessage(
  completion: ProfileCompletionResult
): string {
  if (completion.percentage === 100) {
    return 'Your profile is complete!';
  }

  if (completion.missing.length === 1) {
    return `Add your ${completion.missing[0].toLowerCase()} to complete your profile.`;
  }

  if (completion.missing.length > 0) {
    return `Complete your profile by adding: ${completion.missing.join(', ').toLowerCase()}.`;
  }

  return 'Complete your profile to get better matches.';
}
