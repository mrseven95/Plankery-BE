#!/bin/bash

echo "Starting Plankery services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start MongoDB and Redis
echo "Starting MongoDB and Redis..."
docker-compose up -d mongodb redis

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker-compose ps

echo "Services started successfully!"
echo ""
echo "MongoDB: mongodb://localhost:27017/plankery"
echo "Redis: redis://localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
