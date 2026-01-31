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
  password: string; // Will store Hashed Password

  @Column({ type: 'enum', enum: UserRole, default: UserRole.DONOR })
  role: UserRole;

  @Column()
  organizationName: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  // For Epic 1/3 (Location)
  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
}