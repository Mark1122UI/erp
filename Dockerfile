# ==============================================================================
# UNIVERSAL ERP — MULTI-STAGE PRODUCTION DOCKERFILE
# ==============================================================================

# -------------------------------------------------------------
# Stage 1: Build & Dependencies
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

# Compile TypeScript
RUN npm run build

# Remove development dependencies to keep bundle lightweight
RUN npm prune --production

# -------------------------------------------------------------
# Stage 2: Production Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create unprivileged application user
RUN addgroup -g 1001 -S erpgroup && \
    adduser -u 1001 -S erpuser -G erpgroup

# Create upload and data directories with correct permissions
RUN mkdir -p /app/uploads && chown -R erpuser:erpgroup /app

# Copy production runtime files from builder
COPY --from=builder --chown=erpuser:erpgroup /app/package*.json ./
COPY --from=builder --chown=erpuser:erpgroup /app/node_modules ./node_modules
COPY --from=builder --chown=erpuser:erpgroup /app/dist ./dist
COPY --from=builder --chown=erpuser:erpgroup /app/public ./public

# Switch to non-root user
USER erpuser

# Expose service port
EXPOSE 3000

# Health check instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start Universal ERP server
CMD ["node", "dist/server.js"]
