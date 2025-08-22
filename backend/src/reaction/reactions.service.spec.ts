import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsService } from './reaction.service';
import { InMemoryAnnouncementsRepository } from '../repositories/in-memory-announcements.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReactionType } from '../entities/reaction.entity';

describe('ReactionsService', () => {
  let service: ReactionsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      findReactionByUser: jest.fn(),
      createReaction: jest.fn(),
      removeReaction: jest.fn(),
      getIdempotencyKey: jest.fn(),
      setIdempotencyKey: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionsService,
        {
          provide: InMemoryAnnouncementsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReactionsService>(ReactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new reaction', async () => {
      const announcementId = 'announcement-1';
      const userId = 'user-1';
      const type: ReactionType = 'up';

      mockRepository.findOne.mockResolvedValue({ id: announcementId });
      mockRepository.findReactionByUser.mockResolvedValue(null);
      mockRepository.getIdempotencyKey.mockResolvedValue(null);
      mockRepository.createReaction.mockResolvedValue({
        id: 'reaction-1',
        announcementId,
        userId,
        type,
      });

      const result = await service.create(announcementId, userId, type);

      expect(result).toEqual({ type });
      expect(mockRepository.createReaction).toHaveBeenCalledWith({
        announcementId,
        userId,
        type,
      });
    });

    it('should handle idempotency key correctly', async () => {
      const announcementId = 'announcement-1';
      const userId = 'user-1';
      const type: ReactionType = 'up';
      const idempotencyKey = 'idempotency-key-123';

      mockRepository.findOne.mockResolvedValue({ id: announcementId });
      mockRepository.findReactionByUser.mockResolvedValue(null);
      mockRepository.getIdempotencyKey.mockResolvedValue({
        reactionId: 'existing-reaction-id',
        expiresAt: new Date(Date.now() + 300000), // 5 minutes from now
      });

      const result = await service.create(announcementId, userId, type, idempotencyKey);

      expect(result).toEqual({ type });
      expect(mockRepository.createReaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent announcement', async () => {
      const announcementId = 'non-existent';
      const userId = 'user-1';
      const type: ReactionType = 'up';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(announcementId, userId, type)).rejects.toThrow(NotFoundException);
    });

    it('should update existing reaction', async () => {
      const announcementId = 'announcement-1';
      const userId = 'user-1';
      const oldType: ReactionType = 'up';
      const newType: ReactionType = 'down';

      mockRepository.findOne.mockResolvedValue({ id: announcementId });
      mockRepository.findReactionByUser.mockResolvedValue({
        id: 'existing-reaction',
        type: oldType,
      });
      mockRepository.getIdempotencyKey.mockResolvedValue(null);
      mockRepository.createReaction.mockResolvedValue({
        id: 'updated-reaction',
        announcementId,
        userId,
        type: newType,
      });

      const result = await service.create(announcementId, userId, newType);

      expect(result).toEqual({ type: newType });
      expect(mockRepository.removeReaction).toHaveBeenCalledWith(announcementId, userId);
      expect(mockRepository.createReaction).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a reaction', async () => {
      const announcementId = 'announcement-1';
      const userId = 'user-1';

      mockRepository.findOne.mockResolvedValue({ id: announcementId });
      mockRepository.findReactionByUser.mockResolvedValue({
        id: 'reaction-1',
        type: 'up',
      });

      await service.remove(announcementId, userId);

      expect(mockRepository.removeReaction).toHaveBeenCalledWith(announcementId, userId);
    });

    it('should throw NotFoundException for non-existent announcement', async () => {
      const announcementId = 'non-existent';
      const userId = 'user-1';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(announcementId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-existent reaction', async () => {
      const announcementId = 'announcement-1';
      const userId = 'user-1';

      mockRepository.findOne.mockResolvedValue({ id: announcementId });
      mockRepository.findReactionByUser.mockResolvedValue(null);

      await expect(service.remove(announcementId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
