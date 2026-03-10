import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  afterInit() {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // ─── Volunteer Location Tracking ─────────────────────────────────────────

  @SubscribeMessage('volunteer.shareLocation')
  handleShareLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      volunteerId: string;
      donationId: string;
      lat: number;
      lng: number;
    },
  ) {
    // Broadcast to everyone watching this delivery
    this.server.emit(`volunteer.location.${data.donationId}`, {
      volunteerId: data.volunteerId,
      donationId: data.donationId,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  }

  emitDonationCreated(donationData: any) {
    const payload = {
      ...donationData,
      location: donationData?.location || {
        lat: Number(donationData?.latitude) || 0,
        lng: Number(donationData?.longitude) || 0,
        address: donationData?.address || 'Unknown Location',
      },
    };

    this.server.emit('donation.created', payload);
  }

  emitDonationClaimed(donation: any) {
    const payload =
      typeof donation === 'string'
        ? { donationId: donation, status: 'CLAIMED' }
        : {
            donationId: donation?.id || donation?.donationId,
            claimedBy: donation?.claimedById || donation?.claimedBy,
            status: donation?.status || 'CLAIMED',
          };

    this.server.emit('donation.claimed', payload);
  }

  emitVolunteerAssigned(payload: {
    volunteerId: string;
    donationId: string;
    donationName: string;
    donorAddress: string;
    ngoName: string;
  }) {
    this.server.emit('volunteer.assigned', {
      ...payload,
      id: `va-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    // Also ping the specific volunteer
    this.server.emit(`volunteer.assigned.${payload.volunteerId}`, payload);
  }

  emitNotification(notification: {
    title: string;
    message: string;
    type: string;
    targetUserIds?: string[];
  }) {
    const payload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.logger.log(`Emitting notification: ${notification.title}`);
    this.server.emit('notification', payload);

    // Persist to database
    this.persistNotification(notification).catch((err) =>
      this.logger.warn('Failed to persist notification', err?.message),
    );
  }

  private async persistNotification(notification: {
    title: string;
    message: string;
    type: string;
    targetUserIds?: string[];
  }) {
    const data = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
    };

    if (notification.targetUserIds?.length) {
      await this.notificationsService.createForAllUsers(
        notification.targetUserIds,
        data,
      );
    } else {
      // Broadcast: persist for all non-admin users
      const users = await this.usersRepository.find({
        where: { role: Not(Equal(UserRole.ADMIN)) },
        select: ['id'],
      });
      const userIds = users.map((u) => u.id);
      if (userIds.length > 0) {
        await this.notificationsService.createForAllUsers(userIds, data);
      }
    }
  }

  emitNearExpiryAlert(payload: { donationId: string; expiryTime: Date }) {
    this.server.emit('donation.near_expiry', payload);
  }
}
