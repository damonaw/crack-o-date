import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Database interface
export interface Database {
  get: (sql: string, params?: any) => Promise<any>;
  all: (sql: string, params?: any) => Promise<any[]>;
  run: (sql: string, params?: any) => Promise<any>;
  close: () => Promise<void>;
}

// Initialize database
export async function initializeDatabase(): Promise<Database> {
  const dbPath = path.join(__dirname, '../database/crack-o-date.db');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables
  await createTables(db);
  
  return db;
}

async function createTables(db: Database) {
  // Users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Puzzle dates table
  await db.run(`
    CREATE TABLE IF NOT EXISTS puzzle_dates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_string TEXT UNIQUE NOT NULL,
      date_numbers TEXT NOT NULL,
      month_length INTEGER NOT NULL,
      day_length INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Solutions table
  await db.run(`
    CREATE TABLE IF NOT EXISTS solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      puzzle_date_id INTEGER NOT NULL,
      equation TEXT NOT NULL,
      score INTEGER NOT NULL,
      left_value REAL NOT NULL,
      right_value REAL NOT NULL,
      is_retroactive BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (puzzle_date_id) REFERENCES puzzle_dates (id),
      UNIQUE(user_id, puzzle_date_id)
    )
  `);

  // User sessions table
  await db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Create indexes for better performance
  await db.run(`CREATE INDEX IF NOT EXISTS idx_solutions_user_id ON solutions (user_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_solutions_puzzle_date_id ON solutions (puzzle_date_id)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id)`);
}

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Solution interface
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

// Puzzle date interface
export interface PuzzleDate {
  id: number;
  date_string: string;
  date_numbers: string;
  month_length: number;
  day_length: number;
  created_at: string;
}