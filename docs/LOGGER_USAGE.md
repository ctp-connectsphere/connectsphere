# Logger Usage Guide

## Overview

ConnectSphere uses a centralized logging system (`src/lib/utils/logger.ts`) to replace all `console.log`, `console.error`, and other console statements throughout the codebase. This provides:

- **Structured logging** with timestamps and log levels
- **Environment-aware logging** (development vs production)
- **Consistent formatting** across the application
- **Better debugging** with contextual information

## Import

```typescript
import { logger } from '@/lib/utils/logger';
```

## Log Levels

The logger provides different log levels for different types of messages:

### `logger.debug(message, context?)`

Use for detailed debugging information (only shown in development).

```typescript
logger.debug('Processing user request', {
  userId: user.id,
  action: 'update-profile',
});
```

### `logger.info(message, context?)`

Use for informational messages about normal application flow.

```typescript
logger.info('User logged in successfully', {
  email: user.email,
  userId: user.id,
});
```

### `logger.warn(message, context?)`

Use for warnings about potentially problematic situations.

```typescript
logger.warn('Rate limit approaching', {
  userId: user.id,
  requests: 95,
  limit: 100,
});
```

### `logger.error(message, error?, context?)`

Use for error messages with optional error objects.

```typescript
try {
  await saveUser(user);
} catch (error) {
  logger.error('Failed to save user', error, { userId: user.id });
}
```

### `logger.success(message, context?)`

Convenience method for success messages (logs at info level with visual indicator).

```typescript
logger.success('Database connection established', {
  host: config.database.host,
});
```

### `logger.failure(message, error?, context?)`

Convenience method for failure messages (logs at error level with visual indicator).

```typescript
logger.failure('Database connection failed', error, {
  host: config.database.host,
});
```

### `logger.log(message, ...args)`

Legacy support for console.log patterns. Use `logger.info()` instead when possible.

```typescript
logger.log('Simple message', arg1, arg2); // Only in development
```

## Environment Behavior

### Development Mode

- **All log levels** are displayed (debug, info, warn, error)
- Detailed stack traces for errors
- Color-coded console output

### Production Mode

- **Only warnings and errors** are logged
- Debug and info messages are suppressed
- Optimized for performance

## Context Objects

Always include relevant context when logging. This helps with debugging and monitoring:

```typescript
// ✅ Good: Includes context
logger.error('Failed to process payment', error, {
  userId: user.id,
  orderId: order.id,
  amount: order.total,
});

// ❌ Bad: Missing context
logger.error('Failed to process payment', error);
```

## Best Practices

### 1. Replace console.log with appropriate log level

```typescript
// ❌ Don't do this
console.log('User created:', user.id);
console.error('Error:', error);

// ✅ Do this
logger.info('User created', { userId: user.id });
logger.error('Error creating user', error, { email: user.email });
```

### 2. Use structured context objects

```typescript
// ✅ Good
logger.info('User action completed', {
  userId: user.id,
  action: 'profile-update',
  timestamp: new Date().toISOString(),
});

// ❌ Less useful
logger.info('User action completed: profile-update for user ' + user.id);
```

### 3. Include error objects for errors

```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', error, { operationName: 'saveData' });
}

// ❌ Missing error details
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', undefined, { operationName: 'saveData' });
}
```

### 4. Use appropriate log levels

```typescript
// Debug: Detailed debugging info
logger.debug('Cache hit', { key: cacheKey, duration: 5 });

// Info: Normal application flow
logger.info('Email sent successfully', { to: email, templateId: 'welcome' });

// Warn: Potential issues
logger.warn('High memory usage detected', { usage: '85%', threshold: '80%' });

// Error: Actual errors
logger.error('Failed to send email', error, {
  to: email,
  templateId: 'welcome',
});
```

## Examples from Codebase

### Authentication Logging

```typescript
// Login attempts
logger.warn('Failed login attempt', {
  email: data.email,
  clientIP,
});

logger.info('Successful login', {
  email: data.email,
  clientIP,
  userId: user.id,
});
```

### Database Operations

```typescript
// Connection status
logger.success('Database connection successful');
logger.failure('Database connection failed', error);
```

### Redis Operations

```typescript
// Operation monitoring
logger.debug('Redis GET operation', {
  key,
  duration: Date.now() - start,
});

logger.error('Redis operation failed', error, { operationName: 'getUser' });
```

## Migration from console.log

When migrating existing code:

1. **Replace `console.log`** → `logger.info()` or `logger.debug()`
2. **Replace `console.error`** → `logger.error()`
3. **Replace `console.warn`** → `logger.warn()`
4. **Add context objects** where helpful
5. **Remove emoji characters** (logger handles formatting)

```typescript
// Before
console.log('✅ User created:', user.id);
console.error('❌ Error:', error);

// After
logger.success('User created', { userId: user.id });
logger.error('Error creating user', error, { email: user.email });
```

## Testing

The logger is configured to work in test environments. In tests, you can mock the logger if needed:

```typescript
import { logger } from '@/lib/utils/logger';

jest.spyOn(logger, 'error').mockImplementation(() => {});
```

## See Also

- `src/lib/utils/logger.ts` - Logger implementation
- Development Decisions Documentation - Why we use structured logging
