# Base stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build the application
# Note: In a real production scenario, we might want to pass NEXT_PUBLIC_API_URL here
# but for this setup we'll use env variables at runtime where possible or 
# rely on the build-time env if specified in docker-compose
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001

# Start the application
CMD ["npm", "start"]
