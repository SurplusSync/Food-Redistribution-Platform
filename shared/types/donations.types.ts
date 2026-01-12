export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface FoodListing {
  id: string;
  donorId: string;
  foodType: string;
  quantity: number;
  unit: string;
  preparationTime: Date;
  expiryTime: Date;
  location: Location;
  imageUrl?: string;
  specialInstructions?: string;
  status: 'ACTIVE' | 'CLAIMED' | 'COLLECTED' | 'EXPIRED';
  createdAt: Date;
}