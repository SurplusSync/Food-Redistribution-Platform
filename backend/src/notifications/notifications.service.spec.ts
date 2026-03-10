import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserNotification } from './entities/user-notification.entity';

const mockNotifRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(UserNotification), useValue: mockNotifRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── create ────────────────────────────────────
  describe('create', () => {
    it('should create and save a notification', async () => {
      const data = { userId: 'u1', title: 'New Food', message: 'A donation nearby', type: 'new_food_nearby' };
      const entity = { id: 'n1', ...data, read: false, createdAt: new Date() };
      mockNotifRepo.create.mockReturnValue(entity);
      mockNotifRepo.save.mockResolvedValue(entity);

      const result = await service.create(data);

      expect(mockNotifRepo.create).toHaveBeenCalledWith(data);
      expect(mockNotifRepo.save).toHaveBeenCalledWith(entity);
      expect(result.id).toBe('n1');
      expect(result.userId).toBe('u1');
    });
  });

  // ── createForAllUsers ─────────────────────────
  describe('createForAllUsers', () => {
    it('should create notifications for multiple users', async () => {
      const userIds = ['u1', 'u2', 'u3'];
      const data = { title: 'Alert', message: 'Broadcast', type: 'near_expiry' };
      const entities = userIds.map((userId) => ({ id: `n-${userId}`, userId, ...data }));

      mockNotifRepo.create.mockImplementation((d) => d);
      mockNotifRepo.save.mockResolvedValue(entities);

      const result = await service.createForAllUsers(userIds, data);

      expect(mockNotifRepo.create).toHaveBeenCalledTimes(3);
      expect(mockNotifRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: 'u1', title: 'Alert' }),
          expect.objectContaining({ userId: 'u2', title: 'Alert' }),
          expect.objectContaining({ userId: 'u3', title: 'Alert' }),
        ]),
      );
      expect(result).toEqual(entities);
    });

    it('should handle empty user list', async () => {
      mockNotifRepo.save.mockResolvedValue([]);

      const result = await service.createForAllUsers([], { title: 'X', message: 'Y', type: 'z' });

      expect(mockNotifRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // ── findByUser ────────────────────────────────
  describe('findByUser', () => {
    it('should return notifications for a user ordered by createdAt DESC', async () => {
      const notifications = [
        { id: 'n2', userId: 'u1', createdAt: new Date('2026-03-10') },
        { id: 'n1', userId: 'u1', createdAt: new Date('2026-03-09') },
      ];
      mockNotifRepo.find.mockResolvedValue(notifications);

      const result = await service.findByUser('u1');

      expect(mockNotifRepo.find).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        order: { createdAt: 'DESC' },
        take: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no notifications', async () => {
      mockNotifRepo.find.mockResolvedValue([]);

      const result = await service.findByUser('u-none');

      expect(result).toEqual([]);
    });
  });

  // ── markRead ──────────────────────────────────
  describe('markRead', () => {
    it('should update a specific notification as read', async () => {
      mockNotifRepo.update.mockResolvedValue({ affected: 1 });

      await service.markRead('n1', 'u1');

      expect(mockNotifRepo.update).toHaveBeenCalledWith(
        { id: 'n1', userId: 'u1' },
        { read: true },
      );
    });
  });

  // ── markAllRead ───────────────────────────────
  describe('markAllRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      mockNotifRepo.update.mockResolvedValue({ affected: 5 });

      await service.markAllRead('u1');

      expect(mockNotifRepo.update).toHaveBeenCalledWith(
        { userId: 'u1', read: false },
        { read: true },
      );
    });
  });
});
