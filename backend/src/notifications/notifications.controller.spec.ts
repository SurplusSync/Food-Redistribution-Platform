import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockNotificationsService = {
  findByUser: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should return notifications for the authenticated user', async () => {
      const notifications = [
        { id: 'n1', title: 'Food nearby', read: false },
        { id: 'n2', title: 'Claimed', read: true },
      ];
      mockNotificationsService.findByUser.mockResolvedValue(notifications);

      const req = { user: { sub: 'user-123' } };
      const result = await controller.getMyNotifications(req);

      expect(mockNotificationsService.findByUser).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toEqual(notifications);
    });
  });

  describe('markRead', () => {
    it('should mark a single notification as read', async () => {
      mockNotificationsService.markRead.mockResolvedValue(undefined);

      const req = { user: { sub: 'user-123' } };
      const result = await controller.markRead('n1', req);

      expect(mockNotificationsService.markRead).toHaveBeenCalledWith(
        'n1',
        'user-123',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllRead.mockResolvedValue(undefined);

      const req = { user: { sub: 'user-123' } };
      const result = await controller.markAllRead(req);

      expect(mockNotificationsService.markAllRead).toHaveBeenCalledWith(
        'user-123',
      );
      expect(result).toEqual({ success: true });
    });
  });
});
