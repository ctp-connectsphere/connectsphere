# Glossary

A comprehensive guide to terms, concepts, and abbreviations used in the Campus Connect project.

## Project-Specific Terms

### Campus Connect
The name of our platform. A comprehensive web application designed to enhance campus life by connecting students with events, resources, and each other.

### MVP (Minimum Viable Product)
The first version of Campus Connect with core features: event discovery, user profiles, and basic community engagement.

### Event Discovery
The primary feature allowing students to find and explore campus events based on their interests, schedule, and location.

### User Profile
A personalized page for each student containing their information, interests, and event participation history.

## Technical Terms

### Frontend
The client-side of the application that users interact with directly. Built with React, TypeScript, and Vite.

### Backend
The server-side of the application that handles business logic, data processing, and API endpoints. Built with Node.js and Express.

### API (Application Programming Interface)
A set of endpoints that allow the frontend to communicate with the backend to fetch or send data.

### REST (Representational State Transfer)
An architectural style for designing networked applications. Our API follows REST principles.

### SPA (Single Page Application)
A web application that loads a single HTML page and dynamically updates content without page refreshes.

## Development Terms

### CI/CD (Continuous Integration/Continuous Deployment)
Automated processes that build, test, and deploy code changes. Configured via GitHub Actions.

### ESLint
A tool for identifying and fixing problems in JavaScript/TypeScript code to maintain code quality.

### Prettier
An opinionated code formatter that ensures consistent code style across the project.

### Hot Module Replacement (HMR)
A Vite feature that updates modules in the browser without requiring a full page reload during development.

### TypeScript
A typed superset of JavaScript that adds static type checking to catch errors before runtime.

### npm (Node Package Manager)
A package manager for JavaScript that manages project dependencies.

## Architecture Terms

### Component
A reusable piece of UI in React. Can be a button, form, or entire page section.

### Route
A URL path in the application that maps to a specific page or view.

### Controller
A backend component that handles requests and coordinates between routes and models.

### Middleware
Functions in Express that process requests before they reach the route handler.

### Environment Variables
Configuration values stored outside the code, typically in `.env` files, for sensitive or environment-specific data.

## Database Terms (Future)

### Schema
The structure of the database, defining tables, columns, and relationships.

### Migration
A version-controlled change to the database schema.

### Model
A representation of a database table in code, defining its structure and relationships.

### ORM (Object-Relational Mapping)
A technique for querying and manipulating databases using an object-oriented paradigm.

## User Roles

### Student
The primary user type. Students can browse events, create profiles, and participate in campus activities.

### Admin
Users with elevated permissions who can manage events, moderate content, and access analytics.

### Organization
Campus organizations that create and manage events (to be implemented in future phases).

## Event Types

### Academic
Events related to studies, lectures, workshops, study groups, and academic competitions.

### Social
Casual gatherings, parties, meetups, and social activities.

### Sports
Athletic events, games, tournaments, and fitness activities.

### Career
Job fairs, networking events, career workshops, and professional development opportunities.

### Other
Events that don't fit into the above categories.

## Communication Terms

### Pull Request (PR)
A request to merge code changes from one branch into another, subject to review.

### Issue
A tracked task, bug report, or feature request in GitHub.

### Branch
An independent line of development in Git. We use `main`, `develop`, and `feature/*` branches.

### Commit
A saved change to the codebase with a descriptive message.

## Testing Terms (Future Implementation)

### Unit Test
Tests that verify individual functions or components work correctly in isolation.

### Integration Test
Tests that verify multiple components work together correctly.

### E2E Test (End-to-End)
Tests that simulate real user scenarios from start to finish.

### Test Coverage
The percentage of code that is executed during testing.

## Performance Terms

### Lazy Loading
Loading components or resources only when they're needed to improve initial load time.

### Code Splitting
Breaking the application into smaller chunks that can be loaded on demand.

### Caching
Storing data temporarily to reduce repeated requests and improve performance.

### CDN (Content Delivery Network)
A distributed network of servers that delivers web content based on geographic location.

## Security Terms

### Authentication
The process of verifying a user's identity (e.g., login).

### Authorization
The process of verifying what a user has access to.

### JWT (JSON Web Token)
A secure way to transmit information between parties as a JSON object.

### CORS (Cross-Origin Resource Sharing)
A security feature that controls how resources on a web page can be requested from another domain.

### Environment File (.env)
A file containing environment-specific variables and secrets that should not be committed to version control.

## Acronyms

- **API**: Application Programming Interface
- **CI/CD**: Continuous Integration/Continuous Deployment
- **CORS**: Cross-Origin Resource Sharing
- **CSS**: Cascading Style Sheets
- **E2E**: End-to-End
- **HMR**: Hot Module Replacement
- **HTML**: HyperText Markup Language
- **HTTP/HTTPS**: HyperText Transfer Protocol (Secure)
- **IDE**: Integrated Development Environment
- **JSON**: JavaScript Object Notation
- **JWT**: JSON Web Token
- **MVP**: Minimum Viable Product
- **npm**: Node Package Manager
- **ORM**: Object-Relational Mapping
- **PR**: Pull Request
- **REST**: Representational State Transfer
- **SPA**: Single Page Application
- **SQL**: Structured Query Language
- **UI**: User Interface
- **URL**: Uniform Resource Locator
- **UX**: User Experience
- **VSCode**: Visual Studio Code

## Conventions

### Naming Conventions

**Files:**
- React Components: `PascalCase.tsx` (e.g., `EventCard.tsx`)
- Utility files: `camelCase.ts` (e.g., `formatDate.ts`)
- Config files: `lowercase.config.js` (e.g., `vite.config.ts`)

**Variables:**
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- Variables/Functions: `camelCase` (e.g., `getUserEvents`)
- Components: `PascalCase` (e.g., `EventList`)

**Git Branches:**
- Features: `feature/feature-name`
- Fixes: `fix/bug-description`
- Documentation: `docs/update-description`

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

---

This glossary is a living document. Feel free to suggest additions or clarifications!
