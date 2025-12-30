# Blue-Green Deployment Strategy

This document describes the blue-green deployment strategy implemented for the Modern Academy API.

## Overview

Blue-Green deployment is a release technique that reduces downtime and risk by running two identical production environments called Blue and Green.

- **Blue Environment**: Currently live and serving production traffic
- **Green Environment**: Idle environment used for staging new releases

## Architecture

```
┌─────────────────┐
│   Client        │
└────────┬────────┘
         │
    Port 3000
         │
    ┌────▼─────────────┐
    │  Nginx LB        │
    │  (Router)        │
    └────┬──────────┬──┘
         │          │
    ┌────▼───────┐  │
    │ API Blue   │  │ ┌──────────────┐
    │ :3001      │  ├─►API Green    │
    └────────────┘  │ │ :3002       │
                    │ └──────────────┘
                    │
            ┌───────▼────────┐
            │ Redis Cache    │
            │ (Shared)       │
            └────────────────┘
```

## How It Works

### Initial State
- **Blue** is active (receiving all traffic via Nginx)
- **Green** is idle

### Deployment Process

1. **Build & Deploy Green**
   ```bash
   ./scripts/deploy-blue-green.sh blue
   ```
   - Builds new Docker image
   - Starts Green instance on port 3002
   - Waits for health check to pass

2. **Test Green**
   - Run smoke tests against Green instance
   - Verify database migrations completed
   - Check API endpoints

3. **Switch Traffic**
   - Nginx switches traffic from Blue to Green
   - **Instant switch** - no downtime
   - Old connections to Blue gracefully close

4. **Verify**
   - Monitor Green (now active)
   - Check application logs
   - Verify metrics and performance

### Rollback Process

If issues are detected:

```bash
./scripts/rollback-blue-green.sh
```

- Instantly switches traffic back to Blue
- Green remains running for debugging
- Takes < 1 second

## Commands

### Deploy New Version

```bash
# Deploy to inactive instance (auto-detect)
./scripts/deploy-blue-green.sh

# Or explicitly specify target
./scripts/deploy-blue-green.sh blue
./scripts/deploy-blue-green.sh green
```

### Rollback

```bash
./scripts/rollback-blue-green.sh
```

### Check Status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs

```bash
# Blue instance
docker-compose -f docker-compose.prod.yml logs modern_academy_api_blue -f

# Green instance
docker-compose -f docker-compose.prod.yml logs modern_academy_api_green -f

# Load balancer
docker-compose -f docker-compose.prod.yml logs modern_academy_lb -f
```

## Environment Variables

Add to your `.env.prod` file:

```env
# Blue-Green Deployment
PORT=3000                   # External port (load balancer)
PORT_BLUE=3001             # Blue instance port
PORT_GREEN=3002            # Green instance port
```

## Health Checks

Both instances run health checks:

```bash
GET /health
```

The load balancer also checks this endpoint to determine if traffic can be switched.

## Database Migrations

Migrations run automatically on container startup via the entrypoint script:

```bash
npm run migration:run || true
```

**Important**: Ensure migrations are:
- Forward-compatible
- Can run on live data
- Have rollback scripts

## Best Practices

1. **Test Before Switching**
   - Run automated tests against Green
   - Perform smoke tests
   - Check critical endpoints

2. **Monitor After Switch**
   - Watch application metrics
   - Check error rates
   - Monitor database queries

3. **Keep Both Instances Updated**
   - Periodically update both Blue and Green
   - Prevents stale dependencies
   - Reduces drift between environments

4. **Database Strategy**
   - Use zero-downtime migrations
   - Backward-compatible schema changes
   - Test migrations on staging first

5. **Traffic Switching**
   - Use very brief windows for testing
   - Have rollback plan ready
   - Coordinate with team

## Troubleshooting

### Green instance won't start

```bash
docker-compose -f docker-compose.prod.yml logs modern_academy_api_green
```

Check for:
- Database connection issues
- Migration failures
- Memory/CPU constraints

### Health check failing

```bash
docker-compose -f docker-compose.prod.yml exec modern_academy_api_green curl http://localhost:3000/health
```

Verify:
- Application is running
- Health endpoint is working
- Database is connected

### Traffic not switching

```bash
docker exec modern_academy_lb cat /tmp/blue_green_active.conf
```

Manually trigger switch:
```bash
docker exec modern_academy_lb nginx -s reload
```

### Nginx issues

```bash
docker-compose -f docker-compose.prod.yml exec modern_academy_lb nginx -t
```

Check configuration syntax.

## Performance Considerations

- **Memory**: Both instances running = ~1GB total
- **CPU**: Load balanced across both
- **Disk**: Separate Docker images for each
- **Network**: Internal Docker network, minimal latency

## Security

- Load balancer and instances on internal Docker network
- Only expose port 3000 externally
- Redis not exposed externally
- Health check endpoint should be protected in production

## Advanced Features

### Canary Deployment (Optional)

Gradually shift traffic:

```nginx
upstream api_blue {
    server modern_academy_api_blue:3000 weight=70;
    server modern_academy_api_green:3000 weight=30;
}
```

### Health Check Customization

Edit `nginx/conf.d/blue-green.conf` to adjust:
- Proxy timeouts
- Connection settings
- Headers

### Multi-Region Setup

For global deployments, replicate this setup per region.
