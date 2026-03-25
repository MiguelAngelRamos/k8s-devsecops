import 'reflect-metadata';

// Mock pg pool so the postgres module loads without a real DB
jest.mock('../../../src/infrastructure/db/postgres', () => ({
  __esModule: true,
  default: { query: jest.fn(), on: jest.fn(), connect: jest.fn() },
  initDb: jest.fn(),
}));

import { AuthController } from '../../../src/controllers/AuthController';
import { AuthService } from '../../../src/services/AuthService';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<Pick<AuthService, 'register'>>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockAuthService = { register: jest.fn() } as any;

    // Instantiate directly, bypassing inversify DI
    controller = new AuthController(mockAuthService as any);

    mockReq = {
      body: { email: 'user@test.com', password: 'pass1234', name: 'User' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('register()', () => {
    it('should respond 201 with token and user on success', async () => {
      const mockResult = {
        token: 'jwt_token_abc',
        user: { id: '1', email: 'user@test.com', name: 'User' },
      };
      mockAuthService.register.mockResolvedValue(mockResult);

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should respond 400 with error message when service throws', async () => {
      mockAuthService.register.mockRejectedValue(new Error('El usuario ya existe'));

      await controller.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'El usuario ya existe' });
    });
  });
});
