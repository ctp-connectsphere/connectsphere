# Contributing to Campus Connect

Thank you for your interest in contributing to Campus Connect! We're excited to have you join our community.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Pull Requests

1. **Fork the repository** and create your branch from `develop`
2. **Follow the coding style** of the project
3. **Write clear commit messages**
4. **Include tests** if applicable
5. **Update documentation** as needed
6. **Ensure the test suite passes**
7. **Make sure your code lints**

## 🔧 Development Process

### Setting Up Your Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/connectsphere.git`
3. Add upstream remote: `git remote add upstream https://github.com/ctp-connectsphere/connectsphere.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

### Making Changes

1. Make your changes in your feature branch
2. Follow the existing code style and patterns
3. Test your changes locally
4. Commit your changes with clear messages

### Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Examples:
```
Add event filtering by category

Implement filtering functionality for events by category type.
Closes #123
```

### Code Style

#### JavaScript/TypeScript
- Use meaningful variable names
- Follow ESLint configurations
- Add comments for complex logic
- Keep functions small and focused
- Use async/await over promises when possible

#### React Components
- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript for prop types
- Follow React best practices

#### CSS
- Use meaningful class names
- Follow BEM or similar naming convention
- Prefer utility classes when appropriate

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage
- Test edge cases

### Documentation

- Update README.md if needed
- Add JSDoc comments for functions
- Update API documentation for new endpoints
- Include inline comments for complex logic

## 🔄 Git Workflow

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/what-was-refactored` - Code refactoring
- `test/test-description` - Adding or updating tests

### Pull Request Process

1. Update your branch with the latest from `develop`:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. Push your changes:
   ```bash
   git push origin feature/your-feature-name
   ```

3. Create a Pull Request:
   - Provide a clear title and description
   - Link related issues
   - Request review from maintainers
   - Wait for CI checks to pass

4. Address review feedback:
   - Make requested changes
   - Push updates to your branch
   - Respond to comments

5. Once approved, your PR will be merged!

## 📋 Code Review Guidelines

### For Contributors

- Be open to feedback
- Respond to comments promptly
- Ask questions if anything is unclear
- Be patient during the review process

### For Reviewers

- Be respectful and constructive
- Explain the reasoning behind suggestions
- Approve when ready or request specific changes
- Provide helpful resources when needed

## 🐛 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on

## 🎯 Priority Levels

- `critical` - Blocks core functionality
- `high` - Important but not blocking
- `medium` - Should be addressed soon
- `low` - Nice to have

## 🔐 Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Provide details about the vulnerability
4. Allow time for the issue to be addressed

## 📞 Getting Help

- Check the [Onboarding Guide](docs/ONBOARDING.md)
- Review [Technical Documentation](docs/TECHNICAL.md)
- Ask questions in GitHub Discussions
- Reach out to maintainers

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Special contributors page (coming soon)

## 📜 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community welcoming and inclusive.

---

Thank you for contributing to Campus Connect! Your efforts help make campus life better for students everywhere. 🎓✨
