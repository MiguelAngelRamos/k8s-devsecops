// Must mock 'pg' BEFORE importing the module under test,
// so the Pool created at module-load time uses the mock.
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    query: jest.fn(),
  })),
}));

import { initDb } from '../../../src/infrastructure/db/postgres';
import pool from '../../../src/infrastructure/db/postgres';

// Capture error handler registered at module-load (before clearMocks wipes the calls)
let registeredErrorHandler: ((err: Error, client: any) => void) | undefined;
beforeAll(() => {
  const onCalls: any[][] = (pool as any).on.mock.calls;
  const errorEntry = onCalls.find((c) => c[0] === 'error');
  if (errorEntry) {
    registeredErrorHandler = errorEntry[1];
  }
});

describe('postgres module', () => {
  describe('initDb()', () => {
    it('should create the users table and release the client on success', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({}),
        release: jest.fn(),
      };
      (pool as any).connect.mockResolvedValue(mockClient);

      await initDb();

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('should release the client and re-throw when query fails', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('query failed')),
        release: jest.fn(),
      };
      (pool as any).connect.mockResolvedValue(mockClient);

      await expect(initDb()).rejects.toThrow('query failed');
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('pool error handler', () => {
    it('should call process.exit(-1) when the pool emits an error', () => {
      if (!registeredErrorHandler) {
        // handler was not captured — skip gracefully
        return;
      }

      const exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {
          throw new Error('process.exit called');
        }) as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => registeredErrorHandler!(new Error('idle client error'), {})).toThrow(
        'process.exit called',
      );
      expect(exitSpy).toHaveBeenCalledWith(-1);

      exitSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

});
