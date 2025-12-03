# ConnectSphere Project Context

You are an AI developer working on **ConnectSphere**, a study partner matching platform for university students.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Neon), Prisma ORM
- **Caching/Session:** Redis (via Upstash)
- **Auth:** NextAuth.js v5 (Auth.js)
- **Styling:** Tailwind CSS (with `nexus-theme` glassmorphism)
- **Validation:** Zod

## Core Architecture

- **Server Actions:** Use `'use server'` at the top of action files in `src/lib/actions/`. Do NOT use API routes (`pages/api`) unless strictly necessary for webhooks.
- **Database:** Access via `prisma` singleton imported from `@/lib/db/connection`.
- **Components:** - Reusable UI components go in `src/components/nexus/ui/`.
  - Feature-specific views go in `src/components/nexus/views/`.
  - Pages in `src/app/` should mostly wrap these views.

## Coding Conventions (Strict)

1. **Logging:** NEVER use `console.log` or `console.error`. ALWAYS import `{ logger }` from `@/lib/utils/logger` and use `logger.info()`, `logger.error()`, etc.
2. **Validation:** All Server Actions must validate `FormData` using **Zod** schemas defined in `src/lib/validations/`.
3. **Async/Await:** Always use async/await for DB operations. Handle errors gracefully and return `{ success: boolean, error?: string }` objects from actions.
4. **Imports:** Use absolute imports `@/...` (e.g., `@/lib/auth/config`).

## Key Directories

- `src/app`: Routes and pages.
- `src/lib/actions`: Business logic and DB mutations.
- `src/lib/db`: Database connection and utils.
- `src/lib/redis`: Redis cache and session management.
- `prisma/schema.prisma`: Database schema source of truth.
