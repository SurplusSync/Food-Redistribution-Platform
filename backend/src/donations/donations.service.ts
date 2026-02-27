import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';
import { Donation, DonationStatus } from './entities/donation.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventsGateway } from '../events/events.gateway';
import { RedisService } from '../common/redis.service';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Record<string, any>,
    private eventsGateway: EventsGateway,
    private redisService: RedisService,
  ) {}

  /**
   * Invalidate all cached donation queries.
   * Called after any write operation (create, claim, status update, deliver)
   * so that subsequent GET /donations requests fetch fresh data.
   */
  private async invalidateCache(): Promise<void> {
    try {
      // cache-manager v7 uses clear(), older versions use reset()
      if (typeof this.cacheManager.clear === 'function') {
        await this.cacheManager.clear();
      } else if (typeof this.cacheManager.reset === 'function') {
        await this.cacheManager.reset();
      }
      this.logger.debug('Donation cache invalidated');
    } catch (error) {
      this.logger.warn(
        'Failed to invalidate cache, it will expire naturally',
        error,
      );
    }
  }

  async create(createDonationDto: CreateDonationDto, userId: string) {
    this.validateFoodSafety(createDonationDto);

    const donation = this.donationsRepository.create({
      ...createDonationDto,
      donorId: userId,
      status: DonationStatus.AVAILABLE,
    });

    const saved = await this.donationsRepository.save(donation);

    // Award karma to donor for creating a donation
    const donor = await this.usersRepository.findOne({ where: { id: userId } });
    if (donor) {
      donor.karmaPoints = (donor.karmaPoints || 0) + 10;
      const newBadges = this.checkAndAwardBadges(donor);
      if (newBadges.length > 0) {
        donor.badges = [...new Set([...(donor.badges || []), ...newBadges])];
      }
      await this.usersRepository.save(donor);
    }

    // 1. Emit the event over websockets
    this.eventsGateway.emitDonationCreated(saved);

    // 2. Clear Redis cache for donation listings
    if (this.redisService) {
      // Assuming keys are stored like "/donations*" or clear all cache if needed
      await this.redisService.deleteKeysByPattern('*donations*');
    }

    await this.invalidateCache();
    return saved;
  }

  private validateFoodSafety(createDonationDto: CreateDonationDto) {
    const now = new Date();
    const expiryDate = new Date(createDonationDto.expiryTime);
    const preparationDate = new Date(createDonationDto.preparationTime);

    // 1. Check if expiry time is in the past
    if (expiryDate <= now) {
      throw new BadRequestException(
        'Donation expiry time cannot be in the past',
      );
    }

    // 2. Check if preparation time is in the future
    if (preparationDate > now) {
      throw new BadRequestException('Preparation time cannot be in the future');
    }

    // 3. Define high-risk food types and their safe consumption windows
    const highRiskFoodTypes = ['cooked', 'dairy', 'meat', 'poultry', 'seafood'];
    const foodTypeLower = createDonationDto.foodType.toLowerCase();
    const isHighRisk = highRiskFoodTypes.some((type) =>
      foodTypeLower.includes(type),
    );

    // Stricter rule for high-risk food: must have at least 2 hours of shelf life at create time
    const minSafeWindowHours = isHighRisk ? 2 : 1;
    const safeLimit = new Date(
      now.getTime() + minSafeWindowHours * 60 * 60 * 1000,
    );

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
      console.error(
        'Error with distance query, returning all donations:',
        error,
      );
      // Fallback: return all donations without distance filtering
      return await this.donationsRepository.find({
        order: { createdAt: 'DESC' },
      });
    }
  }

  async claim(id: string, claimDto: ClaimDonationDto, userId: string) {
    return await this.donationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 1. Find the donation and user (NGO)
        const donation = await transactionalEntityManager.findOne(Donation, {
          where: { id },
        });
        const user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

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
        if (
          user.dailyIntakeCapacity !== null &&
          user.dailyIntakeCapacity !== undefined
        ) {
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
          if (
            user.currentIntakeLoad + donation.quantity >
            user.dailyIntakeCapacity
          ) {
            throw new BadRequestException(
              `Claim exceeds daily intake capacity. Current load: ${user.currentIntakeLoad}, Capacity: ${user.dailyIntakeCapacity}`,
            );
          }
        }

        // 4. Update status and NGO current load
        donation.status = DonationStatus.CLAIMED;
        donation.claimedById = userId;

        user.currentIntakeLoad += donation.quantity;

        // Award karma to NGO for claiming a donation
        user.karmaPoints = (user.karmaPoints || 0) + 10;
        const newBadges = this.checkAndAwardBadges(user);
        if (newBadges.length > 0) {
          user.badges = [...new Set([...(user.badges || []), ...newBadges])];
        }

        await transactionalEntityManager.save(user);
        const saved = await transactionalEntityManager.save(donation);

        // 5. Emit Event
        this.eventsGateway.emitDonationClaimed(saved.id);

        await this.invalidateCache();
        return saved;
      },
    );
  }

  async updateStatus(id: string, status: DonationStatus, userId: string) {
    return await this.donationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the donation
        const donation = await transactionalEntityManager.findOne(Donation, {
          where: { id },
          relations: ['donor'], // Load donor relation for karma
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

        // Authorization: donor, claiming NGO, or assigned volunteer
        const isAuthorized =
          donation.donorId === userId ||
          donation.claimedById === userId ||
          (requestingUser.role === UserRole.VOLUNTEER &&
            donation.claimedById !== null);

        if (!isAuthorized) {
          throw new BadRequestException(
            'You are not authorized to update this donation status',
          );
        }

        const oldStatus = donation.status;

        // Handle DELIVERED status with karma awards
        if (status === DonationStatus.DELIVERED) {
          if (oldStatus === DonationStatus.DELIVERED) {
            throw new BadRequestException(
              'Donation already marked as delivered',
            );
          }

          // Decrement NGO's intake load and award NGO karma
          if (donation.claimedById) {
            const claimedNgo = await transactionalEntityManager.findOne(User, {
              where: { id: donation.claimedById },
            });

            if (claimedNgo) {
              claimedNgo.currentIntakeLoad = Math.max(
                0,
                claimedNgo.currentIntakeLoad - donation.quantity,
              );

              const NGO_KARMA = 20;
              claimedNgo.karmaPoints =
                (claimedNgo.karmaPoints || 0) + NGO_KARMA;

              const ngoBadges = this.checkAndAwardBadges(claimedNgo);
              if (ngoBadges.length > 0) {
                claimedNgo.badges = [
                  ...new Set([...(claimedNgo.badges || []), ...ngoBadges]),
                ];
              }

              await transactionalEntityManager.save(claimedNgo);
            }
          }

          // Award karma to volunteer (if they're the one marking as delivered)
          if (requestingUser.role === UserRole.VOLUNTEER) {
            const VOLUNTEER_KARMA = 50;
            requestingUser.karmaPoints =
              (requestingUser.karmaPoints || 0) + VOLUNTEER_KARMA;

            const volunteerNewBadges = this.checkAndAwardBadges(requestingUser);
            if (volunteerNewBadges.length > 0) {
              requestingUser.badges = [
                ...new Set([
                  ...(requestingUser.badges || []),
                  ...volunteerNewBadges,
                ]),
              ];
            }

            await transactionalEntityManager.save(requestingUser);

            // Ensure volunteerId is set even if PICKED_UP was skipped
            if (!donation.volunteerId) {
              donation.volunteerId = userId;
            }
          }

          // Award karma to donor
          if (donation.donor) {
            const DONOR_KARMA = 30;
            donation.donor.karmaPoints =
              (donation.donor.karmaPoints || 0) + DONOR_KARMA;

            const donorNewBadges = this.checkAndAwardBadges(donation.donor);
            if (donorNewBadges.length > 0) {
              donation.donor.badges = [
                ...new Set([
                  ...(donation.donor.badges || []),
                  ...donorNewBadges,
                ]),
              ];
            }

            await transactionalEntityManager.save(donation.donor);
          }

          donation.status = DonationStatus.DELIVERED;
          donation.deliveredAt = new Date();
          await transactionalEntityManager.save(donation);
          await this.invalidateCache();

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
        if (
          status === DonationStatus.AVAILABLE &&
          (oldStatus === DonationStatus.CLAIMED ||
            oldStatus === DonationStatus.PICKED_UP)
        ) {
          const claimedUser = await transactionalEntityManager.findOne(User, {
            where: { id: donation.claimedById },
          });

          if (claimedUser) {
            claimedUser.currentIntakeLoad = Math.max(
              0,
              claimedUser.currentIntakeLoad - donation.quantity,
            );
            await transactionalEntityManager.save(claimedUser);
          }

          donation.claimedById = null;
        }

        // Update status
        donation.status = status;
        await transactionalEntityManager.save(donation);
        await this.invalidateCache();

        return donation;
      },
    );
  }

  async getMonthlyStats(userId: string) {
    try {
      // Get user to determine role
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      const role = user?.role || 'DONOR';

      // Build the last 6 months
      const months: { year: number; month: number; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.push({ year: d.getFullYear(), month: d.getMonth(), label: labels[d.getMonth()] });
      }

      const allDonations = await this.donationsRepository.find({
        where: role === 'NGO'
          ? { claimedById: userId }
          : role === 'VOLUNTEER'
            ? { volunteerId: userId }
            : { donorId: userId },
        order: { createdAt: 'ASC' },
      });

      const monthlyData = months.map(({ year, month, label }) => {
        const inMonth = allDonations.filter(d => {
          const dt = new Date(d.createdAt);
          return dt.getFullYear() === year && dt.getMonth() === month;
        });
        const delivered = inMonth.filter(d => d.status === DonationStatus.DELIVERED).length;
        const claimed = inMonth.filter(d =>
          d.status === DonationStatus.CLAIMED ||
          d.status === DonationStatus.PICKED_UP ||
          d.status === DonationStatus.DELIVERED
        ).length;
        return {
          label,
          total: inMonth.length,
          delivered,
          claimed,
          meals: delivered * 10,
        };
      });

      return { success: true, data: monthlyData };
    } catch {
      return { success: true, data: [] };
    }
  }

  async getCommunityStats() {
    try {
      const total = await this.donationsRepository.count();
      const delivered = await this.donationsRepository.count({
        where: { status: DonationStatus.DELIVERED },
      });
      const active = await this.donationsRepository.count({
        where: { status: DonationStatus.AVAILABLE },
      });
      const totalDonors = await this.usersRepository.count({
        where: { role: 'DONOR' as any },
      });
      const totalNGOs = await this.usersRepository.count({
        where: { role: 'NGO' as any },
      });
      const totalVolunteers = await this.usersRepository.count({
        where: { role: 'VOLUNTEER' as any },
      });

      return {
        success: true,
        data: {
          totalDonations: total,
          deliveredDonations: delivered,
          activeDonations: active,
          mealsProvided: delivered * 10,
          kgRescued: delivered * 5,
          co2Saved: Math.floor(delivered * 5 * 2.5),
          totalDonors,
          totalNGOs,
          totalVolunteers,
        },
      };
    } catch (error) {
      return {
        success: true,
        data: {
          totalDonations: 0,
          deliveredDonations: 0,
          activeDonations: 0,
          mealsProvided: 0,
          kgRescued: 0,
          co2Saved: 0,
          totalDonors: 0,
          totalNGOs: 0,
          totalVolunteers: 0,
        },
      };
    }
  }

  // Badge checking based on karma thresholds
  private checkAndAwardBadges(user: User): string[] {
    const newBadges: string[] = [];
    const currentBadges = user.badges || [];

    const badgeRules = [
      { threshold: 10, badge: 'Newcomer', emoji: '🌱' },
      { threshold: 50, badge: 'Local Hero', emoji: '🦸' },
      { threshold: 150, badge: 'Champion', emoji: '🏆' },
      { threshold: 300, badge: 'Legend', emoji: '⭐' },
      { threshold: 500, badge: 'Superhero', emoji: '💫' },
    ];

    // Check each badge rule
    for (const rule of badgeRules) {
      const badgeName = `${rule.emoji} ${rule.badge}`;

      if (
        user.karmaPoints >= rule.threshold &&
        !currentBadges.includes(badgeName)
      ) {
        newBadges.push(badgeName);
      }
    }

    return newBadges;
  }
}
