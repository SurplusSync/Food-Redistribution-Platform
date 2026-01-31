export type UserRole = 'donor' | 'ngo' | 'volunteer'

export type DonationStatus = 'ACTIVE' | 'CLAIMED' | 'DELIVERED' | 'EXPIRED'

export type FoodType = 'cooked' | 'raw' | 'packaged' | 'fruits' | 'bakery' | 'dairy'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  verified: boolean
  phone?: string
  organizationName?: string
  organizationType?: string
  address?: string
  trustScore?: number
  impactStats?: {
    totalDonations: number
    mealsProvided: number
    kgSaved: number
  }
}

export type Donation = {
  id: string
  name: string
  foodType: FoodType
  quantity: string
  unit: string
  description?: string
  status: DonationStatus
  donorId: string
  donorName: string
  donorTrustScore: number
  location: {
    lat: number
    lng: number
    address?: string
  }
  hygiene: {
    keptCovered: boolean
    containerClean: boolean
  }
  preparationTime: Date
  expiryTime: Date
  imageUrl?: string
  claimedBy?: string
  claimedAt?: Date
  deliveredAt?: Date
  volunteerId?: string
}

export type Notification = {
  id: string
  userId: string
  type: 'food_claimed' | 'pickup_assigned' | 'delivery_confirmed' | 'near_expiry' | 'new_food_nearby'
  title: string
  message: string
  read: boolean
  createdAt: Date
  relatedId?: string
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
  requirement: number
  earned: boolean
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Mock data storage
let USERS: User[] = [
  {
    id: 'donor-1',
    email: 'donor@example.com',
    name: 'Green Restaurant',
    role: 'donor',
    verified: true,
    organizationName: 'Green Restaurant',
    organizationType: 'restaurant',
    trustScore: 4.8,
    impactStats: { totalDonations: 45, mealsProvided: 450, kgSaved: 180 }
  },
  {
    id: 'ngo-1',
    email: 'ngo@example.com',
    name: 'Hope Foundation',
    role: 'ngo',
    verified: true,
    organizationName: 'Hope Foundation',
    trustScore: 4.9,
    impactStats: { totalDonations: 120, mealsProvided: 2400, kgSaved: 900 }
  },
  {
    id: 'volunteer-1',
    email: 'volunteer@example.com',
    name: 'John Driver',
    role: 'volunteer',
    verified: true,
    impactStats: { totalDonations: 80, mealsProvided: 1200, kgSaved: 500 }
  }
]

let DONATIONS: Donation[] = [
  {
    id: '1',
    name: 'Vegetable Biryani',
    foodType: 'cooked',
    quantity: '5',
    unit: 'kg',
    description: 'Freshly prepared, mild spices',
    status: 'ACTIVE',
    donorId: 'donor-1',
    donorName: 'Green Restaurant',
    donorTrustScore: 4.8,
    location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Delhi' },
    hygiene: { keptCovered: true, containerClean: true },
    preparationTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 3.5), // 3.5 hours from now
  },
  {
    id: '2',
    name: 'Fresh Vegetables',
    foodType: 'raw',
    quantity: '3',
    unit: 'kg',
    status: 'ACTIVE',
    donorId: 'donor-1',
    donorName: 'Green Grocery',
    donorTrustScore: 4.6,
    location: { lat: 28.6200, lng: 77.2150 },
    hygiene: { keptCovered: true, containerClean: true },
    preparationTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 23), // 23 hours from now
  },
  {
    id: '3',
    name: 'Bread Loaves',
    foodType: 'bakery',
    quantity: '15',
    unit: 'pieces',
    status: 'CLAIMED',
    donorId: 'donor-1',
    donorName: 'Sunrise Bakery',
    donorTrustScore: 4.7,
    location: { lat: 28.6080, lng: 77.2000 },
    hygiene: { keptCovered: true, containerClean: true },
    preparationTime: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 22), // 22 hours from now
    claimedBy: 'ngo-1',
    claimedAt: new Date(Date.now() - 1000 * 60 * 15),
  }
]

let NOTIFICATIONS: Notification[] = []

// Auth
export const loginUser = async (email: string): Promise<User> => {
  await sleep(400)
  const user = USERS.find(u => u.email === email)
  if (user) return { ...user }
  throw new Error('Invalid credentials')
}

export const registerUser = async (data: {
  name: string
  email: string
  role: UserRole
  organizationName?: string
  organizationType?: string
  phone?: string
}): Promise<User> => {
  await sleep(500)
  const newUser: User = {
    id: `${data.role}-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: data.role,
    verified: false,
    organizationName: data.organizationName,
    organizationType: data.organizationType,
    phone: data.phone,
    trustScore: 0,
    impactStats: { totalDonations: 0, mealsProvided: 0, kgSaved: 0 }
  }
  USERS.push(newUser)
  return { ...newUser }
}

// Donations
export const getDonations = async (filters?: {
  status?: DonationStatus
  role?: UserRole
  userId?: string
  nearLocation?: { lat: number; lng: number; radius: number }
}): Promise<Donation[]> => {
  await sleep(400)
  let filtered = [...DONATIONS]

  // Filter by status
  if (filters?.status) {
    filtered = filtered.filter(d => d.status === filters.status)
  }

  // Filter for user's own donations (donors)
  if (filters?.userId && filters?.role === 'donor') {
    filtered = filtered.filter(d => d.donorId === filters.userId)
  }

  // Filter for claimed donations (NGOs)
  if (filters?.userId && filters?.role === 'ngo') {
    filtered = filtered.filter(d => d.claimedBy === filters.userId || d.status === 'ACTIVE')
  }

  // Filter by location proximity
  if (filters?.nearLocation) {
    const { lat, lng, radius } = filters.nearLocation
    filtered = filtered.filter(d => {
      const distance = getDistance(lat, lng, d.location.lat, d.location.lng)
      return distance <= radius
    })
  }

  return filtered.map(d => ({ ...d }))
}

export const createDonation = async (data: {
  name: string
  foodType: FoodType
  quantity: string
  unit: string
  description?: string
  donorId: string
  donorName: string
  donorTrustScore: number
  location: { lat: number; lng: number }
  hygiene: { keptCovered: boolean; containerClean: boolean }
  preparationTime: Date
  imageUrl?: string
}): Promise<Donation> => {
  await sleep(500)

  // Calculate expiry time based on food type
  const expiryHours = getExpiryHours(data.foodType)
  const expiryTime = new Date(data.preparationTime.getTime() + expiryHours * 60 * 60 * 1000)

  // Validate food safety window
  const now = new Date()
  const timeSincePreparation = (now.getTime() - data.preparationTime.getTime()) / (1000 * 60 * 60)
  
  if (timeSincePreparation > expiryHours) {
    throw new Error(`This ${data.foodType} food exceeds the safe consumption window of ${expiryHours} hours`)
  }

  const newDonation: Donation = {
    id: `donation-${Date.now()}`,
    ...data,
    status: 'ACTIVE',
    expiryTime,
  }

  DONATIONS.push(newDonation)

  // Create notifications for nearby NGOs
  createNearbyNotifications(newDonation)

  return { ...newDonation }
}

export const claimDonation = async (donationId: string, ngoId: string): Promise<Donation> => {
  await sleep(500)
  const idx = DONATIONS.findIndex(d => d.id === donationId)
  if (idx === -1) throw new Error('Donation not found')
  
  if (DONATIONS[idx].status !== 'ACTIVE') {
    throw new Error('This donation is no longer available')
  }

  DONATIONS[idx] = {
    ...DONATIONS[idx],
    status: 'CLAIMED',
    claimedBy: ngoId,
    claimedAt: new Date()
  }

  // Notify donor
  createNotification({
    userId: DONATIONS[idx].donorId,
    type: 'food_claimed',
    title: 'Food Claimed',
    message: `Your donation "${DONATIONS[idx].name}" has been claimed`,
    relatedId: donationId
  })

  return { ...DONATIONS[idx] }
}

export const confirmPickup = async (donationId: string, volunteerId: string): Promise<Donation> => {
  await sleep(500)
  const idx = DONATIONS.findIndex(d => d.id === donationId)
  if (idx === -1) throw new Error('Donation not found')

  DONATIONS[idx] = {
    ...DONATIONS[idx],
    volunteerId
  }

  // Notify NGO and donor
  if (DONATIONS[idx].claimedBy) {
    createNotification({
      userId: DONATIONS[idx].claimedBy,
      type: 'pickup_assigned',
      title: 'Pickup In Progress',
      message: `Food is being picked up for "${DONATIONS[idx].name}"`,
      relatedId: donationId
    })
  }

  return { ...DONATIONS[idx] }
}

export const confirmDelivery = async (donationId: string): Promise<Donation> => {
  await sleep(500)
  const idx = DONATIONS.findIndex(d => d.id === donationId)
  if (idx === -1) throw new Error('Donation not found')

  DONATIONS[idx] = {
    ...DONATIONS[idx],
    status: 'DELIVERED',
    deliveredAt: new Date()
  }

  // Update impact stats
  const donor = USERS.find(u => u.id === DONATIONS[idx].donorId)
  if (donor && donor.impactStats) {
    donor.impactStats.totalDonations++
    donor.impactStats.mealsProvided += Math.floor(parseFloat(DONATIONS[idx].quantity) * 2)
    donor.impactStats.kgSaved += parseFloat(DONATIONS[idx].quantity)
  }

  // Notify all parties
  createNotification({
    userId: DONATIONS[idx].donorId,
    type: 'delivery_confirmed',
    title: 'Delivery Confirmed',
    message: `Your donation "${DONATIONS[idx].name}" was delivered successfully`,
    relatedId: donationId
  })

  return { ...DONATIONS[idx] }
}

// Notifications
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await sleep(300)
  return NOTIFICATIONS.filter(n => n.userId === userId).map(n => ({ ...n }))
}

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await sleep(200)
  const notification = NOTIFICATIONS.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

// Badges
export const getBadges = async (userId: string): Promise<Badge[]> => {
  await sleep(300)
  const user = USERS.find(u => u.id === userId)
  if (!user || !user.impactStats) return []

  const badges: Badge[] = [
    {
      id: 'first-donation',
      name: 'First Step',
      description: 'Made your first donation',
      icon: '🌱',
      requirement: 1,
      earned: user.impactStats.totalDonations >= 1
    },
    {
      id: 'five-donations',
      name: 'Helper',
      description: 'Completed 5 donations',
      icon: '🤝',
      requirement: 5,
      earned: user.impactStats.totalDonations >= 5
    },
    {
      id: 'twenty-donations',
      name: 'Champion',
      description: 'Completed 20 donations',
      icon: '🏆',
      requirement: 20,
      earned: user.impactStats.totalDonations >= 20
    },
    {
      id: 'fifty-donations',
      name: 'Legend',
      description: 'Completed 50 donations',
      icon: '⭐',
      requirement: 50,
      earned: user.impactStats.totalDonations >= 50
    },
    {
      id: 'hundred-kg',
      name: 'Waste Warrior',
      description: 'Saved 100kg of food',
      icon: '♻️',
      requirement: 100,
      earned: user.impactStats.kgSaved >= 100
    }
  ]

  return badges
}

// Helper functions
function getExpiryHours(foodType: FoodType): number {
  const expiryMap: Record<FoodType, number> = {
    cooked: 4,
    raw: 24,
    packaged: 720, // 30 days
    fruits: 48,
    bakery: 24,
    dairy: 48
  }
  return expiryMap[foodType] || 24
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
  const notification: Notification = {
    id: `notif-${Date.now()}-${Math.random()}`,
    ...data,
    read: false,
    createdAt: new Date()
  }
  NOTIFICATIONS.push(notification)
}

function createNearbyNotifications(donation: Donation) {
  const nearbyNGOs = USERS.filter(u => u.role === 'ngo' && u.verified)
  nearbyNGOs.forEach(ngo => {
    createNotification({
      userId: ngo.id,
      type: 'new_food_nearby',
      title: 'New Food Available',
      message: `${donation.name} (${donation.quantity}${donation.unit}) available nearby`,
      relatedId: donation.id
    })
  })
}

// Check for near-expiry donations
export const checkExpiringDonations = () => {
  const now = new Date()
  DONATIONS.forEach(donation => {
    if (donation.status === 'ACTIVE') {
      const timeUntilExpiry = donation.expiryTime.getTime() - now.getTime()
      const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60)
      
      // Mark as expired if past expiry time
      if (hoursUntilExpiry <= 0) {
        donation.status = 'EXPIRED'
      }
      // Send alert if less than 1 hour remaining
      else if (hoursUntilExpiry <= 1) {
        createNotification({
          userId: donation.donorId,
          type: 'near_expiry',
          title: 'Food Expiring Soon',
          message: `"${donation.name}" will expire in ${Math.floor(hoursUntilExpiry * 60)} minutes`,
          relatedId: donation.id
        })
      }
    }
  })
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  await sleep(300)
  const user = USERS.find(u => u.id === userId)
  return user ? { ...user } : null
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await sleep(400)
  const userIndex = USERS.findIndex(u => u.id === userId)
  if (userIndex === -1) throw new Error('User not found')
  
  USERS[userIndex] = { ...USERS[userIndex], ...updates }
  return { ...USERS[userIndex] }
}