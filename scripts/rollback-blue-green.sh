#!/bin/bash

# Blue-Green Rollback Script
# Usage: ./rollback.sh

set -e

echo "=========================================="
echo "Blue-Green Rollback Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Determine docker command
DOCKER_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker compose"
fi

# Get current active upstream
CURRENT_UPSTREAM=$(docker exec modern_academy_lb cat /tmp/blue_green_active.conf 2>/dev/null || echo "set \$upstream \"api_blue\";")

if [[ $CURRENT_UPSTREAM == *"api_blue"* ]]; then
    CURRENT="blue"
    PREVIOUS="green"
else
    CURRENT="green"
    PREVIOUS="blue"
fi

echo -e "${YELLOW}Current Active: $CURRENT${NC}"
echo -e "${YELLOW}Rolling back to: $PREVIOUS${NC}"

echo ""
echo -e "${YELLOW}Switching traffic to ${PREVIOUS}...${NC}"
UPSTREAM_CONFIG="set \$upstream \"api_${PREVIOUS}\";"
echo "$UPSTREAM_CONFIG" | docker exec -i modern_academy_lb tee /tmp/blue_green_active.conf > /dev/null

# Reload nginx
docker exec modern_academy_lb nginx -s reload

echo -e "${GREEN}Rollback completed successfully!${NC}"
echo "Traffic switched back to: $PREVIOUS"
echo ""
echo "Container Status:"
$DOCKER_CMD -f docker-compose.prod.yml ps | grep modern_academy_api
