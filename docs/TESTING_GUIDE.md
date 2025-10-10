# Campus Connect Testing Guide

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Testing Stack](#testing-stack)
4. [Frontend Testing](#frontend-testing)
5. [Backend Testing](#backend-testing)
6. [Integration Testing](#integration-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Testing Database](#testing-database)
9. [Mock Services](#mock-services)
10. [CI/CD Testing](#cicd-testing)
11. [Performance Testing](#performance-testing)
12. [Security Testing](#security-testing)

---

## Overview

This guide provides comprehensive testing strategies and practices for the Campus Connect application. Our testing approach follows the testing pyramid methodology with a focus on automated testing, code coverage, and continuous integration.

**Testing Philosophy:**
- **Quality over Quantity:** Focus on meaningful tests that catch real bugs
- **Fast Feedback:** Tests should run quickly and provide immediate feedback
- **Maintainable:** Tests should be easy to understand and update
- **Reliable:** Tests should be stable and not flaky

---

## Testing Strategy

### Testing Pyramid

```mermaid
graph TB
    subgraph "Testing Pyramid"
        A[E2E Tests<br/>10% - Critical User Flows]
        B[Integration Tests<br/>20% - API & Database]
        C[Unit Tests<br/>70% - Components & Functions]
    end
    
    A1[User Registration Flow] --> A
    A2[Study Partner Matching] --> A
    A3[Real-time Chat] --> A
    
    B1[API Endpoint Tests] --> B
    B2[Database Integration] --> B
    B3[External Service Integration] --> B
    
    C1[React Components] --> C
    C2[Utility Functions] --> C
    C3[Business Logic] --> C
    C4[Hooks & Services] --> C
```

### Test Categories

| Test Type | Coverage | Speed | Reliability | Purpose |
|-----------|----------|-------|-------------|---------|
| **Unit Tests** | 70% | Very Fast | High | Test individual functions/components |
| **Integration Tests** | 20% | Fast | High | Test component interactions |
| **E2E Tests** | 10% | Slow | Medium | Test complete user journeys |

### Coverage Targets

- **Overall Coverage:** ≥ 80%
- **Critical Paths:** ≥ 95% (authentication, matching algorithm)
- **Business Logic:** ≥ 90%
- **UI Components:** ≥ 75%

---

## Testing Stack

### Frontend Testing Tools

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

### Backend Testing Tools

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@types/jest": "^29.0.0",
    "@types/supertest": "^2.0.0",
    "ts-jest": "^29.0.0",
    "testcontainers": "^10.0.0"
  }
}
```

---

## Frontend Testing

### Unit Testing with Vitest

**Setup Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
})
```

**Test Setup:**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))
```

### Component Testing Examples

**Button Component Test:**

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600')
  })
})
```

**Custom Hook Test:**

```typescript
// src/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'
import { authService } from '../services/authService'

// Mock the auth service
vi.mock('../services/authService')
const mockAuthService = vi.mocked(authService)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    const mockTokens = { accessToken: 'token', refreshToken: 'refresh' }
    
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      tokens: mockTokens
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('test@example.com', 'password')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('should handle login errors', async () => {
    const error = new Error('Invalid credentials')
    mockAuthService.login.mockRejectedValue(error)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong')
      } catch (e) {
        expect(e).toBe(error)
      }
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

### API Service Testing

```typescript
// src/services/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'

// Mock fetch
global.fetch = vi.fn()
const mockFetch = vi.mocked(fetch)

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com' },
        tokens: { accessToken: 'token', refreshToken: 'refresh' }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await authService.login('test@example.com', 'password')

    expect(result).toEqual(mockResponse.data)
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    })
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: { message: 'Invalid credentials' }
      }),
    } as Response)

    await expect(authService.login('test@example.com', 'wrong'))
      .rejects.toThrow('Invalid credentials')
  })
})
```

---

## Backend Testing

### Unit Testing with Jest

**Jest Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts']
}
```

**Test Setup:**

```typescript
// src/test/setup.ts
import { jest } from '@jest/globals'

// Mock external services
jest.mock('../services/emailService')
jest.mock('../services/cloudinaryService')

// Setup test database
beforeAll(async () => {
  // Initialize test database connection
})

afterAll(async () => {
  // Cleanup test database
})

beforeEach(async () => {
  // Reset database state
})
```

### Controller Testing

```typescript
// src/controllers/authController.test.ts
import request from 'supertest'
import { app } from '../app'
import { authService } from '../services/authService'
import { User } from '../models/User'

jest.mock('../services/authService')
const mockAuthService = jest.mocked(authService)

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
      const mockTokens = {
        accessToken: 'jwt_token',
        refreshToken: 'refresh_token'
      }

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens
      })

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(mockUser)
      expect(response.body.data.tokens).toEqual(mockTokens)
    })

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('Invalid credentials')
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })
})
```

### Service Layer Testing

```typescript
// src/services/matchingService.test.ts
import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import { matchingService } from './matchingService'
import { User } from '../models/User'
import { Course } from '../models/Course'

describe('Matching Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate compatibility scores correctly', async () => {
    const user1 = {
      id: 'user_1',
      studyProfile: {
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate'
      }
    } as User

    const user2 = {
      id: 'user_2',
      studyProfile: {
        preferredLocation: 'library',
        studyStyle: 'collaborative',
        studyPace: 'moderate'
      }
    } as User

    const course = { id: 'course_1' } as Course

    // Mock database calls
    vi.spyOn(matchingService, 'getCourseEnrollments').mockResolvedValue([user2])
    vi.spyOn(matchingService, 'getAvailabilityOverlap').mockResolvedValue(0.8)
    vi.spyOn(matchingService, 'calculatePreferenceScore').mockReturnValue(0.9)

    const matches = await matchingService.findMatches(user1.id, course.id)

    expect(matches).toHaveLength(1)
    expect(matches[0].compatibilityScore).toBeGreaterThan(0.8)
    expect(matches[0].matchingReasons).toContain('Same course section')
  })

  it('should handle no matches found', async () => {
    const user1 = { id: 'user_1' } as User
    const course = { id: 'course_1' } as Course

    vi.spyOn(matchingService, 'getCourseEnrollments').mockResolvedValue([])

    const matches = await matchingService.findMatches(user1.id, course.id)

    expect(matches).toHaveLength(0)
  })
})
```

---

## Integration Testing

### Database Integration Tests

```typescript
// src/test/integration/database.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { userService } from '../services/userService'

const prisma = new PrismaClient()

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up test data
    await prisma.message.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.userCourse.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.user.deleteMany()
  })

  it('should create user with profile', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      university: 'Test University'
    }

    const user = await userService.createUser(userData, {
      preferredLocation: 'library',
      studyStyle: 'collaborative',
      studyPace: 'moderate'
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.profile).toBeDefined()
    expect(user.profile?.preferredLocation).toBe('library')
  })

  it('should find matches with availability overlap', async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        passwordHash: 'hash',
        firstName: 'John',
        lastName: 'Doe',
        university: 'Test University'
      }
    })

    const user2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        passwordHash: 'hash',
        firstName: 'Jane',
        lastName: 'Smith',
        university: 'Test University'
      }
    })

    // Create course
    const course = await prisma.course.create({
      data: {
        name: 'Test Course',
        code: 'TEST 101',
        section: '001',
        semester: 'Spring 2024',
        universityId: 'test-university-id'
      }
    })

    // Enroll both users in course
    await prisma.userCourse.createMany({
      data: [
        { userId: user1.id, courseId: course.id },
        { userId: user2.id, courseId: course.id }
      ]
    })

    // Add overlapping availability
    await prisma.availability.createMany({
      data: [
        { userId: user1.id, dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
        { userId: user2.id, dayOfWeek: 1, startTime: '10:00', endTime: '13:00' }
      ]
    })

    const matches = await matchingService.findMatches(user1.id, course.id)

    expect(matches).toHaveLength(1)
    expect(matches[0].user.id).toBe(user2.id)
    expect(matches[0].commonAvailability).toHaveLength(1)
  })
})
```

---

## End-to-End Testing

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@berkeley.edu')
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!')
    await page.fill('[data-testid="firstName-input"]', 'John')
    await page.fill('[data-testid="lastName-input"]', 'Doe')
    await page.selectOption('[data-testid="university-select"]', 'berkeley.edu')

    // Submit form
    await page.click('[data-testid="register-button"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Registration successful. Please check your email for verification.'
    )
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register')

    // Submit form with invalid data
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', '123')
    await page.click('[data-testid="register-button"]')

    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toContainText(
      'Please enter a valid university email address'
    )
    await expect(page.locator('[data-testid="password-error"]')).toContainText(
      'Password must be at least 8 characters'
    )
  })
})
```

```typescript
// e2e/study-matching.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Study Partner Matching', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'testuser@berkeley.edu')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should find and display study matches', async ({ page }) => {
    // Navigate to matches page
    await page.goto('/matches/course_456')

    // Wait for matches to load
    await expect(page.locator('[data-testid="matches-list"]')).toBeVisible()

    // Verify match cards are displayed
    const matchCards = page.locator('[data-testid="match-card"]')
    await expect(matchCards).toHaveCount({ min: 1 })

    // Check match details
    const firstMatch = matchCards.first()
    await expect(firstMatch.locator('[data-testid="match-name"]')).toBeVisible()
    await expect(firstMatch.locator('[data-testid="compatibility-score"]')).toBeVisible()
    await expect(firstMatch.locator('[data-testid="connect-button"]')).toBeVisible()
  })

  test('should send connection request', async ({ page }) => {
    await page.goto('/matches/course_456')

    // Click connect button on first match
    await page.click('[data-testid="match-card"]:first-child [data-testid="connect-button"]')

    // Fill connection message
    await page.fill('[data-testid="connection-message"]', 'Hi! I\'d love to study together.')
    await page.click('[data-testid="send-request-button"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Connection request sent successfully'
    )

    // Verify button state changed
    await expect(page.locator('[data-testid="connect-button"]')).toContainText('Pending')
  })
})
```

---

## Testing Database

### Test Database Setup

```typescript
// src/test/database.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const testDb = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = testDb
}

export const cleanupDatabase = async () => {
  const tablenames = await testDb.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await testDb.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
    }
  }
}
```

### Test Data Factories

```typescript
// src/test/factories.ts
import { Prisma } from '@prisma/client'
import { testDb } from './database'

export const userFactory = async (overrides: Partial<Prisma.UserCreateInput> = {}) => {
  return testDb.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      passwordHash: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      university: 'Test University',
      ...overrides
    }
  })
}

export const courseFactory = async (overrides: Partial<Prisma.CourseCreateInput> = {}) => {
  const university = await testDb.university.create({
    data: {
      name: 'Test University',
      domain: 'test.edu'
    }
  })

  return testDb.course.create({
    data: {
      name: 'Test Course',
      code: 'TEST 101',
      section: '001',
      semester: 'Spring 2024',
      universityId: university.id,
      ...overrides
    }
  })
}

export const connectionFactory = async (
  requesterId: string,
  targetId: string,
  courseId: string,
  overrides: Partial<Prisma.ConnectionCreateInput> = {}
) => {
  return testDb.connection.create({
    data: {
      requesterId,
      targetId,
      courseId,
      status: 'pending',
      ...overrides
    }
  })
}
```

---

## Mock Services

### MSW (Mock Service Worker) Setup

```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // Auth endpoints
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe'
          },
          tokens: {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token'
          }
        }
      })
    )
  }),

  // Matching endpoints
  rest.get('/api/v1/matches/:courseId', (req, res, ctx) => {
    const { courseId } = req.params
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          course: {
            id: courseId,
            name: 'Data Structures and Algorithms',
            code: 'CS 161'
          },
          matches: [
            {
              user: {
                id: 'user_456',
                firstName: 'Jane',
                lastName: 'Smith',
                profileImage: 'https://example.com/image.jpg',
                studyProfile: {
                  preferredLocation: 'library',
                  studyStyle: 'collaborative',
                  studyPace: 'moderate'
                }
              },
              compatibilityScore: 85,
              matchingReasons: [
                'Same course section',
                'Overlapping availability',
                'Similar study preferences'
              ],
              commonAvailability: [
                {
                  day: 'monday',
                  start: '10:00',
                  end: '12:00'
                }
              ],
              connectionStatus: 'none'
            }
          ],
          totalMatches: 1
        }
      })
    )
  })
]
```

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

---

## CI/CD Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_campusconnect
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run database migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_campusconnect
      
      - name: Run backend tests
        run: |
          cd backend
          npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_campusconnect
          NODE_ENV: test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "User Registration and Login Flow"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/register"
          json:
            email: "test{{ $randomString() }}@example.com"
            password: "TestPassword123!"
            firstName: "Test"
            lastName: "User"
            university: "Test University"
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ email }}"
            password: "TestPassword123!"

  - name: "Get Study Matches"
    weight: 50
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "existing@example.com"
            password: "TestPassword123!"
      - get:
          url: "/api/v1/matches/course_123"
          headers:
            Authorization: "Bearer {{ accessToken }}"

  - name: "Send Message"
    weight: 20
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "existing@example.com"
            password: "TestPassword123!"
      - post:
          url: "/api/v1/messages/connection_123"
          json:
            content: "Hello! When should we study?"
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

---

## Security Testing

### Security Test Examples

```typescript
// src/test/security.test.ts
import request from 'supertest'
import { app } from '../app'

describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject requests without valid JWT', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR')
    })

    it('should reject expired JWT tokens', async () => {
      const expiredToken = 'expired.jwt.token'
      
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
    })

    it('should rate limit authentication attempts', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      )

      const responses = await Promise.all(promises)
      const rateLimited = responses.filter(r => r.status === 429)
      
      expect(rateLimited.length).toBeGreaterThan(0)
    })
  })

  describe('Input Validation', () => {
    it('should sanitize user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>'
      
      const response = await request(app)
        .post('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          firstName: maliciousInput
        })
        .expect(200)

      expect(response.body.data.firstName).not.toContain('<script>')
    })

    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --"
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: maliciousInput,
          password: 'password'
        })
        .expect(400)

      // Verify database is still intact
      const dbResponse = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
    })
  })
})
```

---

## Running Tests

### Frontend Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Backend Test Commands

```bash
# Run all tests
cd backend && npm run test

# Run tests in watch mode
cd backend && npm run test:watch

# Run tests with coverage
cd backend && npm run test:coverage

# Run integration tests
cd backend && npm run test:integration

# Run E2E tests
cd backend && npm run test:e2e
```

### Test Coverage Reports

Coverage reports are generated in multiple formats:
- **HTML:** `coverage/index.html` (interactive report)
- **LCOV:** `coverage/lcov.info` (for CI integration)
- **JSON:** `coverage/coverage-final.json` (for programmatic access)

## Advanced Testing Patterns

### Server Actions Testing

```typescript
// lib/actions/user.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfile } from './user'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Mock dependencies
vi.mock('@/lib/auth')
vi.mock('@/lib/db')
vi.mock('next/cache')

const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma)
const mockRevalidatePath = vi.mocked(revalidatePath)

describe('updateProfile Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update user profile successfully', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    }
    
    mockAuth.mockResolvedValue(mockSession as any)
    mockPrisma.user.update.mockResolvedValue({
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe'
    } as any)

    const formData = new FormData()
    formData.set('firstName', 'John')
    formData.set('lastName', 'Doe')

    const result = await updateProfile(formData)

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { firstName: 'John', lastName: 'Doe' }
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/profile')
    expect(result).toEqual({ success: true, message: 'Profile updated successfully' })
  })

  it('should handle validation errors', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    }
    
    mockAuth.mockResolvedValue(mockSession as any)

    const formData = new FormData()
    formData.set('firstName', '') // Invalid empty name
    formData.set('lastName', 'Doe')

    const result = await updateProfile(formData)

    expect(result).toEqual({
      success: false,
      errors: {
        firstName: ['First name is required']
      }
    })
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('should handle unauthorized access', async () => {
    mockAuth.mockResolvedValue(null)

    const formData = new FormData()
    formData.set('firstName', 'John')
    formData.set('lastName', 'Doe')

    await expect(updateProfile(formData)).rejects.toThrow('Unauthorized')
  })
})
```

### Database Integration Testing

```typescript
// tests/integration/matching.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { findMatches } from '@/lib/actions/matching'

const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL
})

describe('Matching Algorithm Integration', () => {
  let testUser1: any
  let testUser2: any
  let testCourse: any

  beforeEach(async () => {
    // Clean up test data
    await prisma.message.deleteMany()
    await prisma.connection.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.userCourse.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.user.deleteMany()
    await prisma.course.deleteMany()

    // Create test data
    testUser1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        passwordHash: 'hash',
        firstName: 'John',
        lastName: 'Doe',
        university: 'Test University',
        isVerified: true
      }
    })

    testUser2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        passwordHash: 'hash',
        firstName: 'Jane',
        lastName: 'Smith',
        university: 'Test University',
        isVerified: true
      }
    })

    testCourse = await prisma.course.create({
      data: {
        name: 'Test Course',
        code: 'CS 101',
        section: '001',
        semester: 'Fall 2024',
        university: 'Test University'
      }
    })

    // Enroll both users in the same course
    await prisma.userCourse.createMany({
      data: [
        { userId: testUser1.id, courseId: testCourse.id },
        { userId: testUser2.id, courseId: testCourse.id }
      ]
    })

    // Add overlapping availability
    await prisma.availability.createMany({
      data: [
        { userId: testUser1.id, dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
        { userId: testUser2.id, dayOfWeek: 1, startTime: '11:00', endTime: '13:00' }
      ]
    })
  })

  afterEach(async () => {
    // Clean up after each test
    await prisma.$disconnect()
  })

  it('should find matches with overlapping availability', async () => {
    const formData = new FormData()
    formData.set('courseId', testCourse.id)

    // Mock auth to return testUser1
    vi.mocked(auth).mockResolvedValue({
      user: { id: testUser1.id }
    } as any)

    const result = await findMatches(formData)

    expect(result.success).toBe(true)
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].user.id).toBe(testUser2.id)
    expect(result.matches[0].availability_score).toBeGreaterThan(0)
  })

  it('should not return users without overlapping availability', async () => {
    // Remove availability for user2
    await prisma.availability.deleteMany({
      where: { userId: testUser2.id }
    })

    const formData = new FormData()
    formData.set('courseId', testCourse.id)

    vi.mocked(auth).mockResolvedValue({
      user: { id: testUser1.id }
    } as any)

    const result = await findMatches(formData)

    expect(result.success).toBe(true)
    expect(result.matches).toHaveLength(0)
  })
})
```

### End-to-End Testing with Playwright

```typescript
// tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration and Matching Flow', () => {
  test('complete user journey from registration to finding matches', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@berkeley.edu')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="firstName-input"]', 'John')
    await page.fill('[data-testid="lastName-input"]', 'Doe')
    await page.selectOption('[data-testid="university-select"]', 'University of California, Berkeley')

    // Submit registration
    await page.click('[data-testid="register-button"]')

    // Wait for redirect to login
    await expect(page).toHaveURL('/login')

    // Login with registered credentials
    await page.fill('[data-testid="email-input"]', 'test@berkeley.edu')
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.click('[data-testid="login-button"]')

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')

    // Complete profile setup
    await page.click('[data-testid="complete-profile-button"]')
    
    await page.fill('[data-testid="bio-input"]', 'Computer Science student looking for study partners')
    await page.selectOption('[data-testid="study-style-select"]', 'collaborative')
    await page.selectOption('[data-testid="study-pace-select"]', 'moderate')
    await page.selectOption('[data-testid="location-select"]', 'library')

    // Set availability
    await page.click('[data-testid="monday-10am"]')
    await page.click('[data-testid="monday-11am"]')
    await page.click('[data-testid="wednesday-2pm"]')

    await page.click('[data-testid="save-profile-button"]')

    // Navigate to courses
    await page.click('[data-testid="courses-tab"]')

    // Search and add a course
    await page.fill('[data-testid="course-search"]', 'CS 161')
    await page.click('[data-testid="course-result-0"]')
    await page.click('[data-testid="enroll-button"]')

    // Navigate to matches
    await page.click('[data-testid="matches-tab"]')
    await page.click('[data-testid="find-matches-button"]')

    // Wait for matches to load
    await expect(page.locator('[data-testid="match-card"]')).toBeVisible()

    // Send connection request
    await page.click('[data-testid="connect-button-0"]')
    await page.fill('[data-testid="connection-message"]', 'Hi! I\'d love to study together for CS 161.')
    await page.click('[data-testid="send-request-button"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Connection request sent')
  })

  test('real-time chat functionality', async ({ browser }) => {
    // Create two browser contexts for two users
    const user1Context = await browser.newContext()
    const user2Context = await browser.newContext()

    const user1Page = await user1Context.newPage()
    const user2Page = await user2Context.newPage()

    // Login as two different users
    await user1Page.goto('/login')
    await user1Page.fill('[data-testid="email-input"]', 'user1@berkeley.edu')
    await user1Page.fill('[data-testid="password-input"]', 'password')
    await user1Page.click('[data-testid="login-button"]')

    await user2Page.goto('/login')
    await user2Page.fill('[data-testid="email-input"]', 'user2@berkeley.edu')
    await user2Page.fill('[data-testid="password-input"]', 'password')
    await user2Page.click('[data-testid="login-button"]')

    // Navigate to chat for both users
    await user1Page.goto('/chat/connection-123')
    await user2Page.goto('/chat/connection-123')

    // User 1 sends a message
    await user1Page.fill('[data-testid="message-input"]', 'Hello! When should we study?')
    await user1Page.click('[data-testid="send-message-button"]')

    // User 2 should receive the message
    await expect(user2Page.locator('[data-testid="message-0"]')).toContainText('Hello! When should we study?')

    // User 2 replies
    await user2Page.fill('[data-testid="message-input"]', 'How about tomorrow at 2 PM?')
    await user2Page.click('[data-testid="send-message-button"]')

    // User 1 should receive the reply
    await expect(user1Page.locator('[data-testid="message-1"]')).toContainText('How about tomorrow at 2 PM?')

    // Clean up
    await user1Context.close()
    await user2Context.close()
  })
})
```

### Performance Testing

```typescript
// tests/performance/api-performance.test.ts
import { test, expect } from '@playwright/test'

test.describe('API Performance Tests', () => {
  test('matches API should respond within 500ms', async ({ request }) => {
    const start = Date.now()
    
    const response = await request.get('/api/matches/course_123', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    
    const duration = Date.now() - start
    
    expect(response.ok()).toBe(true)
    expect(duration).toBeLessThan(500)
  })

  test('user profile API should respond within 200ms', async ({ request }) => {
    const start = Date.now()
    
    const response = await request.get('/api/users/profile', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    
    const duration = Date.now() - start
    
    expect(response.ok()).toBe(true)
    expect(duration).toBeLessThan(200)
  })

  test('database queries should be optimized', async ({ request }) => {
    const queries = [
      '/api/matches/course_123',
      '/api/users/profile',
      '/api/courses',
      '/api/connections'
    ]

    for (const query of queries) {
      const start = Date.now()
      const response = await request.get(query)
      const duration = Date.now() - start
      
      expect(response.ok()).toBe(true)
      expect(duration).toBeLessThan(1000) // 1 second max
    }
  })
})
```

### Security Testing

```typescript
// tests/security/auth-security.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Security Tests', () => {
  test('should prevent SQL injection in login', async ({ request }) => {
    const maliciousEmail = "admin'; DROP TABLE users; --"
    
    const response = await request.post('/api/auth/login', {
      data: {
        email: maliciousEmail,
        password: 'password'
      }
    })

    expect(response.status()).toBe(400)
    
    // Verify users table still exists by making a valid request
    const validResponse = await request.get('/api/users/profile', {
      headers: { 'Authorization': 'Bearer valid-token' }
    })
    expect(validResponse.status()).not.toBe(500)
  })

  test('should prevent XSS in user input', async ({ page }) => {
    await page.goto('/register')

    const xssPayload = '<script>alert("XSS")</script>'
    
    await page.fill('[data-testid="firstName-input"]', xssPayload)
    await page.fill('[data-testid="lastName-input"]', 'Doe')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'Password123!')
    await page.selectOption('[data-testid="university-select"]', 'Test University')

    await page.click('[data-testid="register-button"]')

    // Check that script tag was escaped/sanitized
    const firstNameValue = await page.inputValue('[data-testid="firstName-input"]')
    expect(firstNameValue).not.toContain('<script>')
  })

  test('should enforce rate limiting on auth endpoints', async ({ request }) => {
    const loginAttempts = []
    
    // Make multiple rapid login attempts
    for (let i = 0; i < 15; i++) {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      })
      loginAttempts.push(response.status())
    }

    // Should get rate limited after 10 attempts
    expect(loginAttempts.filter(status => status === 429).length).toBeGreaterThan(0)
  })

  test('should validate file uploads', async ({ request }) => {
    // Try to upload a malicious file
    const maliciousFile = Buffer.from('<?php system($_GET["cmd"]); ?>')
    
    const response = await request.post('/api/users/profile/image', {
      multipart: {
        file: {
          name: 'malicious.php',
          mimeType: 'application/x-php',
          buffer: maliciousFile
        }
      },
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    })

    expect(response.status()).toBe(400)
    const errorData = await response.json()
    expect(errorData.error).toContain('Invalid file type')
  })
})
```

### Test Utilities and Helpers

```typescript
// tests/utils/test-helpers.ts
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

export class TestDatabase {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL
    })
  }

  async createTestUser(overrides: any = {}) {
    return this.prisma.user.create({
      data: {
        email: faker.internet.email(),
        passwordHash: 'hashedpassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        university: 'Test University',
        isVerified: true,
        ...overrides
      }
    })
  }

  async createTestCourse(overrides: any = {}) {
    return this.prisma.course.create({
      data: {
        name: faker.company.name(),
        code: faker.string.alphanumeric(6),
        section: '001',
        semester: 'Fall 2024',
        university: 'Test University',
        ...overrides
      }
    })
  }

  async createTestConnection(requesterId: string, targetId: string, courseId: string) {
    return this.prisma.connection.create({
      data: {
        requesterId,
        targetId,
        courseId,
        status: 'pending'
      }
    })
  }

  async cleanup() {
    // Delete in correct order to respect foreign key constraints
    await this.prisma.message.deleteMany()
    await this.prisma.connection.deleteMany()
    await this.prisma.availability.deleteMany()
    await this.prisma.userCourse.deleteMany()
    await this.prisma.userProfile.deleteMany()
    await this.prisma.user.deleteMany()
    await this.prisma.course.deleteMany()
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

export class TestAuthHelper {
  static createMockSession(user: any) {
    return {
      user,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }
  }

  static createMockJWT(userId: string) {
    // In real tests, you might use a JWT library to create proper tokens
    return `mock-jwt-token-${userId}`
  }
}

export class TestDataFactory {
  static createUserData(overrides: any = {}) {
    return {
      email: faker.internet.email(),
      password: 'TestPassword123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      university: 'University of California, Berkeley',
      ...overrides
    }
  }

  static createCourseData(overrides: any = {}) {
    return {
      name: faker.company.name(),
      code: faker.string.alphanumeric(6),
      section: '001',
      semester: 'Fall 2024',
      instructor: faker.person.fullName(),
      ...overrides
    }
  }

  static createAvailabilityData(userId: string, overrides: any = {}) {
    return {
      userId,
      dayOfWeek: faker.number.int({ min: 0, max: 6 }),
      startTime: '10:00',
      endTime: '12:00',
      ...overrides
    }
  }
}
```

---

*Last Updated: January 2024*  
*Testing Guide Version: 1.0.0*
