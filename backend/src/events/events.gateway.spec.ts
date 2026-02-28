import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';

describe('EventsGateway Unit Tests', () => {
  let gateway: EventsGateway;
  let logSpy: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    logSpy = jest.fn();
    (gateway as any).logger = { log: logSpy };
    (gateway as any).server = { emit: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should log when gateway initializes', () => {
    gateway.afterInit();

    expect(logSpy).toHaveBeenCalledWith('Init');
  });

  it('should log client connection', () => {
    const client = { id: 'socket-1' } as any;

    gateway.handleConnection(client);

    expect(logSpy).toHaveBeenCalledWith('Client connected: socket-1');
  });

  it('should log client disconnection', () => {
    const client = { id: 'socket-2' } as any;

    gateway.handleDisconnect(client);

    expect(logSpy).toHaveBeenCalledWith('Client disconnected: socket-2');
  });

  it('should emit donation.created event', () => {
    const payload = {
      id: 'donation-1',
      quantity: 10,
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'MG Road',
    };
    const emitSpy = (gateway as any).server.emit as jest.Mock;

    gateway.emitDonationCreated(payload);

    expect(emitSpy).toHaveBeenCalledWith(
      'donation.created',
      expect.objectContaining({
        id: 'donation-1',
        location: {
          lat: 12.9716,
          lng: 77.5946,
          address: 'MG Road',
        },
      }),
    );
  });

  it('should emit donation.claimed event', () => {
    const donation = {
      id: 'donation-2',
      claimedById: 'ngo-1',
      status: 'CLAIMED',
    };
    const emitSpy = (gateway as any).server.emit as jest.Mock;

    gateway.emitDonationClaimed(donation);

    expect(emitSpy).toHaveBeenCalledWith('donation.claimed', {
      donationId: 'donation-2',
      claimedBy: 'ngo-1',
      status: 'CLAIMED',
    });
  });
});
