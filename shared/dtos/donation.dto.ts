export interface CreateDonationDto {
  foodType: string;
  quantity: number;
  unit: string;
  preparationTime: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  specialInstructions?: string;
}