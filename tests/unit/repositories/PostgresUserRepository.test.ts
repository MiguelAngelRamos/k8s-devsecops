import 'reflect-metadata';

// Mock the pg pool before any module that imports it
jest.mock('../../../src/infrastructure/db/postgres', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    on: jest.fn(),
    connect: jest.fn(),
  },
  initDb: jest.fn(),
}));

import { PostgresUserRepository } from '../../../src/infrastructure/repositories/PostgresUserRepository';
import { User } from '../../../src/domain/entities/User';
import pool from '../../../src/infrastructure/db/postgres';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('PostgresUserRepository', () => {
  let repo: PostgresUserRepository;

  beforeEach(() => {
    repo = new PostgresUserRepository();
  });

  describe('findByEmail()', () => {
    it('should return a User when a row is found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ id: '1', email: 'test@test.com', password: 'hash', name: 'Test User' }],
      });

      const result = await repo.findByEmail('test@test.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@test.com');
      expect(result?.id).toBe('1');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@test.com'],
      );
    });

    it('should return null when no row is found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const result = await repo.findByEmail('ghost@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create()', () => {
    it('should insert the user and return it', async () => {
      (mockPool.query as jest.Mock).mockResolvedValue({ rows: [{}] });

      const user = new User('99', 'new@test.com', 'hashed_pass', 'New User');
      const result = await repo.create(user);

      expect(result).toBe(user);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (id, email, password, name) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, user.email, user.password, user.name],
      );
    });

    it('should throw "Error al crear usuario en BD" when query rejects', async () => {
      (mockPool.query as jest.Mock).mockRejectedValue(new Error('duplicate key'));

      const user = new User('1', 'dup@test.com', 'hash', 'Dup');
      await expect(repo.create(user)).rejects.toThrow('Error al crear usuario en BD');
    });
  });
});
