import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new session with 6-digit code', async () => {
      const createDto = { mode: 'RUSH' as const };
      const userId = 'user-id';

      const mockSession = {
        id: 'session-id',
        code: 'ABC123',
        mode: 'RUSH',
        status: 'PENDING',
        lecturerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        endedAt: null,
      };

      mockPrismaService.session.create.mockResolvedValue(mockSession);

      const result = await service.create(createDto, userId);

      expect(result.code).toHaveLength(6);
      expect(result.mode).toBe('RUSH');
      expect(result.lecturerId).toBe(userId);
      expect(prismaService.session.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all sessions for a user', async () => {
      const userId = 'user-id';
      const mockSessions = [
        {
          id: 'session-1',
          code: 'ABC123',
          mode: 'RUSH',
          status: 'ACTIVE',
          lecturerId: userId,
        },
        {
          id: 'session-2',
          code: 'DEF456',
          mode: 'THINKING',
          status: 'ENDED',
          lecturerId: userId,
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(2);
      expect(result[0].lecturerId).toBe(userId);
    });
  });

  describe('joinByCode', () => {
    it('should return session for valid code', async () => {
      const code = 'ABC123';
      const mockSession = {
        id: 'session-id',
        code,
        mode: 'RUSH',
        status: 'ACTIVE',
        lecturerId: 'lecturer-id',
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.joinByCode(code);

      expect(result.code).toBe(code);
      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error for inactive session', async () => {
      const code = 'ABC123';
      const mockSession = {
        id: 'session-id',
        code,
        mode: 'RUSH',
        status: 'ENDED',
        lecturerId: 'lecturer-id',
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      await expect(service.joinByCode(code)).rejects.toThrow();
    });
  });
});

