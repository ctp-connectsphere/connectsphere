# Campus Connect: Complete Technical Documentation

## Table of Contents

1. [Overview & Vision](#10-overview--vision)
2. [System Architecture](#20-system-architecture)
3. [Getting Started: Local Development Setup](#30-getting-started-local-development-setup)
4. [Engineering Practices & Conventions](#40-engineering-practices--conventions)
5. [Backend (API) Deep Dive](#50-backend-api-deep-dive)
6. [Frontend Deep Dive](#60-frontend-deep-dive)
7. [Testing](#70-testing)
8. [Deployment & CI/CD](#80-deployment--cicd)
9. [Infrastructure & Monitoring](#90-infrastructure--monitoring)
10. [How to Contribute](#100-how-to-contribute)
11. [Versioning & Changelog](#110-versioning--changelog)
12. [Project Roadmap & Conclusion](#120-project-roadmap--conclusion)

---

## 1.0 Overview & Vision

This document provides a high-level technical and strategic overview of the Campus Connect project. Its purpose is to onboard new team members and align all contributors on the core mission, target features, and terminology that will guide the development lifecycle.

### 1.1 Project Mission

The core mission of Campus Connect is to engineer a purpose-built solution that systematically removes the friction and uncertainty from finding compatible academic study partners on university campuses.

**The Problem:** Students frequently struggle with the ad-hoc and inefficient process of finding study partners. Existing, non-specialized platforms (social media, messaging apps) lack the structured data required for effective matching, leading to mismatches in course sections, availability, and study habits. This results in a significant loss of opportunity for effective peer-to-peer learning.

**The Solution:** Campus Connect will be a mobile-first web application that provides a data-driven, algorithmic solution to this problem. By capturing and analyzing key data points—specifically verified course enrollment, granular weekly availability, and defined study preferences—the platform's core matching algorithm will intelligently connect students, ensuring every potential partnership is based on a high degree of compatibility.

### 1.2 Target Audience

This technical documentation is written for the internal engineering team responsible for the design, development, deployment, and maintenance of the Campus Connect platform. The intended audience includes:

- **Full-Stack Developers:** Who will build and maintain the Next.js application, including Server Components, Server Actions, API routes, and database integration.
- **Frontend Developers:** Who will focus on client components, UI/UX, and interactive features using React and TailwindCSS.
- **Future DevOps/SREs:** Who will manage the cloud infrastructure, CI/CD pipelines, and application monitoring.

The goal of this documentation is to serve as the single source of truth for the engineering team, facilitating rapid onboarding and ensuring consistent, high-quality development practices.

### 1.3 Key Features & Scope (Phase 1 MVP)

The initial development phase is focused on delivering a lean, functional Minimum Viable Product (MVP) to validate the core concept of one-on-one student matching.

**In Scope for MVP:**

- **Student User Authentication:** Secure sign-up and login system. Initial implementation will verify users via their official university (.edu) email address, with a design that allows for future SSO integration.
- **User Onboarding & Profile Creation:** A guided, multi-step process for new users to input their essential matching data:
  - **Course Registration:** Manual entry of current courses and their specific section numbers.
  - **Availability Grid:** A visual weekly calendar interface allowing users to mark blocks of free time for studying.
  - **Study Profile:** A short questionnaire to capture preferences on study location (e.g., Library vs. Cafe), style (e.g., Collaborative vs. Quiet), and pace.
- **Core Matching Engine:** The backend service that processes user profiles to generate a ranked list of the most compatible study partners for a given course.
- **Connection System:** A simple request-based system allowing users to connect. A user can send a "Connect" request, and the recipient can accept or decline.
- **1-on-1 Private Chat:** Upon a successful (accepted) connection, a secure and private chat channel is created within the application to enable users to communicate and coordinate logistics.

**Explicitly Out of Scope for MVP:**

- **Group Formation & Management:** All features related to creating or managing study groups of more than two people are deferred to Phase 2.
- **Monetization & Premium Features:** The MVP will be entirely free to use. All "freemium" features, such as profile boosts or advanced filters, are not part of the initial build.
- **University Administrative Dashboards:** Any site-license features for university partners, including analytics, are part of the long-term vision and are not included.
- **Native Mobile Applications (iOS/Android):** The platform will be a responsive web application only.

### 1.4 Key Terminology / Glossary

The following terms have specific meanings within the context of the Campus Connect project.

- **Campus Connect:** The official name of the web application.
- **MVP (Minimum Viable Product):** Refers to the Phase 1 feature set detailed in section 1.3. The goal is to deliver a functional, lean product to validate the core one-on-one matching concept.
- **Study Profile:** The collection of user-defined preferences regarding study habits, including location, style, and pace. This data is a key input for the matching algorithm.
- **Availability Grid:** The data structure and corresponding UI representing a user's free time on a weekly basis. It is a primary filter for identifying potential meeting times between users.
- **Compatibility Score:** The numerical output of the matching algorithm for a given pair of students in the context of a specific course. It is a calculated value representing the quality of a potential match, used to rank results.
- **Connection:** The state of a relationship between two users in the system. A connection has a lifecycle: it begins as Pending when one user sends a request and becomes Accepted if the recipient approves it. Only Accepted connections can use the private chat.

---

## 2.0 System Architecture

### 2.1 High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Mobile Browser]
        B[Desktop Browser]
    end

    subgraph "Edge Network"
        C[Vercel Edge Network<br/>Global CDN]
    end

    subgraph "Next.js Application - Vercel"
        D[App Router<br/>Server Components]
        E[API Routes<br/>Route Handlers]
        F[Server Actions<br/>Server Mutations]
        G[Next.js Middleware<br/>Auth & Rate Limiting]
    end

    subgraph "Services Layer"
        H[NextAuth.js<br/>Authentication]
        I[Matching Algorithm<br/>Server Component]
        J[Real-time Service<br/>Pusher/Ably]
    end

    subgraph "Data Layer"
        K[Neon/Supabase<br/>PostgreSQL 15+]
        L[Upstash Redis<br/>Cache & Sessions]
        M[Cloudinary<br/>File Storage]
    end

    subgraph "External Services"
        N[Resend/SendGrid<br/>Email]
        O[PostHog<br/>Analytics]
    end

    A --> C
    B --> C
    C --> G
    G --> D
    G --> E
    G --> F
    D --> I
    E --> H
    F --> I
    H --> K
    H --> L
    I --> K
    I --> L
    E --> J
    E --> M
    E --> N
    D --> O
```

### 2.2 Technology Stack

#### Full-Stack Framework

- **Next.js 14+** - React framework with App Router, Server Components, and Server Actions
- **React 19+** - UI library with concurrent features (via Next.js)
- **TypeScript 5.8.3** - Type safety across frontend and backend
- **TailwindCSS 3.x** - Utility-first CSS framework for rapid UI development
- **Shadcn/ui** - High-quality component library built on Radix UI

#### State Management & Data Fetching

- **React Server Components** - Default server-side rendering
- **Server Actions** - Type-safe server mutations
- **Zustand** - Client-side state management
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation for forms and APIs
- **TanStack Query** - Client-side data fetching and caching (when needed)

#### Authentication & Security

- **NextAuth.js v5 (Auth.js)** - Complete authentication solution
- **JWT** - Session tokens (via NextAuth.js)
- **bcrypt** - Password hashing
- **Middleware** - Route protection and authentication checks
- **CSRF Protection** - Built-in with Next.js
- **Upstash Rate Limit** - API rate limiting

#### Database & Caching

- **PostgreSQL 15+** - Primary relational database
- **Prisma** - Type-safe database ORM with connection pooling
- **Upstash Redis** - Serverless Redis for caching and sessions
- **Neon or Supabase** - Serverless PostgreSQL hosting

#### Real-time & Communication

- **Pusher** or **Ably** - Real-time messaging (serverless WebSocket alternative)
- **Server-Sent Events (SSE)** - Real-time updates (alternative approach)

#### Infrastructure & DevOps

- **Vercel** - Complete hosting (frontend + backend + Edge functions)
- **Upstash** - Redis and rate limiting
- **Neon/Supabase** - PostgreSQL database
- **Cloudinary** - Image/file storage
- **SendGrid** - Email service (via Resend alternative)
- **GitHub Actions** - CI/CD pipeline
- **Vercel Edge Runtime** - Global edge deployment

### 2.3 Data Flow

The following diagram illustrates the data flow for a key user action: getting study partner matches.

```mermaid
sequenceDiagram
    participant U as User
    participant SC as Server Component
    participant SA as Server Action
    participant M as Middleware
    participant DB as PostgreSQL
    participant RC as Redis Cache
    participant NA as NextAuth

    U->>SC: Navigate to /matches/[courseId]
    SC->>M: Request intercepted
    M->>NA: Validate session
    NA->>RC: Check session cache
    RC->>NA: Return session
    NA->>M: Session valid
    M->>SC: Allow request
    SC->>RC: Check cached matches
    alt Cache hit
        RC->>SC: Return cached matches
    else Cache miss
        SC->>DB: Query user profile & availability
        SC->>DB: Query potential matches
        SC->>SC: Calculate compatibility scores
        SC->>RC: Cache results (5 min TTL)
    end
    SC->>U: Render matches UI (RSC)
    Note over U,SA: User sends connection request
    U->>SA: Submit form (Server Action)
    SA->>NA: Validate session
    SA->>DB: Create connection
    SA->>RC: Invalidate cache
    SA->>U: Revalidate & redirect
```

---

## 3.0 Getting Started: Local Development Setup

### 3.1 Prerequisites

Before setting up the development environment, ensure you have the following software installed:

- **Git** (latest version) - Version control
- **Node.js 20.x** - JavaScript runtime
- **npm 10.x** or **yarn 1.22.x** - Package manager
- **Docker Desktop** - For local database and Redis
- **VS Code** (recommended) - Code editor with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prisma
- **PostgreSQL Client** (optional) - pgAdmin or TablePlus for database management

### 3.2 Repository & Installation

```bash
# Clone the repository
git clone https://github.com/your-org/connectsphere.git
cd connectsphere

# Install dependencies
npm install

# Set up Prisma
npx prisma generate
npx prisma db push

# Start local Redis (using Docker)
docker run -d -p 6379:6379 redis:alpine
```

### 3.3 Environment Configuration

Create `.env.local` file in the project root:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Campus Connect"

# Database (Local PostgreSQL or Neon/Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/campusconnect_dev

# Redis (Upstash or Local)
UPSTASH_REDIS_REST_URL=http://localhost:6379
UPSTASH_REDIS_REST_TOKEN=local-dev-token

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-generate-with-openssl

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@campusconnect.app

# File Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL_RATELIMIT=your-upstash-url
UPSTASH_REDIS_REST_TOKEN_RATELIMIT=your-upstash-token
```

### 3.4 Running the Application

```bash
# Start Next.js development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

The application will be available at:

- **Application:** http://localhost:3000
- **API Routes:** http://localhost:3000/api/\*
- **Prisma Studio:** http://localhost:5555

### 3.5 First-Time Sanity Check

To verify your local setup is working correctly:

1. **Frontend Check:**
   - Visit http://localhost:5173
   - Should see the Campus Connect landing page
   - Check browser console for no errors

2. **Backend Check:**
   - Visit http://localhost:3001/api/health
   - Should return `{"status": "ok", "timestamp": "..."}`

3. **Database Check:**

   ```bash
   cd backend
   npx prisma studio
   ```

   - Should open Prisma Studio at http://localhost:5555
   - Verify tables are created

4. **Full Integration Check:**
   - Register a new account
   - Complete onboarding flow
   - Verify data appears in database

---

## 4.0 Engineering Practices & Conventions

### 4.1 Git & Branching Strategy

We follow a simplified GitFlow workflow:

```mermaid
gitgraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Setup"
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add JWT"
    commit id: "Add middleware"
    checkout develop
    merge feature/user-auth
    branch release/v1.0.0
    checkout release/v1.0.0
    commit id: "Bug fixes"
    checkout main
    merge release/v1.0.0
    tag: "v1.0.0"
    checkout develop
    merge main
```

**Branch Naming Conventions:**

- `feature/description` - New features (e.g., `feature/user-onboarding`)
- `bugfix/description` - Bug fixes (e.g., `bugfix/auth-token-expiry`)
- `hotfix/description` - Critical production fixes (e.g., `hotfix/security-patch`)
- `release/version` - Release preparation (e.g., `release/v1.2.0`)

**Pull Request Process:**

1. Create feature branch from `develop`
2. Make commits with conventional commit messages
3. Push branch and create PR to `develop`
4. Code review by at least one team member
5. Address feedback and update PR
6. Merge after approval and passing CI checks

### 4.2 Coding Standards

**ESLint Configuration:**

```javascript
// eslint.config.js
export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.next']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]);
```

**Prettier Configuration:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

**Naming Conventions:**

- **Files:** kebab-case (`user-profile.tsx`, `auth-service.ts`)
- **Components:** PascalCase (`UserProfile`, `AuthService`)
- **Functions/Variables:** camelCase (`getUserProfile`, `authToken`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)
- **Types/Interfaces:** PascalCase (`UserProfile`, `ApiResponse`)

### 4.3 Directory Structure

```
/connectsphere
├── docs/                          # Technical documentation
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   ├── TESTING.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── CONTRIBUTING.md
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/               # Dashboard route group
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── matches/
│   │   │   └── [courseId]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── [connectionId]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/                       # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── matches/
│   │   │   └── route.ts
│   │   └── connections/
│   │       └── route.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   └── globals.css
├── components/                    # React components
│   ├── ui/                        # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── auth/                      # Auth components
│   ├── matches/                   # Match components
│   └── shared/                    # Shared components
├── lib/                           # Utility libraries
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts
│   │   ├── matches.ts
│   │   └── connections.ts
│   ├── db/                        # Database utilities
│   │   └── prisma.ts
│   ├── redis/                     # Redis utilities
│   │   └── client.ts
│   ├── auth/                      # NextAuth configuration
│   │   └── config.ts
│   ├── validations/               # Zod schemas
│   └── utils.ts
├── prisma/                        # Database schema
│   ├── schema.prisma
│   └── migrations/
├── public/                        # Static assets
├── types/                         # TypeScript types
├── .github/                       # GitHub workflows
│   └── workflows/
│       └── ci.yml
├── middleware.ts                  # Next.js middleware
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── package.json
├── tsconfig.json
├── TECHNICAL_DOCUMENTATION.md     # This file
├── README.md
└── CHANGELOG.md
```

### 4.4 API Design Principles

**RESTful API Standards:**

- Use HTTP methods appropriately (GET, POST, PUT, DELETE, PATCH)
- Consistent URL structure: `/api/v1/resource/{id}`
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Version API endpoints (`/api/v1/`, `/api/v2/`)

**Request/Response Format:**

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

**Authentication:**

- JWT tokens in Authorization header: `Bearer <token>`
- Token refresh endpoint: `POST /api/v1/auth/refresh`
- Protected routes require valid JWT

**Rate Limiting:**

- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Separate limits for different endpoint categories

---

## 5.0 Server Architecture Deep Dive

### 5.1 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant NA as NextAuth.js
    participant SA as Server Action
    participant D as Database
    participant R as Redis
    participant E as Resend

    C->>SA: POST register (email, password)
    SA->>SA: Validate with Zod schema
    SA->>D: Check if user exists
    alt User exists
        SA->>C: Return error
    else User new
        SA->>SA: Hash password with bcrypt
        SA->>D: Create user (pending verification)
        SA->>E: Send verification email
        SA->>C: Success response
    end

    Note over C,E: User clicks email link
    C->>NA: GET /api/auth/verify?token={token}
    NA->>D: Verify token and activate user
    NA->>R: Create session in Redis
    NA->>C: Redirect to dashboard

    C->>NA: POST /api/auth/signin (credentials)
    NA->>D: Find user by email
    NA->>NA: Verify password hash
    NA->>R: Create session
    NA->>C: Set session cookie + redirect

    Note over C,NA: Protected requests
    C->>SA: Server Action call
    SA->>NA: auth() helper checks session
    NA->>R: Validate session in Redis
    NA->>SA: Return user data
    SA->>C: Process request with user context
```

**Session Management:**

- **JWT Sessions:** NextAuth.js handles JWT creation and validation
- **Redis Storage:** Session data cached in Upstash Redis for serverless
- **Automatic Refresh:** Sessions auto-refresh via NextAuth.js
- **Server Components:** Access user via `await auth()` helper
- **Client Components:** Access session via `useSession()` hook

### 5.2 Database Schema

For detailed database schema documentation, see [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md).

**Core Entities:**

- **Users** - User accounts and profiles
- **Courses** - Academic courses and sections
- **UserCourses** - User enrollment in courses
- **Availability** - User availability grid data
- **Connections** - Study partner relationships
- **Messages** - Chat messages between connected users

### 5.3 Core Logic: Matching Algorithm

The matching algorithm is the heart of Campus Connect. It calculates compatibility scores between users based on multiple factors:

```typescript
interface MatchingCriteria {
  courseOverlap: number; // 40% weight
  timeAvailability: number; // 30% weight
  studyPreferences: number; // 20% weight
  profileCompleteness: number; // 10% weight
}

interface MatchResult {
  userId: string;
  compatibilityScore: number; // 0-100
  matchingReasons: string[];
  commonAvailability: TimeSlot[];
}
```

**Algorithm Steps:**

1. **Course Filtering:** Find users enrolled in the same course section
2. **Availability Analysis:** Calculate overlapping free time slots
3. **Preference Matching:** Compare study location, style, and pace preferences
4. **Score Calculation:** Weighted combination of all factors
5. **Ranking:** Sort by compatibility score (highest first)

### 5.4 API Reference

For complete API documentation, see [docs/API_REFERENCE.md](./docs/API_REFERENCE.md).

**Key Endpoints:**

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/courses` - List available courses
- `POST /api/v1/users/courses` - Enroll in course
- `GET /api/v1/matches/{courseId}` - Get study matches
- `POST /api/v1/connections/request` - Send connection request
- `GET /api/v1/messages/{connectionId}` - Get chat messages

---

## 6.0 Client Architecture Deep Dive

### 6.1 Component Library

**Design System Components:**

```typescript
// Button Component Example
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
}) => {
  // Implementation with Tailwind classes
};
```

**Component Categories:**

- **UI Components:** Button, Input, Modal, Card, Badge
- **Form Components:** FormField, Select, Checkbox, RadioGroup
- **Layout Components:** Header, Sidebar, Footer, Container
- **Feature Components:** AvailabilityGrid, CourseSelector, MatchCard

### 6.2 State Management

We use **Zustand** for state management due to its simplicity and TypeScript support:

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await authService.login(email, password);
    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### 6.3 Routing

**Route Structure:**

```typescript
// App.tsx
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/matches/:courseId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MatchesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/chat/:connectionId" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};
```

### 6.4 Theming & Styling

**TailwindCSS Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

**CSS Architecture:**

- **Global Styles:** `src/styles/globals.css`
- **Component Styles:** Co-located with components using Tailwind classes
- **Dark Mode:** Implemented using Tailwind's dark mode utilities
- **Responsive Design:** Mobile-first approach with breakpoint utilities

---

## 7.0 Testing

### 7.1 Testing Strategy

**Testing Pyramid:**

```mermaid
graph TB
    A[E2E Tests<br/>Playwright] --> B[Integration Tests<br/>Jest + Supertest]
    B --> C[Unit Tests<br/>Vitest + Testing Library]

    A1[User Flows<br/>Registration to Chat] --> A
    B1[API Endpoints<br/>Database Integration] --> B
    C1[Components<br/>Utilities<br/>Services] --> C
```

**Test Categories:**

- **Unit Tests (70%):** Individual functions, components, utilities
- **Integration Tests (20%):** API endpoints, database operations
- **E2E Tests (10%):** Critical user journeys

### 7.2 How to Run Tests

```bash
# Frontend Tests
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage
npm run test:watch        # Watch mode

# Backend Tests
cd backend
npm run test              # Run unit tests
npm run test:integration  # Run integration tests
npm run test:e2e          # Run E2E tests

# All Tests
npm run test:all          # Run frontend + backend tests
```

### 7.3 Test Environment & Data

**Test Database:**

- Separate PostgreSQL instance for testing
- Automated schema migrations
- Seed data for consistent test scenarios

**Mock Services:**

- Email service (SendGrid) - mocked in tests
- File storage (Cloudinary) - mocked in tests
- External APIs - mocked with MSW (Mock Service Worker)

For detailed testing documentation, see [docs/TESTING.md](./docs/TESTING.md).

---

## 8.0 Deployment & CI/CD

### 8.1 Environments

```mermaid
graph LR
    A[Development<br/>Local] --> B[Staging<br/>Vercel Preview]
    B --> C[Production<br/>Vercel]

    A1[localhost:3000<br/>Local DB + Redis] --> A
    B1[preview.campusconnect.app<br/>Neon + Upstash] --> B
    C1[campusconnect.app<br/>Neon + Upstash] --> C
```

**Environment Configuration:**

- **Development:** Local Next.js with hot reload and local services
- **Staging:** Vercel preview deployments with staging database
- **Production:** Vercel production with optimized performance and monitoring

### 8.2 CI/CD Pipeline

```mermaid
graph TB
    A[Push to Branch] --> B[GitHub Actions Trigger]
    B --> C[Install Dependencies]
    C --> D[Run Linting & Type Check]
    D --> E[Run Tests (Unit + Integration)]
    E --> F{Tests Pass?}
    F -->|No| G[Fail Build]
    F -->|Yes| H[Build Next.js App]
    H --> I[Deploy to Vercel Preview]
    I --> J[Run E2E Tests]
    J --> K{E2E Pass?}
    K -->|No| L[Rollback Preview]
    K -->|Yes| M[Deploy to Production]
    M --> N[Health Check]
    N --> O[Notify Team]
```

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: echo "Deploy to staging"

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: echo "Deploy to production"
```

### 8.3 Manual Deployment Process

**Pre-deployment Checklist:**

- [ ] All tests passing
- [ ] Code review completed
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] Feature flags configured
- [ ] Monitoring alerts configured

**Deployment Steps:**

1. Merge feature branch to `main`
2. Monitor CI/CD pipeline
3. Verify staging deployment
4. Run smoke tests on staging
5. Deploy to production
6. Run health checks
7. Monitor error rates for 15 minutes

### 8.4 Rollback Procedure

**Automated Rollback Triggers:**

- Error rate > 5% for 5 minutes
- Response time > 2 seconds average
- Database connection failures

**Manual Rollback Process:**

1. Identify the problematic deployment
2. Revert to previous stable version
3. Update database if necessary
4. Verify application health
5. Notify team of rollback

For detailed deployment documentation, see [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md).

---

## 9.0 Infrastructure & Monitoring

### 9.1 Cloud Infrastructure

```mermaid
graph TB
    subgraph "Frontend - Vercel"
        A[Edge Network]
        B[Static Assets]
        C[Serverless Functions]
    end

    subgraph "Next.js Serverless Functions"
        D[API Routes]
        E[Server Actions]
        F[Edge Runtime]
    end

    subgraph "Database - Neon PostgreSQL"
        G[Primary Database]
        H[Read Replicas]
        I[Automated Backups]
    end

    subgraph "External Services"
        J[Cloudinary CDN]
        K[SendGrid API]
        L[Analytics]
    end

    A --> D
    B --> J
    C --> D
    D --> G
    E --> G
    F --> G
    D --> K
    A --> L
```

**Infrastructure Details:**

- **Frontend:** Vercel Edge Network with global CDN
- **Backend:** Next.js Serverless Functions with Edge Runtime
- **Database:** Neon PostgreSQL with automated backups and read replicas
- **File Storage:** Cloudinary for images and documents
- **Monitoring:** Vercel Analytics + custom PostHog analytics + Neon metrics

### 9.2 Logging

**Log Levels:**

- **ERROR:** Application errors, failed requests
- **WARN:** Non-critical issues, deprecated API usage
- **INFO:** Important business events, user actions
- **DEBUG:** Detailed execution information (development only)

**Log Structure:**

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User matched successfully",
  "userId": "user_123",
  "courseId": "course_456",
  "matchesCount": 5,
  "requestId": "req_789"
}
```

**Log Aggregation:**

- **Development:** Console output
- **Staging/Production:** Vercel logs + external service (LogTail or DataDog)

### 9.3 Monitoring & Alerting

**Key Metrics:**

- **Uptime:** 99.9% target
- **Response Time:** < 200ms average
- **Error Rate:** < 1% target
- **Database Performance:** Query response times
- **User Engagement:** DAU, MAU, session duration

**Alerting Rules:**

- **Critical:** Service down, database unavailable
- **Warning:** High error rate, slow response times
- **Info:** Deployment success, new user registrations

**Monitoring Dashboard:**

- Vercel built-in metrics and analytics
- Custom PostHog analytics dashboard
- Neon database performance metrics
- Uptime monitoring with external service (UptimeRobot or Pingdom)

---

## 10.0 How to Contribute

### 10.1 Submitting an Issue

**Bug Reports:**

- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

**Feature Requests:**

- Use the feature request template
- Describe the problem being solved
- Provide mockups or examples
- Consider MVP scope

### 10.2 Submitting a Pull Request

**PR Process:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit PR with description

**Code Review Checklist:**

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

For detailed contribution guidelines, see [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md).

---

## 11.0 Versioning & Changelog

### 11.1 Versioning Scheme

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to API or database schema
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

**Pre-release Versions:**

- **Alpha** (0.1.0-alpha.1): Early development, unstable
- **Beta** (0.1.0-beta.1): Feature complete, testing phase
- **RC** (0.1.0-rc.1): Release candidate, final testing

### 11.2 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes.

**Changelog Format:**

```markdown
## [1.0.0] - 2024-01-15

### Added

- User authentication system
- Study partner matching algorithm
- Real-time chat functionality

### Changed

- Improved matching algorithm accuracy
- Updated UI/UX design

### Fixed

- Fixed authentication token expiry issue
- Resolved chat message ordering bug

### Security

- Updated dependencies to address vulnerabilities
```

---

## 12.0 Project Roadmap & Conclusion

### 12.1 Future Features (Phase 2)

**Planned Enhancements:**

- **Group Formation:** Multi-person study groups
- **Advanced Matching:** Machine learning improvements
- **Mobile Apps:** Native iOS and Android applications
- **University Integration:** SSO and course catalog APIs
- **Analytics Dashboard:** Usage insights and reporting
- **Premium Features:** Advanced filters, profile boosts

**Technical Improvements:**

- **Performance:** Caching layer, CDN optimization
- **Scalability:** Microservices architecture
- **Security:** Enhanced authentication, audit logging
- **Monitoring:** Advanced observability and alerting

### 12.2 Key Contacts

**Development Team:**

- **Lead Developer:** [Name] - [email]
- **Frontend Developer:** [Name] - [email]
- **Backend Developer:** [Name] - [email]
- **DevOps Engineer:** [Name] - [email]

**Project Management:**

- **Product Manager:** [Name] - [email]
- **Technical Lead:** [Name] - [email]

**External Services:**

- **Vercel Support:** support@vercel.com
- **Neon Support:** support@neon.tech
- **Database Hosting:** Neon PostgreSQL

---

## Conclusion

This technical documentation serves as the foundation for building Campus Connect, a platform that will revolutionize how students find study partners on university campuses. The architecture is designed for scalability, maintainability, and rapid development while ensuring a high-quality user experience.

The documentation will evolve as the project grows, but these foundational principles and practices will guide the development team through the MVP and beyond.

For the most up-to-date information, always refer to the latest version of this document and the detailed subdocs in the `docs/` directory.

---

_Last Updated: Oct. 2025_  
_Version: 1.0.0_  
_Document Status: Draft_
