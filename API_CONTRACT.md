# API Contract - Food Redistribution Platform

## Base URLs
- **Backend (Development):** `http://localhost:3000`
- **Frontend (Development):** `http://localhost:5173`
- **API Documentation:** `http://localhost:3000/api`

---

## Authentication

Protected endpoints require a Bearer token in the header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Endpoints

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "donor@restaurant.com",
  "password": "securepass123",
  "name": "Annapurna Restaurant",
  "role": "DONOR",
  "phoneNumber": "+919876543210"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "donor@restaurant.com",
      "name": "Annapurna Restaurant",
      "role": "DONOR"
    }
  },
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email address",
    "password must be at least 6 characters"
  ],
  "statusCode": 400
}
```

---

### 2. Login User

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "donor@restaurant.com",
  "password": "securepass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "donor@restaurant.com",
      "name": "Annapurna Restaurant",
      "role": "DONOR"
    }
  },
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

### 3. Create Food Donation

**Endpoint:** `POST /donations`  
**Authentication:** Required (Bearer Token)

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "foodType": "Vegetable Biryani",
  "quantity": 50,
  "unit": "servings",
  "preparationTime": "2025-01-12T10:00:00Z",
  "latitude": 17.6868,
  "longitude": 83.2185,
  "address": "Beach Road, Visakhapatnam, Andhra Pradesh",
  "imageUrl": "https://example.com/food.jpg",
  "specialInstructions": "Keep refrigerated. Contains nuts."
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "foodType": "Vegetable Biryani",
    "quantity": 50,
    "unit": "servings",
    "status": "ACTIVE",
    "location": {
      "latitude": 17.6868,
      "longitude": 83.2185,
      "address": "Beach Road, Visakhapatnam, Andhra Pradesh"
    },
    "preparationTime": "2025-01-12T10:00:00Z",
    "createdAt": "2025-01-12T10:30:00Z"
  },
  "message": "Donation created successfully"
}
```
---

### 4. Get All Available Food Donations

**Endpoint:** `GET /donations`  
**Authentication:** Required (Bearer Token)

**Query Parameters (Optional):**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| latitude | number | NGO's current latitude | 17.6868 |
| longitude | number | NGO's current longitude | 83.2185 |
| radius | number | Search radius in kilometers (default: 5) | 10 |

**Example Request:**
```http
GET /donations?latitude=17.6868&longitude=83.2185&radius=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "foodType": "Vegetable Biryani",
      "quantity": 50,
      "unit": "servings",
      "status": "AVAILABLE",
      "location": {
        "latitude": 17.6868,
        "longitude": 83.2185,
        "address": "Beach Road, Visakhapatnam, Andhra Pradesh"
      },
      "donor": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Annapurna Restaurant",
        "trustScore": 4.5
      },
      "preparationTime": "2025-01-12T10:00:00Z",
      "expiryTime": "2025-01-12T18:00:00Z",
      "distance": 2.3,
      "imageUrl": "https://example.com/food.jpg",
      "specialInstructions": "Keep refrigerated. Contains nuts.",
      "createdAt": "2025-01-12T10:30:00Z"
    }
  ],
  "message": "Food listings retrieved successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Please login first",
  "statusCode": 401
}
```

**Implementation Notes:**
- Returns only donations with `status = "AVAILABLE"`
- Sorted by creation time (newest first)
- If latitude/longitude provided, includes `distance` field in km
- If radius provided, filters results to within specified radius
- Uses PostGIS `ST_DWithin` for geospatial filtering

---

### 5. Claim Food Donation

**Endpoint:** `PATCH /donations/:id/claim`  
**Authentication:** Required (Bearer Token - NGO role only)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The donation ID to claim |

**Request Body:**
```json
{
  "estimatedPickupTime": "2025-01-12T15:00:00Z"
}
```

**Example Request:**
```http
PATCH /donations/660e8400-e29b-41d4-a716-446655440001/claim
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "estimatedPickupTime": "2025-01-12T15:00:00Z"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "foodType": "Vegetable Biryani",
    "quantity": 50,
    "unit": "servings",
    "status": "CLAIMED",
    "claimedBy": {
      "id": "770e8400-e29b-41d4-a716-446655440010",
      "name": "Helping Hands NGO",
      "contactNumber": "+919876543210"
    },
    "claimedAt": "2025-01-12T14:00:00Z",
    "estimatedPickupTime": "2025-01-12T15:00:00Z",
    "donor": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Annapurna Restaurant",
      "contactNumber": "+919123456789",
      "address": "Beach Road, Visakhapatnam"
    },
    "location": {
      "latitude": 17.6868,
      "longitude": 83.2185,
      "address": "Beach Road, Visakhapatnam"
    }
  },
  "message": "Food donation claimed successfully"
}
```

**Error Response (400 Bad Request - Already Claimed):**
```json
{
  "success": false,
  "message": "This donation has already been claimed",
  "errors": ["Food status is CLAIMED. Cannot claim again."],
  "statusCode": 400
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Donation not found",
  "statusCode": 404
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only NGOs can claim food donations",
  "statusCode": 403
}
```

**Business Rules:**
- Only users with role `NGO` can claim donations
- Cannot claim if status is `CLAIMED`, `COLLECTED`, or `EXPIRED`
- Updates status from `AVAILABLE` to `CLAIMED`
- Records which NGO claimed it (`claimedBy`) and timestamp (`claimedAt`)
- Returns donor contact information for coordination
- Temporary lock during claim to prevent race conditions

---

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "quantity must be a positive number",
    "latitude must be a number"
  ],
  "statusCode": 400
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Unauthorized - Please login first",
  "statusCode": 401
}
```

---

## Standard Error Response Format

All API errors follow this structure:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "statusCode": 400
}
```

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200  | OK | Successful GET, PUT, DELETE |
| 201  | Created | Successful POST (resource created) |
| 400  | Bad Request | Validation error, malformed request |
| 401  | Unauthorized | Missing or invalid authentication token |
| 403  | Forbidden | Valid token but insufficient permissions |
| 404  | Not Found | Resource doesn't exist |
| 500  | Internal Server Error | Server-side error |

---

## Testing with Swagger

### How to Test Endpoints:

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open Swagger UI:**
   - Go to: `http://localhost:3000/api`

3. **Test an Endpoint:**
   - Click on any endpoint (e.g., `POST /auth/register`)
   - Click "Try it out" button
   - Fill in the request body
   - Click "Execute"
   - See the response below

4. **Test Protected Endpoints:**
   - First, login and copy the token from response
   - Click "Authorize" button at top
   - Enter: `Bearer <your-token>`
   - Click "Authorize"
   - Now you can test protected endpoints

---

## For Frontend Team (Keshav)

### How to Import Shared Types:
```typescript
// Import types from shared folder
import { User, UserRole } from '../../../shared/types/user.types';
import { FoodListing, Location } from '../../../shared/types/donation.types';
import { ApiResponse, ApiError } from '../../../shared/types/common.types';

// Import DTOs
import { LoginDto, RegisterDto, AuthResponse } from '../../../shared/dtos/auth.dto';
import { CreateDonationDto } from '../../../shared/dtos/donation.dto';
```

### Example Login API Call:
```typescript
async function login(credentials: LoginDto) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data: ApiResponse = await response.json();

    if (data.success && data.data) {
      // Store token
      localStorage.setItem('token', data.data.token);
      return data.data.user;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### Example Create Donation Call:
```typescript
async function createDonation(donation: CreateDonationDto) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/donations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(donation)
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message);
  }
  
  return data.data;
}
```
### Example: Get Available Donations
```typescript
import { FoodListing } from '../../../shared/types/donation.types';
import { ApiResponse } from '../../../shared/types/common.types';

async function getAvailableDonations(
  latitude?: number, 
  longitude?: number, 
  radius: number = 5
): Promise<FoodListing[]> {
  const token = localStorage.getItem('token');
  
  // Build URL with query parameters
  let url = 'http://localhost:3000/donations';
  const params = new URLSearchParams();
  
  if (latitude && longitude) {
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    params.append('radius', radius.toString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data: ApiResponse<FoodListing[]> = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch donations');
  }
  
  return data.data || [];
}
```

### Example: Claim a Donation
```typescript
async function claimDonation(
  donationId: string, 
  pickupTime: string
) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:3000/donations/${donationId}/claim`, 
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        estimatedPickupTime: pickupTime
      })
    }
  );

  const data = await response.json();
  
  if (!data.success) {
    // Handle specific error cases
    if (data.statusCode === 400) {
      throw new Error('This food has already been claimed');
    } else if (data.statusCode === 403) {
      throw new Error('Only NGOs can claim donations');
    }
    throw new Error(data.message || 'Failed to claim donation');
  }
  
  return data.data;
}

// Usage in React component:
// const donations = await getAvailableDonations(myLat, myLong, 10);
// await claimDonation(donation.id, '2025-01-12T15:00:00Z');
```

---

## For Backend Team (Mayuka)

### How to Use DTOs in Controllers:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    
    return {
      success: true,
      data: user,
      message: 'User registered successfully'
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    
    return {
      success: true,
      data: result,
      message: 'Login successful'
    };
  }
}
```

### Standard Response Format:

Always return responses in this format:
```typescript
// Success
return {
  success: true,
  data: yourData,
  message: 'Operation successful'
};

// Error (throw exception)
throw new BadRequestException({
  success: false,
  message: 'Email already exists',
  statusCode: 400
});
```
### Example: Get Available Donations Controller
```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all available food donations' })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radius in km (default: 5)' })
  async getAvailableDonations(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius: number = 5,
  ) {
    const donations = await this.donationsService.findAvailable(
      latitude,
      longitude,
      radius
    );
    
    return {
      success: true,
      data: donations,
      message: 'Food listings retrieved successfully'
    };
  }
}
```

### Example: Claim Donation Controller
```typescript
import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClaimDonationDto } from './dto/claim-donation.dto';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  
  @Patch(':id/claim')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NGO')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a food donation (NGO only)' })
  async claimDonation(
    @Param('id') id: string,
    @Body() dto: ClaimDonationDto,
    @CurrentUser() user: User,
  ) {
    const claimed = await this.donationsService.claimDonation(
      id, 
      user.id, 
      dto.estimatedPickupTime
    );
    
    return {
      success: true,
      data: claimed,
      message: 'Food donation claimed successfully'
    };
  }
}
```

### New DTO Required: ClaimDonationDto

Create file: `backend/src/donations/dto/claim-donation.dto.ts`
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ClaimDonationDto {
  @ApiProperty({ 
    example: '2025-01-12T15:00:00Z',
    description: 'Estimated time when NGO will pick up the food (ISO 8601 format)'
  })
  @IsDateString()
  estimatedPickupTime: string;
}
```

### Service Method Example:
```typescript
// In donations.service.ts
async findAvailable(
  latitude?: number,
  longitude?: number,
  radius: number = 5
): Promise<FoodListing[]> {
  const query = this.donationRepository
    .createQueryBuilder('donation')
    .leftJoinAndSelect('donation.donor', 'donor')
    .where('donation.status = :status', { status: 'AVAILABLE' });

  // If location provided, filter by distance using PostGIS
  if (latitude && longitude) {
    query.andWhere(
      `ST_DWithin(
        donation.location::geography,
        ST_MakePoint(:longitude, :latitude)::geography,
        :radius * 1000
      )`,
      { latitude, longitude, radius }
    );
    
    // Add distance field
    query.addSelect(
      `ST_Distance(
        donation.location::geography,
        ST_MakePoint(:longitude, :latitude)::geography
      ) / 1000`,
      'distance'
    );
  }

  query.orderBy('donation.createdAt', 'DESC');

  return query.getMany();
}

async claimDonation(
  donationId: string,
  ngoId: string,
  pickupTime: string
): Promise<FoodListing> {
  const donation = await this.donationRepository.findOne({
    where: { id: donationId },
    relations: ['donor']
  });

  if (!donation) {
    throw new NotFoundException('Donation not found');
  }

  if (donation.status !== 'AVAILABLE') {
    throw new BadRequestException('This donation has already been claimed');
  }

  donation.status = 'CLAIMED';
  donation.claimedBy = ngoId;
  donation.claimedAt = new Date();
  donation.estimatedPickupTime = new Date(pickupTime);

  return this.donationRepository.save(donation);
}
```

---

## Quick Reference Links

- **Swagger UI:** http://localhost:3000/api
- **Backend Server:** http://localhost:3000
- **Frontend App:** http://localhost:5173

---

## Support

If you encounter issues:
1. Check this documentation first
2. Verify Swagger UI shows your endpoint
3. Test endpoint in Swagger before frontend
4. Check browser console for CORS errors
5. Contact Yuvahasini for integration issues
