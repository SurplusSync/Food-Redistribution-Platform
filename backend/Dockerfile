# stage 1: Build the Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install
COPY backend/package*.json ./
RUN npm install

# Copy backend source and shared types
COPY backend/ .
COPY shared/ /shared/

RUN npm run build

# stage 2: Run the Application (Production)
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/main"]