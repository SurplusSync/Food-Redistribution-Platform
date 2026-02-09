# SurplusSync - Food Redistribution Platform

A full-stack platform connecting food donors (restaurants, caterers, individuals) with NGOs and volunteers to reduce food waste and feed communities in need.

## Features

### For Donors
- **Create Food Donations** - List surplus food with images, quantity, food type, and expiry time
- **Track Donation Status** - Monitor your donations through AVAILABLE → CLAIMED → PICKED_UP → DELIVERED
- **Food Safety Validation** - Automatic validation for high-risk foods and expiry windows
- **Impact Dashboard** - See your contribution metrics (meals provided, CO2 saved, kg redistributed)

### For NGOs
- **Discover Nearby Food** - Interactive map with geo-location filtering by radius
- **Claim Donations** - Reserve available food with estimated pickup time
- **Capacity Management** - Daily intake limits to prevent over-claiming
- **Mark as Delivered** - Confirm receipt of food donations

### For Volunteers
- **Status Updates** - Mark pickups and deliveries in the donation workflow
- **Transport Coordination** - Bridge between donors and NGOs

## Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT with Passport.js
- **File Storage:** Cloudinary (image uploads)
- **API Docs:** Swagger/OpenAPI at `/api`

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Maps:** Leaflet with React-Leaflet
- **HTTP Client:** Axios


## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and JWT settings

# Run migrations (if using)
npm run migration:run

# Start dev server
npm run start:dev
```

Backend runs at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/api`

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

### Docker (Full Stack)

```bash
docker-compose up --build
```

## User Roles

| Role | Permissions |
|------|-------------|
| **DONOR** | Create donations, view own listings, see impact stats |
| **NGO** | Browse donations, claim food, mark as delivered |
| **VOLUNTEER** | Update pickup/delivery status |

## Environment Variables

### Backend (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=food_platform
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ to reduce food waste and feed communities**
