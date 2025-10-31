# Scripts Tests Organization

Test scripts are organized by function into the following directory structure.

## Directory Structure

```
scripts/tests/
├── database/              # Database-related tests
│   └── redis-data.ts         # Redis data tests
│
├── utilities/             # Utility tests
│   └── email-service.ts      # Email service tests
│
├── functions/             # Function tests (organized by module)
│   └── auth/              # Authentication function tests
│       (future: register.ts, login.ts, etc.)
│
└── integration/           # Integration tests
    └── all-functions.ts      # Comprehensive integration test suite
```

## Test File Descriptions

### Database Tests (`database/`)

**redis-data.ts** - Redis data tests

- Test Redis connection
- Add test data
- Verify data structures

```bash
npm run test:redis
```

### Utilities Tests (`utilities/`)

**email-service.ts** - Email service tests

- Test Resend email sending
- Verify EMAIL_FROM configuration
- Test password reset emails

```bash
npm run test:email
```

### Integration Tests (`integration/`)

**all-functions.ts** - Comprehensive integration tests

- Test all authentication functions
- Database connection tests
- Environment variable checks
- End-to-end workflow tests

```bash
npm run test:integration
```

## Running Tests

### Run All Integration Tests

```bash
npm run test:integration
```

### Run Specific Test Types

```bash
npm run test:email    # Email service
npm run test:redis    # Redis tests
```

## Adding New Tests

### Database Tests

Add to `scripts/tests/database/`:

```bash
# Example: Test PostgreSQL connection
scripts/tests/database/postgres-connection.ts
```

### Utility Tests

Add to `scripts/tests/utilities/`:

```bash
# Example: Test configuration validation
scripts/tests/utilities/config-validation.ts
```

### Function Tests

Add to `scripts/tests/functions/[category]/`:

```bash
# Example: Authentication functions
scripts/tests/functions/auth/register.ts
scripts/tests/functions/auth/login.ts

# Example: Matching functions (future)
scripts/tests/functions/matching/algorithm.ts
```

### Integration Tests

Add to `scripts/tests/integration/`:

```bash
# Example: Full workflow tests
scripts/tests/integration/full-flow.ts
```

## Difference from Vitest Tests

- **Vitest Tests** (`src/__tests__/`): Unit tests using a testing framework
- **Scripts Tests** (`scripts/tests/`): Integration/end-to-end tests using manual scripts

Both complement each other:

- Vitest: Fast, isolated unit tests
- Scripts: Full workflows, real environment integration tests
