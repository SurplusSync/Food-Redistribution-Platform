import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  @Column()
  name: string;

  @Column({ nullable: true }) // Make this nullable if not every user has one
  organizationName: string;

  @Column({ nullable: true })
  organizationType: string;

  @Column({ nullable: true }) // Make nullable to prevent errors on existing data
  phone: string;

  @Column({ nullable: true }) // Make nullable
  address: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column('float', { nullable: true, default: 0 })
  currentIntakeLoad: number;

  @Column('float', { nullable: true, default: 100 })
  dailyIntakeCapacity: number;

  @CreateDateColumn()
  createdAt: Date;
}