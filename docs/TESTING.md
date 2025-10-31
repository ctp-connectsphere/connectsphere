# Complete Testing Guide

> This document consolidates all testing-related content, including Vitest unit tests and Scripts integration tests.

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Framework](#testing-framework)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Test Organization](#test-organization)
7. [Best Practices](#best-practices)
8. [Test Coverage](#test-coverage)
9. [Adding New Tests](#adding-new-tests)
10. [FAQ](#faq)

---

## Overview

The project uses two testing approaches:

### 1. Vitest Unit Tests (`src/__tests__/`)

- ✅ Fast, isolated unit tests
- ✅ Uses testing framework (Vitest)
- ✅ Automatic discovery and execution
- ✅ Suitable for single function testing

### 2. Scripts Integration Tests (`scripts/tests/`)

- ✅ Integration/end-to-end tests
- ✅ Real environment testing
- ✅ Manual scripts, more flexible
- ✅ Suitable for complex scenarios

Both complement each other, covering different testing levels.

---

## Testing Framework

### Vitest

We use **Vitest** as our testing framework.

**Why Vitest?**

- ✅ **Fast** - Built on Vite, runs very quickly
- ✅ **Jest Compatible** - Same API as Jest, easy to learn
- ✅ **TypeScript Native** - No additional configuration needed
- ✅ **Great DX** - Interactive UI, watch mode, coverage reports
- ✅ **ESM Support** - Works seamlessly with modern JavaScript

**Installed Packages:**

- `vitest` - Testing framework
- `@vitest/ui` - Interactive test UI

**Configuration Files:**

- `vitest.config.ts` - Vitest configuration (includes path aliases)
- `vitest.setup.ts` - Test setup (loads environment variables)

---

## Test Structure

### Vitest Unit Test Structure

```
src/__tests__/
├── database/              # Database-related tests
│   ├── connection.test.ts     # Database connection and query tests
│   └── models.test.ts         # Prisma model constraints and relationships
│
├── utilities/             # Utility function tests
│   ├── password.test.ts       # Password hashing/verification (bcrypt)
│   └── validation.test.ts     # Email/password validation helpers
│
└── functions/             # Business logic/function tests
    └── auth/              # Authentication functions
        ├── register.test.ts         # User registration (6 tests)
        ├── password-reset.test.ts  # Password reset flow (9 tests)
        └── logout.test.ts          # Logout functionality (2 tests)
```

### Scripts Integration Test Structure

```
scripts/tests/
├── database/              # Database-related tests
│   └── redis-data.ts         # Redis data tests
│
├── utilities/             # Utility tests
│   └── email-service.ts      # Email service tests
│
├── functions/             # Function tests (organized by module)
│   └── auth/              # Authentication functions (extensible)
│
└── integration/           # Integration tests
    └── all-functions.ts      # Comprehensive integration test suite
```

---

## Running Tests

### Vitest Unit Test Commands

```bash
# Run all unit tests (once)
npm test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Interactive UI (visual test runner)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Run Tests by Category

```bash
# Run only database tests
npm test -- database

# Run only utility tests
npm test -- utilities

# Run only authentication function tests
npm test -- functions/auth
```

### Run Specific Test File

```bash
# Run specific test file
npm test -- register.test.ts
npm test -- password-reset.test.ts
```

### Scripts Integration Test Commands

```bash
# Integration tests (comprehensive functional tests)
npm run test:integration

# Email service tests
npm run test:email

# Redis tests
npm run test:redis
```

---

## Writing Tests

### Vitest Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerUser } from '@/lib/actions/auth';
import { prisma } from '@/lib/db/connection';

describe('registerUser', () => {
  const testEmail = `test.${Date.now()}@mail.citytech.cuny.edu`;

  afterEach(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a valid user', async () => {
    const formData = new FormData();
    formData.append('email', testEmail);
    formData.append('password', 'TestPassword123!');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('university', 'City Tech');

    const result = await registerUser(formData);

    expect(result.success).toBe(true);
    expect(result.message).toContain('successful');
  });

  it('should reject duplicate email', async () => {
    // ... test logic
  });
});
```

### Common Assertions

```typescript
// Equality
expect(result).toBe(true); // Strict equality (===)
expect(result).toEqual({ a: 1 }); // Deep equality

// Truthiness
expect(result).toBeTruthy();
expect(result).toBeFalsy();
expect(result).toBeNull();
expect(result).toBeUndefined();

// Numbers
expect(number).toBeGreaterThan(5);
expect(number).toBeLessThan(10);

// Strings
expect(str).toContain('substring');
expect(str).toMatch(/regex/);

// Arrays/Objects
expect(array).toHaveLength(5);
expect(obj).toHaveProperty('key');
expect(array).toContainEqual({ a: 1 });

// Exceptions
expect(() => func()).toThrow();
expect(() => func()).toThrowError('message');
```

### Async Testing

```typescript
it('should work with async code', async () => {
  const result = await asyncFunction();
  expect(result).toBe('success');
});

it('should handle promises', async () => {
  await expect(promiseFunction()).resolves.toBe('value');
  await expect(promiseFunction()).rejects.toThrow();
});
```

### Database Testing

```typescript
import { prisma } from '@/lib/db/connection';

describe('database tests', () => {
  beforeEach(async () => {
    // Create test data
  });

  afterEach(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    // Close connection
    await prisma.$disconnect();
  });
});
```

---

## Test Organization

### Vitest Test Categories

#### Database Tests (9 tests)

**connection.test.ts** (4 tests)

- Database connectivity
- Basic queries
- Transaction handling

**models.test.ts** (5 tests)

- User model creation
- Unique constraints (email, token)
- Model relationships

#### Utilities Tests (12 tests)

**password.test.ts** (4 tests)

- Password hashing
- Password verification
- Salt rounds consistency

**validation.test.ts** (8 tests)

- Email format validation
- .edu domain requirement
- Password length validation
- FormData handling

#### Functions Tests (17 tests)

**auth/register.test.ts** (6 tests)

- Valid registration
- Duplicate email rejection
- Non-.edu email rejection
- Missing fields validation
- Short password rejection
- Invalid email format

**auth/password-reset.test.ts** (9 tests)

- Request password reset
- Security (doesn't reveal user existence)
- Token storage
- Valid reset
- Invalid/expired/used token rejection
- Short password rejection

**auth/logout.test.ts** (2 tests)

- Successful logout
- Return value structure

**Total: 38 tests** ✅

### Scripts Test Categories

#### Database Tests

- `redis-data.ts` - Redis data operation tests

#### Utilities Tests

- `email-service.ts` - Resend email service tests

#### Integration Tests

- `all-functions.ts` - Comprehensive test suite (authentication, database, email, etc.)

---

## Best Practices

### Test File Naming

- Pattern: `*.test.ts` or `*.spec.ts`
- Examples: `register.test.ts`, `password-reset.test.ts`

### Test Organization

1. ✅ **One concern per test file** - Keep tests focused
2. ✅ **Descriptive file names** - Clearly indicate what's tested
3. ✅ **Group related tests** - Use `describe` blocks
4. ✅ **Clean up test data** - Use `afterEach`/`afterAll` hooks
5. ✅ **Isolate tests** - Tests should not depend on each other

### Test Structure

```typescript
describe('functionName', () => {
  describe('success cases', () => {
    it('should do X', () => {
      /* ... */
    });
  });

  describe('error cases', () => {
    it('should handle Y', () => {
      /* ... */
    });
  });
});
```

### Setup & Teardown

```typescript
beforeAll(() => {
  // Run once before all tests
});

afterAll(() => {
  // Run once after all tests
});

beforeEach(() => {
  // Run before each test
});

afterEach(() => {
  // Run after each test (cleanup data)
});
```

---

## Test Coverage

### Current Test Statistics

**Vitest Unit Tests: 38 tests, all passing** ✅

- Database: 9 tests
- Utilities: 12 tests
- Functions: 17 tests

### Generate Coverage Report

```bash
npm run test:coverage
```

This creates a `coverage/` directory with HTML reports.

### Coverage Goals

- Code Coverage: Target 80%+
- Critical Functions: 100% coverage
- Edge Cases: Cover as much as possible

---

## Adding New Tests

### Vitest Unit Tests

#### Database Tests

```typescript
// src/__tests__/database/new-model.test.ts
describe('NewModel', () => {
  it('should do something', () => {
    // ...
  });
});
```

#### Utility Tests

```typescript
// src/__tests__/utilities/new-utility.test.ts
describe('New Utility', () => {
  it('should do something', () => {
    // ...
  });
});
```

#### Function Tests

```bash
# Create new category
mkdir -p src/__tests__/functions/matching

# Add test file
# src/__tests__/functions/matching/algorithm.test.ts
```

### Scripts Integration Tests

#### Database Tests

```bash
touch scripts/tests/database/postgres-connection.ts
```

#### Utility Tests

```bash
touch scripts/tests/utilities/config-validation.ts
```

#### Function Tests

```bash
mkdir -p scripts/tests/functions/auth
touch scripts/tests/functions/auth/register.ts
```

#### Integration Tests

```bash
touch scripts/tests/integration/full-flow.ts
```

---

## FAQ

### Q: When to use Vitest vs Scripts tests?

**A:**

- **Vitest**: Unit tests, fast feedback, isolated testing
- **Scripts**: Integration tests, end-to-end tests, real environment testing

### Q: How to run specific tests?

**A:**

```bash
# Vitest: Use file path pattern
npm test -- register.test.ts

# Scripts: Run specific script
npm run test:email
```

### Q: Tests are slow, what to do?

**A:**

- Use `npm run test:watch` to only run changed tests
- Ensure tests are isolated and don't depend on external services
- Use mocks instead of real database calls (when needed)

### Q: How to debug failing tests?

**A:**

```bash
# Use interactive UI
npm run test:ui

# Or add console.log
console.log('Debug:', result);
```

---

## Quick Reference

### All Test Commands

```bash
# Vitest unit tests
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:ui             # Interactive UI
npm run test:coverage       # Coverage report

# Scripts integration tests
npm run test:integration    # Integration tests
npm run test:email          # Email tests
npm run test:redis          # Redis tests
```

### Test File Locations

- **Vitest**: `src/__tests__/`
- **Scripts**: `scripts/tests/`

### Configuration Files

- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Jest Documentation](https://jestjs.io/) (Vitest is Jest-compatible)

---

## Changelog

### 2025-10-30

- ✅ Installed and configured Vitest
- ✅ Migrated manual test scripts to Vitest
- ✅ Created categorized test structure (database, utilities, functions)
- ✅ Organized scripts test files
- ✅ Consolidated all test documentation

### Current Status

- ✅ 38 Vitest unit tests (all passing)
- ✅ 3 Scripts integration tests
- ✅ Complete test documentation

---

## Summary

The project now has a comprehensive testing infrastructure:

1. **Vitest Unit Tests** - Fast, isolated, easy to maintain
2. **Scripts Integration Tests** - Full workflows, real environment
3. **Clear Directory Structure** - Easy to find and manage tests
4. **Complete Documentation** - Covers all testing-related content

All tests are categorized and organized for easy maintenance and expansion.
