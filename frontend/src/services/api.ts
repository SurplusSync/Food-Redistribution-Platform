import axios, { type InternalAxiosRequestConfig } from 'axios';

// 1. Setup Axios (Real Backend Connection)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Auth Interceptor (Attaches Token)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
  earned?: boolean;
  requirement?: number;
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
  };
  const response = await api.post('/auth/register', payload);
  return response.data.data;
};

export const getDonations = async () => {
  const response = await api.get('/donations');

  // ADAPTER: Bulletproof Data Conversion
  return response.data.map((item: any) => ({
    ...item,

    // SAFETY 1: Force ID to String to prevent "1" === 1 failures
    id: String(item.id),

    // SAFETY 2: Force Quantity to String (Frontend expects string from previous mocks)
    quantity: String(item.quantity),

    // SAFETY 3: Default missing location data
    location: {
      lat: Number(item.latitude) || 0,
      lng: Number(item.longitude) || 0,
      address: item.address || 'Unknown Location'
    },

    // SAFETY 4: Default missing Donor/Hygiene data
    donorName: item.donorName || "Community Donor",
    donorTrustScore: Number(item.donorTrustScore) || 5.0,
    hygiene: item.hygiene || { keptCovered: true, containerClean: true },
    foodType: item.foodType || 'cooked',

    // SAFETY 5: Safe Date Parsing
    expiryTime: item.expiryTime ? new Date(item.expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    preparationTime: item.preparationTime ? new Date(item.preparationTime) : new Date(),
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
  }));
};

export const createDonation = async (data: any) => {
  const { location, ...cleanData } = data;

  const payload = {
    ...cleanData,
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

//  MOCK HELPERS (Safe Defaults)

export const getNotifications = async (_userId: string): Promise<Notification[]> => {
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

export const markNotificationRead = async (_id: string) => {
  return;
};

export const checkExpiringDonations = () => {
  return;
};

export const getBadges = async (_userId: string): Promise<Badge[]> => {
  return [
    { id: '1', name: 'Newcomer', icon: '🌱', description: 'Joined the platform', earned: true, requirement: 1 }
  ];
};

export const getUserProfile = async (_userId: string): Promise<User | null> => {
  try {
    // Call the backend profile endpoint
    // Note: The backend identifies the user from the JWT token, so we don't need to pass the ID in the URL for the current user
    const response = await api.get('/auth/profile');

    // The backend returns the user object directly (based on AuthController.getProfile)
    const user = response.data;

    if (!user) return null;

    // Make sure we carry over the token if it's needed in state
    // (Usually token is stored separately, but keeping existing type structure)
    return {
      ...user,
      impactStats: user.impactStats || {
        totalDonations: 0,
        mealsProvided: 0,
        kgSaved: 0
      }
    };
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
};

export const updateUserProfile = async (_userId: string, data: any) => {
  try {
    // Exclude impactStats from update payload if present, as backend doesn't expect it in DTO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { impactStats, token: _token, ...updateData } = data;

    const response = await api.patch('/auth/profile', updateData);
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

export default api;