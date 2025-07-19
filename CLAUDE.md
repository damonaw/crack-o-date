# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crack-O-Date is a daily math puzzle web application where users create equations using the digits from today's date. The app validates that all date numbers are used in order and both sides of the equation are equal.

## Architecture

This is a full-stack TypeScript application with:

- **Client**: React SPA with TypeScript, React Router, and custom CSS
- **Server**: Express.js API with TypeScript, SQLite database
- **Core Logic**: Date parsing utilities and mathematical expression parser/validator

### Key Components

**Date Processing (`client/src/utils/dateUtils.ts`)**:
- Parses current date into individual digits (e.g., 7/18/2025 → [7,1,8,2,0,2,5])
- Handles timezone and date format normalization
- Supports historical date parsing for past puzzle attempts

**Math Parser (`client/src/utils/mathParser.ts`)**:
- Validates mathematical expressions using recursive descent parsing
- Enforces date number usage rules (all numbers, in order, exactly once)
- Calculates scores based on operator complexity: basic (+,-) = 1pt, intermediate (*,/) = 2pts, advanced (^,sqrt,abs,mod) = 3pts
- Returns detailed validation results including left/right values and errors

**UI Structure**:
- `GamePage`: Main puzzle interface with date display, equation input, and validation
- `LoginPage`: User authentication (authentication system not yet implemented)
- `ProfilePage`: Solution history and user statistics with math textbook formatting
- `MathDisplay`: KaTeX-powered component for rendering mathematical equations in textbook format
- `SolutionHistory`: Component displaying solutions with proper mathematical notation

## Development Commands

### Client (React)
```bash
cd client
npm start          # Development server (http://localhost:3000)
npm run build      # Production build
npm test           # Run tests
```

### Server (Express)
```bash
cd server
npm run dev        # Development server with auto-reload (port 3001)
npm run build      # Compile TypeScript to JavaScript
npm start          # Production server (requires build first)
npm test           # Run tests
```

## Core Game Rules

1. **Date Numbers**: All digits from today's date must be used exactly once
2. **Order Constraint**: Numbers must appear in the equation in the same order as the date
3. **Equation Balance**: Left side must equal right side mathematically
4. **Scoring**: Points awarded based on operator complexity (parentheses don't affect score)
5. **Historical Play**: Past dates can be solved but are marked as retroactive and don't count toward averages

## Database Schema (PostgreSQL)

The application uses PostgreSQL with the following tables:
- `users`: User accounts with username, email, and password hash
- `puzzle_dates`: Date information including date strings and parsed digit arrays
- `solutions`: User equation solutions with scores and validation results
- `user_sessions`: JWT session token management for authentication

PostgreSQL provides better performance, concurrent access, and production scalability compared to the previous SQLite setup.

## Authentication System

User authentication is implemented with:
- Bcrypt password hashing for secure storage
- JWT tokens for session management
- Express rate limiting for API protection
- CORS configuration for cross-origin requests
- Session token expiration and cleanup

## Mathematical Notation

The app uses KaTeX for rendering mathematical equations in textbook format:
- **MathDisplay Component**: Converts standard notation to LaTeX and renders with KaTeX
- **Operator Conversion**: `*` → `⋅`, `/` → `÷`, `sqrt()` → `√`, `abs()` → `|x|`, `mod` → `mod`
- **Error Handling**: Graceful fallback to plain text if KaTeX rendering fails
- **Styling**: Textbook-style formatting with proper spacing and typography

## Testing Strategy

The math parser and date utilities contain the core business logic and should be thoroughly tested. React components use standard Create React App testing setup with Jest and React Testing Library.

## Production Deployment and Hosting

### Database Migration to PostgreSQL ✅ COMPLETED

**Migration completed successfully:**
1. ✅ Exported existing SQLite data 
2. ✅ Converted schema to PostgreSQL-compatible format
3. ✅ Updated server configuration for PostgreSQL connection
4. ✅ Removed SQLite dependencies and legacy code
5. ✅ Updated documentation and environment configuration

**PostgreSQL Benefits:**
- Better concurrent access handling
- JSON column support for flexible mobile data structures
- Built-in authentication and row-level security
- Real-time subscriptions for live features
- Horizontal scaling capabilities

### Containerization Strategy

**Docker Multi-Stage Build:**
- Stage 1: Build React frontend to static files
- Stage 2: Compile TypeScript backend
- Stage 3: Production nginx for frontend
- Stage 4: Production Node.js for backend

**Development vs Production:**
- Development: Hot reloading, source maps, debug logging
- Production: Optimized builds, security headers, error monitoring

### Cloud Hosting Recommendations

**For Current Web Application:**
1. **Google Cloud Run** - Serverless containers, automatic scaling
2. **AWS ECS with Fargate** - Managed container orchestration
3. **Render** - Simple deployment, PostgreSQL addon
4. **Railway** - Git-based deployment, built-in database

**For Future Mobile App Support:**
1. **EAS Hosting (Expo)** - Unified web + mobile deployment
2. **AWS Amplify** - Mobile-optimized with offline sync
3. **Firebase + Cloud Run** - Real-time features, push notifications
4. **Supabase** - Open-source, mobile SDKs, real-time subscriptions

### Environment Configuration

**Development (.env.local):**
```
DATABASE_URL=postgresql://localhost:5432/crack_o_date_dev
JWT_SECRET=dev-secret-key
NODE_ENV=development
```

**Production Environment Variables:**
```
DATABASE_URL=postgresql://user:password@host:5432/crack_o_date
JWT_SECRET=secure-random-jwt-secret
NODE_ENV=production
CORS_ORIGIN=https://crack-o-date.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Considerations

**Database Security:**
- Use connection pooling to prevent connection exhaustion
- Enable SSL connections for database communication
- Implement row-level security for user data isolation
- Regular backups with point-in-time recovery

**API Security:**
- Rate limiting per IP and user
- CORS configuration for production domains
- Helmet.js for security headers
- Input validation and sanitization
- SQL injection prevention via parameterized queries

**Authentication & Authorization:**
- JWT token expiration and refresh strategies
- Secure password hashing with bcrypt
- Session management and cleanup
- Two-factor authentication consideration for future

### Monitoring and Observability

**Application Monitoring:**
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (Pingdom, StatusCake)
- Custom metrics for game statistics

**Database Monitoring:**
- Connection pool utilization
- Query performance analysis
- Storage usage trends
- Backup verification

### Mobile App Deployment Considerations

**API Adaptations for Mobile:**
- Global CDN for reduced latency
- Offline-first data synchronization
- Push notification infrastructure
- File upload handling for user avatars
- Background processing for analytics

**Data Architecture for Mobile:**
- JSON columns for flexible user preferences
- Real-time subscriptions for multiplayer features
- Optimistic updates for better UX
- Conflict resolution for offline edits

### Deployment Automation

**CI/CD Pipeline:**
1. Code commit triggers automated testing
2. Build Docker images for frontend/backend
3. Push images to container registry
4. Deploy to staging environment
5. Run integration tests
6. Deploy to production with zero downtime
7. Monitor deployment health and rollback if needed

**Database Migration Strategy:**
- Automated migration scripts in CI/CD
- Database versioning and rollback capabilities
- Migration testing in staging environment
- Blue-green deployment for zero-downtime updates