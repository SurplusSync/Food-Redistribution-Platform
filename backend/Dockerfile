# --- Stage 1: Base (Install Dependencies) ---
FROM node:20-alpine AS base

# 1. Set Root Workdir
WORKDIR /app

# 2. Copy Package Files (structure must match monorepo)
COPY backend/package*.json ./backend/
# Copy shared if it has a package.json, otherwise just the folder structure
COPY shared/ ./shared/

# 3. Install Dependencies
WORKDIR /app/backend
RUN npm install

# --- Stage 2: Development (For Local Docker Compose) ---
FROM base AS dev
# We don't copy source code here because docker-compose mounts it via volumes!
WORKDIR /app/backend
CMD ["npm", "run", "start:dev"]

# --- Stage 3: Builder (For Render Production) ---
FROM base AS builder
WORKDIR /app
# Copy all source code (backend + shared)
COPY . .
# Build the backend
WORKDIR /app/backend
RUN npm run build

# Stage 4: Production Runner (For Render)
FROM node:20-alpine AS production
WORKDIR /app

# Copy built artifacts from the correct path
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./

EXPOSE 3000
CMD ["npm", "run", "start:prod"]