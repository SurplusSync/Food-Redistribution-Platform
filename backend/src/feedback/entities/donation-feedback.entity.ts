import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Donation } from '../../donations/entities/donation.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class DonationFeedback {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    rating: number; // 1-5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column()
    donationId: string;

    @Column()
    ngoId: string;

    @ManyToOne(() => Donation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'donationId' })
    donation: Donation;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ngoId' })
    ngo: User;

    @CreateDateColumn()
    createdAt: Date;
}
