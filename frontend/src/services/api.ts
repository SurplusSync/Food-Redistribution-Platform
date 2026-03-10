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

// Types

export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER';
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP' | 'DELIVERED' | 'EXPIRED';
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
  volunteerId?: string;
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
  vehicleType?: string;
  vehicleNumber?: string;
  isAvailable?: boolean;
  badgeCatalog?: {
    id: string;
    name: string;
    icon: string;
    description: string;
    earned: boolean;
    requirement: number;
  }[];
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

// Auth

export const loginUser = async (email: string, password?: string) => {
  if (!password) throw new Error('Password is required');
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerUser = async (data: any) => {
  let payload: any;
  const headers: Record<string, string> = {};

  if (data instanceof FormData) {
    const currentRole = data.get('role');
    if (currentRole && typeof currentRole === 'string') {
      data.set('role', currentRole.toUpperCase());
    }
    payload = data;
    headers['Content-Type'] = 'multipart/form-data';
  } else {
    payload = { ...data, role: data.role.toUpperCase() };
  }

  const response = await api.post('/auth/register', payload, { headers });
  return response.data.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  // Backend returns the user object directly (not wrapped in { data: ... })
  const raw = response.data;
  // Handle both wrapped ({ data: user }) and flat (user) shapes
  const user = raw?.id ? raw : (raw?.data ?? raw);

  if (!user?.id) {
    throw new Error('Failed to fetch profile');
  }

  const profile = {
    ...user,
    phoneNumber: user.phoneNumber || user.phone || '',
    karmaPoints: user.karmaPoints || 0,
    badges: user.badges || [],
    badgeCatalog: user.badgeCatalog || [],
    level: user.level || 1,
    nextLevelPoints: user.nextLevelPoints || 0,
    impactStats: user.impactStats || {
      totalDonations: 0,
      mealsProvided: 0,
      kgSaved: 0,
    },
  };

  // Sync key fields to localStorage so other pages see up-to-date data
  const stored = JSON.parse(localStorage.getItem('user') || '{}');
  localStorage.setItem('user', JSON.stringify({ ...stored, ...profile }));

  return profile;
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
  const params: Record<string, string> = {};
  if (filters?.status?.length) {
    params.status = filters.status.join(',');
  }
  const response = await api.get('/donations', { params });

  // FIX: safely handle both plain array and wrapped { data: [] } response shapes
  const rawList = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

  let data = rawList.map((item: any) => ({
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

  // Filter out expired donations (by status or by time)
  data = data.filter((d: any) => {
    if (d.status === 'EXPIRED') return false;
    if (d.expiryTime && new Date(d.expiryTime).getTime() < Date.now()) return false;
    return true;
  });

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

export const markAsDelivered = async (id: string) => {
  const response = await api.patch(`/donations/${id}/deliver`);
  return response.data;
};

// Notifications — persisted in backend DB

export const getNotifications = async (_userId: string): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  const raw = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  return raw.map((n: any) => ({
    ...n,
    type: (['food_claimed', 'pickup_assigned', 'delivery_confirmed', 'near_expiry', 'new_food_nearby'].includes(n.type)
      ? n.type
      : 'new_food_nearby') as Notification['type'],
    createdAt: new Date(n.createdAt),
  }));
};

export const markNotificationRead = async (id: string) => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await api.patch('/notifications/read-all');
};

// Stats API

export interface CommunityStats {
  totalDonations: number;
  deliveredDonations: number;
  activeDonations: number;
  mealsProvided: number;
  kgRescued: number;
  co2Saved: number;
  totalDonors: number;
  totalNGOs: number;
  totalVolunteers: number;
}

export interface MonthlyStatPoint {
  label: string;
  total: number;
  delivered: number;
  claimed: number;
  meals: number;
}

export const getCommunityStats = async (): Promise<CommunityStats> => {
  try {
    const response = await api.get('/donations/stats/community');
    return response.data?.data || response.data || {};
  } catch {
    return {
      totalDonations: 0, deliveredDonations: 0, activeDonations: 0,
      mealsProvided: 0, kgRescued: 0, co2Saved: 0,
      totalDonors: 0, totalNGOs: 0, totalVolunteers: 0,
    };
  }
};

export const getMonthlyStats = async (): Promise<MonthlyStatPoint[]> => {
  try {
    const response = await api.get('/donations/stats/monthly');
    return response.data?.data || [];
  } catch {
    return [];
  }
};

export interface LeaderboardEntry {
  id: string;
  name: string;
  role: 'Donor' | 'NGO' | 'Volunteer';
  score: number;
}

export const getLeaderboard = async (scope: string = 'all', role?: string): Promise<LeaderboardEntry[]> => {
  try {
    const params: Record<string, string> = { scope };
    if (role) params.role = role;
    const response = await api.get('/donations/leaderboard', { params });
    return response.data?.data || [];
  } catch {
    return [];
  }
};

export const getCompletedTrips = async (userId: string): Promise<Donation[]> => {
  const response = await api.get('/donations');
  const rawList = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  return rawList
    .filter((item: any) => item.volunteerId === userId && item.status === 'DELIVERED')
    .map((item: any) => ({
      ...item,
      id: String(item.id),
      quantity: String(item.quantity),
      status: item.status,
      location: {
        lat: Number(item.latitude) || 0,
        lng: Number(item.longitude) || 0,
        address: item.address || 'Unknown Location',
      },
      donorName: item.donorName || 'Community Donor',
      donorTrustScore: Number(item.donorTrustScore) || 5.0,
      hygiene: typeof item.hygiene === 'string' ? JSON.parse(item.hygiene) : (item.hygiene || {}),
      foodType: item.foodType || 'cooked',
      expiryTime: item.expiryTime ? new Date(item.expiryTime) : new Date(),
      preparationTime: item.preparationTime ? new Date(item.preparationTime) : new Date(),
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : undefined,
      imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
    }));
};

export const toggleAvailability = async (isAvailable: boolean): Promise<User> => {
  const response = await api.patch('/auth/profile', { isAvailable });
  return response.data.data || response.data;
};

// Admin API
export const adminAPI = {
  getPendingNGOs: () => api.get('/admin/pending-ngos'),
  verifyNGO: (id: string) => api.patch(`/admin/verify/${id}`),

  getAllUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),

  getAllDonations: () => api.get('/admin/donations'),

  // Support Tickets (admin-only: view all, update status)
  getAllTickets: () => api.get('/admin/tickets'),
  updateTicket: (id: string, data: { status?: string; adminNote?: string }) =>
    api.patch(`/admin/tickets/${id}`, data),

  // Flagged Food
  getFlaggedDonations: () => api.get('/admin/flagged'),
  flagDonation: (donationId: string, reason: string) =>
    api.post('/admin/flagged', { donationId, reason }),
  updateFlaggedDonation: (id: string, data: { status: string; adminNote?: string }) =>
    api.patch(`/admin/flagged/${id}`, data),

  // Admin Notifications
  getAdminNotifications: () => api.get('/admin/notifications'),
};

// ── User-facing support ticket API (any authenticated user) ────────────────
export const supportAPI = {
  getMyTickets: () => api.get('/support/tickets'),
  createTicket: (data: { subject: string; description: string; priority?: string }) =>
    api.post('/support/tickets', data),
};

// ── Volunteer deliveries ────────────────────────────────────────────────────
export const getMyDeliveries = async () => {
  const res = await api.get('/donations/my-deliveries');
  const raw = Array.isArray(res.data) ? res.data : [];
  return raw;
};

// Feedback API

export interface FeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  donationId: string;
  ngoId: string;
  createdAt: string;
  ngo?: { id: string; name: string };
}

export const createFeedback = async (data: { donationId: string; rating: number; comment?: string }): Promise<FeedbackItem> => {
  const response = await api.post('/feedback', data);
  return response.data;
};

export const getFeedbackForDonation = async (donationId: string): Promise<FeedbackItem[]> => {
  const response = await api.get(`/feedback/donation/${donationId}`);
  return response.data;
};

export const getDonorAverageRating = async (donorId: string): Promise<{ averageScore: number; totalReviews: number }> => {
  const response = await api.get(`/feedback/donor/${donorId}/average`);
  return response.data;
};

export default api;