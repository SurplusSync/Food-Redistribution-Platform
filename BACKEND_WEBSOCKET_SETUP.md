# Backend WebSocket Setup Guide

This guide provides everything the backend team needs to implement the WebSocket server for real-time donations updates.

## Installation

### 1. Install Required Packages

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

## Implementation

### 1. Create WebSocket Gateway

Create `src/donations/donations.gateway.ts`:

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: 'donations',
})
export class DonationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('DonationsGateway');
  private connectedUsers = new Map<string, string>(); // socket.id -> userId

  /**
   * Handle client connection
   * Authenticates user via JWT token passed in auth payload
   */
  handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // TODO: Verify JWT token here
      // const decoded = this.jwtService.verify(token);
      // client.userId = decoded.sub;
      // client.user = decoded;

      this.connectedUsers.set(client.id, client.userId || 'unknown');
      this.logger.log(
        `Client ${client.id} connected. Total connections: ${this.connectedUsers.size}`,
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(
      `Client ${client.id} disconnected. Total connections: ${this.connectedUsers.size}`,
    );
  }

  /**
   * Emit when a new donation is created
   * Should be called from DonationsService.create()
   * 
   * @param donationData The new donation data
   */
  emitDonationCreated(donationData: {
    id: string;
    name: string;
    foodType: string;
    quantity: string;
    unit: string;
    description?: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    donorName: string;
    expiryTime: Date;
    imageUrls: string[];
  }) {
    this.server.emit('donation.created', {
      id: donationData.id,
      name: donationData.name,
      foodType: donationData.foodType,
      quantity: donationData.quantity,
      unit: donationData.unit,
      description: donationData.description,
      location: donationData.location,
      donorName: donationData.donorName,
      expiryTime: donationData.expiryTime,
      imageUrls: donationData.imageUrls,
      createdAt: new Date(),
    });

    this.logger.log(`🍕 New donation emitted: ${donationData.name}`);
  }

  /**
   * Emit when a donation is claimed
   * Should be called from DonationsService.claimDonation()
   * 
   * @param donationId The donation ID
   * @param claimedBy The user/NGO who claimed it
   * @param status The donation status
   */
  emitDonationClaimed(donationId: string, claimedBy: string, status: string = 'CLAIMED') {
    this.server.emit('donation.claimed', {
      donationId,
      claimedBy,
      status,
      claimedAt: new Date(),
    });

    this.logger.log(`✅ Donation claimed emitted: ${donationId} by ${claimedBy}`);
  }

  /**
   * Emit when a donation status is updated
   * Should be called from DonationsService.updateDonationStatus()
   * 
   * @param donationId The donation ID
   * @param newStatus The new status (PICKED_UP, DELIVERED, etc.)
   * @param updatedBy The user who updated it
   */
  emitDonationStatusUpdated(
    donationId: string,
    newStatus: string,
    updatedBy: string,
  ) {
    this.server.emit('donation.status.updated', {
      donationId,
      status: newStatus,
      updatedBy,
      updatedAt: new Date(),
    });

    this.logger.log(
      `🔄 Donation status updated emitted: ${donationId} -> ${newStatus}`,
    );
  }

  /**
   * Optional: Listen for client messages
   * For future bidirectional communication
   */
  @SubscribeMessage('test')
  handleTest(client: AuthenticatedSocket, data: any) {
    this.logger.log(`Test message from ${client.id}:`, data);
    client.emit('test-response', { message: 'Pong!', timestamp: new Date() });
  }
}
```

### 2. Register Gateway in Module

Update `src/donations/donations.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsGateway } from './donations.gateway';
import { Donation } from './entities/donation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), AuthModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsGateway],
  exports: [DonationsGateway], // Export gateway for use in other modules
})
export class DonationsModule {}
```

### 3. Call Gateway Methods in Service

Update `src/donations/donations.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DonationsGateway } from './donations.gateway';

@Injectable()
export class DonationsService {
  constructor(
    private donationsRepository: Repository<Donation>,
    @Inject(DonationsGateway) private donationsGateway: DonationsGateway,
  ) {}

  async create(createDonationDto: CreateDonationDto, userId: string) {
    const donation = this.donationsRepository.create({
      ...createDonationDto,
      donorId: userId,
    });

    const savedDonation = await this.donationsRepository.save(donation);

    // 🔥 Emit WebSocket event
    this.donationsGateway.emitDonationCreated({
      id: savedDonation.id,
      name: savedDonation.name,
      foodType: savedDonation.foodType,
      quantity: savedDonation.quantity,
      unit: savedDonation.unit,
      description: savedDonation.description,
      location: savedDonation.location,
      donorName: savedDonation.donorName,
      expiryTime: savedDonation.expiryTime,
      imageUrls: savedDonation.imageUrls,
    });

    return savedDonation;
  }

  async claimDonation(donationId: string, userId: string) {
    const donation = await this.donationsRepository.findOne(donationId);

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status !== 'AVAILABLE') {
      throw new BadRequestException('Donation is not available for claiming');
    }

    donation.status = 'CLAIMED';
    donation.claimedById = userId;
    donation.claimedAt = new Date();

    const updated = await this.donationsRepository.save(donation);

    // 🔥 Emit WebSocket event
    this.donationsGateway.emitDonationClaimed(
      donation.id,
      userId,
      'CLAIMED',
    );

    return updated;
  }

  async updateDonationStatus(
    donationId: string,
    newStatus: DonationStatus,
    userId: string,
  ) {
    const donation = await this.donationsRepository.findOne(donationId);

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    const oldStatus = donation.status;
    donation.status = newStatus;

    if (newStatus === 'PICKED_UP') {
      donation.pickedUpAt = new Date();
      donation.pickedUpBy = userId;
    } else if (newStatus === 'DELIVERED') {
      donation.deliveredAt = new Date();
      donation.deliveredBy = userId;
    }

    const updated = await this.donationsRepository.save(donation);

    // 🔥 Emit WebSocket event
    this.donationsGateway.emitDonationStatusUpdated(
      donationId,
      newStatus,
      userId,
    );

    this.logger.log(
      `Donation ${donationId} status changed: ${oldStatus} -> ${newStatus}`,
    );

    return updated;
  }
}
```

### 4. Update Main App Module

Ensure WebSocket is configured in `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // ... your database config
    }),
    AuthModule,
    DonationsModule,
  ],
})
export class AppModule {}
```

## Environment Variables

Add to your `.env`:

```env
# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Or in production:
FRONTEND_URL=https://yourdomain.com
```

## Testing WebSocket Connection

### 1. Using Socket.IO Client Testing Tool

Install the Socket.IO client CLI:

```bash
npm install -g socket.io-client-cli
```

Connect to your server:

```bash
socket-client http://localhost:3000/donations \
  --auth '{"token":"your-jwt-token"}'
```

### 2. Using Postman (WebSocket)

1. Create new WebSocket request
2. Enter URL: `ws://localhost:3000/donations`
3. Add auth header: `Authorization: Bearer <token>`
4. Connect and monitor messages

### 3. Manual Testing in Browser Console

```javascript
// After logging in on frontend
const socket = io('http://localhost:3000/donations', {
  auth: {
    token: localStorage.getItem('token')
  }
});

socket.on('donation.created', (data) => {
  console.log('New donation:', data);
});

socket.on('donation.claimed', (data) => {
  console.log('Donation claimed:', data);
});
```

## Debugging

### Enable Socket.IO Debug Logs

Set debug flag:

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  debug: true, // Enable debug mode
})
```

Or in environment:

```bash
DEBUG=socket.io:* npm run start:dev
```

### Common Issues

**CORS Error:**
- Check `FRONTEND_URL` matches actual frontend URL
- Ensure credentials are properly configured
- Try `origin: "*"` temporarily for testing

**Connection Refused:**
- Verify backend is running
- Check port (default 3000)
- Check firewall settings

**Token Not Recognized:**
- Verify JWT token is being sent in auth payload
- Check token expiration
- Verify token secret matches

## Performance Tips

1. **Rate Limiting:** Consider throttling donations updates for high-traffic scenarios
2. **Namespaces:** Use additional namespaces for different features
3. **Rooms:** Use socket rooms to broadcast to specific user groups
4. **Memory:** Monitor socket connections on dashboard during testing

## Production Checklist

- [ ] Test with production database
- [ ] Configure proper CORS for production domain
- [ ] Enable JWT token verification in handleConnection
- [ ] Add error handling for all emissions
- [ ] Monitor WebSocket connections in logs
- [ ] Set up automatic cleanup of dead connections
- [ ] Load test with expected user count
- [ ] Set up alarms for connection failures

## References

- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.IO Server API](https://socket.io/docs/v4/server-api/)
- [Socket.IO Rooms and Namespaces](https://socket.io/docs/v4/rooms-and-namespaces/)

---

**Last Updated:** February 20, 2026
**Backend Implementation Status:** ⏳ Ready for Implementation
