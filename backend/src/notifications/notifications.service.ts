import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from './entities/user-notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly notifRepo: Repository<UserNotification>,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }): Promise<UserNotification> {
    const notif = this.notifRepo.create(data);
    return this.notifRepo.save(notif);
  }

  /** Persist a notification for every user (broadcast). */
  async createForAllUsers(
    userIds: string[],
    data: { title: string; message: string; type: string },
  ) {
    const entities = userIds.map((userId) =>
      this.notifRepo.create({ userId, ...data }),
    );
    return this.notifRepo.save(entities);
  }

  async findByUser(userId: string): Promise<UserNotification[]> {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async markRead(id: string, userId: string) {
    await this.notifRepo.update({ id, userId }, { read: true });
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ userId, read: false }, { read: true });
  }
}
