import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpiryService {
    calculateExpiry(preparationTime: Date, safetyHours: number): Date {
        const expiry = new Date(preparationTime);
        expiry.setHours(expiry.getHours() + safetyHours);
        return expiry;
    }

    isExpired(currentTime: Date, expiryTime: Date): boolean {
        return currentTime > expiryTime;
    }

    isNearExpiry(currentTime: Date, expiryTime: Date, thresholdMinutes: number): boolean {
        const timeDiff = expiryTime.getTime() - currentTime.getTime();
        const thresholdMs = thresholdMinutes * 60 * 1000;
        return timeDiff > 0 && timeDiff <= thresholdMs;
    }
}
