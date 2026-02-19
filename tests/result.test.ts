import { describe, expect, it, vi } from 'vitest';
import { Fail, match, Ok, Result } from '../src/index.js';

describe('Result', () => {
  describe('Ok', () => {
    it('creates an Ok value', () => {
      const res = Ok(42);
      expect(res.isOk()).toBe(true);
      expect(res.isErr()).toBe(false);
    });

    it('unwraps the value', () => {
      expect(Ok(42).unwrap()).toBe(42);
    });

    it('unwrapErr throws', () => {
      expect(() => Ok(42).unwrapErr()).toThrow('Called unwrapErr on an Ok value');
    });

    it('expect returns the value', () => {
      expect(Ok(42).expect('should not throw')).toBe(42);
    });

    it('expectErr throws', () => {
      expect(() => Ok(42).expectErr('custom')).toThrow('custom');
    });

    it('unwrapOr returns the inner value', () => {
      expect(Ok(42).unwrapOr(0)).toBe(42);
    });

    it('unwrapOrElse returns the inner value', () => {
      expect(Ok<number, string>(42).unwrapOrElse(() => 0)).toBe(42);
    });

    it('maps the value', () => {
      const res = Ok(2).map((x) => x * 3);
      expect(res.unwrap()).toBe(6);
    });

    it('mapErr is a no-op', () => {
      const res = Ok<number, string>(42).mapErr((e) => e.toUpperCase());
      expect(res.unwrap()).toBe(42);
    });

    it('mapOr applies the function', () => {
      expect(Ok(2).mapOr(0, (x) => x * 3)).toBe(6);
    });

    it('mapOrElse applies the ok function', () => {
      expect(
        Ok<number, string>(2).mapOrElse(
          () => 0,
          (x) => x * 3,
        ),
      ).toBe(6);
    });

    it('and returns the other result', () => {
      const res = Ok(1).and(Ok('hello'));
      expect(res.unwrap()).toBe('hello');
    });

    it('and with Err returns the other Err', () => {
      const res = Ok(1).and(Fail('fail'));
      expect(res.unwrapErr()).toBe('fail');
    });

    it('flatMap chains operations', () => {
      const res = Ok(2).flatMap((x) => Ok(x * 3));
      expect(res.unwrap()).toBe(6);
    });

    it('flatMap can produce Err', () => {
      const res = Ok(2).flatMap(() => Fail('oops'));
      expect(res.unwrapErr()).toBe('oops');
    });

    it('or returns self', () => {
      const res = Ok<number, string>(1).or(Ok<number, number>(2));
      expect(res.unwrap()).toBe(1);
    });

    it('orElse returns self', () => {
      const res = Ok<number, string>(1).orElse(() => Ok<number, number>(2));
      expect(res.unwrap()).toBe(1);
    });

    it('inspect calls the function', () => {
      const fn = vi.fn();
      const res = Ok(42);
      const returned = res.inspect(fn);
      expect(fn).toHaveBeenCalledWith(42);
      expect(returned).toBe(res);
    });

    it('inspectErr does not call the function', () => {
      const fn = vi.fn();
      Ok(42).inspectErr(fn);
      expect(fn).not.toHaveBeenCalled();
    });

    it('toString returns Ok(value)', () => {
      expect(Ok(42).toString()).toBe('Ok(42)');
    });
  });

  describe('Err', () => {
    it('creates an Err value', () => {
      const res = Fail('oops');
      expect(res.isOk()).toBe(false);
      expect(res.isErr()).toBe(true);
    });

    it('unwrap throws with error message', () => {
      expect(() => Fail('oops').unwrap()).toThrow('Called unwrap on an Err value: oops');
    });

    it('unwrapErr returns the error', () => {
      expect(Fail('oops').unwrapErr()).toBe('oops');
    });

    it('expect throws with custom message', () => {
      expect(() => Fail('oops').expect('custom')).toThrow('custom');
    });

    it('expectErr returns the error', () => {
      expect(Fail('oops').expectErr('should not throw')).toBe('oops');
    });

    it('unwrapOr returns the default', () => {
      expect(Fail<number>('oops').unwrapOr(99)).toBe(99);
    });

    it('unwrapOrElse calls the function with error', () => {
      expect(Fail<number>('oops').unwrapOrElse((e) => e.length)).toBe(4);
    });

    it('map is a no-op', () => {
      const res = Fail<number>('oops').map((x) => x * 2);
      expect(res.unwrapErr()).toBe('oops');
    });

    it('mapErr transforms the error', () => {
      const res = Fail<number>('oops').mapErr((e) => e.toUpperCase());
      expect(res.unwrapErr()).toBe('OOPS');
    });

    it('mapOr returns the default', () => {
      expect(Fail<number>('oops').mapOr(99, (x) => x * 2)).toBe(99);
    });

    it('mapOrElse applies the error function', () => {
      expect(
        Fail<number>('oops').mapOrElse(
          (e) => e.length,
          (x) => x * 2,
        ),
      ).toBe(4);
    });

    it('and returns self (Err)', () => {
      const res = Fail<number>('oops').and(Ok('hello'));
      expect(res.unwrapErr()).toBe('oops');
    });

    it('flatMap returns self (Err)', () => {
      const res = Fail<number>('oops').flatMap((x) => Ok(x * 2));
      expect(res.unwrapErr()).toBe('oops');
    });

    it('or returns the other result', () => {
      const res = Fail<number, string>('oops').or(Ok<number, number>(42));
      expect(res.unwrap()).toBe(42);
    });

    it('orElse transforms the error', () => {
      const res = Fail<number, string>('oops').orElse((e) => Fail<number, number>(e.length));
      expect(res.unwrapErr()).toBe(4);
    });

    it('inspect does not call the function', () => {
      const fn = vi.fn();
      Fail('oops').inspect(fn);
      expect(fn).not.toHaveBeenCalled();
    });

    it('inspectErr calls the function', () => {
      const fn = vi.fn();
      const res = Fail('oops');
      const returned = res.inspectErr(fn);
      expect(fn).toHaveBeenCalledWith('oops');
      expect(returned).toBe(res);
    });

    it('toString returns Err(error)', () => {
      expect(Fail('oops').toString()).toBe('Err(oops)');
    });
  });

  describe('fromThrowable', () => {
    it('returns Ok when function succeeds', () => {
      const res = Result.fromThrowable(() => 42);
      expect(res.isOk()).toBe(true);
      expect(res.unwrap()).toBe(42);
    });

    it('returns Err with Error when function throws Error', () => {
      const res = Result.fromThrowable(() => {
        throw new Error('boom');
      });
      expect(res.isErr()).toBe(true);
      expect(res.unwrapErr()).toBeInstanceOf(Error);
      expect(res.unwrapErr().message).toBe('boom');
    });

    it('returns Err with wrapped Error when function throws non-Error', () => {
      const res = Result.fromThrowable(() => {
        throw 'string error';
      });
      expect(res.isErr()).toBe(true);
      expect(res.unwrapErr()).toBeInstanceOf(Error);
      expect(res.unwrapErr().message).toBe('string error');
    });
  });

  describe('combine', () => {
    it('returns Ok with values when all succeed', () => {
      const res = Result.combine([Ok(1), Ok(2), Ok(3)]);
      expect(res.isOk()).toBe(true);
      expect(res.unwrap()).toEqual([1, 2, 3]);
    });

    it('returns first Err when any fails', () => {
      const res = Result.combine([Ok(1), Fail('fail'), Ok(3)]);
      expect(res.isErr()).toBe(true);
      expect(res.unwrapErr()).toBe('fail');
    });

    it('returns Ok with empty array for empty input', () => {
      const res = Result.combine([]);
      expect(res.isOk()).toBe(true);
      expect(res.unwrap()).toEqual([]);
    });
  });

  describe('.match() method', () => {
    it('Ok dispatches to Ok arm', () => {
      const result = Ok(42).match({
        Ok: (v) => `got ${v}`,
        Err: (e) => `error: ${e}`,
      });
      expect(result).toBe('got 42');
    });

    it('Err dispatches to Err arm', () => {
      const result = Fail('oops').match({
        Ok: (v) => `got ${v}`,
        Err: (e) => `error: ${e}`,
      });
      expect(result).toBe('error: oops');
    });
  });

  describe('standalone match()', () => {
    it('matches Ok', () => {
      const result = match(Ok(42), {
        Ok: (v) => `got ${v}`,
        Err: (e) => `error: ${e}`,
      });
      expect(result).toBe('got 42');
    });

    it('matches Err', () => {
      const result = match(Fail('oops'), {
        Ok: (v) => `got ${v}`,
        Err: (e) => `error: ${e}`,
      });
      expect(result).toBe('error: oops');
    });
  });

  describe('type guards', () => {
    it('narrows Ok type after isOk check', () => {
      const res: Result<number> = Ok(42);
      if (res.isOk()) {
        const val: number = res.unwrap();
        expect(val).toBe(42);
      }
    });

    it('narrows Err type after isErr check', () => {
      const res: Result<number> = Fail('oops');
      if (res.isErr()) {
        const err: string = res.unwrapErr();
        expect(err).toBe('oops');
      }
    });
  });

  describe('chaining', () => {
    it('chains multiple Ok operations', () => {
      const res = Ok(10)
        .map((x) => x * 2)
        .flatMap((x) => (x > 15 ? Ok(`value: ${x}`) : Fail('too small')))
        .unwrapOr('default');

      expect(res).toBe('value: 20');
    });

    it('short-circuits on Err', () => {
      const res = Ok(10)
        .map((x) => x * 2)
        .flatMap((x) => (x > 100 ? Ok(`value: ${x}`) : Fail('too small')))
        .unwrapOr('default');

      expect(res).toBe('default');
    });
  });

  describe('error types', () => {
    it('works with custom error types', () => {
      type AppError = { code: number; message: string };
      const res = Fail<number, AppError>({ code: 404, message: 'not found' });
      expect(res.unwrapErr().code).toBe(404);
    });

    it('mapErr transforms error type', () => {
      const res = Fail<number>('oops').mapErr((e) => ({ original: e, code: 500 }));
      expect(res.unwrapErr()).toEqual({ original: 'oops', code: 500 });
    });
  });

  describe('factory exports', () => {
    it('exports Ok factory', () => {
      expect(Ok).toBeDefined();
      expect(typeof Ok).toBe('function');
    });

    it('exports Fail factory', () => {
      expect(Fail).toBeDefined();
      expect(typeof Fail).toBe('function');
    });
  });
});
