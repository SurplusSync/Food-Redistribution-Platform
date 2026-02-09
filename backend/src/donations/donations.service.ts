import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';
import { Donation, DonationStatus } from './entities/donation.entity';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createDonationDto: CreateDonationDto, userId: string) {
    // Creates a new entry in the 'donation' table
    const donation = this.donationsRepository.create({
      ...createDonationDto,
      donorId: userId, // From JWT payload
      status: DonationStatus.AVAILABLE,
    });

    // Saves to Postgres
    return await this.donationsRepository.save(donation);
  }

  async findAll(latitude?: number, longitude?: number, radius: number = 5) {
    // 1. If no location provided, just return everything
    if (!latitude || !longitude) {
      try {
        return await this.donationsRepository.find({
          order: { createdAt: 'DESC' },
        });
      } catch (error) {
        console.error('Error fetching donations:', error);
        return [];
      }
    }

    // 2. THE "MEDIUM COMPLEXITY" ALGORITHM
    // This runs a raw SQL query to calculate distance on the database server.
    // It finds all food within 'radius' km and sorts by closest first.
    try {
      return await this.donationsRepository
        .createQueryBuilder('donation')
        .addSelect(
          `(6371 * acos(cos(radians(:lat)) * cos(radians(donation.latitude)) * cos(radians(donation.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(donation.latitude))))`,
          'distance',
        )
        .having('distance < :radius')
        .setParameters({ lat: latitude, lon: longitude, radius })
        .orderBy('distance', 'ASC')
        .getMany();
    } catch (error) {
      console.error('Error with distance query, returning all donations:', error);
      // Fallback: return all donations without distance filtering
      return await this.donationsRepository.find({
        order: { createdAt: 'DESC' },
      });
    }
  }

  async claim(id: string, claimDto: ClaimDonationDto, userId: string) {
    return await this.donationsRepository.manager.transaction(async transactionalEntityManager => {
      // 1. Find the donation and user (NGO)
      const donation = await transactionalEntityManager.findOne(Donation, { where: { id } });
      const user = await transactionalEntityManager.findOne(User, { where: { id: userId } });

      // 2. Checks
      if (!donation) {
        throw new NotFoundException('Donation not found');
      }
      if (donation.status !== DonationStatus.AVAILABLE) {
        throw new BadRequestException('Donation already claimed');
      }
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check role
      if (user.role !== UserRole.NGO) {
        throw new BadRequestException('Only NGOs can claim donations');
      }

      // 3. NGO Capacity Validation
      if (user.dailyIntakeCapacity !== null && user.dailyIntakeCapacity !== undefined) {
        // Check unit match (case-insensitive)
        if (user.capacityUnit && donation.unit) {
          const ngoUnit = user.capacityUnit.trim().toLowerCase();
          const donationUnit = donation.unit.trim().toLowerCase();

          if (ngoUnit !== donationUnit) {
            throw new BadRequestException(
              `Unit mismatch: NGO capacity is in ${user.capacityUnit}, but donation is in ${donation.unit}.`,
            );
          }
        }

        // Check capacity limit
        if (user.currentIntakeLoad + donation.quantity > user.dailyIntakeCapacity) {
          throw new BadRequestException(
            `Claim exceeds daily intake capacity. Current load: ${user.currentIntakeLoad}, Capacity: ${user.dailyIntakeCapacity}`,
          );
        }
      }

      // 4. Update status and NGO current load
      donation.status = DonationStatus.CLAIMED;
      donation.claimedById = userId;

      user.currentIntakeLoad += donation.quantity;

      await transactionalEntityManager.save(user);
      return await transactionalEntityManager.save(donation);
    });
  }

  async markAsDelivered(id: string, userId: string) {
    return await this.donationsRepository.manager.transaction(async transactionalEntityManager => {
      const donation = await transactionalEntityManager.findOne(Donation, { where: { id } });

      if (!donation) {
        throw new NotFoundException('Donation not found');
      }

      if (donation.claimedById !== userId) {
        throw new BadRequestException('You can only mark your claimed donations as delivered');
      }

      if (donation.status === DonationStatus.DELIVERED) {
        throw new BadRequestException('Donation already marked as delivered');
      }

      const user = await transactionalEntityManager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update status to DELIVERED
      donation.status = DonationStatus.DELIVERED;

      // Decrement current intake load
      user.currentIntakeLoad = Math.max(0, user.currentIntakeLoad - donation.quantity);

      await transactionalEntityManager.save(user);
      return await transactionalEntityManager.save(donation);
    });
  }
}