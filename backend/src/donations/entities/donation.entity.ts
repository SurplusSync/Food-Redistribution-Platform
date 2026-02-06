import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DonationStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  PICKED_UP = 'PICKED_UP',
}

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  foodType: string;  // Changed from 'foodItem' to match Frontend

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

  @CreateDateColumn()
  createdAt: Date;
}