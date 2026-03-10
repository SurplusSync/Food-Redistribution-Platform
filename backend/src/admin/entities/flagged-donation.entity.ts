import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FlagStatus {
  FLAGGED = 'FLAGGED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

@Entity()
export class FlaggedDonation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  donationId: string;

  @Column()
  donationName: string;

  @Column()
  reportedByUserId: string;

  @Column()
  reportedByEmail: string;

  @Column('text')
  reason: string;

  @Column({ type: 'enum', enum: FlagStatus, default: FlagStatus.FLAGGED })
  status: FlagStatus;

  @Column({ nullable: true })
  adminNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
