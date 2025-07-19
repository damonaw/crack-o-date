#!/bin/bash

# Crack-O-Date Setup Script
# Sets up the development environment with PostgreSQL

echo "🚀 Setting up Crack-O-Date development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Create environment files if they don't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env from example..."
    cp server/.env.example server/.env
    echo "⚠️  Please update server/.env with your database credentials"
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client/.env from example..."
    cp client/.env.example client/.env
fi

# Start PostgreSQL with Docker
echo "🐘 Starting PostgreSQL database..."
sudo docker compose up postgres -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if there's a SQLite backup to migrate
if [ -f "server/database/crack-o-date.db.backup" ]; then
    echo "📥 Found SQLite backup. You can migrate it later with: npm run db:migrate"
    echo "ℹ️  Note: Migration requires SQLite dependencies to be temporarily installed"
else
    echo "ℹ️  No SQLite backup found. Starting with fresh PostgreSQL database."
fi

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update server/.env with your database credentials if needed"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see your app"
echo ""
echo "📚 Useful commands:"
echo "  npm run dev          - Start development servers"
echo "  npm run docker:dev   - Start everything with Docker"
echo "  npm run docker:down  - Stop all Docker services"
echo "  npm run db:migrate   - Migrate SQLite data to PostgreSQL"
echo ""
echo "🐳 Docker commands:"
echo "  docker compose up postgres -d  - Start just PostgreSQL"
echo "  docker compose up -d           - Start all services"
echo "  docker compose down            - Stop all services"