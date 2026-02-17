import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    // Perform safety validation
    this.validateFoodSafety(createDonationDto);

    // Creates a new entry in the 'donation' table
    const donation = this.donationsRepository.create({
      ...createDonationDto,
      donorId: userId, // From JWT payload
      status: DonationStatus.AVAILABLE,
    });

    // Saves to Postgres
    return await this.donationsRepository.save(donation);
  }

  private validateFoodSafety(createDonationDto: CreateDonationDto) {
    const now = new Date();
    const expiryDate = new Date(createDonationDto.expiryTime);
    const preparationDate = new Date(createDonationDto.preparationTime);

    // 1. Check if expiry time is in the past
    if (expiryDate <= now) {
      throw new BadRequestException('Donation expiry time cannot be in the past');
    }

    // 2. Check if preparation time is in the future
    if (preparationDate > now) {
      throw new BadRequestException('Preparation time cannot be in the future');
    }

    // 3. Define high-risk food types and their safe consumption windows
    const highRiskFoodTypes = ['cooked', 'dairy', 'meat', 'poultry', 'seafood'];
    const foodTypeLower = createDonationDto.foodType.toLowerCase();
    const isHighRisk = highRiskFoodTypes.some(type => foodTypeLower.includes(type));

    // Stricter rule for high-risk food: must have at least 2 hours of shelf life at create time
    const minSafeWindowHours = isHighRisk ? 2 : 1;
    const safeLimit = new Date(now.getTime() + minSafeWindowHours * 60 * 60 * 1000);

    if (expiryDate < safeLimit) {
      const message = isHighRisk
        ? `High-risk food (${createDonationDto.foodType}) must have at least ${minSafeWindowHours} hours of safe consumption window remaining.`
        : `Food must have at least ${minSafeWindowHours} hour of safe consumption window remaining.`;
      throw new BadRequestException(message);
    }
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


  async updateStatus(id: string, status: DonationStatus, userId: string) {
    return await this.donationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the donation
        const donation = await transactionalEntityManager.findOne(Donation, {
          where: { id },
          relations: ['donor'] // ✅ Load donor relation for karma
        });

        if (!donation) {
          throw new NotFoundException('Donation not found');
        }

        // Find the user making the request
        const requestingUser = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

        if (!requestingUser) {
          throw new NotFoundException('User not found');
        }

        // ✅ AUTHORIZATION CHECK (allows donors, NGOs, and volunteers)
        const isAuthorized =
          donation.donorId === userId ||
          donation.claimedById === userId ||
          (requestingUser.role === UserRole.VOLUNTEER && donation.claimedById !== null);

        if (!isAuthorized) {
          throw new BadRequestException('You are not authorized to update this donation status');
        }

        const oldStatus = donation.status;

        // ✅ GAMIFICATION: Handle DELIVERED status with karma awards
        if (status === DonationStatus.DELIVERED) {
          if (oldStatus === DonationStatus.DELIVERED) {
            throw new BadRequestException('Donation already marked as delivered');
          }

          // Find the NGO who claimed it
          const claimedNgo = await transactionalEntityManager.findOne(User, {
            where: { id: donation.claimedById }
          });

          if (claimedNgo) {
            // Decrement NGO's intake load
            claimedNgo.currentIntakeLoad = Math.max(0, claimedNgo.currentIntakeLoad - donation.quantity);
            await transactionalEntityManager.save(claimedNgo);
          }

          // ✅ AWARD KARMA TO VOLUNTEER (if they're the one marking as delivered)
          if (requestingUser.role === UserRole.VOLUNTEER) {
            const VOLUNTEER_KARMA = 50;
            requestingUser.karmaPoints = (requestingUser.karmaPoints || 0) + VOLUNTEER_KARMA;

            // Check and award badges to volunteer
            const volunteerNewBadges = this.checkAndAwardBadges(requestingUser);
            if (volunteerNewBadges.length > 0) {
              const currentBadges = requestingUser.badges || [];
              requestingUser.badges = [...new Set([...currentBadges, ...volunteerNewBadges])];
            }

            await transactionalEntityManager.save(requestingUser);
          }

          // ✅ AWARD KARMA TO DONOR
          if (donation.donor) {
            const DONOR_KARMA = 30;
            donation.donor.karmaPoints = (donation.donor.karmaPoints || 0) + DONOR_KARMA;

            // Check and award badges to donor
            const donorNewBadges = this.checkAndAwardBadges(donation.donor);
            if (donorNewBadges.length > 0) {
              const currentBadges = donation.donor.badges || [];
              donation.donor.badges = [...new Set([...currentBadges, ...donorNewBadges])];
            }

            await transactionalEntityManager.save(donation.donor);
          }

          donation.status = DonationStatus.DELIVERED;
          donation.deliveredAt = new Date();
          await transactionalEntityManager.save(donation);

          return {
            ...donation,
            karmaAwarded: requestingUser.role === UserRole.VOLUNTEER ? 50 : 0,
            donorKarmaAwarded: 30,
          };
        }

        // Handle PICKED_UP status
        if (status === DonationStatus.PICKED_UP) {
          donation.pickedUpAt = new Date();
          donation.volunteerId = userId;
        }

        // Handle reversing a claim (CLAIMED/PICKED_UP -> AVAILABLE)
        if (status === DonationStatus.AVAILABLE && (oldStatus === DonationStatus.CLAIMED || oldStatus === DonationStatus.PICKED_UP)) {
          const claimedUser = await transactionalEntityManager.findOne(User, {
            where: { id: donation.claimedById }
          });

          if (claimedUser) {
            claimedUser.currentIntakeLoad = Math.max(0, claimedUser.currentIntakeLoad - donation.quantity);
            await transactionalEntityManager.save(claimedUser);
          }

          donation.claimedById = null;
        }

        // Update status
        donation.status = status;
        await transactionalEntityManager.save(donation);

        return donation;
      },
    );
  }

  // ✅ Badge checking method (keep this as-is)
  private checkAndAwardBadges(user: User): string[] {
    const newBadges: string[] = [];
    const currentBadges = user.badges || [];

    // Badge thresholds
    const badgeRules = [
      { threshold: 50, badge: 'Newcomer', emoji: '🌱' },
      { threshold: 100, badge: 'Local Hero', emoji: '🦸' },
      { threshold: 250, badge: 'Champion', emoji: '🏆' },
      { threshold: 500, badge: 'Legend', emoji: '⭐' },
      { threshold: 1000, badge: 'Superhero', emoji: '💫' },
    ];

    // Check each badge rule
    for (const rule of badgeRules) {
      const badgeName = `${rule.emoji} ${rule.badge}`;

      if (user.karmaPoints >= rule.threshold && !currentBadges.includes(badgeName)) {
        newBadges.push(badgeName);
      }
    }

    return newBadges;
  }

}