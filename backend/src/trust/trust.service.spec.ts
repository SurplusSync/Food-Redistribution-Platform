import { Test, TestingModule } from '@nestjs/testing';
import { TrustService } from './trust.service';

describe('TrustService', () => {
    let service: TrustService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TrustService],
        }).compile();

        service = module.get<TrustService>(TrustService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should increase trust with positive feedback', () => {
        const score = service.calculateTrustScore(50, 10, 20, 0);
        expect(score).toBe(80);
    });

    it('should decrease trust with violations', () => {
        const score = service.calculateTrustScore(50, 10, 20, 30);
        expect(score).toBe(50);
    });

    it('should not exceed maximum trust score (100)', () => {
        const score = service.calculateTrustScore(90, 20, 20, 0);
        expect(score).toBeLessThanOrEqual(100);
        expect(score).toBe(100);
    });

    it('should not go below minimum trust score (0)', () => {
        const score = service.calculateTrustScore(10, 0, 0, 50);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBe(0);
    });

    it('should increase trust correctly', () => {
        const result = service.increaseTrust(60, 10);
        expect(result).toBe(70);
    });

    it('should decrease trust correctly', () => {
        const result = service.decreaseTrust(60, 20);
        expect(result).toBe(40);
    });

    it('should handle zero values correctly', () => {
        const score = service.calculateTrustScore(0, 0, 0, 0);
        expect(score).toBe(0);
    });
});
