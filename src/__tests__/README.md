# Test Organization

Tests are organized into three main categories for better maintainability and discoverability.

## Directory Structure

```
src/__tests__/
├── database/          # Database-related tests
│   ├── connection.test.ts    # Database connectivity tests
│   └── models.test.ts        # Prisma model tests
├── utilities/         # Utility function tests
│   ├── password.test.ts      # Password hashing/verification
│   └── validation.test.ts    # Validation helpers
└── functions/         # Business logic/function tests
    └── auth/          # Authentication functions
        ├── register.test.ts         # User registration
        ├── password-reset.test.ts   # Password reset flow
        └── logout.test.ts           # Logout functionality
```

## Test Categories

### Database Tests (`database/`)

Tests for database connectivity, models, and queries:

- **`connection.test.ts`** - Database connection and basic queries
- **`models.test.ts`** - Prisma model constraints and relationships

**Example:**

```typescript
describe('Database Connection', () => {
  it('should connect to database successfully', async () => {
    await prisma.$connect();
    // ...
  });
});
```

### Utilities Tests (`utilities/`)

Tests for utility functions and helpers:

- **`password.test.ts`** - Password hashing and verification (bcrypt)
- **`validation.test.ts`** - Email validation, password validation, etc.

**Example:**

```typescript
describe('Password Utilities', () => {
  it('should hash a password', async () => {
    const hash = await bcrypt.hash('password', 12);
    // ...
  });
});
```

### Functions Tests (`functions/`)

Tests for business logic and server actions:

- **`functions/auth/register.test.ts`** - User registration
- **`functions/auth/password-reset.test.ts`** - Password reset flow
- **`functions/auth/logout.test.ts`** - Logout functionality

**Future subdirectories:**

- `functions/matching/` - Matching algorithm tests
- `functions/profile/` - Profile management tests
- `functions/courses/` - Course-related tests

**Example:**

```typescript
describe('registerUser', () => {
  it('should register a valid user', async () => {
    const result = await registerUser(formData);
    expect(result.success).toBe(true);
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests by Category

```bash
# Run only database tests
npm test -- database

# Run only utility tests
npm test -- utilities

# Run only auth function tests
npm test -- functions/auth
```

### Run Specific Test File

```bash
npm test -- register.test.ts
```

## Adding New Tests

1. **Database tests**: Add to `database/` directory
2. **Utility tests**: Add to `utilities/` directory
3. **Function tests**: Add to `functions/[category]/` directory

Create new subdirectories as needed:

```bash
mkdir -p src/__tests__/functions/matching
```

## Best Practices

- ✅ Keep tests focused on one category
- ✅ Use descriptive test file names: `*.test.ts`
- ✅ Group related tests in `describe` blocks
- ✅ Clean up test data in `afterEach` hooks
- ✅ Close database connections in `afterAll` hooks
