// This script helps identify remaining console statements
// Run: npx tsx scripts/fix-remaining-console.ts

const files = [
  'src/lib/actions/dashboard.ts',
  'src/lib/actions/matches.ts',
  'src/lib/actions/messages.ts',
  'src/lib/actions/onboarding.ts',
  'src/lib/actions/settings.ts',
  'src/lib/actions/topics.ts',
];

console.log('Remaining files with console statements:');
files.forEach(file => console.log(`- ${file}`));
