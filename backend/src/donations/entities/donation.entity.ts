import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

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

  @Column('float')
  quantity: number;

  @Column()
  unit: string;  // e.g., "kg", "plates", "servings"

  @Column()
  preparationTime: string;

  // Location Data
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

  // ✅ Relation to donor (for gamification - awards karma)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'donorId' })
  donor: User;

  @Column({ nullable: true })
  claimedById: string | null;

  // ✅ NEW: Volunteer who picks up/delivers the food
  @Column({ nullable: true })
  volunteerId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expiryTime: Date;

  // ✅ NEW: Timestamps for workflow tracking
  @Column({ type: 'timestamp', nullable: true })
  pickedUpAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}