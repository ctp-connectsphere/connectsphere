# Developer Onboarding Guide

Welcome to the Campus Connect project! This guide will help you get started with development.

## Project Overview

**Campus Connect** is a platform designed to enhance campus life by connecting students with events, resources, and each other. Our MVP focuses on core features like event discovery, user profiles, and community engagement.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ctp-connectsphere/connectsphere.git
cd connectsphere
```

### 2. Set Up the Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend should now be running at `http://localhost:5173`

### 3. Set Up the Backend

In a new terminal:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend API should now be running at `http://localhost:3000`

### 4. Verify the Setup

- Frontend: Open `http://localhost:5173` in your browser
- Backend: Visit `http://localhost:3000/health` - you should see a JSON response

## Project Structure

```
/frontend      # React + TypeScript + Vite application
/backend       # Node.js + Express API
/shared        # Shared constants, types, and utilities
/docs          # Technical documentation
```

## Development Workflow

### Running Linters

**Frontend:**
```bash
cd frontend
npm run lint
```

**Backend:**
```bash
cd backend
npm run lint
```

### Building the Project

**Frontend:**
```bash
cd frontend
npm run build
```

### Running Tests

Tests will be added in future phases. Currently:
```bash
npm test
```

## Code Style

- Follow the ESLint configurations provided
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Git Workflow

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Description of changes"`
3. Push to the repository: `git push origin feature/your-feature-name`
4. Create a Pull Request on GitHub

## Common Issues

### Port Already in Use

If port 3000 or 5173 is already in use, you can change it:
- Frontend: Update `vite.config.ts`
- Backend: Update `PORT` in `.env` file

### Module Not Found

Run `npm install` in the respective directory (frontend or backend).

## Getting Help

- Check the [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Review existing issues on GitHub
- Reach out to the team in our communication channels

## Next Steps

1. Read through the [Technical Documentation](./TECHNICAL.md)
2. Review the [Contributing Guidelines](../CONTRIBUTING.md)
3. Check the GitHub Issues for tasks labeled `good-first-issue`
4. Join the team communication channels

Happy coding! 🚀
