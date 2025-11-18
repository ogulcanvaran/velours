@echo off
echo 📦 Velours Secrets Deployment Package Creator

echo 🗂️ Creating deployment directory...
if exist "velours-secrets-deployment" rmdir /s /q "velours-secrets-deployment"
mkdir "velours-secrets-deployment"

echo 📋 Copying essential files...

REM Source code
xcopy /E /I /Y "src" "velours-secrets-deployment\src\"

REM Configuration files
copy "package.json" "velours-secrets-deployment\"
copy "package-lock.json" "velours-secrets-deployment\"
copy "tsconfig.json" "velours-secrets-deployment\"
copy "next.config.ts" "velours-secrets-deployment\"
copy "postcss.config.mjs" "velours-secrets-deployment\"
copy "components.json" "velours-secrets-deployment\"
copy "eslint.config.mjs" "velours-secrets-deployment\"
copy "next-env.d.ts" "velours-secrets-deployment\"

REM Prisma
xcopy /E /I /Y "prisma" "velours-secrets-deployment\prisma\"

REM Public files (fotoğraflar vs)
xcopy /E /I /Y "public" "velours-secrets-deployment\public\"

REM Docker files
copy "Dockerfile" "velours-secrets-deployment\"
copy "docker-compose.prod.yml" "velours-secrets-deployment\"
copy ".dockerignore" "velours-secrets-deployment\"

REM Deployment scripts
copy "deploy.sh" "velours-secrets-deployment\"
copy "deploy.bat" "velours-secrets-deployment\"

REM Documentation
copy "DEPLOYMENT.md" "velours-secrets-deployment\"
copy "README.md" "velours-secrets-deployment\"

REM Database backup
copy "database_backup.sql" "velours-secrets-deployment\"

REM Environment template
echo DATABASE_URL="postgresql://medusa:medusapass@localhost:7834/velours_secrets?schema=public" > "velours-secrets-deployment\.env.example"
echo NODE_ENV=production >> "velours-secrets-deployment\.env.example"

echo 🗜️ Creating ZIP package...
powershell Compress-Archive -Path "velours-secrets-deployment\*" -DestinationPath "velours-secrets-deployment.zip" -Force

echo ✅ Deployment package created: velours-secrets-deployment.zip
echo 📁 Package contents in: velours-secrets-deployment\

pause