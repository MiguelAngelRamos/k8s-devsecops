import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from '../../../src/dtos/RegisterDto';

describe('RegisterDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'password123',
      name: 'John',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail with an invalid email', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'not-an-email',
      password: 'password123',
      name: 'John',
    });
    const errors = await validate(dto);
    const emailErrors = errors.filter((e) => e.property === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('should fail with a password shorter than 6 characters', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: '12345',
      name: 'John',
    });
    const errors = await validate(dto);
    const passwordErrors = errors.filter((e) => e.property === 'password');
    expect(passwordErrors.length).toBeGreaterThan(0);
  });

  it('should fail with a name shorter than 2 characters', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'test@example.com',
      password: 'password123',
      name: 'J',
    });
    const errors = await validate(dto);
    const nameErrors = errors.filter((e) => e.property === 'name');
    expect(nameErrors.length).toBeGreaterThan(0);
  });

  it('should fail when multiple fields are invalid', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: 'bad',
      password: '123',
      name: 'J',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
