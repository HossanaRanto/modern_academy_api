# Docker Setup Guide

This project includes Docker configurations for both development and production environments.

## Development Environment (PostgreSQL)

### Prerequisites
- Docker
- Docker Compose

### Start Development Environment

```bash
# Using docker-compose (with .env.dev)
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Or build and start
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f api

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ This will delete your database data)
docker-compose -f docker-compose.dev.yml down -v
```

### Development Services

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

### Connect to PostgreSQL Database

**From pgAdmin:**
1. Open http://localhost:5050
2. Login with credentials from .env.dev
3. Add New Server:
   - Name: Modern Academy DB
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: modern_academy

**From Host Machine:**
```bash
psql -h localhost -p 5432 -U postgres -d modern_academy
```

### Development Workflow

1. Make changes to your code (hot reload is enabled)
2. Generate migrations:
   ```bash
   docker-compose -f docker-compose.dev.yml exec api npm run build
   docker-compose -f docker-compose.dev.yml exec api npm run migration:generate -- src/database/migrations/MigrationName
   ```
3. Run migrations:
   ```bash
   docker-compose -f docker-compose.dev.yml exec api npm run migration:run
   ```

### Run Commands in Container

```bash
# Access container shell
docker-compose -f docker-compose.dev.yml exec api sh

# Run migrations
docker-compose -f docker-compose.dev.yml exec api npm run migration:run

# Revert migration
docker-compose -f docker-compose.dev.yml exec api npm run migration:revert

# Run tests
docker-compose -f docker-compose.dev.yml exec api npm test
```

## Production Environment (MySQL)

### Prerequisites
- Docker
- Docker Compose
- MySQL database (external or separate container)

### Configuration

1. Update `.env.prod` with your production MySQL credentials:
   ```env
   DB_HOST=your_mysql_host
   DB_PORT=3306
   DB_USERNAME=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_DATABASE=modern_academy
   NODE_ENV=production
   PORT=3000
   ```

### Deploy Production

```bash
# Build and start
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Production Services

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Docker Commands Reference

### Build Images

```bash
# Development
docker build -f Dockerfile.dev -t modern-academy-api:dev .

# Production
docker build -f Dockerfile -t modern-academy-api:prod .
```

### Container Management

```bash
# List running containers
docker ps

# View container logs
docker logs modern_academy_api_dev -f

# Execute command in container
docker exec -it modern_academy_api_dev sh

# Stop container
docker stop modern_academy_api_dev

# Remove container
docker rm modern_academy_api_dev
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect modern_academy_api_postgres_data

# Remove volume (⚠️ This deletes data)
docker volume rm modern_academy_api_postgres_data
```

### Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect modern_academy_api_modern_academy_network
```

## Database Switching

The application automatically detects the database type based on the port:
- **Port 5432**: PostgreSQL (Development)
- **Port 3306**: MySQL (Production)

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5432

# Kill the process
sudo kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Container Won't Start

```bash
# Remove all containers and volumes, then rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d --build
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a --volumes

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml up -d --build
```

## Best Practices

1. **Development**: Use `docker-compose.dev.yml` with PostgreSQL
2. **Production**: Use `docker-compose.prod.yml` with external MySQL
3. **Always** backup your database before destroying volumes
4. **Never** commit `.env` files with real credentials
5. **Use** `.env.example` as a template for new environments
6. **Monitor** container health and logs regularly
7. **Update** images regularly for security patches

## Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| DB_HOST | postgres | your_host | Database host |
| DB_PORT | 5432 | 3306 | Database port |
| DB_USERNAME | postgres | your_user | Database username |
| DB_PASSWORD | postgres | your_pass | Database password |
| DB_DATABASE | modern_academy | modern_academy | Database name |
| NODE_ENV | development | production | Environment |
| PORT | 3000 | 3000 | API port |

## Security Notes

- Production container runs as non-root user
- Resource limits applied in production
- Health checks enabled
- Secrets should be managed via Docker secrets or environment variable injection
- Never expose database ports in production
