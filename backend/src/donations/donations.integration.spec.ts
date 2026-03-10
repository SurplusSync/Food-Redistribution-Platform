import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { Donation, DonationStatus } from './entities/donation.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../common/cloudinary.service';
import { EventsGateway } from '../events/events.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisService } from '../common/redis.service';

describe('Donations Integration (e2e)', () => {
    let app: INestApplication;

    const mockDonationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        manager: {
            transaction: jest.fn(),
        },
    };

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    const mockCloudinaryService = {
        uploadImages: jest.fn().mockResolvedValue(['http://image.url']),
    };

    const mockEventsGateway = {
        emitDonationCreated: jest.fn(),
        emitNotification: jest.fn(),
    };

    const mockCacheManager = {
        clear: jest.fn(),
        reset: jest.fn(),
    };

    const mockRedisService = {
        deleteKeysByPattern: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [DonationsController],
            providers: [
                DonationsService,
                { provide: getRepositoryToken(Donation), useValue: mockDonationRepository },
                { provide: getRepositoryToken(User), useValue: mockUserRepository },
                { provide: CloudinaryService, useValue: mockCloudinaryService },
                { provide: EventsGateway, useValue: mockEventsGateway },
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
                { provide: RedisService, useValue: mockRedisService },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: any) => {
                    const req = context.switchToHttp().getRequest();
                    // Mock authenticated user object gracefully bypassing standard Auth logic
                    req.user = { userId: 'donor-123', email: 'donor@test.com', role: UserRole.DONOR };
                    return true;
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validDonationPayload = {
        name: 'Vegetable Biryani',
        donorId: 'donor-123',
        donorName: 'Test Donor',
        foodType: 'cooked',
        quantity: 50,
        unit: 'kg',
        preparationTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        expiryTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        latitude: 17.6868,
        longitude: 83.2185,
    };

    describe('1. Successful Donation Creation', () => {
        it('Donation should be stored in database and return 201', async () => {
            // Mock db insertion sequence
            mockDonationRepository.create.mockReturnValue({ ...validDonationPayload, status: DonationStatus.AVAILABLE });
            mockDonationRepository.save.mockResolvedValue({ id: 'don-1', ...validDonationPayload, status: DonationStatus.AVAILABLE });
            mockUserRepository.findOne.mockResolvedValue({ id: 'donor-123', karmaPoints: 10, badges: [] });

            const response = await request(app.getHttpServer())
                .post('/donations')
                .send(validDonationPayload)
                .expect(201);

            expect(response.body).toHaveProperty('id', 'don-1');
            expect(mockDonationRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vegetable Biryani' }));
            expect(mockDonationRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('2. Transaction Rollback', () => {
        it('If database save fails, donation should not persist and rollback behavior verified', async () => {
            // Simulate Database failure during the primary insertion
            mockDonationRepository.create.mockReturnValue({ ...validDonationPayload, status: DonationStatus.AVAILABLE });
            const dbError = new Error('Database connection failed or constraint violated');
            mockDonationRepository.save.mockRejectedValueOnce(dbError);

            const response = await request(app.getHttpServer())
                .post('/donations')
                .send(validDonationPayload);

            expect(response.status).toBe(500); // Triggered by internal server error bounds

            // Verify rollback behavior:
            // If the donation save fails, subsequent dependent operations (like saving the user points) MUST NOT be executed
            expect(mockUserRepository.findOne).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
            expect(mockEventsGateway.emitDonationCreated).not.toHaveBeenCalled();

            // Ensure it was strictly a DB persistence fail stopping propagation naturally
            expect(mockDonationRepository.save).toHaveBeenCalledTimes(1);
        });
    });

    describe('3. Concurrent Requests', () => {
        it('Simulate multiple donation creation requests and verify database integrity', async () => {
            // Simulate environment surviving concurrent access mapping to multiple simultaneous payload queries
            mockDonationRepository.create.mockImplementation((dto) => ({ ...dto, status: DonationStatus.AVAILABLE }));

            let counter = 0;
            mockDonationRepository.save.mockImplementation(async (entity) => {
                counter++;
                return { id: `don-${counter}`, ...entity };
            });
            mockUserRepository.findOne.mockResolvedValue({ id: 'donor-123', karmaPoints: 10, badges: [] });

            // Fire 5 requests simultaneously without awaiting sequentially simulating intense network load
            const concurrentRequests = Array.from({ length: 5 }).map(() =>
                request(app.getHttpServer())
                    .post('/donations')
                    .send(validDonationPayload)
            );

            const responses = await Promise.all(concurrentRequests);

            // Verify the parallel structure succeeded
            responses.forEach((response) => {
                expect(response.status).toBe(201);
            });

            // Assert database integrity: Ensure exactly 5 saves were sent to the DB independently without overwriting logic bounds
            expect(mockDonationRepository.create).toHaveBeenCalledTimes(5);
            expect(mockDonationRepository.save).toHaveBeenCalledTimes(5);

            // Secondary integration bounds: Ensure no caching lock crashed the parallel instances
            expect(mockUserRepository.save).toHaveBeenCalledTimes(5);
        });
    });
});
