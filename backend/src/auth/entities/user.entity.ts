import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Donation } from '../../donations/entities/donation.entity';

export enum UserRole {
  DONOR = 'DONOR',
  NGO = 'NGO',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DONOR })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean; // false = suspended/banned

  @Column()
  name: string;

  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  organizationType: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column('float', { nullable: true })
  dailyIntakeCapacity: number;

  @Column('float', { default: 0 })
  currentIntakeLoad: number;

  @Column({ nullable: true })
  capacityUnit: string;

  @Column({ nullable: true })
  certificateUrl: string;

  // 🎮 Gamification
  @Column({ default: 0 })
  karmaPoints: number;

  @Column('simple-array', { default: '' })
  badges: string[];

  // Timestamps — only once each ✅
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Donation, (donation) => donation.donor)
  donations: Donation[];
}