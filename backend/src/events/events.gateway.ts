import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

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

  afterInit() {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
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
  }) {
    const payload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.logger.log(`Emitting notification: ${notification.title}`);
    this.server.emit('notification', payload);
  }

  emitNearExpiryAlert(payload: { donationId: string; expiryTime: Date }) {
    this.server.emit('donation.near_expiry', payload);
  }
}
