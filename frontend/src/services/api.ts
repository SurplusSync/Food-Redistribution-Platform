import axios, { type InternalAxiosRequestConfig } from 'axios';

// Axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Type

export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER';
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED';
export type FoodType = 'cooked' | 'raw' | 'packaged' | 'fruits' | 'bakery' | 'dairy';

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
  type: 'food_claimed' | 'pickup_assigned' | 'delivery_confirmed' | 'near_expiry' | 'new_food_nearby';
  read: boolean;
  createdAt: Date;
};

export type Badge = {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned?: boolean;
  requirement?: number;
};

// Aut─

export const loginUser = async (email: string, password?: string) => {
  if (!password) throw new Error('Password is required');
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerUser = async (data: any) => {
  const payload = { ...data, role: data.role.toUpperCase() };
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  const user = response.data;

  if (!user?.id) {
    throw new Error('Failed to fetch profile');
  }

  return {
    ...user,
    phoneNumber: user.phoneNumber || user.phone || '',
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
};

export const updateUserProfile = async (data: any) => {
  const { impactStats, token, karmaPoints, badges, level, nextLevelPoints, ...updateData } = data;
  const response = await api.patch('/auth/profile', updateData);
  return response.data.data || response.data;
};

// Donations

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
      address: item.address || 'Unknown Location',
    },
    donorName: item.donorName || 'Community Donor',
    donorTrustScore: Number(item.donorTrustScore) || 5.0,
    hygiene:
      typeof item.hygiene === 'string'
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
      : typeof item.imageUrls === 'string' && item.imageUrls
        ? item.imageUrls.split(',')
        : [],
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

  const toISO = (val: Date | string) =>
    val instanceof Date ? val.toISOString() : val;

  formData.append('preparationTime', toISO(data.preparationTime));
  formData.append('expiryTime', toISO(data.expiryTime));

  if (data.donorId !== undefined && data.donorId !== null) {
    formData.append('donorId', String(data.donorId));
  }
  if (data.donorName !== undefined && data.donorName !== null) {
    formData.append('donorName', String(data.donorName));
  }
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

  images.forEach((file) => formData.append('images', file));

  const response = await api.post('/donations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const claimDonation = async (id: string) => {
  const response = await api.patch(`/donations/${id}/claim`, {
    estimatedPickupTime: new Date().toISOString(),
  });
  return response.data;
};

export const updateDonationStatus = async (id: string, status: DonationStatus) => {
  const response = await api.patch(`/donations/${id}/status`, { status });
  return response.data;
};

// Notifications (mock)

export const getNotifications = async (_userId: string): Promise<Notification[]> => {
  return [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Welcome to SurplusSync.',
      type: 'new_food_nearby',
      read: false,
      createdAt: new Date(),
    },
  ];
};

export const markNotificationRead = async (_id: string) => {
  return;
};

export const checkExpiringDonations = () => {
  return;
};

export default api;