import 'reflect-metadata';

// Mock the SQLite database module before any imports that reference it
jest.mock('../../../src/infrastructure/db/database', () => ({
  __esModule: true,
  default: { prepare: jest.fn() },
}));

import { SQLiteUserRepository } from '../../../src/infrastructure/repositories/SQLiteUserRepository';
import { User } from '../../../src/domain/entities/User';
import db from '../../../src/infrastructure/db/database';

const mockDb = db as jest.Mocked<typeof db>;

describe('SQLiteUserRepository', () => {
  let repo: SQLiteUserRepository;

  beforeEach(() => {
    repo = new SQLiteUserRepository();
  });

  describe('findByEmail()', () => {
    it('should return a User when a row is found', async () => {
      const fakeRow = { id: '1', email: 'test@test.com', password: 'hash', name: 'Test User' };
      const mockStmt = { get: jest.fn().mockReturnValue(fakeRow) };
      (mockDb.prepare as jest.Mock).mockReturnValue(mockStmt);

      const result = await repo.findByEmail('test@test.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@test.com');
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('Test User');
    });

    it('should return null when no row is found', async () => {
      const mockStmt = { get: jest.fn().mockReturnValue(null) };
      (mockDb.prepare as jest.Mock).mockReturnValue(mockStmt);

      const result = await repo.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    it('should insert the user and return it', async () => {
      const mockStmt = { run: jest.fn() };
      (mockDb.prepare as jest.Mock).mockReturnValue(mockStmt);

      const user = new User('42', 'new@test.com', 'hashed_pass', 'New User');
      const result = await repo.create(user);

      expect(result).toBe(user);
      expect(mockStmt.run).toHaveBeenCalledWith(
        user.id,
        user.email,
        user.password,
        user.name,
      );
    });

    it('should throw "Error al crear usuario en BD" when insert fails', async () => {
      const mockStmt = {
        run: jest.fn().mockImplementation(() => {
          throw new Error('UNIQUE constraint failed');
        }),
      };
      (mockDb.prepare as jest.Mock).mockReturnValue(mockStmt);

      const user = new User('1', 'dup@test.com', 'hash', 'Dup');
      await expect(repo.create(user)).rejects.toThrow('Error al crear usuario en BD');
    });
  });
});
