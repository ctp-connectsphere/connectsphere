# Campus Connect

**Connecting Students, One Study Session at a Time**

Campus Connect is a web application designed to help university students find compatible study partners based on shared courses, availability, and study preferences. Our platform uses intelligent matching algorithms to connect students who share similar academic goals and study habits.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.x** or higher
- **npm** or **yarn** package manager
- **Git** (latest version)

### Installation

```bash
# Clone the repository
git clone https://github.com/ctp-connectsphere/connectsphere.git
cd connectsphere

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Project Structure

```
connectsphere/
├── docs/                          # Technical documentation
│   ├── API_REFERENCE.md          # Complete API documentation
│   ├── DATABASE_SCHEMA.md        # Database design and schema
│   ├── TESTING_GUIDE.md          # Testing strategies and examples
│   ├── DEPLOYMENT_GUIDE.md       # Deployment and CI/CD guide
│   └── CONTRIBUTING.md           # Contribution guidelines
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # React components
├── lib/                          # Utility libraries
│   ├── actions/                  # Server Actions
│   ├── auth/                     # NextAuth configuration
│   └── db/                       # Database utilities
├── prisma/                       # Database schema
├── public/                       # Static assets
├── TECHNICAL_DOCUMENTATION.md    # Comprehensive technical docs
├── CHANGELOG.md                  # Project changelog
└── README.md                     # This file
```

## 📚 Documentation

### For Developers

- **[Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)** - Complete project overview, architecture, and development guidelines
- **[Architecture Decisions](./docs/ARCHITECTURE_DECISIONS.md)** - Key architectural decisions and rationale
- **[API Reference](./docs/API_REFERENCE.md)** - Detailed Server Actions and API documentation
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database design with performance optimizations
- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Testing strategies and examples
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Infrastructure and deployment procedures

### For Contributors

- **[Contributing Guidelines](./docs/CONTRIBUTING.md)** - How to contribute to the project
- **[Code Standards](./docs/CONTRIBUTING.md#code-standards)** - Coding conventions and best practices
- **[Git Workflow](./docs/CONTRIBUTING.md#development-workflow)** - Branch strategy and commit guidelines

## 🎯 Project Status

**Current Version:** 0.1.0 (Documentation Phase)

### ✅ Completed

- [x] Project foundation and setup
- [x] Complete technical documentation
- [x] API specification and database schema
- [x] Testing and deployment strategies
- [x] Development guidelines and standards

### 🚧 In Progress

- [ ] Next.js application with App Router
- [ ] Server Components and Server Actions implementation
- [ ] Authentication system (NextAuth.js v5)
- [ ] Database integration (Prisma + PostgreSQL)
- [ ] Matching algorithm implementation
- [ ] Real-time features (Pusher/Ably integration)

### 📋 Planned Features

#### Phase 1 - MVP (Q4 2025)

- User authentication and registration
- User profile creation and management
- Course enrollment system
- Study partner matching algorithm
- Connection request system
- Real-time 1-on-1 chat
- Responsive web interface

#### Phase 2 - Enhanced Features (Q1 2026)

- Improved matching algorithm
- Advanced filtering options
- Study session scheduling
- Notification system
- Mobile optimization

#### Phase 3 - Group Features (Q2 2026)

- Study group formation
- Group chat functionality
- Group study scheduling
- Enhanced group matching

## 🛠️ Technology Stack

### Full-Stack Framework

- **Next.js 14+** - React framework with App Router, Server Components, and Server Actions
- **React 19+** - UI library (via Next.js)
- **TypeScript 5.8.3** - Type safety across frontend and backend
- **TailwindCSS 3.x** - Utility-first CSS framework
- **Shadcn/ui** - High-quality component library

### Authentication & Security

- **NextAuth.js v5 (Auth.js)** - Complete authentication solution
- **JWT** - Session tokens (via NextAuth.js)
- **Middleware** - Route protection and authentication checks
- **Upstash Rate Limit** - API rate limiting

### Database & Caching

- **PostgreSQL 15+** - Primary relational database
- **Prisma** - Type-safe database ORM with connection pooling
- **Upstash Redis** - Serverless Redis for caching and sessions
- **Neon or Supabase** - Serverless PostgreSQL hosting

### Infrastructure

- **Vercel** - Complete hosting (frontend + backend + edge functions)
- **Upstash** - Redis and rate limiting
- **Neon/Supabase** - PostgreSQL database
- **GitHub Actions** - CI/CD pipeline

## 🚀 Getting Started for Developers

### 1. Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 2. Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start

# Database commands
npx prisma generate
npx prisma db push
npx prisma studio
```

### 2.1 Neon PostgreSQL Setup

Use Neon for PostgreSQL in development and production.

1. Create/update your `.env` with the following:

```bash
# Connection via pooler (for app runtime)
DATABASE_URL="postgresql://neondb_owner:npg_MyIHN0h2CnFP@ep-spring-glade-ah133wuj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct connection (for Prisma migrations)
DIRECT_URL="postgresql://neondb_owner:npg_MyIHN0h2CnFP@ep-spring-glade-ah133wuj.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. Apply the Prisma schema to Neon:

```bash
npx prisma db push
```

3. (Optional) Inspect data in Prisma Studio:

```bash
npx prisma studio
```

Troubleshooting:

- If you see TLS/certificate errors, ensure `sslmode=require` is present in both URLs and retry locally (outside sandboxed environments).
- If connections are slow via the pooler, add `&pgbouncer=true&connect_timeout=15` to `DATABASE_URL`.

### 2.2 DB Connectivity Check (Script)

Run a quick connectivity test against `DATABASE_URL`:

```bash
node scripts/neon-db-check.js
```

You should see output confirming connectivity, current database, and a list of tables.

### 3. Code Quality

We use ESLint and Prettier for code quality and formatting:

```bash
# Check code quality
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./docs/CONTRIBUTING.md) before getting started.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our code standards
4. **Add tests** for your changes
5. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Workflow

```mermaid
graph LR
    A[Fork Repo] --> B[Create Branch]
    B --> C[Make Changes]
    C --> D[Write Tests]
    D --> E[Commit Changes]
    E --> F[Push Branch]
    F --> G[Create PR]
    G --> H[Code Review]
    H --> I[Merge to Develop]
```

## 📊 Project Roadmap

See our [Changelog](./CHANGELOG.md) for detailed release history and planned features.

### Upcoming Releases

- **v1.0.0** - MVP with core matching functionality
- **v1.1.0** - Enhanced matching and filtering
- **v1.2.0** - Study group features
- **v2.0.0** - University integration and SSO

## 🐛 Bug Reports & Feature Requests

Still config....

<!-- - **Bug Reports:** [Create an issue](https://github.com/your-org/connectsphere/issues/new?template=bug_report.md)
- **Feature Requests:** [Create an issue](https://github.com/your-org/connectsphere/issues/new?template=feature_request.md)
- **Security Issues:** Email [security@campusconnect.app](mailto:security@campusconnect.app) -->

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer:** [Yiming Gao] - [g1097420948@gmail.com]
- **Frontend Developer:** [Camilo Mason] - [camilomason0@gmail.com]
- **Backend Developer:** [Jolyon Burgess] - [Jolyonburgess87@gmail.com]
- **DevOps Engineer:** [Shaine Lomenario] - [shainelomenario@gmail.com]

## 🙏 Acknowledgments

- University students who provided feedback and requirements
- Open source community for the amazing tools and libraries
- Contributors who help make Campus Connect better

---

**Need Help?** Check our [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) or [open an issue](https://github.com/your-org/connectsphere/issues).

_Last Updated: Oct. 2025_
