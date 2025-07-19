import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './database';
import { createAuthRoutes } from './routes/auth';
import { createSolutionsRoutes } from './routes/solutions';

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting with environment configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests default
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Configure CORS for security
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Initialize database and routes
async function startServer() {
  try {
    const db = await initializeDatabase();
    console.log('Database initialized successfully');

    // Health check route
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    app.use('/api/auth', createAuthRoutes(db));
    app.use('/api/solutions', createSolutionsRoutes(db));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();