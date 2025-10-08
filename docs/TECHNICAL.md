# Technical Documentation

## Architecture Overview

Campus Connect follows a client-server architecture with clear separation of concerns:

- **Frontend**: React-based SPA with TypeScript and Vite
- **Backend**: RESTful API built with Node.js and Express
- **Shared**: Common code, types, and constants used by both

## Technology Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework (to be added)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (to be configured)
- **Nodemon** - Auto-restart for backend development

## API Endpoints

### Health Check
- **GET** `/health` - Check API status
  - Response: `{ status: 'ok', message: 'Campus Connect API is running' }`

### API Base
- **GET** `/api` - API welcome message

(More endpoints will be documented as they are implemented)

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000/api)
- `VITE_NODE_ENV` - Environment (development/production)

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Database Schema

Database integration will be added in future phases. Planned structure:

### Users
- id (UUID)
- email (string)
- name (string)
- role (enum: student, admin)
- created_at (timestamp)
- updated_at (timestamp)

### Events
- id (UUID)
- title (string)
- description (text)
- type (enum: academic, social, sports, career, other)
- date (timestamp)
- location (string)
- created_by (UUID - foreign key to Users)
- created_at (timestamp)
- updated_at (timestamp)

## Security Considerations

- Environment variables for sensitive data
- CORS configuration to restrict origins
- Input validation on all API endpoints
- JWT authentication (to be implemented)
- Rate limiting (to be implemented)

## Development Guidelines

### Code Organization

**Frontend:**
```
src/
  components/     # Reusable UI components
  pages/          # Page-level components
  hooks/          # Custom React hooks
  services/       # API service functions
  utils/          # Utility functions
  types/          # TypeScript types
```

**Backend:**
```
src/
  routes/         # API route definitions
  controllers/    # Request handlers
  models/         # Data models
  middleware/     # Express middleware
  config/         # Configuration files
```

### API Response Format

All API responses should follow this format:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Testing Strategy

(To be implemented in future phases)

- **Unit Tests**: Jest for both frontend and backend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Cypress for frontend user flows

## Deployment

(To be configured in future phases)

- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS
- **Database**: PostgreSQL on managed service

## Performance Considerations

- Code splitting for frontend
- API response caching
- Database query optimization
- CDN for static assets
- Compression for API responses

## Monitoring and Logging

(To be implemented)

- Error tracking (Sentry)
- Performance monitoring
- API request logging
- User analytics

## Future Enhancements

- Real-time notifications (Socket.io)
- File upload support (AWS S3)
- Search functionality (Elasticsearch)
- Mobile app (React Native)
- Progressive Web App features
