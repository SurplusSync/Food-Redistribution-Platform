import axios from 'axios';

// 1. Setup Axios (Real Backend Connection)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Auth Interceptor (Attaches Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- TYPES ---
export type UserRole = 'donor' | 'ngo' | 'volunteer'
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' 

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token?: string;
  // Optional props to satisfy Dashboard components
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
}

//  REAL API CALLS (Connected to Backend)

export const loginUser = async (email: string, password?: string) => {
  if (!password) throw new Error("Password is required");
  const response = await api.post('/auth/login', { email, password });
  return response.data.data; 
};

export const registerUser = async (data: any) => {
  const payload = {
    ...data,
    role: data.role.toUpperCase(), 
    // phone is passed directly, no renaming needed
  };
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const getDonations = async () => {
  const response = await api.get('/donations');
  return response.data;
};

export const createDonation = async (data: any) => {
  const payload = {
    ...data,
    quantity: parseFloat(data.quantity),
    latitude: data.location?.lat || 0,
    longitude: data.location?.lng || 0,
  };
  const response = await api.post('/donations', payload);
  return response.data;
};

export const claimDonation = async (id: string) => {
  const response = await api.patch(`/donations/${id}/claim`);
  return response.data;
};

//  MOCK HELPERS (To Fix Dashboard/Maps)
// These functions don't hit the backend yet but keep the UI running.

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return [
    {
      id: '1',
      title: 'Welcome!',
      message: 'Welcome to SurplusSync. Start donating today!',
      read: false,
      createdAt: new Date()
    }
  ];
};

export const markNotificationRead = async (id: string) => {
  return; 
};

export const checkExpiringDonations = () => {
  return;
};

export const getBadges = async (userId: string): Promise<Badge[]> => {
  return [
    { id: '1', name: 'Newcomer', icon: '🌱', description: 'Joined the platform' }
  ];
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  return data;
};

export default api;