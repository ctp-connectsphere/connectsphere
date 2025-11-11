# Contributing to Campus Connect

## Table of Contents

1. [Welcome](#welcome)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Pull Request Process](#pull-request-process)
6. [Issue Guidelines](#issue-guidelines)
7. [Community Guidelines](#community-guidelines)
8. [Release Process](#release-process)

---

## Welcome

Thank you for your interest in contributing to Campus Connect! This guide will help you get started with contributing to our project. Whether you're fixing a bug, adding a feature, or improving documentation, your contributions are valuable to our community.

**Before you start contributing, please read our:**

- [Technical Documentation](../TECHNICAL_DOCUMENTATION.md) - Understanding the project architecture
- [API Reference](./API_REFERENCE.md) - Backend API documentation
- [Database Schema](./DATABASE_SCHEMA.md) - Database design and structure

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Git** (latest version)
- **Node.js 20.x** or higher
- **npm** or **yarn** package manager
- **Docker Desktop** (for local database)
- **VS Code** (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Prisma
  - ESLint
  - Prettier

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR_USERNAME/connectsphere.git
cd connectsphere
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/original-org/connectsphere.git
```

4. **Install dependencies**:

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

5. **Set up environment variables**:

```bash
# Copy environment files
cp .env.example .env.local
cp backend/.env.example backend/.env

# Edit the files with your local configuration
```

6. **Start development services**:

```bash
# Start database and Redis
docker-compose up -d postgres redis

# Run database migrations
cd backend
npm run migrate:dev
cd ..

# Start development servers
npm run dev
```

---

## Development Workflow

### Branch Strategy

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

**Branch Types:**

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical production fixes
- `release/version` - Release preparation

### Creating a Feature Branch

```bash
# Ensure you're on develop and it's up to date
git checkout develop
git pull upstream develop

# Create and checkout your feature branch
git checkout -b feature/your-feature-name

# Example branch names:
# feature/user-profile-editing
# feature/real-time-notifications
# bugfix/authentication-token-expiry
# hotfix/security-patch
```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: type(scope): description

# Examples:
git commit -m "feat(auth): add JWT token refresh functionality"
git commit -m "fix(matching): resolve compatibility score calculation bug"
git commit -m "docs(api): update authentication endpoint documentation"
git commit -m "style(ui): improve button component styling"
git commit -m "test(matching): add unit tests for matching algorithm"
git commit -m "refactor(database): optimize user query performance"
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Development Process

1. **Start with an issue** - Check if there's an existing issue or create one
2. **Create feature branch** - From `develop` branch
3. **Make your changes** - Follow coding standards
4. **Write tests** - Ensure adequate test coverage
5. **Update documentation** - If needed
6. **Commit your changes** - Using conventional commit format
7. **Push your branch** - To your fork
8. **Create pull request** - Against `develop` branch

---

## Code Standards

### TypeScript Standards

**File Naming:**

```typescript
// kebab-case for files
user - profile.tsx;
auth - service.ts;
matching - algorithm.ts;

// PascalCase for components
UserProfile.tsx;
AuthService.ts;
MatchingAlgorithm.ts;
```

**Function and Variable Naming:**

```typescript
// camelCase for functions and variables
const getUserProfile = async (userId: string) => {
  const userProfile = await fetchUserData(userId);
  return userProfile;
};

// PascalCase for classes and interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResult> {
    // Implementation
  }
}

// UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.campusconnect.app';
const MAX_RETRY_ATTEMPTS = 3;
```

**Type Definitions:**

```typescript
// Prefer interfaces for object shapes
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// Use type aliases for unions and primitives
type Status = 'pending' | 'accepted' | 'declined';
type UserId = string;

// Generic types for reusable components
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### React Standards

**Component Structure:**

```typescript
// Component with proper TypeScript interfaces
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
}) => {
  // Component implementation
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

export default Button
```

**Custom Hooks:**

```typescript
// Custom hooks should start with 'use'
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hook implementation
  }, []);

  return { user, loading, login, logout };
};

export { useAuth };
```

### Backend Standards

**Controller Structure:**

```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiResponse } from '../types/ApiResponse';

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserProfile(userId);

    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User profile retrieved successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
```

**Service Layer:**

```typescript
// services/userService.ts
import prisma from '../config/database';
import { User, CreateUserData } from '../types/User';

export class UserService {
  async getUserProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: userData,
      include: { profile: true },
    });
  }
}

export const userService = new UserService();
```

### Testing Standards

**Frontend Tests:**

```typescript
// Button.test.tsx
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
})
```

**Backend Tests:**

```typescript
// userController.test.ts
import request from 'supertest';
import { app } from '../app';
import { userService } from '../services/userService';

jest.mock('../services/userService');
const mockUserService = jest.mocked(userService);

describe('User Controller', () => {
  describe('GET /api/v1/users/:userId/profile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUserService.getUserProfile.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/user_123/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });
  });
});
```

---

## Pull Request Process

### Before Submitting

- [ ] **Code follows style guidelines** - Run `npm run lint` and fix issues
- [ ] **Tests are included** - Add tests for new functionality
- [ ] **Tests are passing** - Run `npm run test` and ensure all tests pass
- [ ] **Documentation is updated** - Update relevant documentation
- [ ] **No console.log statements** - Remove debug statements
- [ ] **Error handling is appropriate** - Proper error handling and user feedback
- [ ] **Performance considerations** - No obvious performance issues

### Creating a Pull Request

1. **Push your branch** to your fork:

```bash
git push origin feature/your-feature-name
```

2. **Create pull request** on GitHub:
   - Title: Brief description of changes
   - Description: Detailed explanation of what was changed and why
   - Link related issues: Use "Fixes #123" or "Closes #123"
   - Add screenshots for UI changes

3. **Pull Request Template:**

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Code Review Process

**Review Checklist:**

- [ ] **Functionality** - Does the code work as intended?
- [ ] **Code Quality** - Is the code clean, readable, and maintainable?
- [ ] **Performance** - Are there any performance concerns?
- [ ] **Security** - Are there any security vulnerabilities?
- [ ] **Testing** - Are there adequate tests?
- [ ] **Documentation** - Is documentation updated appropriately?

**Review Guidelines:**

- Be constructive and respectful
- Focus on the code, not the person
- Explain your reasoning for suggestions
- Be specific about what needs to be changed
- Acknowledge good practices and improvements

**Response to Reviews:**

- Address all feedback promptly
- Ask for clarification if needed
- Make requested changes in new commits
- Update the PR description if significant changes are made

---

## Issue Guidelines

### Creating Issues

**Bug Reports:**

```markdown
## Bug Description

A clear and concise description of what the bug is.

## To Reproduce

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 1.0.0]

## Additional Context

Add any other context about the problem here.
```

**Feature Requests:**

```markdown
## Feature Description

A clear and concise description of what you want to happen.

## Problem Statement

Is your feature request related to a problem? Please describe.

## Proposed Solution

Describe the solution you'd like.

## Alternatives Considered

Describe any alternative solutions or features you've considered.

## Additional Context

Add any other context or screenshots about the feature request here.
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority
- `frontend` - Frontend related
- `backend` - Backend related
- `database` - Database related
- `testing` - Testing related

---

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

**Be Respectful:**

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community

**Be Professional:**

- Show empathy towards other community members
- Be collaborative
- When we disagree, try to understand why
- Focus on resolving issues and learning from mistakes

**Be Inclusive:**

- Welcome newcomers and help them get started
- Be patient with those who are learning
- Encourage questions and provide helpful answers
- Respect different skill levels and backgrounds

### Getting Help

**Communication Channels:**

- **GitHub Discussions** - General questions and discussions
- **GitHub Issues** - Bug reports and feature requests
- **Pull Request Comments** - Code review discussions
- **Email** - Security issues (security@campusconnect.app)

**Getting Help Guidelines:**

- Search existing issues and discussions before asking
- Provide clear, detailed information
- Include relevant code snippets and error messages
- Be patient - maintainers are volunteers

---

## Release Process

### Version Numbering

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to API or database schema
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Release Workflow

1. **Feature Complete** - All features for the release are merged to `develop`
2. **Create Release Branch** - `git checkout -b release/v1.2.0`
3. **Final Testing** - Comprehensive testing and bug fixes
4. **Update Documentation** - Update changelog and documentation
5. **Merge to Main** - Create PR from release branch to `main`
6. **Tag Release** - Create git tag and GitHub release
7. **Deploy** - Automated deployment to production
8. **Merge Back** - Merge `main` back to `develop`

### Changelog

All notable changes are documented in [CHANGELOG.md](../CHANGELOG.md):

```markdown
## [1.1.0] - 2025-10-10

### Added

- User profile editing functionality
- Real-time notifications for connection requests
- Dark mode theme support

### Changed

- Improved matching algorithm accuracy
- Updated UI/UX design for better accessibility

### Fixed

- Fixed authentication token expiry issue
- Resolved chat message ordering bug
- Fixed mobile responsiveness issues

### Security

- Updated dependencies to address vulnerabilities
- Enhanced input validation for user data
```

---

## Recognition

We appreciate all contributions to Campus Connect! Contributors will be recognized in:

- **README.md** - List of contributors
- **Release Notes** - Recognition for significant contributions
- **GitHub Contributors** - Automatic recognition through GitHub

**Types of Contributions:**

- Code contributions
- Documentation improvements
- Bug reports and testing
- Community support and mentoring
- Design and UX improvements

---

## Questions?

If you have any questions about contributing, please:

1. Check the [Technical Documentation](../TECHNICAL_DOCUMENTATION.md)
2. Search existing [GitHub Issues](https://github.com/your-org/connectsphere/issues)
3. Start a [GitHub Discussion](https://github.com/your-org/connectsphere/discussions)
4. Contact the maintainers at [maintainers@campusconnect.app](mailto:maintainers@campusconnect.app)

Thank you for contributing to Campus Connect! 🚀

---

_Last Updated: Oct. 2025_  
_Contributing Guide Version: 1.0.0_
