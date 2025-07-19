#!/usr/bin/env ts-node

import { initializeDatabase } from './database';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Legacy SQLite initialization for migration only
async function initializeSQLiteForMigration() {
  const dbPath = path.join(__dirname, '../database/crack-o-date.db.backup');
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return db;
}

async function migrateFromSQLiteBackup() {
  console.log('🚀 Starting migration from SQLite backup to PostgreSQL...');
  
  try {
    // Check if SQLite backup exists
    const sqliteBackupPath = path.join(__dirname, '../database/crack-o-date.db.backup');
    console.log('📂 Checking for SQLite backup at:', sqliteBackupPath);
    
    // Initialize PostgreSQL database
    console.log('🐘 Connecting to PostgreSQL database...');
    const postgresDb = await initializeDatabase();
    
    try {
      // Try to connect to SQLite backup
      const sqliteDb = await initializeSQLiteForMigration();
      
      // Export data from SQLite
      console.log('📤 Exporting data from SQLite backup...');
      const users = await sqliteDb.all('SELECT * FROM users');
      const puzzle_dates = await sqliteDb.all('SELECT * FROM puzzle_dates');
      const solutions = await sqliteDb.all('SELECT * FROM solutions');
      const user_sessions = await sqliteDb.all('SELECT * FROM user_sessions');
      
      console.log(`Found:
      - ${users.length} users
      - ${puzzle_dates.length} puzzle dates
      - ${solutions.length} solutions
      - ${user_sessions.length} user sessions`);
      
      // Import data to PostgreSQL
      console.log('📥 Importing data to PostgreSQL...');
      
      // Import users
      for (const user of users) {
        await postgresDb.run(
          'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (username) DO NOTHING',
          [user.username, user.email, user.password_hash, user.created_at, user.updated_at]
        );
      }
      
      // Import puzzle dates
      for (const puzzleDate of puzzle_dates) {
        await postgresDb.run(
          'INSERT INTO puzzle_dates (date_string, date_numbers, month_length, day_length, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (date_string) DO NOTHING',
          [puzzleDate.date_string, puzzleDate.date_numbers, puzzleDate.month_length, puzzleDate.day_length, puzzleDate.created_at]
        );
      }
      
      // Import solutions
      for (const solution of solutions) {
        await postgresDb.run(
          'INSERT INTO solutions (user_id, puzzle_date_id, equation, score, left_value, right_value, is_retroactive, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (user_id, puzzle_date_id) DO NOTHING',
          [solution.user_id, solution.puzzle_date_id, solution.equation, solution.score, solution.left_value, solution.right_value, solution.is_retroactive, solution.created_at]
        );
      }
      
      // Import user sessions
      for (const session of user_sessions) {
        await postgresDb.run(
          'INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (session_token) DO NOTHING',
          [session.user_id, session.session_token, session.expires_at, session.created_at]
        );
      }
      
      await sqliteDb.close();
      console.log('✅ Migration from SQLite backup completed successfully!');
      
    } catch (sqliteError) {
      console.log('ℹ️ No SQLite backup found or unable to read it. Starting with fresh PostgreSQL database.');
      console.log('This is normal for new installations.');
    }
    
    await postgresDb.close();
    
    console.log('🔧 Migration complete! Your application is now using PostgreSQL.');
    console.log('📝 Make sure your .env file has: DATABASE_URL=postgresql://...');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateFromSQLiteBackup();
}

export { migrateFromSQLiteBackup };