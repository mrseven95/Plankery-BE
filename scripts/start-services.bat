@echo off
echo Starting Plankery services...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Start MongoDB and Redis
echo Starting MongoDB and Redis...
docker-compose up -d mongodb redis

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo Checking service status...
docker-compose ps

echo Services started successfully!
echo.
echo MongoDB: mongodb://localhost:27017/plankery
echo Redis: redis://localhost:6379
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
