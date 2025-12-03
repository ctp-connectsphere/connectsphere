# Authentication Architecture

## Overview

ConnectSphere currently uses **NextAuth.js v5 (Auth.js)** for authentication. There's also a **Stack Auth (Neon Auth)** integration planned but not yet active.

## Current System: NextAuth.js

### How It Works

1. **User Registration/Login Flow:**

   ```
   User → Login Page → NextAuth.js → Database (Prisma) → JWT Session
   ```

2. **Authentication Methods:**
   - ✅ **Credentials** (Email/Password) - Active
   - ✅ **Google OAuth** - Active (once env vars are loaded)
   - ✅ **GitHub OAuth** - Active (once env vars are loaded)

3. **User Storage:**
   - Users stored in `User` table via Prisma
   - Passwords hashed with `bcrypt`
   - Sessions stored as JWT tokens (in cookies)

### Key Components

#### 1. Auth Configuration (`src/lib/auth/config.ts`)

- Configures NextAuth.js providers
- Handles OAuth credentials
- Manages session tokens

#### 2. Login Page (`src/app/(auth)/login/page.tsx`)

- Shows OAuth buttons (if providers configured)
- Email/password form
- Calls `signIn()` from NextAuth

#### 3. Middleware (`middleware.ts`)

- Protects routes
- Checks authentication status
- Redirects unauthenticated users to login

#### 4. API Routes (`src/app/api/auth/[...nextauth]/route.ts`)

- Handles all NextAuth.js API endpoints
- `/api/auth/signin` - Login
- `/api/auth/callback/google` - Google OAuth callback
- `/api/auth/callback/github` - GitHub OAuth callback
- `/api/auth/session` - Get current session
- `/api/auth/providers` - List available providers

### Environment Variables (NextAuth.js)

**In Vercel Dashboard → Settings → Environment Variables:**

```
NEXTAUTH_URL=https://connectsphere-eight.vercel.app
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### OAuth Flow

1. **User clicks "Continue with Google/GitHub"**
   - Redirects to `/api/auth/signin/google` or `/api/auth/signin/github`

2. **NextAuth redirects to OAuth provider**
   - Google: `https://accounts.google.com/oauth/authorize?...`
   - GitHub: `https://github.com/login/oauth/authorize?...`

3. **User authorizes on OAuth provider**

4. **OAuth provider redirects back**
   - To: `https://connectsphere-eight.vercel.app/api/auth/callback/google`
   - Or: `https://connectsphere-eight.vercel.app/api/auth/callback/github`

5. **NextAuth creates/updates user**
   - Checks if user exists by email
   - Creates new user if not found
   - Links OAuth account to user
   - Creates session

6. **User redirected to dashboard**
   - JWT session token stored in cookie
   - User is now authenticated

## Planned System: Stack Auth (Neon Auth)

### Status: ⚠️ NOT YET ACTIVE

Stack Auth is configured in Neon but **not currently being used**. The codebase has placeholder components:

- `src/lib/auth/stack-auth.ts` - Placeholder (package not installed)
- `src/components/auth/stack-sign-in.tsx` - Placeholder component
- `src/components/auth/stack-sign-up.tsx` - Placeholder component

### Environment Variables (Stack Auth)

These are set but **not used**:

```
NEXT_PUBLIC_STACK_PROJECT_ID=d951de76-d481-4ec4-a882-ff33e380e0b2
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_ddyjp7rdcngvbyrg6b9se0ysw2y05p4mnaya78nd134w8
STACK_SECRET_SERVER_KEY=ssk_7w53be2aymfxgbxy6ca7kcf7krfmr4e6hqvx8t4b4zjyr
```

### How Stack Auth Would Work (If Activated)

1. Users would authenticate via Stack Auth
2. Stack Auth would sync users to `neon_auth.users_sync` table
3. Stack Auth handles OAuth providers (configured in Neon dashboard)
4. Your app would query Stack Auth for user data

### To Activate Stack Auth (Future)

1. Install Stack Auth package (e.g., `@stackframejs/nextjs`)
2. Update `src/lib/auth/stack-auth.ts` with real implementation
3. Replace NextAuth.js with Stack Auth in login components
4. Update middleware to use Stack Auth session checks

## Current Database Schema

**Users are stored in:**

- `User` table (via Prisma schema)
- Fields: `id`, `email`, `firstName`, `lastName`, `passwordHash`, `isVerified`, etc.

**If Stack Auth was active:**

- Users would sync to `neon_auth.users_sync` table
- Managed by Neon/Stack Auth automatically

## Testing Authentication

### Check Current Auth System

1. **Check which providers are available:**

   ```
   GET https://connectsphere-eight.vercel.app/api/auth/providers
   ```

   Should return: `credentials`, `google`, `github`

2. **Debug OAuth configuration:**

   ```
   GET https://connectsphere-eight.vercel.app/api/auth/debug
   ```

   Shows if OAuth credentials are loaded

3. **Check current session:**
   ```
   GET https://connectsphere-eight.vercel.app/api/auth/session
   ```

### Login Flow

1. Visit `/login`
2. See OAuth buttons (if configured)
3. Click "Continue with Google" → Redirects to Google
4. After Google auth → Redirects back → Creates session
5. Redirected to `/dashboard`

## Summary

- **Currently Using:** NextAuth.js with Prisma User table
- **OAuth Providers:** Google & GitHub (need env vars in Vercel)
- **Planned:** Stack Auth (not active yet)
- **User Storage:** Custom `User` table via Prisma

The Neon Auth dashboard you're seeing is for Stack Auth configuration, but it's **not currently being used**. All authentication is handled by NextAuth.js.
