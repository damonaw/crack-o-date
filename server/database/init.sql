-- PostgreSQL initialization script for development
-- This file is automatically executed when the PostgreSQL container starts

-- Create database if not exists (for development)
-- Note: In Docker, the database is already created via environment variables

-- Set timezone
SET timezone = 'UTC';

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual table creation is handled by the application
-- This file can be used for additional setup like:
-- - Creating additional databases
-- - Setting up initial data
-- - Creating roles and permissions

-- Example: Create a read-only user for analytics (commented out for now)
-- CREATE USER readonly_user WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE crack_o_date_dev TO readonly_user;
-- GRANT USAGE ON SCHEMA public TO readonly_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

SELECT 'PostgreSQL initialization completed successfully!' as status;