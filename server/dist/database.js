"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
// Initialize database
async function initializeDatabase() {
    const dbPath = path_1.default.join(__dirname, '../database/crack-o-date.db');
    const db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    // Create tables
    await createTables(db);
    return db;
}
exports.initializeDatabase = initializeDatabase;
async function createTables(db) {
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
//# sourceMappingURL=database.js.map