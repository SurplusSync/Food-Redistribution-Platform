import axios, { type InternalAxiosRequestConfig } from 'axios';

// 1. Setup Axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Auth Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========================================
// TYPES
// ========================================

export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER';
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED';
export type FoodType = 'cooked' | 'raw' | 'packaged' | 'fruits' | 'bakery' | 'dairy';

// Donation Interface
export interface Donation {
  id: string;
  name: string;
  foodType: FoodType;
  quantity: string;
  unit: string;
  description?: string;
  donorId: string;
  donorName: string;
  donorTrustScore: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  hygiene: {
    keptCovered: boolean;
    containerClean: boolean;
  };
  preparationTime: Date;
  expiryTime: Date;
  createdAt: Date;
  status: DonationStatus;
  claimedBy?: string;
  imageUrls: string[];
}

// User Interface with Gamification
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  phone?: string;
  isVerified?: boolean;
  token?: string;
  verified?: boolean;
  organizationName?: string;
  organizationType?: string;
  address?: string;
  trustScore?: number;
  karmaPoints?: number;
  badges?: string[];
  level?: number;
  nextLevelPoints?: number;
  impactStats?: {
    totalDonations: number;
    mealsProvided: number;
    kgSaved: number;
  };
}

export type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned?: boolean;
  requirement?: number;
}

// ========================================
// API CALLS
// ========================================

/**
 * Login user
 */
export const loginUser = async (email: string, password?: string) => {
  if (!password) throw new Error("Password is required");
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

/**
 * Register new user
 */
export const registerUser = async (data: any) => {
  const payload = {
    ...data,
    role: data.role.toUpperCase(),
  };
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

/**
 * Get user profile with karma and badges
 * ✅ FIXED: Backend returns user directly at response.data (no nesting)
 */
/**
 * Get user profile with karma and badges
 * 🔍 HEAVILY INSTRUMENTED VERSION FOR DEBUGGING
 */
export const getUserProfile = async (): Promise<User> => {
  console.log('📍 Step 1: getUserProfile called');

  try {
    console.log('📍 Step 2: Calling api.get("/auth/profile")');
    const response = await api.get('/auth/profile');

    console.log('📍 Step 3: Response received');
    console.log('   typeof response:', typeof response);
    console.log('   response:', response);
    console.log('   response.data:', response.data);
    console.log('   typeof response.data:', typeof response.data);

    // Backend returns user data directly at response.data
    const user = response.data.data;

    console.log('📍 Step 4: Assigned user = response.data');
    console.log('   user:', user);
    console.log('   user.id:', user?.id);
    console.log('   user.email:', user?.email);

    if (!user) {
      console.error('❌ user is falsy:', user);
      throw new Error('Failed to fetch profile - user is null/undefined');
    }

    if (!user.id) {
      console.error('❌ user.id is missing!');
      console.error('   user object:', user);
      console.error('   user keys:', Object.keys(user));
      throw new Error('Failed to fetch profile - no user id');
    }

    console.log('✅ Step 5: Validation passed! User has id and email');

    // Map phone to phoneNumber for consistency
    const phoneNumber = user.phoneNumber || user.phone || '';

    const result = {
      ...user,
      phoneNumber,
      karmaPoints: user.karmaPoints || 0,
      badges: user.badges || [],
      level: user.level || 1,
      nextLevelPoints: user.nextLevelPoints || 0,
      impactStats: user.impactStats || {
        totalDonations: 0,
        mealsProvided: 0,
        kgSaved: 0,
      },
    };

    console.log('✅ Step 6: Returning user profile:', result);
    return result;

  } catch (error: any) {
    console.error('❌ getUserProfile caught error:', error);
    console.error('   Error name:', error?.name);
    console.error('   Error message:', error?.message);
    console.error('   Error response:', error?.response);
    console.error('   Error response data:', error?.response?.data);
    console.error('   Error stack:', error?.stack);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: any) => {
  const { impactStats, token, karmaPoints, badges, level, nextLevelPoints, ...updateData } = data;

  const response = await api.patch('/auth/profile', updateData);

  // Backend might return data directly or nested
  return response.data.data || response.data;
};

/**
 * Get all donations
 */
export const getDonations = async (filters?: {
  status?: string[];
  role?: string;
  userId?: string;
}) => {
  const response = await api.get('/donations');

  let data = response.data.map((item: any) => ({
    ...item,
    id: String(item.id),
    quantity: String(item.quantity),
    status: item.status || 'AVAILABLE',
    location: {
      lat: Number(item.latitude) || 0,
      lng: Number(item.longitude) || 0,
      address: item.address || 'Unknown Location'
    },
    donorName: item.donorName || "Community Donor",
    donorTrustScore: Number(item.donorTrustScore) || 5.0,
    hygiene: typeof item.hygiene === 'string'
      ? JSON.parse(item.hygiene)
      : (item.hygiene || { keptCovered: true, containerClean: true }),
    foodType: item.foodType || 'cooked',
    expiryTime: item.expiryTime
      ? new Date(item.expiryTime)
      : new Date(Date.now() + 24 * 60 * 60 * 1000),
    preparationTime: item.preparationTime
      ? new Date(item.preparationTime)
      : new Date(),
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    imageUrls: Array.isArray(item.imageUrls)
      ? item.imageUrls
      : (typeof item.imageUrls === 'string' && item.imageUrls
        ? item.imageUrls.split(',')
        : []),
  }));

  if (filters?.status) {
    data = data.filter((d: any) => filters.status?.includes(d.status));
  }

  return data;
};

/**
 * Create new donation
 */
export const createDonation = async (data: any, images: File[] = []) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('foodType', data.foodType);
  formData.append('quantity', data.quantity.toString());
  formData.append('unit', data.unit);
  formData.append('description', data.description || '');

  const prepTime = data.preparationTime instanceof Date
    ? data.preparationTime.toISOString()
    : data.preparationTime;
  formData.append('preparationTime', prepTime);

  const expTime = data.expiryTime instanceof Date
    ? data.expiryTime.toISOString()
    : data.expiryTime;
  formData.append('expiryTime', expTime);

  if (data.donorId) formData.append('donorId', data.donorId);
  if (data.donorName) formData.append('donorName', data.donorName);
  if (data.donorTrustScore) {
    formData.append('donorTrustScore', data.donorTrustScore.toString());
  }

  if (data.location) {
    formData.append('latitude', data.location.lat.toString());
    formData.append('longitude', data.location.lng.toString());
  }

  if (data.hygiene) {
    formData.append('hygiene', JSON.stringify(data.hygiene));
  }

  images.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/donations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Claim a donation (NGO only)
 */
export const claimDonation = async (id: string) => {
  const response = await api.patch(`/donations/${id}/claim`, {
    estimatedPickupTime: new Date().toISOString()
  });
  return response.data;
};

/**
 * Update donation status (Volunteer workflow)
 */
export const updateDonationStatus = async (id: string, status: DonationStatus) => {
  const response = await api.patch(`/donations/${id}/status`, { status });
  return response.data;
};

// ========================================
// MOCK/PLACEHOLDER FUNCTIONS
// ========================================

/**
 * Get notifications for user (mock)
 */
export const getNotifications = async (_userId: string): Promise<Notification[]> => {
  return [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Welcome to SurplusSync.',
      read: false,
      createdAt: new Date(),
    },
  ];
};

/**
 * Mark notification as read (mock)
 */
export const markNotificationRead = async (_id: string) => {
  return;
};

/**
 * Check expiring donations (mock)
 */
export const checkExpiringDonations = () => {
  return;
};

/**
 * Get user badges (mock)
 */
export const getBadges = async (_userId: string): Promise<Badge[]> => {
  return [
    {
      id: '1',
      name: 'Newcomer',
      icon: '🌱',
      description: 'Joined the platform',
      earned: true,
      requirement: 1,
    },
  ];
};

export default api;