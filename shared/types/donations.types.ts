export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  EXPIRED = 'EXPIRED',
}
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
  status: DonationStatus; // uses enum
  claimedBy?: string;
  claimedAt?: Date;
  pickedUpAt?: Date; // When volunteer picks up
  deliveredAt?: Date; // When volunteer delivers
  createdAt: Date;
}
