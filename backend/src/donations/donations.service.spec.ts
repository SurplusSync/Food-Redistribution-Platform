import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation, DonationStatus } from './entities/donation.entity';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DonationsService', () => {
    let service: DonationsService;
    let repository: any;

    const mockDonationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            addSelect: jest.fn().mockReturnThis(),
            having: jest.fn().mockReturnThis(),
            setParameters: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
        })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DonationsService,
                {
                    provide: getRepositoryToken(Donation),
                    useValue: mockDonationRepository,
                },
            ],
        }).compile();

        service = module.get<DonationsService>(DonationsService);
        repository = module.get(getRepositoryToken(Donation));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create and save a new donation', async () => {
            const createDto: CreateDonationDto = {
                name: 'Rice',
                donorId: 'donor-1',
                donorName: 'John Doe',
                foodType: 'cooked',
                quantity: 10,
                unit: 'kg',
                preparationTime: new Date().toISOString(),
                latitude: 10,
                longitude: 20,
                description: 'Test donation',
            };
            const userId = 'donor-123';
            const savedDonation = { id: 'donation-1', ...createDto, status: DonationStatus.AVAILABLE };

            mockDonationRepository.create.mockReturnValue(savedDonation);
            mockDonationRepository.save.mockResolvedValue(savedDonation);

            const result = await service.create(createDto, userId);

            expect(repository.create).toHaveBeenCalledWith({
                ...createDto,
                donorId: userId,
                status: DonationStatus.AVAILABLE,
            });
            expect(repository.save).toHaveBeenCalledWith(savedDonation);
            expect(result).toEqual(savedDonation);
        });
    });

    describe('claim', () => {
        it('should successfully claim an available donation', async () => {
            const donationId = 'donation-1';
            const userId = 'ngo-123';
            const claimDto: ClaimDonationDto = {};
            const existingDonation = { id: donationId, status: DonationStatus.AVAILABLE };
            const updatedDonation = { ...existingDonation, status: DonationStatus.CLAIMED, claimedById: userId };

            mockDonationRepository.findOne.mockResolvedValue(existingDonation);
            mockDonationRepository.save.mockResolvedValue(updatedDonation);

            const result = await service.claim(donationId, claimDto, userId);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: donationId } });
            expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
                status: DonationStatus.CLAIMED,
                claimedById: userId,
            }));
            expect(result).toEqual(updatedDonation);
        });

        it('should throw NotFoundException if donation does not exist', async () => {
            mockDonationRepository.findOne.mockResolvedValue(null);
            await expect(service.claim('invalid-id', {}, 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if donation is already claimed', async () => {
            const donation = { id: 'donation-1', status: DonationStatus.CLAIMED };
            mockDonationRepository.findOne.mockResolvedValue(donation);
            await expect(service.claim('donation-1', {}, 'user-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return all donations if no location provided', async () => {
            const donations = [{ id: '1' }, { id: '2' }];
            mockDonationRepository.find.mockResolvedValue(donations);

            const result = await service.findAll();
            expect(result).toEqual(donations);
            expect(repository.find).toHaveBeenCalled();
        });

        it('should use query builder if location is provided', async () => {
            const donations = [{ id: '1' }];
            mockDonationRepository.createQueryBuilder.mockReturnValue({
                addSelect: jest.fn().mockReturnThis(),
                having: jest.fn().mockReturnThis(),
                setParameters: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(donations),
            });

            const result = await service.findAll(10, 20, 5);
            expect(repository.createQueryBuilder).toHaveBeenCalled();
            expect(result).toEqual(donations);
        });
    });
});
