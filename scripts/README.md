# Test Scripts

This directory contains integration and utility test scripts that complement the Vitest unit tests.

## Available Scripts

### Integration Tests

- **`test-all-functions.ts`** - Comprehensive integration test suite
  - Runs all authentication functions together
  - Environment checks
  - Database connectivity
  - Email service tests
  - Full end-to-end flow testing

  **Run**: `npm run test:integration`

### Utility Tests

- **`test-email-service.ts`** - Email service specific tests
  - Password reset email sending
  - EMAIL_FROM configuration
  - Resend API integration

  **Run**: `npm run test:email`

## Unit Tests (Vitest)

Unit tests are now written using **Vitest** and located in:

- `src/lib/actions/__tests__/auth.test.ts` - Authentication function tests

**Run unit tests**:

```bash
npm test              # Run all unit tests
npm run test:watch    # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

See [Testing Framework Guide](../docs/TESTING_FRAMEWORK.md) for details.

## Other Scripts

- `debug-db.ts` - Database debugging utilities
- `debug-redis.ts` - Redis debugging utilities
- `browse-redis.ts` - Browse Redis data
- `cleanup-sessions.ts` - Clean up sessions
- `validate-config.ts` - Validate environment configuration
- `seed-dev.ts` - Seed development database
- `seed-comprehensive.ts` - Comprehensive seed data
- `prisma-studio.ts` - Launch Prisma Studio
- `neon-db-check.cjs` - Check Neon database connectivity
