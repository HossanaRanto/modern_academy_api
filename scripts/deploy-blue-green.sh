#!/bin/bash

# Blue-Green Deployment Script
# Usage: ./deploy.sh [blue|green]

set -e

ACTIVE_INSTANCE=${1:-blue}
INACTIVE_INSTANCE=$([[ "$ACTIVE_INSTANCE" == "blue" ]] && echo "green" || echo "blue")

echo "=========================================="
echo "Blue-Green Deployment Script"
echo "=========================================="
echo "Active Instance: $ACTIVE_INSTANCE"
echo "Inactive Instance: $INACTIVE_INSTANCE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker or Docker Compose not found${NC}"
    exit 1
fi

# Determine docker command
DOCKER_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker compose"
fi

echo -e "${YELLOW}[1/5] Stopping inactive instance (${INACTIVE_INSTANCE})...${NC}"
$DOCKER_CMD -f docker-compose.prod.yml stop modern_academy_api_$INACTIVE_INSTANCE || true

echo -e "${YELLOW}[2/5] Building new image for inactive instance...${NC}"
$DOCKER_CMD -f docker-compose.prod.yml build modern_academy_api_$INACTIVE_INSTANCE

echo -e "${YELLOW}[3/5] Starting inactive instance...${NC}"
$DOCKER_CMD -f docker-compose.prod.yml up -d modern_academy_api_$INACTIVE_INSTANCE

echo -e "${YELLOW}[4/5] Waiting for instance to be healthy...${NC}"
HEALTH_RETRIES=0
MAX_RETRIES=30
while [ $HEALTH_RETRIES -lt $MAX_RETRIES ]; do
    if $DOCKER_CMD -f docker-compose.prod.yml exec -T modern_academy_api_$INACTIVE_INSTANCE wget --quiet --tries=1 --spider http://localhost:3000/health 2>/dev/null; then
        echo -e "${GREEN}Instance is healthy!${NC}"
        break
    fi
    HEALTH_RETRIES=$((HEALTH_RETRIES + 1))
    echo "Waiting for $INACTIVE_INSTANCE to be healthy... ($HEALTH_RETRIES/$MAX_RETRIES)"
    sleep 1
done

if [ $HEALTH_RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${RED}Error: Instance did not become healthy within timeout${NC}"
    echo "Rolling back to $ACTIVE_INSTANCE..."
    $DOCKER_CMD -f docker-compose.prod.yml down modern_academy_api_$INACTIVE_INSTANCE
    exit 1
fi

echo -e "${YELLOW}[5/5] Switching traffic to ${INACTIVE_INSTANCE}...${NC}"
# Create a temporary config file to switch upstream
UPSTREAM_CONFIG="set \$upstream \"api_${INACTIVE_INSTANCE}\";"
echo "$UPSTREAM_CONFIG" | docker exec -i modern_academy_lb tee /tmp/blue_green_active.conf > /dev/null

# Reload nginx
docker exec modern_academy_lb nginx -s reload

echo -e "${GREEN}=========================================="
echo "Deployment completed successfully!"
echo "Active Instance: $INACTIVE_INSTANCE"
echo "==========================================${NC}"

# Optional: Show status
echo ""
echo "Container Status:"
$DOCKER_CMD -f docker-compose.prod.yml ps | grep modern_academy_api
