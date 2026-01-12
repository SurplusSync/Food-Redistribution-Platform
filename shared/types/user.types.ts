export enum UserRole {
  DONOR = 'DONOR',
  NGO = 'NGO',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  name: string;
  isVerified: boolean;
  createdAt: Date;
}