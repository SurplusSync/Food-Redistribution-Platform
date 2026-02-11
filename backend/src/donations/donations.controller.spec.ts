import { Test, TestingModule } from '@nestjs/testing';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';

describe('DonationsController', () => {
    let controller: DonationsController;
    let donationsService: DonationsService;
    let cloudinaryService: CloudinaryService;

    const mockDonationsService = {
        create: jest.fn(),
        claim: jest.fn(),
        findAll: jest.fn(),
    };

    const mockCloudinaryService = {
        uploadImages: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DonationsController],
            providers: [
                { provide: DonationsService, useValue: mockDonationsService },
                { provide: CloudinaryService, useValue: mockCloudinaryService },
            ],
        }).compile();

        controller = module.get<DonationsController>(DonationsController);
        donationsService = module.get<DonationsService>(DonationsService);
        cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    });

    it('should create donation with uploaded image', async () => {
        const mockFiles = [{ buffer: Buffer.from('test') } as Express.Multer.File];
        const mockReq = { user: { userId: '1' } };

        const mockBody: CreateDonationDto = {
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

        const imageUrls = ['http://cloudinary.com/image.jpg'];

        mockCloudinaryService.uploadImages.mockResolvedValue(imageUrls);
        mockDonationsService.create.mockResolvedValue({ id: 1, ...mockBody, imageUrls });

        await controller.create(mockBody, mockFiles, mockReq);

        expect(cloudinaryService.uploadImages).toHaveBeenCalledWith(mockFiles);
        expect(donationsService.create).toHaveBeenCalledWith(
            expect.objectContaining({ ...mockBody, imageUrls }),
            '1'
        );
    });

    it('should allow NGO to claim donation', async () => {
        const donationId = '5';
        const mockRequest = {
            user: { userId: 101 }, // Extracted from JWT
        };
        const claimDto: ClaimDonationDto = {};

        mockDonationsService.claim.mockResolvedValue({ success: true });

        await controller.claim(donationId, claimDto, mockRequest as any);

        expect(donationsService.claim).toHaveBeenCalledWith(donationId, claimDto, 101);
    });
});
