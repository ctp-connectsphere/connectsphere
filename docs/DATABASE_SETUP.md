# Database Setup Guide

## Required Tables

This application requires the following database tables. If you encounter errors about missing tables, run the corresponding migration script.

### 1. user_topics Table

**Error:** `The table public.user_topics does not exist in the current database.`

**Solution:** Run the migration script:

```bash
npx tsx scripts/create-user-topics-table.ts
```

This script will:
- Create the `user_topics` table with proper schema
- Add foreign key constraints to `users` and `topics` tables
- Create indexes for better query performance

### 2. user_courses.status Column

**Error:** `The column user_courses.status does not exist in the current database.`

**Solution:** Run the migration script:

```bash
npx tsx scripts/add-status-to-user-courses.ts
```

This script will:
- Add the `status` column to `user_courses` table
- Set default value to `'Enrolled'`
- Update existing rows with the default status

## Production Deployment

When deploying to production (e.g., Vercel), ensure these scripts are run on your production database:

1. Connect to your production database
2. Run the migration scripts in order:
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   
   # Run migrations
   npx tsx scripts/create-user-topics-table.ts
   npx tsx scripts/add-status-to-user-courses.ts
   ```

## Verification

After running the scripts, verify the tables exist:

```sql
-- Check if user_topics table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_topics';

-- Check if status column exists in user_courses
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_courses' AND column_name = 'status';
```

## Demo Data

To populate the database with demo topics and user topics for testing:

```bash
npx tsx scripts/seed-topics-demo.ts
```

This script will:
- Create 24 demo topics across different categories (skills, interests, subjects)
- Assign 3-6 random topics to each existing user
- Set random proficiency levels for skills
- Set random interest levels for interests
- Skip topics that already exist (safe to run multiple times)

**Demo Topics Include:**
- **Skills**: JavaScript, Python, React, Node.js, TypeScript, SQL, Git, Docker
- **Interests**: Web Development, Machine Learning, Mobile Development, Cloud Computing, etc.
- **Subjects**: Computer Science, Mathematics, Physics, Chemistry, Biology, etc.

## Notes

- The application will gracefully handle missing tables by returning empty arrays
- Check application logs for warnings about missing tables
- All migration scripts include proper error handling and connection cleanup
- Demo data scripts are safe to run multiple times (won't create duplicates)

