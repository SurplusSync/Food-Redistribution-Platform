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
}
