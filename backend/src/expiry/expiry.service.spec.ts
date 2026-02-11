import { Test, TestingModule } from '@nestjs/testing';
import { ExpiryService } from './expiry.service';

describe('ExpiryService', () => {
    let service: ExpiryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExpiryService],
        }).compile();

        service = module.get<ExpiryService>(ExpiryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should calculate expiry correctly', () => {
        const prepTime = new Date('2025-01-01T10:00:00');
        const safetyHours = 4;

        const expiry = service.calculateExpiry(prepTime, safetyHours);

        expect(expiry.getHours()).toBe(14);
    });

    it('should return true if food is expired', () => {
        const expiryTime = new Date('2025-01-01T10:00:00');
        const currentTime = new Date('2025-01-01T11:00:00');

        const result = service.isExpired(currentTime, expiryTime);

        expect(result).toBe(true);
    });

    it('should return false if food is not expired', () => {
        const expiryTime = new Date('2025-01-01T12:00:00');
        const currentTime = new Date('2025-01-01T11:00:00');

        const result = service.isExpired(currentTime, expiryTime);

        expect(result).toBe(false);
    });

    it('should detect near expiry correctly', () => {
        const expiryTime = new Date('2025-01-01T10:30:00');
        const currentTime = new Date('2025-01-01T10:00:00');
        const threshold = 40; // minutes

        const result = service.isNearExpiry(currentTime, expiryTime, threshold);

        expect(result).toBe(true);
    });

    it('should not trigger near expiry if outside threshold', () => {
        const expiryTime = new Date('2025-01-01T12:00:00');
        const currentTime = new Date('2025-01-01T10:00:00');
        const threshold = 30;

        const result = service.isNearExpiry(currentTime, expiryTime, threshold);

        expect(result).toBe(false);
    });

    it('should handle zero safety hours', () => {
        const prepTime = new Date('2025-01-01T10:00:00');
        const expiry = service.calculateExpiry(prepTime, 0);

        expect(expiry.getHours()).toBe(10);
    });
});
