import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database interface compatible with existing SQLite interface
export interface Database {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<any>;
  close: () => Promise<void>;
}

// PostgreSQL connection pool
let pool: Pool;

// Initialize PostgreSQL database
export async function initializeDatabase(): Promise<Database> {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/crack_o_date_dev';
  
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    client.release();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    throw error;
  }

  // Create tables
  await createTables();
  
  return {
    get: async (sql: string, params?: any[]) => {
      const client = await pool.connect();
      try {
        // Convert SQLite style ? placeholders to PostgreSQL $1, $2, etc.
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },
    
    all: async (sql: string, params?: any[]) => {
      const client = await pool.connect();
      try {
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        return result.rows;
      } finally {
        client.release();
      }
    },
    
    run: async (sql: string, params?: any[]) => {
      const client = await pool.connect();
      try {
        const pgSql = convertPlaceholders(sql);
        const result = await client.query(pgSql, params);
        return {
          changes: result.rowCount,
          lastID: result.rows[0]?.id || null
        };
      } finally {
        client.release();
      }
    },
    
    close: async () => {
      await pool.end();
    }
  };
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Users table - Convert SQLite to PostgreSQL syntax
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Puzzle dates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS puzzle_dates (
        id SERIAL PRIMARY KEY,
        date_string VARCHAR(50) UNIQUE NOT NULL,
        date_numbers TEXT NOT NULL,
        month_length INTEGER NOT NULL,
        day_length INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Solutions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS solutions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        puzzle_date_id INTEGER NOT NULL,
        equation TEXT NOT NULL,
        score INTEGER NOT NULL,
        left_value DECIMAL NOT NULL,
        right_value DECIMAL NOT NULL,
        is_retroactive BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (puzzle_date_id) REFERENCES puzzle_dates (id) ON DELETE CASCADE,
        UNIQUE(user_id, puzzle_date_id)
      )
    `);

    // User sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_solutions_user_id ON solutions (user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_solutions_puzzle_date_id ON solutions (puzzle_date_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id)`);
    
    // Create index for email lookups
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);
    
    console.log('PostgreSQL tables created successfully');
  } catch (error) {
    console.error('Error creating PostgreSQL tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// User interface (unchanged)
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Solution interface (unchanged)
export interface Solution {
  id: number;
  user_id: number;
  puzzle_date_id: number;
  equation: string;
  score: number;
  left_value: number;
  right_value: number;
  is_retroactive: boolean;
  created_at: string;
}

// Puzzle date interface (unchanged)
export interface PuzzleDate {
  id: number;
  date_string: string;
  date_numbers: string;
  month_length: number;
  day_length: number;
  created_at: string;
}

