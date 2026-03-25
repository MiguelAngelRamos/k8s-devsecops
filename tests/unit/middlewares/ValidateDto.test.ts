import { Request, Response, NextFunction } from 'express';
import { validateDto } from '../../../src/middlewares/ValidateDto';
import { RegisterDto } from '../../../src/dtos/RegisterDto';

describe('validateDto middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call next() when the body is valid', async () => {
    mockReq.body = {
      email: 'valid@example.com',
      password: 'password123',
      name: 'John',
    };

    const middleware = validateDto(RegisterDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 400 with error messages when body is invalid', async () => {
    mockReq.body = {
      email: 'not-an-email',
      password: '123',
      name: 'J',
    };

    const middleware = validateDto(RegisterDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ errors: expect.any(Array) }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include constraint messages in the 400 response', async () => {
    mockReq.body = { email: 'bad', password: '1', name: 'A' };

    const middleware = validateDto(RegisterDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.errors.length).toBeGreaterThan(0);
  });
});
