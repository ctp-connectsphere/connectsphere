// Script to automatically replace console statements with logger
// This is a helper to speed up the replacement process

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Files to skip (already have logger or are scripts)
const skipFiles = ['src/lib/utils/logger.ts', 'scripts'];

// Helper function to check if file should be skipped
function shouldSkip(filePath) {
  return skipFiles.some(skip => filePath.includes(skip));
}

// Replace console statements
function replaceConsoleStatements(content, filePath) {
  // Skip if file already imports logger (or is logger itself)
  if (content.includes("from '@/lib/utils/logger'") || shouldSkip(filePath)) {
    return { content, modified: false };
  }

  let modified = false;
  let newContent = content;

  // Add logger import if there are console statements
  if (newContent.includes('console.')) {
    // Find the last import statement
    const importRegex = /^import .+ from ['"].+['"];?$/gm;
    const imports = newContent.match(importRegex) || [];
    const lastImport = imports[imports.length - 1];

    if (lastImport && !newContent.includes("from '@/lib/utils/logger'")) {
      const insertIndex = newContent.indexOf(lastImport) + lastImport.length;
      newContent =
        newContent.slice(0, insertIndex) +
        "\nimport { logger } from '@/lib/utils/logger';" +
        newContent.slice(insertIndex);
      modified = true;
    }

    // Replace console.log with logger.info or logger.log
    newContent = newContent.replace(
      /console\.log\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        // If it contains emojis or success indicators, use logger.success
        if (match.includes('✅') || match.includes('success')) {
          return `logger.success(${args.replace(/['"]/g, '')})`;
        }
        return `logger.info(${args})`;
      }
    );

    // Replace console.error with logger.error
    newContent = newContent.replace(
      /console\.error\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        return `logger.error(${args})`;
      }
    );

    // Replace console.warn with logger.warn
    newContent = newContent.replace(
      /console\.warn\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        return `logger.warn(${args})`;
      }
    );

    // Replace console.info with logger.info
    newContent = newContent.replace(
      /console\.info\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        return `logger.info(${args})`;
      }
    );

    // Replace console.debug with logger.debug
    newContent = newContent.replace(
      /console\.debug\(([^)]+)\)/g,
      (match, args) => {
        modified = true;
        return `logger.debug(${args})`;
      }
    );
  }

  return { content: newContent, modified };
}

// Main function
async function main() {
  console.log(
    'This script helps identify files that need console replacements.'
  );
  console.log('For safety, manual review is recommended for each replacement.');
}

main().catch(console.error);
