import { Injectable } from '@nestjs/common';

@Injectable()
export class TrustService {
    calculateTrustScore(base: number, hygiene: number, feedback: number, violations: number): number {
        let score = base + hygiene + feedback - violations;
        if (score > 100) score = 100;
        if (score < 0) score = 0;
        return score;
    }

    increaseTrust(currentScore: number, amount: number): number {
        let score = currentScore + amount;
        if (score > 100) score = 100;
        return score;
    }

    decreaseTrust(currentScore: number, amount: number): number {
        let score = currentScore - amount;
        if (score < 0) score = 0;
        return score;
    }
}
