import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
import { Cron } from '@nestjs/schedule';
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

  private async invalidateCache(): Promise<void> {
    try {
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

    const donor = await this.usersRepository.findOne({ where: { id: userId } });
    if (donor) {
      donor.karmaPoints = (donor.karmaPoints || 0) + 10;
      const newBadges = this.checkAndAwardBadges(donor);
      if (newBadges.length > 0) {
        donor.badges = [...new Set([...(donor.badges || []), ...newBadges])];
        for (const badge of newBadges) {
          this.eventsGateway.emitNotification({
            title: 'New Badge Earned!',
            message: `Congratulations! You earned the ${badge} badge.`,
            type: 'new_food_nearby',
          });
        }
      }
      await this.usersRepository.save(donor);
    }

    this.eventsGateway.emitDonationCreated(saved);

    this.eventsGateway.emitNotification({
      title: 'New Donation Available',
      message: `${saved.name || 'A new food donation'} is now available for pickup.`,
      type: 'new_food_nearby',
    });

    if (this.redisService) {
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

    // 4. Apply stricter rules only for high-risk foods
    if (isHighRisk) {
      const minSafeWindowHours = 2;
      const safeLimit = new Date(
        now.getTime() + minSafeWindowHours * 60 * 60 * 1000,
      );

      if (expiryDate < safeLimit) {
        throw new BadRequestException(
          `High-risk food (${createDonationDto.foodType}) must have at least ${minSafeWindowHours} hours of safe consumption window remaining.`,
        );
      }
    }
    // Non-high-risk foods (e.g. bakery, produce, canned): only reject if already expired (handled above)
  }

  @Cron('*/5 * * * *')
  async handleExpiredDonations(): Promise<void> {
    const now = new Date();
    this.logger.log('Running expiry cron job...');

    try {
      const expiredDonations = await this.donationsRepository.find({
        where: {
          status: In([DonationStatus.AVAILABLE, DonationStatus.CLAIMED]),
          expiryTime: LessThanOrEqual(now),
        },
      });

      if (expiredDonations.length === 0) {
        this.logger.log('No expired donations found.');
        return;
      }

      for (const donation of expiredDonations) {
        donation.status = DonationStatus.EXPIRED;
      }

      await this.donationsRepository.save(expiredDonations);
      await this.invalidateCache();

      this.logger.log(
        `Expired ${expiredDonations.length} donation(s) that passed their safe consumption time.`,
      );
    } catch (error) {
      this.logger.error('Expiry cron job failed', error);
    }
  }

  async findAll(latitude?: number, longitude?: number, radius: number = 5) {
    // First, mark any expired donations that the cron hasn't caught yet
    const now = new Date();
    try {
      const missed = await this.donationsRepository.find({
        where: {
          status: In([DonationStatus.AVAILABLE, DonationStatus.CLAIMED]),
          expiryTime: LessThanOrEqual(now),
        },
      });
      if (missed.length > 0) {
        for (const d of missed) {
          d.status = DonationStatus.EXPIRED;
        }
        await this.donationsRepository.save(missed);
        this.logger.log(`Marked ${missed.length} expired donation(s) on-the-fly.`);
      }
    } catch (error) {
      this.logger.warn('Failed to mark expired donations on-the-fly', error);
    }

    const activeStatuses = In([
      DonationStatus.AVAILABLE,
      DonationStatus.CLAIMED,
      DonationStatus.PICKED_UP,
      DonationStatus.DELIVERED,
    ]);

    if (!latitude || !longitude) {
      try {
        return await this.donationsRepository.find({
          where: { status: activeStatuses },
          order: { createdAt: 'DESC' },
        });
      } catch (error) {
        console.error('Error fetching donations:', error);
        return [];
      }
    }

    try {
      return await this.donationsRepository
        .createQueryBuilder('donation')
        .where('donation.status IN (:...statuses)', {
          statuses: [
            DonationStatus.AVAILABLE,
            DonationStatus.CLAIMED,
            DonationStatus.PICKED_UP,
            DonationStatus.DELIVERED,
          ],
        })
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
      return await this.donationsRepository.find({
        where: { status: activeStatuses },
        order: { createdAt: 'DESC' },
      });
    }
  }

  async claim(id: string, claimDto: ClaimDonationDto, userId: string) {
    return await this.donationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const donation = await transactionalEntityManager.findOne(Donation, {
          where: { id },
        });
        const user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

        if (!donation) {
          throw new NotFoundException('Donation not found');
        }
        if (donation.status !== DonationStatus.AVAILABLE) {
          throw new BadRequestException('Donation already claimed');
        }
        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (
          donation.expiryTime &&
          new Date(donation.expiryTime) <= new Date()
        ) {
          donation.status = DonationStatus.EXPIRED;
          await transactionalEntityManager.save(donation);
          throw new BadRequestException(
            'This donation has expired and can no longer be claimed.',
          );
        }

        if (user.role !== UserRole.NGO) {
          throw new BadRequestException('Only NGOs can claim donations');
        }

        if (
          user.dailyIntakeCapacity !== null &&
          user.dailyIntakeCapacity !== undefined
        ) {
          if (user.capacityUnit && donation.unit) {
            const ngoUnit = user.capacityUnit.trim().toLowerCase();
            const donationUnit = donation.unit.trim().toLowerCase();

            if (ngoUnit !== donationUnit) {
              throw new BadRequestException(
                `Unit mismatch: NGO capacity is in ${user.capacityUnit}, but donation is in ${donation.unit}.`,
              );
            }
          }

          if (
            user.currentIntakeLoad + donation.quantity >
            user.dailyIntakeCapacity
          ) {
            throw new BadRequestException(
              `Claim exceeds daily intake capacity. Current load: ${user.currentIntakeLoad}, Capacity: ${user.dailyIntakeCapacity}`,
            );
          }
        }

        donation.status = DonationStatus.CLAIMED;
        donation.claimedById = userId;

        user.currentIntakeLoad += donation.quantity;

        user.karmaPoints = (user.karmaPoints || 0) + 10;
        const newBadges = this.checkAndAwardBadges(user);
        if (newBadges.length > 0) {
          user.badges = [...new Set([...(user.badges || []), ...newBadges])];
          for (const badge of newBadges) {
            this.eventsGateway.emitNotification({
              title: 'New Badge Earned!',
              message: `Congratulations! You earned the ${badge} badge.`,
              type: 'new_food_nearby',
            });
          }
        }

        await transactionalEntityManager.save(user);
        const saved = await transactionalEntityManager.save(donation);

        // Auto-assign nearest available volunteer
        try {
          const availableVolunteers = await this.usersRepository.find({
            where: { role: UserRole.VOLUNTEER, isAvailable: true } as any,
          });

          if (availableVolunteers.length > 0) {
            let assigned = availableVolunteers[0];
            if (saved.latitude && saved.longitude) {
              const withDistance = availableVolunteers.map((v: any) => {
                const dLat =
                  ((v.latitude || 0) - saved.latitude) * (Math.PI / 180);
                const dLon =
                  ((v.longitude || 0) - saved.longitude) * (Math.PI / 180);
                const a =
                  Math.sin(dLat / 2) ** 2 +
                  Math.cos((saved.latitude * Math.PI) / 180) *
                    Math.cos(((v.latitude || 0) * Math.PI) / 180) *
                    Math.sin(dLon / 2) ** 2;
                return {
                  volunteer: v,
                  dist: 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
                };
              });
              withDistance.sort((a, b) => a.dist - b.dist);
              assigned = withDistance[0].volunteer;
            }
            const ngo = await this.usersRepository.findOne({
              where: { id: userId },
            });
            this.eventsGateway.emitVolunteerAssigned({
              volunteerId: assigned.id,
              donationId: saved.id,
              donationName: saved.name,
              donorAddress: saved.address || 'See donation details',
              ngoName: ngo?.organizationName || ngo?.name || 'NGO',
            });
            this.eventsGateway.emitNotification({
              title: '🚗 Pickup Assignment',
              message: `You've been assigned to pick up "${saved.name}". Check your dashboard!`,
              type: 'pickup_assigned',
            });
          }
        } catch (e) {
          this.logger.warn('Auto-assign volunteer failed (non-critical):', e);
        }

        this.eventsGateway.emitDonationClaimed(saved);

        this.eventsGateway.emitNotification({
          title: 'Donation Claimed',
          message: `Your donation has been claimed by an NGO.`,
          type: 'food_claimed',
        });

        await this.invalidateCache();
        return saved;
      },
    );
  }

  async updateStatus(id: string, status: DonationStatus, userId: string) {
    return await this.donationsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const donation = await transactionalEntityManager.findOne(Donation, {
          where: { id },
          relations: ['donor'],
        });

        if (!donation) {
          throw new NotFoundException('Donation not found');
        }

        const requestingUser = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
        });

        if (!requestingUser) {
          throw new NotFoundException('User not found');
        }

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

        if (status === DonationStatus.DELIVERED) {
          if (oldStatus === DonationStatus.DELIVERED) {
            throw new BadRequestException(
              'Donation already marked as delivered',
            );
          }

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

            if (!donation.volunteerId) {
              donation.volunteerId = userId;
            }
          }

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

          this.eventsGateway.emitNotification({
            title: 'Delivery Confirmed',
            message: `A donation has been successfully delivered!`,
            type: 'delivery_confirmed',
          });

          return {
            ...donation,
            karmaAwarded: requestingUser.role === UserRole.VOLUNTEER ? 50 : 0,
            donorKarmaAwarded: 30,
          };
        }

        if (status === DonationStatus.PICKED_UP) {
          donation.pickedUpAt = new Date();
          donation.volunteerId = userId;
        }

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

        donation.status = status;
        await transactionalEntityManager.save(donation);
        await this.invalidateCache();

        return donation;
      },
    );
  }

  async getMonthlyStats(userId: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      const role = user?.role || 'DONOR';

      const months: { year: number; month: number; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const labels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        months.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          label: labels[d.getMonth()],
        });
      }

      const allDonations = await this.donationsRepository.find({
        where:
          role === 'NGO'
            ? { claimedById: userId }
            : role === 'VOLUNTEER'
              ? { volunteerId: userId }
              : { donorId: userId },
        order: { createdAt: 'ASC' },
      });

      const monthlyData = months.map(({ year, month, label }) => {
        const inMonth = allDonations.filter((d) => {
          const dt = new Date(d.createdAt);
          return dt.getFullYear() === year && dt.getMonth() === month;
        });
        const delivered = inMonth.filter(
          (d) => d.status === DonationStatus.DELIVERED,
        ).length;
        const claimed = inMonth.filter(
          (d) =>
            d.status === DonationStatus.CLAIMED ||
            d.status === DonationStatus.PICKED_UP ||
            d.status === DonationStatus.DELIVERED,
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
    } catch {
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
