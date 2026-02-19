import { describe, expect, it, vi } from 'vitest';
import { match, None, Option, Some } from '../src/index.js';

describe('Option', () => {
  describe('Some', () => {
    it('creates a Some value', () => {
      const opt = Some(42);
      expect(opt.isSome()).toBe(true);
      expect(opt.isNone()).toBe(false);
    });

    it('unwraps the value', () => {
      expect(Some(42).unwrap()).toBe(42);
    });

    it('expect returns the value', () => {
      expect(Some(42).expect('should not throw')).toBe(42);
    });

    it('unwrapOr returns the inner value', () => {
      expect(Some(42).unwrapOr(0)).toBe(42);
    });

    it('unwrapOrElse returns the inner value', () => {
      expect(Some(42).unwrapOrElse(() => 0)).toBe(42);
    });

    it('maps the value', () => {
      const opt = Some(2).map((x) => x * 3);
      expect(opt.unwrap()).toBe(6);
    });

    it('flatMaps the value', () => {
      const opt = Some(2).flatMap((x) => Some(x * 3));
      expect(opt.unwrap()).toBe(6);
    });

    it('flatMap returning None produces None', () => {
      const opt = Some(2).flatMap(() => None<number>());
      expect(opt.isNone()).toBe(true);
    });

    it('filters matching predicate', () => {
      const opt = Some(42).filter((x) => x > 10);
      expect(opt.isSome()).toBe(true);
      expect(opt.unwrap()).toBe(42);
    });

    it('filters non-matching predicate', () => {
      const opt = Some(42).filter((x) => x > 100);
      expect(opt.isNone()).toBe(true);
    });

    it('and returns the other option', () => {
      const opt = Some(1).and(Some('hello'));
      expect(opt.unwrap()).toBe('hello');
    });

    it('and with None returns None', () => {
      const opt = Some(1).and(None<string>());
      expect(opt.isNone()).toBe(true);
    });

    it('or returns self', () => {
      const opt = Some(1).or(Some(2));
      expect(opt.unwrap()).toBe(1);
    });

    it('orElse returns self', () => {
      const opt = Some(1).orElse(() => Some(2));
      expect(opt.unwrap()).toBe(1);
    });

    it('xor with None returns Some', () => {
      const opt = Some(1).xor(None<number>());
      expect(opt.unwrap()).toBe(1);
    });

    it('xor with Some returns None', () => {
      const opt = Some(1).xor(Some(2));
      expect(opt.isNone()).toBe(true);
    });

    it('zip with Some returns tuple', () => {
      const opt = Some(1).zip(Some('a'));
      expect(opt.unwrap()).toEqual([1, 'a']);
    });

    it('zip with None returns None', () => {
      const opt = Some(1).zip(None<string>());
      expect(opt.isNone()).toBe(true);
    });

    it('inspect calls the function and returns self', () => {
      const fn = vi.fn();
      const opt = Some(42);
      const result = opt.inspect(fn);
      expect(fn).toHaveBeenCalledWith(42);
      expect(result).toBe(opt);
    });

    it('toUndefined returns the value', () => {
      expect(Some(42).toUndefined()).toBe(42);
    });

    it('toNull returns the value', () => {
      expect(Some(42).toNull()).toBe(42);
    });

    it('toString returns Some(value)', () => {
      expect(Some(42).toString()).toBe('Some(42)');
    });
  });

  describe('None', () => {
    it('creates a None value', () => {
      const opt = None<number>();
      expect(opt.isSome()).toBe(false);
      expect(opt.isNone()).toBe(true);
    });

    it('unwrap throws', () => {
      expect(() => None<number>().unwrap()).toThrow('Called unwrap on a None value');
    });

    it('expect throws with custom message', () => {
      expect(() => None<number>().expect('custom error')).toThrow('custom error');
    });

    it('unwrapOr returns the default', () => {
      expect(None<number>().unwrapOr(99)).toBe(99);
    });

    it('unwrapOrElse calls the function', () => {
      expect(None<number>().unwrapOrElse(() => 99)).toBe(99);
    });

    it('map returns None', () => {
      const opt = None<number>().map((x) => x * 2);
      expect(opt.isNone()).toBe(true);
    });

    it('flatMap returns None', () => {
      const opt = None<number>().flatMap((x) => Some(x * 2));
      expect(opt.isNone()).toBe(true);
    });

    it('filter returns None', () => {
      const opt = None<number>().filter(() => true);
      expect(opt.isNone()).toBe(true);
    });

    it('and returns None', () => {
      const opt = None<number>().and(Some('hello'));
      expect(opt.isNone()).toBe(true);
    });

    it('or returns the other option', () => {
      const opt = None<number>().or(Some(42));
      expect(opt.unwrap()).toBe(42);
    });

    it('orElse calls the function', () => {
      const opt = None<number>().orElse(() => Some(42));
      expect(opt.unwrap()).toBe(42);
    });

    it('xor with None returns None', () => {
      const opt = None<number>().xor(None<number>());
      expect(opt.isNone()).toBe(true);
    });

    it('xor with Some returns Some', () => {
      const opt = None<number>().xor(Some(42));
      expect(opt.unwrap()).toBe(42);
    });

    it('zip returns None', () => {
      const opt = None<number>().zip(Some('a'));
      expect(opt.isNone()).toBe(true);
    });

    it('inspect does not call the function', () => {
      const fn = vi.fn();
      None<number>().inspect(fn);
      expect(fn).not.toHaveBeenCalled();
    });

    it('toUndefined returns undefined', () => {
      expect(None<number>().toUndefined()).toBeUndefined();
    });

    it('toNull returns null', () => {
      expect(None<number>().toNull()).toBeNull();
    });

    it('toString returns None', () => {
      expect(None<number>().toString()).toBe('None');
    });
  });

  describe('fromNullable', () => {
    it('creates Some from a value', () => {
      const opt = Option.fromNullable(42);
      expect(opt.isSome()).toBe(true);
      expect(opt.unwrap()).toBe(42);
    });

    it('creates None from null', () => {
      expect(Option.fromNullable(null).isNone()).toBe(true);
    });

    it('creates None from undefined', () => {
      expect(Option.fromNullable(undefined).isNone()).toBe(true);
    });

    it('creates Some from 0', () => {
      expect(Option.fromNullable(0).unwrap()).toBe(0);
    });

    it('creates Some from empty string', () => {
      expect(Option.fromNullable('').unwrap()).toBe('');
    });

    it('creates Some from false', () => {
      expect(Option.fromNullable(false).unwrap()).toBe(false);
    });
  });

  describe('.match() method', () => {
    it('Some dispatches to Some arm', () => {
      const result = Some(42).match({
        Some: (v) => `got ${v}`,
        None: () => 'nothing',
      });
      expect(result).toBe('got 42');
    });

    it('None dispatches to None arm', () => {
      const result = None<number>().match({
        Some: (v) => `got ${v}`,
        None: () => 'nothing',
      });
      expect(result).toBe('nothing');
    });
  });

  describe('standalone match()', () => {
    it('matches Some', () => {
      const result = match(Some(42), {
        Some: (v) => `got ${v}`,
        None: () => 'nothing',
      });
      expect(result).toBe('got 42');
    });

    it('matches None', () => {
      const result = match(None<number>(), {
        Some: (v) => `got ${v}`,
        None: () => 'nothing',
      });
      expect(result).toBe('nothing');
    });
  });

  describe('type guards', () => {
    it('narrows Some type after isSome check', () => {
      const opt: Option<number> = Some(42);
      if (opt.isSome()) {
        const val: number = opt.unwrap();
        expect(val).toBe(42);
      }
    });

    it('narrows None type after isNone check', () => {
      const opt: Option<number> = None();
      if (opt.isNone()) {
        expect(() => opt.unwrap()).toThrow();
      }
    });
  });

  describe('chaining', () => {
    it('chains multiple operations', () => {
      const result = Some(10)
        .map((x) => x * 2)
        .filter((x) => x > 15)
        .flatMap((x) => Some(`value: ${x}`))
        .unwrapOr('default');

      expect(result).toBe('value: 20');
    });

    it('short-circuits on None', () => {
      const result = Some(10)
        .map((x) => x * 2)
        .filter((x) => x > 100)
        .flatMap((x) => Some(`value: ${x}`))
        .unwrapOr('default');

      expect(result).toBe('default');
    });
  });

  describe('factory exports', () => {
    it('exports Some factory', () => {
      expect(Some).toBeDefined();
      expect(typeof Some).toBe('function');
    });

    it('exports None factory', () => {
      expect(None).toBeDefined();
      expect(typeof None).toBe('function');
    });
  });
});
