# API Contract - Food Redistribution Platform

## 📍 Base URLs
- **Backend (Development):** `http://localhost:3000`
- **Frontend (Development):** `http://localhost:5173`
- **API Documentation:** `http://localhost:3000/api`

---

## 🔐 Authentication

Protected endpoints require a Bearer token in the header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 API Endpoints

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

## 🚨 Standard Error Response Format

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

## 📊 HTTP Status Codes

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

## 🧪 Testing with Swagger

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

## 📝 For Frontend Team (Keshav)

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

---

## 📝 For Backend Team (Mayuka)

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

---

## 🔗 Quick Reference Links

- **Swagger UI:** http://localhost:3000/api
- **Backend Server:** http://localhost:3000
- **Frontend App:** http://localhost:5173

---

## 📞 Support

If you encounter issues:
1. Check this documentation first
2. Verify Swagger UI shows your endpoint
3. Test endpoint in Swagger before frontend
4. Check browser console for CORS errors
5. Contact Yuvahasini for integration issues
