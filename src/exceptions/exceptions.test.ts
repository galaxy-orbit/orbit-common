import { describe, test, expect } from 'bun:test';
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  GatewayTimeoutException,
} from './http.exception';

describe('HttpException', () => {
  test('string response sets message', () => {
    const e = new HttpException('something broke', 418);
    expect(e.getStatus()).toBe(418);
    expect(e.message).toBe('something broke');
  });

  test('object response extracts message and keeps payload', () => {
    const e = new HttpException({ message: 'validation failed', field: 'email' }, 400);
    expect(e.message).toBe('validation failed');
    expect(e.getResponse()).toEqual({ message: 'validation failed', field: 'email' });
  });

  test('array message joins with comma', () => {
    const e = new HttpException({ message: ['a', 'b'] }, 400);
    expect(e.message).toBe('a, b');
  });

  test('toJSON includes statusCode, message and error name', () => {
    const e = new NotFoundException('no user');
    const json = e.toJSON();
    expect(json.statusCode).toBe(404);
    expect(json.message).toBe('no user');
    expect(json.error).toBe('NotFound');
  });
});

describe('built-in exception statuses', () => {
  const cases = [
    [BadRequestException, 400],
    [UnauthorizedException, 401],
    [ForbiddenException, 403],
    [NotFoundException, 404],
    [ConflictException, 409],
    [InternalServerErrorException, 500],
    [GatewayTimeoutException, 504],
  ] as const;

  for (const [Ctor, status] of cases) {
    test(`${Ctor.name} -> ${status}`, () => {
      const e = new Ctor('test message');
      expect(e).toBeInstanceOf(HttpException);
      expect(e.getStatus()).toBe(status);
      expect(e.message).toBe('test message');
    });
  }

  test('default messages are human-friendly', () => {
    expect(new BadRequestException().message).toBe('Bad Request');
    expect(new NotFoundException().message).toBe('Not Found');
  });
});
