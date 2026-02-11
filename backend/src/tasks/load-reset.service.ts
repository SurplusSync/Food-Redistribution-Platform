import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@Injectable()
export class LoadResetService {
    private readonly logger = new Logger(LoadResetService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyReset() {
        this.logger.log('Starting daily NGO intake load reset...');

        try {
            await this.userRepository
                .createQueryBuilder()
                .update(User)
                .set({ currentIntakeLoad: 0 })
                .where('role = :role', { role: UserRole.NGO })
                .execute();

            this.logger.log('Successfully reset currentIntakeLoad for all NGOs.');
        } catch (error) {
            this.logger.error('Failed to reset NGO intake load:', error);
        }
    }
}
