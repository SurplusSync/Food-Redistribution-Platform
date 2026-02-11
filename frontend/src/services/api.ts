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

// TYPES
export type UserRole = 'donor' | 'ngo' | 'volunteer';
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED';
export type FoodType = 'cooked' | 'raw' | 'packaged' | 'fruits' | 'bakery' | 'dairy';

// Explicit Donation Interface
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
  imageUrls: string[]; // Critical for the modal
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
  verified?: boolean;
  phone?: string;
  organizationName?: string;
  organizationType?: string;
  address?: string;
  trustScore?: number;
  impactStats?: {
    totalDonations: number;
    mealsProvided: number;
    kgSaved: number;
  };
}

export type Notification = {
  id: string;
  type: 'food_claimed' | 'pickup_assigned' | 'delivery_confirmed' | 'near_expiry' | 'new_food_nearby';
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

// API CALLS

export const loginUser = async (email: string, password?: string) => {
  if (!password) throw new Error("Password is required");
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerUser = async (data: any) => {
  const payload = {
    ...data,
    role: data.role.toUpperCase(),
  };
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const getDonations = async (filters?: { status?: string[]; role?: string; userId?: string }) => {
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
    hygiene: typeof item.hygiene === 'string' ? JSON.parse(item.hygiene) : (item.hygiene || { keptCovered: true, containerClean: true }),
    foodType: item.foodType || 'cooked',
    expiryTime: item.expiryTime ? new Date(item.expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    preparationTime: item.preparationTime ? new Date(item.preparationTime) : new Date(),
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : (typeof item.imageUrls === 'string' && item.imageUrls ? item.imageUrls.split(',') : []),
  }));

  if (filters?.status) {
    data = data.filter((d: any) => filters.status?.includes(d.status));
  }

  return data;
};

export const createDonation = async (data: any, images: File[] = []) => {
  const formData = new FormData();

  formData.append('name', data.name);
  formData.append('foodType', data.foodType);
  formData.append('quantity', data.quantity.toString());
  formData.append('unit', data.unit);
  formData.append('description', data.description || '');

  if (data.preparationTime) {
    const prepTime = data.preparationTime instanceof Date ? data.preparationTime.toISOString() : data.preparationTime;
    formData.append('preparationTime', (prepTime as string));
  }

  if (data.expiryTime) {
    const expTime = data.expiryTime instanceof Date ? data.expiryTime.toISOString() : data.expiryTime;
    formData.append('expiryTime', (expTime as string));
  }

  if (data.donorId) formData.append('donorId', data.donorId);
  if (data.donorName) formData.append('donorName', data.donorName);
  if (data.donorTrustScore) formData.append('donorTrustScore', data.donorTrustScore.toString());

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

export const claimDonation = async (id: string) => {
  const response = await api.patch(`/donations/${id}/claim`, {
    estimatedPickupTime: new Date().toISOString()
  });
  return response.data;
};

export const updateDonationStatus = async (id: string, status: string) => {
  const response = await api.patch(`/donations/${id}/status`, { status });
  return response.data;
};

// MOCK HELPERS
export const getNotifications = async (_userId: string): Promise<Notification[]> => {
  return [{ id: '1', type: 'food_claimed', title: 'Welcome!', message: 'Welcome to SurplusSync.', read: false, createdAt: new Date() }];
};
export const markNotificationRead = async (_id: string) => { return; };
export const checkExpiringDonations = () => { return; };
export const getBadges = async (_userId: string): Promise<Badge[]> => {
  return [{ id: '1', name: 'Newcomer', icon: '🌱', description: 'Joined the platform', earned: true, requirement: 1 }];
};
export const getUserProfile = async (_userId: string): Promise<User | null> => {
  try {
    const response = await api.get('/auth/profile');
    const user = response.data;
    if (!user) return null;
    return { ...user, impactStats: user.impactStats || { totalDonations: 0, mealsProvided: 0, kgSaved: 0 } };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
};
export const updateUserProfile = async (_userId: string, data: any) => {
  try {
    const { impactStats, token: _token, ...updateData } = data;
    const response = await api.patch('/auth/profile', updateData);
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

export default api;