# Build stage for c-api
FROM node:18-alpine AS builder

WORKDIR /api/

# Copy package files
COPY c-api/package*.json ./app
COPY c-api/tsconfig.json ./app
COPY c-api/tsconfig.test.json ./app
COPY c-lib ./

# Install dependencies
RUN npm install

# Copy source code
COPY c-api/src/ ./app/src/

WORKDIR /api/app/
# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /api/app/

# Copy package files
COPY c-api/package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /c-api/app/dist ./dist

# Copy any additional files needed at runtime
COPY c-api/fix.cjs ./

#comment
# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]
