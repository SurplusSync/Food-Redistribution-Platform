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
    expiryTime: item.expiryTime ? new Date(item.expiryTime) : new Date(Date.now() + 24*60*60*1000),
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
    { id: '1', name: 'Newcomer', icon: '🌱', description: 'Joined the platform', earned: true, requirement: 1  }
  ];
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  const user = JSON.parse(userStr);

  // SAFETY 6: Ensure impactStats exists to prevent Profile crash
  return {
    ...user,
    impactStats: user.impactStats || {
      totalDonations: 0,
      mealsProvided: 0,
      kgSaved: 0
    }
  };
};

export const updateUserProfile = async (userId: string, data: any) => {
  // Mock Update: Save to LocalStorage so user sees changes immediately
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const updatedUser = { ...JSON.parse(userStr), ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  return data;
};

export default api;