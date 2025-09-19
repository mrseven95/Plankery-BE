# Docker Setup for Plankery Backend

This directory contains Docker configuration for running MongoDB and Redis services.

## Services

### MongoDB
- **Port**: 27017
- **Admin User**: admin
- **Admin Password**: password123
- **Database**: plankery
- **Application User**: plankery_user
- **Application Password**: plankery_password

### Redis
- **Port**: 6379
- **Password**: redis123
- **Database**: 0

### Management UIs (Optional)

#### Redis Commander
- **URL**: http://localhost:8081
- **Purpose**: Redis management interface

#### Mongo Express
- **URL**: http://localhost:8082
- **Username**: admin
- **Password**: admin123
- **Purpose**: MongoDB management interface

## Usage

### Start all services
```bash
docker-compose up -d
```

### Start only database services (without management UIs)
```bash
docker-compose up -d mongodb redis
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: This will delete all data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mongodb
docker-compose logs -f redis
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://plankery_user:plankery_password@localhost:27017/plankery

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0
REDIS_TTL=3600

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Data Persistence

- MongoDB data is persisted in the `mongodb_data` Docker volume
- Redis data is persisted in the `redis_data` Docker volume

## Network

All services run on the `plankery-network` bridge network for internal communication.

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in your `.env` file

### Redis Connection Issues
1. Ensure Redis is running: `docker-compose ps`
2. Check Redis logs: `docker-compose logs redis`
3. Verify Redis password in your `.env` file

### Port Conflicts
If you have port conflicts, you can modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "27018:27017"  # MongoDB on port 27018
  - "6380:6379"    # Redis on port 6380
```

Remember to update your `.env` file accordingly.
