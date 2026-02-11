import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { Donation, DonationStatus } from './entities/donation.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('DonationsService', () => {
    let service: DonationsService;
    let donationRepository;
    let userRepository;

    const mockDonationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        manager: {
            transaction: jest.fn(),
        },
    };

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DonationsService,
                {
                    provide: getRepositoryToken(Donation),
                    useValue: mockDonationRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<DonationsService>(DonationsService);
        donationRepository = module.get(getRepositoryToken(Donation));
        userRepository = module.get(getRepositoryToken(User));
    });

    describe('validateFoodSafety', () => {
        it('should throw BadRequestException if expiry time is in the past', () => {
            const now = new Date();
            const pastDate = new Date(now.getTime() - 1000).toISOString();
            const dto: any = {
                expiryTime: pastDate,
                preparationTime: now.toISOString(),
                foodType: 'cooked',
            };

            expect(() => service['validateFoodSafety'](dto)).toThrow(BadRequestException);
            expect(() => service['validateFoodSafety'](dto)).toThrow('Donation expiry time cannot be in the past');
        });

        it('should throw BadRequestException if preparation time is in the future', () => {
            const now = new Date();
            const futureDate = new Date(now.getTime() + 10000).toISOString();
            const dto: any = {
                expiryTime: new Date(now.getTime() + 100000).toISOString(),
                preparationTime: futureDate,
                foodType: 'cooked',
            };

            expect(() => service['validateFoodSafety'](dto)).toThrow(BadRequestException);
            expect(() => service['validateFoodSafety'](dto)).toThrow('Preparation time cannot be in the future');
        });

        it('should throw BadRequestException for high-risk food with < 2 hours shelf life', () => {
            const now = new Date();
            const soonExpiry = new Date(now.getTime() + 1.5 * 60 * 60 * 1000).toISOString();
            const dto: any = {
                expiryTime: soonExpiry,
                preparationTime: now.toISOString(),
                foodType: 'cooked', // high risk
            };

            expect(() => service['validateFoodSafety'](dto)).toThrow(BadRequestException);
            expect(() => service['validateFoodSafety'](dto)).toThrow('High-risk food (cooked) must have at least 2 hours of safe consumption window remaining.');
        });

        it('should allow high-risk food with >= 2 hours shelf life', () => {
            const now = new Date();
            const safeExpiry = new Date(now.getTime() + 2.5 * 60 * 60 * 1000).toISOString();
            const dto: any = {
                expiryTime: safeExpiry,
                preparationTime: now.toISOString(),
                foodType: 'cooked',
            };

            expect(() => service['validateFoodSafety'](dto)).not.toThrow();
        });

        it('should allow low-risk food with >= 1 hour shelf life', () => {
            const now = new Date();
            const safeExpiry = new Date(now.getTime() + 1.5 * 60 * 60 * 1000).toISOString();
            const dto: any = {
                expiryTime: safeExpiry,
                preparationTime: now.toISOString(),
                foodType: 'bread',
            };

            expect(() => service['validateFoodSafety'](dto)).not.toThrow();
        });
    });

    describe('update', () => {
        it('should throw ForbiddenException if user is not the donor', async () => {
            const donation = { id: '1', donorId: 'user1', status: DonationStatus.AVAILABLE };
            donationRepository.findOne.mockResolvedValue(donation);

            await expect(service.update('1', {}, 'user2')).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if donation is not AVAILABLE', async () => {
            const donation = { id: '1', donorId: 'user1', status: DonationStatus.CLAIMED };
            donationRepository.findOne.mockResolvedValue(donation);

            await expect(service.update('1', {}, 'user1')).rejects.toThrow(BadRequestException);
        });

        it('should re-validate food safety when expiryTime is updated', async () => {
            const now = new Date();
            const donation = {
                id: '1',
                donorId: 'user1',
                status: DonationStatus.AVAILABLE,
                foodType: 'cooked',
                preparationTime: now.toISOString()
            };
            donationRepository.findOne.mockResolvedValue(donation);

            const pastExpiry = new Date(now.getTime() - 10000).toISOString();
            const updateDto = { expiryTime: pastExpiry };

            await expect(service.update('1', updateDto, 'user1')).rejects.toThrow(BadRequestException);
        });
    });
});
