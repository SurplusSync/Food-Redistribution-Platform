<h1 align="center">SurplusSync - Food Redistribution Platform</h1>

<p align="center">
  <strong>Connecting surplus food with those who need it most.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Introduction](#introduction)
- [About](#about)
- [Features](#features)
  - [For Donors](#for-donors)
  - [For NGOs](#for-ngos)
  - [For Volunteers](#for-volunteers)
- [Architecture](#architecture)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Donation Status Flow](#donation-status-flow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Docker Setup (Recommended)](#option-1-docker-setup-recommended)
  - [Option 2: Manual Setup](#option-2-manual-setup)
    - [Database Setup](#database-setup)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
  - [Verify Installation](#verify-installation)
- [Environment Variables](#environment-variables)
  - [Root .env (Docker Compose)](#root-env-docker-compose)
  - [Backend Environment](#backend-environment)
  - [Frontend Environment](#frontend-environment)
- [User Roles & Permissions](#user-roles--permissions)
- [API Reference](#api-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Donation Endpoints](#donation-endpoints)
  - [Standard Error Response Format](#standard-error-response-format)
  - [HTTP Status Codes](#http-status-codes)
- [Swagger API Documentation](#swagger-api-documentation)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [Shared Types & DTOs](#shared-types--dtos)
- [Docker Services](#docker-services)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

## Introduction

**SurplusSync** is a full-stack web platform that connects food donors (restaurants, caterers, individuals) with NGOs and volunteers to reduce food waste and feed communities in need. Donors list surplus food, NGOs discover and claim donations via an interactive map, and volunteers coordinate pickups and deliveries - all in real time.

**Example workflow:**

```
Donor lists 50 plates of Biryani
      ↓
NGO discovers it on the map (2.3 km away)
      ↓
NGO claims the donation
      ↓
Volunteer picks it up from the donor
      ↓
Volunteer delivers it to the NGO
      ↓
Everyone's impact dashboard updates
```

---

## About

SurplusSync is designed to tackle the problem of food waste by creating a seamless bridge between those with excess food and organizations that can distribute it. The platform provides:

- **Real-time geospatial discovery** - NGOs find nearby food on an interactive Leaflet map
- **Role-based workflows** - Each user type (Donor, NGO, Volunteer) gets a purpose-built dashboard
- **Food safety tracking** - Hygiene checklists, preparation timestamps, and expiry monitoring
- **Impact analytics** - Track meals provided, CO₂ saved, and kilograms redistributed
- **Image uploads** - Donors can attach up to 5 photos per donation via Cloudinary
- **JWT authentication** - Secure, token-based auth across all protected endpoints

---

## Features

### For Donors
- **Create Food Donations** - List surplus food with name, food type, quantity, unit, images, preparation time, expiry time, hygiene checklist, and special instructions
- **Geolocated Listings** - Attach latitude/longitude and address so NGOs can find your food on the map
- **Image Uploads** - Upload up to 5 images per donation (stored on Cloudinary)
- **Track Donation Status** - Monitor your donations through `AVAILABLE` → `CLAIMED` → `PICKED_UP` → `DELIVERED`
- **Impact Dashboard** - View your contribution metrics (total donations, meals provided, CO₂ saved, kg redistributed)
- **Donation History** - Browse all your past and present donations

### For NGOs
- **Discovery Map** - Interactive Leaflet map with geolocation-based filtering by radius
- **Claim Donations** - Reserve available food with an estimated pickup time
- **NGO Dashboard** - Dedicated dashboard showing claimed donations, active pickups, and delivery status
- **Mark as Delivered** - Confirm receipt of food donations
- **Impact Statistics** - View aggregated impact across all claimed and delivered donations

### For Volunteers
- **Volunteer Dashboard** - Dedicated view with assigned tasks and status updates
- **Pickup Confirmation** - Mark food as picked up from the donor
- **Delivery Confirmation** - Mark food as delivered to the NGO
- **Transport Coordination** - Bridge communication between donors and NGOs

---

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Framework** | [NestJS](https://nestjs.com/) v11 | Modular, TypeScript-first Node.js framework |
| **Database** | [PostgreSQL](https://www.postgresql.org/) 15 with [PostGIS](https://postgis.net/) | Relational database with geospatial extensions |
| **ORM** | [TypeORM](https://typeorm.io/) | Entity-based database management with auto-sync |
| **Authentication** | [Passport.js](http://www.passportjs.org/) + JWT | Secure token-based authentication |
| **File Storage** | [Cloudinary](https://cloudinary.com/) | Cloud-based image upload and transformation |
| **API Documentation** | [Swagger/OpenAPI](https://swagger.io/) | Interactive API docs at `/api` |
| **Validation** | [class-validator](https://github.com/typestack/class-validator) + [class-transformer](https://github.com/typestack/class-transformer) | DTO-based request validation |
| **Password Hashing** | [bcrypt](https://www.npmjs.com/package/bcrypt) | Secure password storage |
| **Frontend Framework** | [React](https://react.dev/) 18 | Component-based UI with hooks |
| **Build Tool** | [Vite](https://vitejs.dev/) | Fast HMR and optimized production builds |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 3 | Utility-first CSS framework |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight, hook-based global state |
| **Maps** | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) | Interactive map-based food discovery |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP requests with interceptors |
| **Icons** | [Lucide React](https://lucide.dev/) | Modern, clean SVG icon library |
| **Routing** | [React Router](https://reactrouter.com/) v6 | Client-side routing with nested layouts |
| **Containerization** | [Docker](https://www.docker.com/) + Docker Compose | Multi-service orchestration |
| **Caching** | [Redis](https://redis.io/) | In-memory key-value store (Alpine image) |
| **DB Administration** | [pgAdmin 4](https://www.pgadmin.org/) | Web-based PostgreSQL management |

### Project Structure

```
Food-Redistribution-Platform/
├── backend/                        # NestJS API server
│   ├── src/
│   │   ├── auth/                   # Authentication module
│   │   │   ├── dto/                # RegisterDto, LoginDto, UpdateProfileDto
│   │   │   ├── entities/           # User entity (TypeORM)
│   │   │   ├── guards/             # JwtAuthGuard
│   │   │   ├── jwt.strategy.ts     # Passport JWT strategy
│   │   │   ├── auth.controller.ts  # Auth endpoints
│   │   │   ├── auth.module.ts      # Module definition
│   │   │   ├── auth.service.ts     # Business logic
│   │   │   └── auth.service.spec.ts
│   │   ├── donations/              # Donations module
│   │   │   ├── dto/                # CreateDonationDto, ClaimDonationDto, UpdateDonationStatusDto
│   │   │   ├── entities/           # Donation entity (TypeORM)
│   │   │   ├── donations.controller.ts
│   │   │   ├── donations.module.ts
│   │   │   ├── donations.service.ts
│   │   │   └── donations.service.spec.ts
│   │   ├── common/                 # Shared services
│   │   │   └── cloudinary.service.ts
│   │   ├── app.module.ts           # Root module
│   │   └── main.ts                 # Bootstrap & Swagger setup
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Public landing page
│   │   │   ├── Login.tsx           # Login form
│   │   │   ├── Register.tsx        # Registration form (role selection)
│   │   │   └── dashboard/
│   │   │       ├── DonorHome.tsx        # Donor dashboard
│   │   │       ├── NGODashboard.tsx     # NGO dashboard
│   │   │       ├── VolunteerDashboard.tsx # Volunteer dashboard
│   │   │       ├── AddFood.tsx          # Create donation form
│   │   │       ├── DiscoveryMap.tsx      # Interactive Leaflet map
│   │   │       ├── History.tsx          # Donation history
│   │   │       ├── Impact.tsx           # Impact analytics
│   │   │       ├── Notifications.tsx    # Notification center
│   │   │       └── Profile.tsx          # User profile management
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx # Sidebar navigation + role-based routing
│   │   ├── services/
│   │   │   └── api.ts              # Axios instance, types, API calls
│   │   ├── App.tsx                 # Router configuration
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Tailwind + custom styles
│   ├── Dockerfile
│   └── package.json
│
├── shared/                         # Shared TypeScript types
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── donations.types.ts
│   │   └── common.types.ts
│   └── dtos/
│       ├── auth.dto.ts
│       └── donation.dto.ts
│
├── docker-compose.yml              # Multi-service orchestration
├── .env.example                    # Environment variable template
├── .gitignore
├── API_CONTRACT.md                 # Detailed API documentation
└── README.md                       # This file
```

### Donation Status Flow

Donations follow a strict lifecycle managed through role-based state transitions:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  AVAILABLE  │───▶│   CLAIMED   │────▶│  PICKED_UP  │───▶│  DELIVERED  │
│             │     │             │     │             │     │             │
│ Donor lists │     │ NGO claims  │     │ Volunteer   │     │ Volunteer   │
│ surplus food│     │ the food    │     │ picks up    │     │ delivers    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     Donor               NGO              Volunteer           Volunteer
```

**Rules:**
- Only **NGOs** can claim a donation (`AVAILABLE` → `CLAIMED`)
- Only **Volunteers** can update status (`CLAIMED` → `PICKED_UP` → `DELIVERED`)
- Status transitions **cannot skip steps** (e.g., `CLAIMED` → `DELIVERED` is invalid)
- Timestamps are automatically recorded at each transition

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ (20 recommended) | Runtime for both backend and frontend |
| **npm** | 9+ | Package manager (comes with Node.js) |
| **PostgreSQL** | 14+ | Required only for manual setup |
| **Docker** & **Docker Compose** | Latest | Required only for Docker setup |
| **Git** | 2.x+ | For cloning the repository |

### Option 1: Docker Setup (Recommended)

The Docker setup spins up all services - PostgreSQL with PostGIS, Redis, pgAdmin, the NestJS backend, and the React frontend - in a single command.

**1. Clone the repository:**

```bash
git clone https://github.com/your-username/Food-Redistribution-Platform.git
cd Food-Redistribution-Platform
```

**2. Create your environment file:**

```bash
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET` and Cloudinary credentials. You can leave the database defaults for local development.

**3. Build and start all services:**

```bash
docker-compose up --build
```

**4. Access the services:**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | React application |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | NestJS REST API |
| **Swagger Docs** | [http://localhost:3000/api](http://localhost:3000/api) | Interactive API documentation |
| **pgAdmin** | [http://localhost:5050](http://localhost:5050) | Database admin panel |

**5. Stop all services:**

```bash
docker-compose down
```

To also remove persistent database volumes:

```bash
docker-compose down -v
```

---

### Option 2: Manual Setup

#### Database Setup

1. Install PostgreSQL 14+ and ensure the service is running
2. Create a database:

```sql
CREATE DATABASE surplus_db;
```

> **Note:** TypeORM with `synchronize: true` will auto-create all tables on first backend startup. No manual migrations are required in development.

#### Backend Setup

```bash
cd backend
npm install

# Configure environment - create a .env file in the project root
# or set these environment variables:
#   DATABASE_HOST=localhost
#   DATABASE_PORT=5432
#   POSTGRES_USER=postgres
#   POSTGRES_PASSWORD=your_password
#   POSTGRES_DB=surplus_db
#   JWT_SECRET=your_jwt_secret
#   CLOUDINARY_CLOUD_NAME=your_cloud_name
#   CLOUDINARY_API_KEY=your_api_key
#   CLOUDINARY_API_SECRET=your_api_secret

# Start the development server
npm run start:dev
```

The backend will start at **http://localhost:3000**
Swagger docs available at **http://localhost:3000/api**

#### Frontend Setup

```bash
cd frontend
npm install

# The frontend reads VITE_API_URL from the environment.
# Default is http://localhost:3000 (no .env needed for local dev)

# Start the development server
npm run dev
```

The frontend will start at **http://localhost:5173**

### Verify Installation

1. Open [http://localhost:5173](http://localhost:5173) - you should see the SurplusSync landing page
2. Open [http://localhost:3000/api](http://localhost:3000/api) - you should see the Swagger UI
3. Register a new account via the UI or Swagger
4. Log in and access your role-specific dashboard

---

## Environment Variables

### Root .env (Docker Compose)

Copy `.env.example` to `.env` in the project root. This file is used by `docker-compose.yml` and the backend:

```env
# DATABASE CONFIGURATION
POSTGRES_USER=surplus_admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=surplus_db
POSTGRES_PORT=5432

# REDIS CONFIGURATION
REDIS_PORT=6379

# PGADMIN (DB DASHBOARD)
PGADMIN_EMAIL=admin@surplussync.com
PGADMIN_PASSWORD=adminsurp123

# JWT
JWT_SECRET=your_jwt_secret_here

# CLOUDINARY (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Backend Environment

When running without Docker, the backend reads these variables (defaults shown):

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_HOST` | `postgres` | PostgreSQL host (`localhost` for manual setup) |
| `DATABASE_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_USER` | `student` | Database username |
| `POSTGRES_PASSWORD` | `student` | Database password |
| `POSTGRES_DB` | `surplus_db` | Database name |
| `JWT_SECRET` | - | **Required.** Secret key for JWT token signing |
| `CLOUDINARY_CLOUD_NAME` | - | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | - | Cloudinary API secret |

### Frontend Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

---

## User Roles & Permissions

SurplusSync uses role-based access control. Users select their role during registration.

| Role | Dashboard | Key Permissions |
|------|-----------|-----------------|
| **DONOR** | Donor Home | Create donations, upload images, view own listings, track status, view impact stats |
| **NGO** | NGO Dashboard | Browse available donations on map, claim food, mark as delivered, view impact stats |
| **VOLUNTEER** | Volunteer Dashboard | View claimed donations, confirm pickup, confirm delivery |
| **ADMIN** | - | Administrative role (reserved) |

**Dashboard routing is automatic** - after login, users are redirected to their role-specific dashboard:
- Donors → `/dashboard`
- NGOs → `/dashboard/ngo`
- Volunteers → `/dashboard/volunteer`

---

## API Reference

All endpoints use JSON. Protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### `POST /auth/register` - Register a new user

**Request Body:**
```json
{
  "email": "donor@restaurant.com",
  "password": "securepass123",
  "name": "Annapurna Restaurant",
  "role": "DONOR",
  "phone": "+919876543210",
  "organizationName": "Annapurna Foods",
  "organizationType": "Restaurant",
  "address": "Beach Road, Visakhapatnam"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "550e8400-...",
      "email": "donor@restaurant.com",
      "name": "Annapurna Restaurant",
      "role": "DONOR"
    }
  },
  "message": "User registered successfully"
}
```

---

#### `POST /auth/login` - Login

**Request Body:**
```json
{
  "email": "donor@restaurant.com",
  "password": "securepass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "...", "email": "...", "name": "...", "role": "DONOR" }
  },
  "message": "Login successful"
}
```

---

#### `GET /auth/profile` - Get current user profile

**Requires authentication**

Returns the full user profile including organization details and capacity settings.

---

#### `PATCH /auth/profile` - Update current user profile

**Requires authentication**

Update name, phone, address, organization details, location coordinates, and capacity settings.

---

### Donation Endpoints

#### `POST /donations` - Create a food donation

**Requires authentication**
**Supports multipart/form-data** (for image uploads)

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Name of the food item |
| `foodType` | string | Yes | Type: `cooked`, `raw`, `packaged`, `fruits`, `bakery`, `dairy` |
| `quantity` | number | Yes | Amount of food |
| `unit` | string | Yes | Unit: `kg`, `plates`, `servings`, `packets`, etc. |
| `preparationTime` | ISO 8601 | Yes | When the food was prepared |
| `expiryTime` | ISO 8601 | No | When the food expires |
| `latitude` | number | Yes | Pickup location latitude |
| `longitude` | number | Yes | Pickup location longitude |
| `description` | string | No | Additional food description |
| `specialInstructions` | string | No | e.g., "Keep refrigerated. Contains nuts." |
| `images` | File[] | No | Up to 5 image files (uploaded to Cloudinary) |

**Success Response (201):**
```json
{
  "id": "660e8400-...",
  "name": "Vegetable Biryani",
  "foodType": "cooked",
  "quantity": 50,
  "unit": "servings",
  "status": "AVAILABLE",
  "latitude": 17.6868,
  "longitude": 83.2185,
  "imageUrls": ["https://res.cloudinary.com/..."],
  "createdAt": "2025-01-12T10:30:00Z"
}
```

---

#### `GET /donations` - Get all available donations

**Query Parameters (optional):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `latitude` | number | - | Searcher's latitude for distance filter |
| `longitude` | number | - | Searcher's longitude for distance filter |
| `radius` | number | `5` | Search radius in kilometers |

**Example:**
```http
GET /donations?latitude=17.6868&longitude=83.2185&radius=10
```

Returns an array of donation objects sorted by creation time.

---

#### `PATCH /donations/:id/claim` - Claim a donation (NGO only)

**Requires authentication**

**Request Body:**
```json
{
  "estimatedPickupTime": "2025-01-12T15:00:00Z"
}
```

Changes donation status from `AVAILABLE` → `CLAIMED` and records the claiming NGO.

---

#### `PATCH /donations/:id/status` - Update donation status (Volunteer only)

**Requires authentication**

**Request Body:**
```json
{
  "status": "PICKED_UP"
}
```

**Valid values:** `PICKED_UP`, `DELIVERED`

Status transitions must follow the correct order: `CLAIMED` → `PICKED_UP` → `DELIVERED`

---

#### `PATCH /donations/:id/deliver` - Mark donation as delivered

**Requires authentication**

Shortcut endpoint to mark a claimed donation as `DELIVERED`.

---

### Standard Error Response Format

All API errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation error, invalid status transition |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but insufficient role permissions |
| `404` | Not Found | Donation or resource doesn't exist |
| `500` | Internal Server Error | Unhandled server-side error |

---

## Swagger API Documentation

The backend automatically generates interactive API documentation using Swagger/OpenAPI.

**How to use:**

1. Start the backend server
2. Navigate to **http://localhost:3000/api**
3. Click on any endpoint → **"Try it out"** → fill in the request body → **"Execute"**
4. For protected endpoints, click **"Authorize"** at the top, enter `Bearer <your-token>`, and click **"Authorize"**

---

## Frontend Pages & Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Marketing landing page with hero section |
| `/login` | `Login` | Public | Email + password login form |
| `/register` | `Register` | Public | Registration with role selection (Donor/NGO/Volunteer) |
| `/dashboard` | `DonorHome` | Donor | Donor's main dashboard with active donations |
| `/dashboard/ngo` | `NGODashboard` | NGO | NGO-specific dashboard with claimed donations |
| `/dashboard/volunteer` | `VolunteerDashboard` | Volunteer | Volunteer task list with pickup/delivery actions |
| `/dashboard/add` | `AddFood` | Donor | Multi-step donation creation form with image upload |
| `/dashboard/map` | `DiscoveryMap` | All | Interactive Leaflet map showing nearby available food |
| `/dashboard/history` | `History` | All | Donation history log |
| `/dashboard/impact` | `Impact` | All | Impact analytics (meals, CO₂, kg redistributed) |
| `/dashboard/notifications` | `Notifications` | All | Notification center |
| `/dashboard/profile` | `Profile` | All | User profile management |

The `DashboardLayout` component provides a persistent sidebar with role-filtered navigation links, user info display, and notification badges.

---

## Shared Types & DTOs

The `shared/` directory contains TypeScript interfaces and DTOs used by both the frontend and backend to ensure type consistency across the stack:

```
shared/
├── types/
│   ├── user.types.ts        # User, UserRole interfaces
│   ├── donations.types.ts   # FoodListing, DonationStatus, Location
│   └── common.types.ts      # ApiResponse, ApiError generics
└── dtos/
    ├── auth.dto.ts           # LoginDto, RegisterDto, AuthResponse
    └── donation.dto.ts       # CreateDonationDto
```

**Usage in frontend:**
```typescript
import { User, UserRole } from '../../../shared/types/user.types';
import { FoodListing } from '../../../shared/types/donation.types';
import { ApiResponse } from '../../../shared/types/common.types';
```

---

## Docker Services

The `docker-compose.yml` orchestrates five services:

| Service | Image | Container | Port | Description |
|---------|-------|-----------|------|-------------|
| **postgres** | `postgis/postgis:15-3.3` | `surplus_db` | `5432` | PostgreSQL with PostGIS extension |
| **redis** | `redis:alpine` | `surplus_redis` | `6379` | Redis with AOF persistence |
| **pgadmin** | `dpage/pgadmin4` | `surplus_pgadmin` | `5050` | Web-based database management |
| **backend** | `node:20-alpine` (custom) | `surplus_backend` | `3000` | NestJS API with hot reload |
| **frontend** | `node:20-alpine` (custom) | `surplus_frontend` | `5173` | Vite dev server with HMR |

**Features:**
- **Hot reloading** - Both backend and frontend volumes are mounted for live code changes
- **Persistent data** - Database data persists in a named `postgres_data` volume
- **Networking** - Backend connects to `postgres` and `redis` by container name
- **Shared types** - The `shared/` directory is mounted into the backend container

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Linting & Formatting

```bash
# Backend
cd backend
npm run lint        # ESLint with auto-fix
npm run format      # Prettier formatting

# Frontend
cd frontend
npm run lint        # ESLint
```

### Building for Production

```bash
# Backend
cd backend
npm run build       # Compiles to dist/
npm run start:prod  # Runs compiled code

# Frontend
cd frontend
npm run build       # Vite production build
npm run preview     # Preview production build locally
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/Food-Redistribution-Platform.git
   ```
3. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install** dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
5. **Make** your changes and ensure tests pass:
   ```bash
   cd backend && npm test
   ```
6. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open** a Pull Request against the `main` branch

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use |
|--------|-----|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no code change |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build process, tooling |

---

## Troubleshooting

### Docker Issues

**Port conflicts:**

If port `5432`, `3000`, or `5173` is already in use, change the port mapping in `.env` or `docker-compose.yml`.

**Database connection refused:**

```bash
# Check if postgres container is running
docker ps

# View postgres logs
docker logs surplus_db

# Restart all services
docker-compose down && docker-compose up --build
```

**Clean rebuild:**

```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Backend Issues

**`MODULE_NOT_FOUND` error:**

```bash
cd backend
rm -rf node_modules
npm install
```

**Database sync errors:**

TypeORM `synchronize: true` is enabled in development. If your entity schema is out of sync, try dropping and re-creating the database:

```sql
DROP DATABASE surplus_db;
CREATE DATABASE surplus_db;
```

Then restart the backend.

### Frontend Issues

**Vite not connecting to backend:**

Ensure `VITE_API_URL` is set and CORS is configured. The backend enables CORS for `http://localhost:5173` by default.

**Map tiles not loading:**

The Discovery Map uses OpenStreetMap tiles. Ensure you have an active internet connection.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ to reduce food waste and feed communities</strong>
</p>
