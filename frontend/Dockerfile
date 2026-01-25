# Frontend Dockerfile for ESG Sustainability Analysis
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY frontend/ .

# Build application
RUN bun run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
