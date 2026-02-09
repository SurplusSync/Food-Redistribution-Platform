import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';
import { Donation, DonationStatus } from './entities/donation.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
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
    // 1. Find the donation in the DB
    const donation = await this.donationsRepository.findOne({ where: { id } });

    // 2. Checks
    if (!donation) {
      throw new NotFoundException('Donation not found');
    }
    if (donation.status !== DonationStatus.AVAILABLE) {
      throw new BadRequestException('Donation already claimed');
    }

    // 3. Update status to CLAIMED
    donation.status = DonationStatus.CLAIMED;
    donation.claimedById = userId; // From JWT payload

    return await this.donationsRepository.save(donation);
  }

  async updateStatus(id: string, status: string, userId: string) {
    const donation = await this.donationsRepository.findOne({ where: { id } });
    if (!donation) throw new NotFoundException('Donation not found');

    // Accept only known status transitions
    const allowedStatuses = Object.values(DonationStatus) as string[];
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    // Simple transition rules (can be expanded):
    // - CLAIMED -> PICKED_UP allowed
    // - PICKED_UP -> DELIVERED allowed
    if (status === DonationStatus.PICKED_UP) {
      if (donation.status !== DonationStatus.CLAIMED) {
        throw new BadRequestException('Donation must be CLAIMED before marking as PICKED_UP');
      }
      donation.status = DonationStatus.PICKED_UP;
    } else if (status === DonationStatus.DELIVERED) {
      if (donation.status !== DonationStatus.PICKED_UP) {
        throw new BadRequestException('Donation must be PICKED_UP before marking as DELIVERED');
      }
      donation.status = DonationStatus.DELIVERED;
    } else {
      // Other transitions are not allowed here
      throw new BadRequestException('Unsupported status transition');
    }

    return await this.donationsRepository.save(donation);
  }
}