# Stage 1: Install all dependencies (used by dev & build)
FROM node:20-alpine AS deps

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

# Stage 2: Development (all deps, ts-node hot-reload)
FROM deps AS dev

WORKDIR /app

# Source code is mounted via docker-compose volumes
EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Stage 3: Build the application
FROM deps AS builder

WORKDIR /app

COPY backend/ .
COPY shared/ /shared/

RUN npm run build

# Stage 4: Production (minimal image)
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/main"]