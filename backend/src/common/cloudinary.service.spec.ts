import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { ConfigService } from '@nestjs/config';

const configuredConfigService = {
  get: jest.fn((key) => {
    if (key === 'CLOUDINARY_CLOUD_NAME') return 'test_cloud';
    if (key === 'CLOUDINARY_API_KEY') return 'test_key';
    if (key === 'CLOUDINARY_API_SECRET') return 'test_secret';
    return null;
  }),
};

const missingKeysConfigService = {
  get: jest.fn((key) => {
    if (key === 'CLOUDINARY_CLOUD_NAME') return 'test_cloud';
    return null;
  }),
};

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: ConfigService, useValue: configuredConfigService },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a MOCK url if API keys are missing (Safe Mode)', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: ConfigService, useValue: missingKeysConfigService },
      ],
    }).compile();
    const safeModeService = module.get<CloudinaryService>(CloudinaryService);

    // 👇 Added 'originalname' to fix the "undefined" error
    const mockFile = {
      buffer: Buffer.from('fake image'),
      originalname: 'mocked-image.jpg',
    } as any;
    const result = await safeModeService.uploadImage(mockFile);

    // The result will look like: https://placehold.co/...?text=mocked-image.jpg
    expect(result).toContain('https://placehold.co');
    expect(result).toContain('mocked-image');
    expect(warnSpy).toHaveBeenCalledWith('⚠️ Cloudinary keys missing. Falling back to Mock mode.');
  });
});
