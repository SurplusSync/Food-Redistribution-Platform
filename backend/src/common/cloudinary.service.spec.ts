import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'CLOUDINARY_CLOUD_NAME') return 'test_cloud';
    return null;
  }),
};

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a MOCK url if API keys are missing (Safe Mode)', async () => {
    // 👇 Added 'originalname' to fix the "undefined" error
    const mockFile = {
      buffer: Buffer.from('fake image'),
      originalname: 'mocked-image.jpg',
    } as any;

    const result = await service.uploadImage(mockFile);

    // The result will look like: https://placehold.co/...?text=mocked-image.jpg
    expect(result).toContain('https://placehold.co');
    expect(result).toContain('mocked-image');
  });
});
