import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './database';
import { createAuthRoutes } from './routes/auth';
import { createSolutionsRoutes } from './routes/solutions';

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Initialize database and routes
async function startServer() {
  try {
    const db = await initializeDatabase();
    console.log('Database initialized successfully');

    // Routes
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