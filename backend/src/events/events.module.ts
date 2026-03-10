import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsGateway } from './events.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => NotificationsModule),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
