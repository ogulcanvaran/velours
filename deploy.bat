@echo off
echo 🚀 Velours Secrets Deployment Starting...

echo 📦 Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

echo 🔨 Building and starting containers...
docker-compose -f docker-compose.prod.yml up --build -d

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo 🗄️ Running database migrations...
docker exec velours-app-prod npx prisma db push

echo ✅ Deployment completed!
echo 🌐 Application is running on http://localhost:2005
pause