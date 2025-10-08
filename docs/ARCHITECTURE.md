# Architecture Overview

## System Architecture

Campus Connect follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Frontend (React + TypeScript + Vite)           │    │
│  │  - User Interface                               │    │
│  │  - State Management                             │    │
│  │  - API Client                                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS (REST API)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Backend (Node.js + Express)                    │    │
│  │  - API Routes                                   │    │
│  │  - Business Logic                               │    │
│  │  - Authentication & Authorization               │    │
│  │  - Middleware                                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Database Queries
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Database (PostgreSQL - Future)                 │    │
│  │  - User Data                                    │    │
│  │  - Event Data                                   │    │
│  │  - Relationships                                │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Campus Connect                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend                Backend              Shared     │
│  ┌──────────┐           ┌──────────┐        ┌────────┐ │
│  │ React    │◄─────────►│ Express  │◄──────►│ Types  │ │
│  │ App      │   REST    │ API      │        │ Utils  │ │
│  └──────────┘           └──────────┘        └────────┘ │
│      │                       │                           │
│      │                       │                           │
│  ┌───▼──────┐           ┌───▼──────┐                   │
│  │ Pages    │           │ Routes   │                    │
│  │ Components│          │ Controllers│                  │
│  └──────────┘           └──────────┘                   │
│      │                       │                           │
│  ┌───▼──────┐           ┌───▼──────┐                   │
│  │ Services │           │ Models   │                    │
│  │ Hooks    │           │ Middleware│                   │
│  └──────────┘           └──────────┘                   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Folder Structure Details

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── assets/          # Static assets (images, fonts)
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Public static files
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

### Backend (`/backend`)

```
backend/
├── src/
│   ├── routes/          # API route definitions
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models (future database)
│   ├── middleware/      # Express middleware
│   ├── config/          # Configuration files
│   ├── utils/           # Utility functions
│   └── index.js         # Entry point
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

### Shared (`/shared`)

```
shared/
├── constants/           # Shared constants
│   └── index.js        # Common constants (roles, types)
├── types/               # Shared TypeScript types
└── utils/               # Shared utility functions
```

### Documentation (`/docs`)

```
docs/
├── ARCHITECTURE.md      # This file
├── ONBOARDING.md       # Developer onboarding guide
├── TECHNICAL.md        # Technical details
└── API.md              # API documentation (future)
```

## Data Flow

### Request Flow

1. **User Action** → User interacts with the frontend UI
2. **API Call** → Frontend service layer makes HTTP request to backend
3. **Route Handler** → Express route receives and validates request
4. **Controller** → Business logic processes the request
5. **Model** → Data access layer interacts with database (future)
6. **Response** → Data flows back through the layers to frontend
7. **UI Update** → React components update based on new data

### Example: Fetching Events

```
User clicks "View Events"
    ↓
React Component calls useEvents() hook
    ↓
Hook calls EventService.getEvents()
    ↓
Service makes GET /api/events request
    ↓
Backend route handler receives request
    ↓
EventController.getEvents() processes
    ↓
EventModel.findAll() queries database (future)
    ↓
Response: { success: true, data: [...events] }
    ↓
Service returns data to hook
    ↓
Hook updates React state
    ↓
Component re-renders with event list
```

## Technology Choices

### Why React?
- Large ecosystem and community support
- Component-based architecture for reusability
- Excellent performance with Virtual DOM
- Strong TypeScript support

### Why Express?
- Lightweight and flexible
- Middleware-based architecture
- Large ecosystem of packages
- Well-documented and battle-tested

### Why TypeScript?
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

### Why Vite?
- Fast development server with HMR
- Optimized production builds
- Native ES modules support
- Excellent TypeScript support

## Security Considerations

- **Authentication**: JWT-based authentication (planned)
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on both client and server
- **CORS**: Configured to restrict origins
- **Environment Variables**: Sensitive data in .env files
- **HTTPS**: Enforced in production
- **SQL Injection**: Parameterized queries (future database)
- **XSS Protection**: React's built-in escaping

## Scalability

### Current (MVP)
- Monolithic architecture
- Single server deployment
- Simple file-based structure

### Future Enhancements
- Microservices architecture
- Load balancing
- Database replication
- CDN for static assets
- Caching layer (Redis)
- Message queue (RabbitMQ/Kafka)

## Development vs Production

### Development
- Hot Module Replacement (HMR)
- Source maps enabled
- Detailed error messages
- CORS enabled for localhost

### Production
- Minified and bundled code
- Environment-specific configurations
- Error logging and monitoring
- Rate limiting
- HTTPS enforcement

## Deployment Strategy

### Frontend
- Build with `npm run build`
- Deploy to Vercel/Netlify
- CDN for global distribution
- Automatic SSL certificates

### Backend
- Deploy to Railway/Render
- Environment variable management
- Automatic deployments from main branch
- Health check endpoints

## Monitoring and Observability

(To be implemented)

- **Logging**: Winston or Pino
- **Error Tracking**: Sentry
- **Performance**: Application Performance Monitoring (APM)
- **Analytics**: User behavior tracking
- **Uptime Monitoring**: Status page

## Future Considerations

- **Real-time Features**: WebSocket integration for live updates
- **File Storage**: AWS S3 for user uploads
- **Search**: Elasticsearch for advanced search capabilities
- **Notifications**: Push notification service
- **Mobile App**: React Native for iOS/Android
- **Internationalization**: i18n for multiple languages

---

Last Updated: Phase 1 MVP
