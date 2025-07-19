# Crack-O-Date

A daily math puzzle web application where users create equations using the digits from today's date.

## 🎯 Game Concept

Players must create mathematical equations using all the digits from today's date in order. For example, with the date 7/18/2025, you must use the digits [7, 1, 8, 2, 0, 2, 5] to create a balanced equation like `7 + 1 = 8` or `(7 + 1) * 8 = 2 * (0 + 2) * 5`.

### Rules
- **Use all digits**: Every digit from today's date must be used exactly once
- **Maintain order**: Numbers must appear in the equation in the same sequence as the date
- **Balance required**: Left side must equal right side mathematically
- **Scoring**: Points based on operator complexity - basic (+, -) = 1pt, intermediate (×, ÷) = 2pts, advanced (^, √, |x|, mod) = 3pts

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **React Router** for navigation between game, profile, and auth pages
- **KaTeX** integration for beautiful mathematical notation rendering
- **Custom CSS** with responsive design

### Backend (Express + TypeScript)
- **Express.js** API server with TypeScript
- **PostgreSQL** database with connection pooling
- **JWT authentication** with bcrypt password hashing
- **Rate limiting** and CORS protection

### Key Components
- **Date Parser**: Converts dates into digit arrays with timezone handling
- **Math Parser**: Recursive descent parser that validates expressions and enforces game rules
- **Score Calculator**: Awards points based on operator complexity
- **Solution History**: Displays past solutions with proper mathematical formatting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crack-o-date
   ```

2. **Install all dependencies (recommended)**
   ```bash
   npm run install:all
   ```

   *Or install individually:*
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

### Development

**Start both client and server (recommended):**
```bash
npm run dev
```
- Server runs on http://localhost:3001
- Client runs on http://localhost:3000

**Or start individually:**
```bash
# Backend server
npm run dev:server

# Frontend client  
npm run dev:client
```

### Production Build

**Build everything:**
```bash
npm run build
```

**Or build individually:**
```bash
npm run build:client
npm run build:server
```

**Start production server:**
```bash
npm start
```

## 🎮 How to Play

1. **View Today's Numbers**: The current date digits are displayed at the top
2. **Create Your Equation**: Enter a mathematical expression using all the digits in order
3. **Submit**: The app validates your equation and calculates your score
4. **Track Progress**: View your solution history and statistics on the profile page

### Example Solutions
For date 7/18/2025 (digits: 7, 1, 8, 2, 0, 2, 5):
- Simple: `7 + 1 = 8` (uses first 3 digits)
- Complex: `7 * (1 + 8) = 2^(0 + 2) + 5` (uses all digits)

## 🗄️ Database Schema

- **users**: User accounts with authentication
- **puzzle_dates**: Date metadata and digit arrays  
- **solutions**: User equation submissions with scores
- **user_sessions**: JWT session management

## 📁 Project Structure

```
crack-o-date/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── utils/          # Date parsing and math validation
│   │   └── contexts/       # React context providers
│   └── public/             # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication middleware
│   │   └── database.ts     # Database schema and setup
│   └── database/           # SQLite database files
└── CLAUDE.md              # Development guidelines
```

## 🛠️ Development Tools

- **TypeScript**: Full type safety across frontend and backend
- **Jest**: Testing framework for business logic validation
- **ESLint**: Code quality and consistency
- **Rate Limiting**: API protection against abuse
- **CORS**: Cross-origin request handling

## 🔐 Security Features

- Bcrypt password hashing
- JWT session tokens with expiration
- SQL injection protection via parameterized queries
- Rate limiting on API endpoints
- CORS configuration for production deployment

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ for local development

### Quick Start with Docker

**Build and run all services:**
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: PostgreSQL (persisted in volume)

**Production build:**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Docker Architecture

```
Services:
├── frontend (React) → nginx:alpine serving static build
├── backend (Express.js) → node:18-alpine with TypeScript
└── database (PostgreSQL) → persistent volume mount
```

## ☁️ Cloud Hosting Options

### Google Cloud Platform

#### Option 1: Cloud Run (Recommended)
**Deploy React + Express.js as containers:**

```bash
# Build and push images
docker build -t gcr.io/[PROJECT-ID]/crack-o-date-frontend ./client
docker build -t gcr.io/[PROJECT-ID]/crack-o-date-backend ./server
docker push gcr.io/[PROJECT-ID]/crack-o-date-frontend
docker push gcr.io/[PROJECT-ID]/crack-o-date-backend

# Deploy to Cloud Run
gcloud run deploy crack-o-date-frontend --image gcr.io/[PROJECT-ID]/crack-o-date-frontend --platform managed
gcloud run deploy crack-o-date-backend --image gcr.io/[PROJECT-ID]/crack-o-date-backend --platform managed
```

**Database:** Migrate to Cloud SQL PostgreSQL for production
```bash
gcloud sql instances create crack-o-date-db --database-version=POSTGRES_14 --tier=db-f1-micro --region=us-central1
```

#### Option 2: Firebase Hosting + Cloud Functions
- Frontend: Firebase Hosting for React build
- Backend: Cloud Functions for API endpoints
- Database: Firestore or Cloud SQL

### Amazon Web Services (AWS)

#### Option 1: ECS with Fargate
**Deploy containerized services:**

```bash
# Push to ECR
aws ecr create-repository --repository-name crack-o-date-frontend
aws ecr create-repository --repository-name crack-o-date-backend
docker tag crack-o-date-frontend:latest [ACCOUNT].dkr.ecr.[REGION].amazonaws.com/crack-o-date-frontend:latest
docker push [ACCOUNT].dkr.ecr.[REGION].amazonaws.com/crack-o-date-frontend:latest
```

**Database:** Amazon RDS PostgreSQL
```bash
aws rds create-db-instance --db-instance-identifier crack-o-date-db --db-instance-class db.t3.micro --engine postgres
```

#### Option 2: AWS Amplify
- Full-stack deployment with git integration
- Built-in CI/CD pipeline
- Managed database with GraphQL API

### Alternative Platforms

#### Render (Simple Deployment)
- PostgreSQL addon available
- Automatic deploys from Git
- Simple scaling and monitoring

#### Railway
- Simple container deployment
- One-click PostgreSQL
- Automatic SSL certificates

#### Vercel + PlanetScale
- Frontend: Vercel (optimal for React)
- Backend: Vercel serverless functions
- Database: PlanetScale MySQL

## 📱 Mobile App Considerations

### Architecture for Mobile + Web

When porting to React Native/Expo, consider this architecture:

```
Frontend Clients:
├── Web App (React) → Static hosting (Vercel/Netlify)
├── iOS App (React Native) → App Store
└── Android App (React Native) → Google Play Store

Shared Backend:
├── API Server (Express.js) → Container hosting
├── Database (PostgreSQL) → Managed database
├── File Storage (S3/Cloud Storage) → For user uploads
└── Push Notifications (FCM/SNS) → For engagement
```

### Mobile-Specific Hosting Requirements

#### API Changes Needed
- **Global CDN**: Lower latency for worldwide users
- **Auto-scaling**: Handle mobile traffic spikes
- **Offline Support**: Data synchronization strategies
- **File Upload**: Image/avatar handling for mobile
- **Push Notifications**: User engagement features

#### Recommended Mobile Stack
1. **EAS Hosting (Expo)**: Full-stack deployment for Expo apps
2. **AWS Amplify**: Mobile-optimized with offline sync
3. **Firebase + Cloud Run**: Google's mobile-first approach
4. **Supabase**: Open-source with excellent mobile SDKs

### Database Benefits for Mobile

**PostgreSQL advantages for mobile apps:**
```sql
-- Better mobile app support with concurrent connections
-- JSON columns for flexible mobile data structures
-- Real-time subscriptions for live updates
-- Built-in auth and row-level security
-- Horizontal scaling for global user base
```

## 🚀 Production Environment Setup

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@host:5432/crack_o_date
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend (.env.production)
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_ENV=production
```

### Security Checklist
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging

## 📋 TODO List

### UI/UX Improvements
- [ ] Responsive layout for profile/logout buttons
- [ ] Visual equation builder with chips/bubbles instead of text input
- [ ] Drag-and-drop interface for numbers and operators

### Features
- [ ] Connect profile page to real user data
- [ ] Historical date puzzle solving
- [ ] User statistics and leaderboards
- [ ] Social sharing of solutions

### Infrastructure
- [x] Database migration to PostgreSQL ✅
- [ ] Set up CI/CD pipeline
- [ ] Implement caching layer (Redis)
- [ ] Add monitoring and alerting
- [ ] Mobile app development (React Native/Expo)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.