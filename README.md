# Campus Connect

**Connecting students, enriching campus life** 🎓

Campus Connect is a comprehensive platform designed to enhance the college experience by connecting students with events, resources, and each other. Built with modern web technologies, our MVP focuses on creating a vibrant, engaged campus community.

## 🎯 Mission

To create an inclusive digital hub that empowers students to discover opportunities, build connections, and make the most of their campus experience.

## ✨ Features (MVP Scope)

- 🎉 **Event Discovery** - Find and join campus events tailored to your interests
- 👤 **User Profiles** - Create and customize your student profile
- 🔔 **Notifications** - Stay updated on events and activities
- 🤝 **Community Engagement** - Connect with fellow students
- 📱 **Responsive Design** - Access from any device

## 🏗️ Project Structure

```
/frontend      # React + TypeScript + Vite application
/backend       # Node.js + Express API with database integration
/shared        # Shared constants, types, and utilities
/docs          # Technical documentation, diagrams, onboarding guides
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ctp-connectsphere/connectsphere.git
   cd connectsphere
   ```

2. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

3. **Set up the backend** (in a new terminal)
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```
   Backend API runs at `http://localhost:3000`

4. **Verify the setup**
   - Visit `http://localhost:5173` for the frontend
   - Visit `http://localhost:3000/health` for the API health check

For detailed setup instructions, see our [Onboarding Guide](docs/ONBOARDING.md).

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- ESLint

### Backend
- Node.js
- Express
- CORS & dotenv

### Development Tools
- ESLint for code quality
- Nodemon for development

## 📚 Documentation

- [Onboarding Guide](docs/ONBOARDING.md) - Get started with development
- [Technical Documentation](docs/TECHNICAL.md) - Architecture and API details
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches

## 🧪 Testing & Quality

```bash
# Frontend linting
cd frontend && npm run lint

# Backend linting
cd backend && npm run lint

# Build frontend
cd frontend && npm run build
```

## 📋 Roadmap

### Phase 1: MVP (Current)
- [x] Project setup and repository configuration
- [ ] User authentication
- [ ] Event listing and details
- [ ] Basic user profiles
- [ ] Core UI components

### Phase 2: Enhanced Features
- [ ] Advanced search and filtering
- [ ] Event recommendations
- [ ] User notifications
- [ ] Social features

### Phase 3: Scale & Optimize
- [ ] Performance optimization
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Admin panel

## 👥 Target Audience

- **Primary**: College students seeking campus engagement
- **Secondary**: Campus organizations and event coordinators
- **Tertiary**: University administration

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ by the Campus Connect team for the CUNY Tech Prep program.

---

**Status**: Phase 1 MVP Development 🚧

For questions or support, please open an issue on GitHub.
