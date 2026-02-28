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
    const payload = { id: 'donation-1', quantity: 10 };
    const emitSpy = (gateway as any).server.emit as jest.Mock;

    gateway.emitDonationCreated(payload);

    expect(emitSpy).toHaveBeenCalledWith('donation.created', payload);
  });

  it('should emit donation.claimed event', () => {
    const donationId = 'donation-2';
    const emitSpy = (gateway as any).server.emit as jest.Mock;

    gateway.emitDonationClaimed(donationId);

    expect(emitSpy).toHaveBeenCalledWith('donation.claimed', donationId);
  });
});
