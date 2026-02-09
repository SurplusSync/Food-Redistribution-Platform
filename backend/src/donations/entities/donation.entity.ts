import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
}

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // Name of the food item

  @Column()
  donorName: string;  // Name of the donor

  @Column({ nullable: true })
  description: string;  // Food description

  @Column('simple-json', { nullable: true })
  hygiene: any;  // Hygiene checklist

  @Column('float', { nullable: true })
  donorTrustScore: number;  // Donor trust score

  @Column()
  foodType: string;  // Type of food (e.g., 'cooked', 'raw')

  @Column('float')   // Changed to Number to match Frontend
  quantity: number;

  @Column()
  unit: string;      // Added to match Frontend (e.g., "kg", "plates")

  @Column()
  preparationTime: string; // Added to match Frontend

  // Location Data (Crucial for the Map)
  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @Column({ nullable: true })
  specialInstructions: string;

  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.AVAILABLE })
  status: DonationStatus;

  @Column()
  donorId: string;

  @Column({ nullable: true })
  claimedById: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}