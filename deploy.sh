#!/bin/bash

# Velours Secrets Deployment Script

echo "🚀 Velours Secrets Deployment Starting..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build and start new containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker exec velours-app-prod npx prisma db push

# Create upload directories with proper permissions
echo "📁 Setting up upload directories..."
docker exec velours-app-prod mkdir -p /app/public/urun-gorsel
docker exec velours-app-prod chown -R nextjs:nodejs /app/public

echo "✅ Deployment completed!"
echo "🌐 Application is running on http://localhost:2005"