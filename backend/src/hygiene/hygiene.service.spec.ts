import { Test, TestingModule } from '@nestjs/testing';
import { HygieneService } from './hygiene.service';

describe('HygieneService', () => {
    let service: HygieneService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HygieneService],
        }).compile();

        service = module.get<HygieneService>(HygieneService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return true when all checklist items are true', () => {
        const checklist = {
            cleanUtensils: true,
            properStorage: true,
            coveredFood: true,
        };

        const result = service.validateChecklist(checklist);

        expect(result).toBe(true);
    });

    it('should return false if any checklist item is false', () => {
        const checklist = {
            cleanUtensils: true,
            properStorage: false,
            coveredFood: true,
        };

        const result = service.validateChecklist(checklist);

        expect(result).toBe(false);
    });

    it('should return false if checklist is incomplete', () => {
        const checklist = {
            cleanUtensils: true,
        };

        const result = service.validateChecklist(checklist);

        expect(result).toBe(false);
    });

    it('should return false for empty checklist', () => {
        const result = service.validateChecklist({});

        expect(result).toBe(false);
    });
});
