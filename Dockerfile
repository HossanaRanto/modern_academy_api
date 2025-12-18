# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache chromium ca-certificates

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy PDF templates
COPY src/shared/pdf/templates ./dist/src/shared/pdf/templates

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of only the necessary application files (not node_modules)
RUN chown nestjs:nodejs /app && \
    chown -R nestjs:nodejs /app/dist

# Create entrypoint script for migrations
RUN echo '#!/bin/sh\nset -e\nnpm run migration:run || true\nnode dist/main' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh && chown nestjs:nodejs /app/docker-entrypoint.sh

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Start application with migrations
CMD ["/app/docker-entrypoint.sh"]
