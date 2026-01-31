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
  ) {}

  async create(createDonationDto: CreateDonationDto) {
    // Creates a new entry in the 'donation' table
    const donation = this.donationsRepository.create({
      ...createDonationDto,
      donorId: 'temp-donor-id', // TODO: In the future, get this from req.user.id
      status: DonationStatus.AVAILABLE,
    });
    
    // Saves to Postgres
    return await this.donationsRepository.save(donation);
  }

  async findAll(latitude?: number, longitude?: number, radius: number = 5) {
    // 1. If no location provided, just return everything
    if (!latitude || !longitude) {
      return this.donationsRepository.find({
        where: { status: DonationStatus.AVAILABLE },
        order: { createdAt: 'DESC' },
      });
    }

    // 2. THE "MEDIUM COMPLEXITY" ALGORITHM
    // This runs a raw SQL query to calculate distance on the database server.
    // It finds food within 'radius' km and sorts by closest first.
    return this.donationsRepository
      .createQueryBuilder('donation')
      .where('donation.status = :status', { status: DonationStatus.AVAILABLE })
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(donation.latitude)) * cos(radians(donation.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(donation.latitude))))`,
        'distance',
      )
      .having('distance < :radius')
      .setParameters({ lat: latitude, lon: longitude, radius })
      .orderBy('distance', 'ASC')
      .getMany();
  }

  async claim(id: string, claimDto: ClaimDonationDto) {
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
    donation.claimedById = 'temp-ngo-id'; // TODO: Replace with real User ID later
    
    return await this.donationsRepository.save(donation);
  }
}