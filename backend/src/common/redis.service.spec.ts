import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('RedisService', () => {
  let service: RedisService;
  let mockDel: jest.Mock;
  let mockKeys: jest.Mock;

  beforeEach(async () => {
    mockDel = jest.fn().mockResolvedValue(undefined);
    mockKeys = jest.fn();

    const mockCacheManager = {
      del: mockDel,
      store: {
        keys: mockKeys,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteKey', () => {
    it('should delete a single cache key', async () => {
      await service.deleteKey('donations:all');

      expect(mockDel).toHaveBeenCalledWith('donations:all');
    });
  });

  describe('deleteKeysByPattern', () => {
    it('should delete all keys matching a pattern', async () => {
      mockKeys.mockResolvedValue(['donations:1', 'donations:2', 'donations:3']);

      await service.deleteKeysByPattern('donations:*');

      expect(mockKeys).toHaveBeenCalledWith('donations:*');
      expect(mockDel).toHaveBeenCalledTimes(3);
      expect(mockDel).toHaveBeenCalledWith('donations:1');
      expect(mockDel).toHaveBeenCalledWith('donations:2');
      expect(mockDel).toHaveBeenCalledWith('donations:3');
    });

    it('should do nothing when no keys match', async () => {
      mockKeys.mockResolvedValue([]);

      await service.deleteKeysByPattern('nonexistent:*');

      expect(mockDel).not.toHaveBeenCalled();
    });
  });
});
