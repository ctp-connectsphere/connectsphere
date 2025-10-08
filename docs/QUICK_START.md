# Quick Start Guide

Get Campus Connect up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Git installed

## Setup Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/ctp-connectsphere/connectsphere.git
cd connectsphere

# Install all dependencies (optional, using root package.json)
npm run install:all
```

Or install individually:

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies  
cd ../backend && npm install
```

### 2. Configure Environment Variables

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Edit the `.env` files if you need to change default ports or add configurations.

### 3. Start Development Servers

**Option A: Using root scripts**
```bash
# Start frontend (in one terminal)
npm run dev:frontend

# Start backend (in another terminal)
npm run dev:backend
```

**Option B: Manually**
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### 4. Verify Setup

- **Frontend**: Open http://localhost:5173
  - You should see the Campus Connect React app
  
- **Backend**: Open http://localhost:3000/health
  - You should see: `{"status":"ok","message":"Campus Connect API is running"}`

## Development Commands

### Linting

```bash
# Lint frontend
npm run lint:frontend
# or
cd frontend && npm run lint

# Lint backend
npm run lint:backend
# or
cd backend && npm run lint

# Lint both
npm run lint
```

### Building

```bash
# Build frontend for production
npm run build:frontend
# or
cd frontend && npm run build
```

### Testing

```bash
# Run backend tests
npm run test:backend
# or
cd backend && npm test
```

## Common Issues

### Port Already in Use

**Frontend (Port 5173)**
```bash
# Edit frontend/vite.config.ts and change the port:
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
})
```

**Backend (Port 3000)**
```bash
# Edit backend/.env
PORT=3001
```

### Dependencies Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
cd frontend
rm -rf dist node_modules
npm install
npm run build
```

## Next Steps

1. 📚 Read the full [Onboarding Guide](ONBOARDING.md)
2. 🏗️ Review the [Architecture Documentation](ARCHITECTURE.md)
3. 💻 Check out the [Technical Documentation](TECHNICAL.md)
4. 🤝 Read the [Contributing Guidelines](../CONTRIBUTING.md)

## Get Help

- 🐛 Found a bug? [Open an issue](https://github.com/ctp-connectsphere/connectsphere/issues)
- 💬 Have questions? Check existing discussions
- 📖 Need more details? See full documentation in `/docs`

Happy coding! 🚀
