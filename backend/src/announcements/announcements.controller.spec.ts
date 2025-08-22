import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.services';
import { InMemoryAnnouncementsRepository } from '../repositories/in-memory-announcements.repository';
import { AnnouncementResponseDto } from '../dto/announcement-response.dto';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: AnnouncementsService;

  const mockRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findCommentsByAnnouncementId: jest.fn(),
    findReactionsByAnnouncementId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        AnnouncementsService,
        {
          provide: InMemoryAnnouncementsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    service = module.get<AnnouncementsService>(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of announcements', async () => {
      mockRepository.findAll.mockResolvedValue([
        {
          id: '1',
          title: 'Test Announcement',
          content: 'Test content',
          status: 'published',
          createdAt: new Date(),
        },
      ]);
      mockRepository.findCommentsByAnnouncementId.mockResolvedValue([]);
      mockRepository.findReactionsByAnnouncementId.mockResolvedValue([]);

      const mockResponse = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };

      await controller.findAll('', mockResponse as any);

      expect(mockResponse.set).toHaveBeenCalledWith('ETag', expect.any(String));
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return 304 when ETag matches', async () => {
      const mockResponse = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn(),
      };

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.findCommentsByAnnouncementId.mockResolvedValue([]);
      mockRepository.findReactionsByAnnouncementId.mockResolvedValue([]);

      // First call to get ETag
      await controller.findAll('', mockResponse as any);
      const etag = mockResponse.set.mock.calls[0][1];

      // Reset mocks
      mockResponse.set.mockClear();
      mockResponse.status.mockClear();
      mockResponse.send.mockClear();
      mockResponse.json.mockClear();

      // Second call with matching ETag
      await controller.findAll(etag, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(304);
      expect(mockResponse.send).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
