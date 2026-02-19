/**
 * Represents an optional value: either `Some(value)` or `None`.
 *
 * Use {@link Some} and {@link None} factory functions to create instances.
 *
 * @typeParam T - The type of the contained value.
 *
 * @example
 * ```ts
 * const name = Some('Alice');
 * const greeting = name.map(n => `Hello, ${n}`).unwrapOr('Hello, stranger');
 * ```
 */
export abstract class Option<T> {
  /** Returns `true` if the option contains a value. */
  abstract isSome(): boolean;

  /** Returns `true` if the option is empty. */
  abstract isNone(): boolean;

  /**
   * Returns the contained value.
   * @throws If the option is `None`.
   */
  abstract unwrap(): T;

  /**
   * Returns the contained value.
   * @param msg - Error message to throw if the option is `None`.
   * @throws With `msg` if the option is `None`.
   */
  abstract expect(msg: string): T;

  /**
   * Returns the contained value, or `defaultValue` if `None`.
   * @param defaultValue - Value to return if `None`.
   */
  abstract unwrapOr(defaultValue: T): T;

  /**
   * Returns the contained value, or computes it from `f` if `None`.
   * @param f - Function to compute the default value.
   */
  abstract unwrapOrElse(f: () => T): T;

  /**
   * Transforms the contained value by applying `f`.
   * Returns `None` if the option is `None`.
   * @param f - Function to apply to the value.
   */
  abstract map<U>(f: (value: T) => U): Option<U>;

  /**
   * Transforms the contained value by applying `f`, which itself returns an `Option`.
   * Flattens the result (avoids `Option<Option<U>>`).
   * @param f - Function returning an `Option`.
   */
  abstract flatMap<U>(f: (value: T) => Option<U>): Option<U>;

  /**
   * Returns `None` if the option is `None` or the predicate returns `false`.
   * @param predicate - Function to test the contained value.
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns `None` if this option is `None`, otherwise returns `optb`.
   * @param optb - The other option.
   */
  abstract and<U>(optb: Option<U>): Option<U>;

  /**
   * Returns this option if it is `Some`, otherwise returns `optb`.
   * @param optb - Fallback option.
   */
  abstract or(optb: Option<T>): Option<T>;

  /**
   * Returns this option if it is `Some`, otherwise calls `f` and returns the result.
   * @param f - Function producing the fallback option.
   */
  abstract orElse(f: () => Option<T>): Option<T>;

  /**
   * Returns `Some` if exactly one of `this` and `optb` is `Some`, otherwise `None`.
   * @param optb - The other option.
   */
  abstract xor(optb: Option<T>): Option<T>;

  /**
   * Zips this option with another. Returns `Some([a, b])` if both are `Some`, otherwise `None`.
   * @param other - The other option to zip with.
   */
  abstract zip<U>(other: Option<U>): Option<[T, U]>;

  /**
   * Calls `f` with the contained value if `Some`, then returns `this` unchanged.
   * Useful for side effects in a chain.
   * @param f - Function to call with the value.
   */
  abstract inspect(f: (value: T) => void): Option<T>;

  /**
   * Exhaustive pattern matching on the option.
   * @param patterns - Object with `Some` and `None` handlers.
   *
   * @example
   * ```ts
   * Some(42).match({
   *   Some: v => `got ${v}`,
   *   None: () => 'nothing',
   * });
   * ```
   */
  abstract match<U>(patterns: { Some: (value: T) => U; None: () => U }): U;

  /** Converts to `T | undefined`. Returns `undefined` if `None`. */
  abstract toUndefined(): T | undefined;

  /** Converts to `T | null`. Returns `null` if `None`. */
  abstract toNull(): T | null;

  /**
   * Creates an `Option` from a nullable value.
   * Returns `Some(value)` if non-null/undefined, otherwise `None`.
   * @param value - A possibly null or undefined value.
   */
  static fromNullable<T>(value: T | null | undefined): Option<T> {
    return value != null ? Some(value) : None<T>();
  }
}

class SomeOption<T> extends Option<T> {
  constructor(private readonly value: T) {
    super();
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  expect(_msg: string): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_f: () => T): T {
    return this.value;
  }

  map<U>(f: (value: T) => U): Option<U> {
    return Some(f(this.value));
  }

  flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    return f(this.value);
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? this : None<T>();
  }

  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }

  or(_optb: Option<T>): Option<T> {
    return this;
  }

  orElse(_f: () => Option<T>): Option<T> {
    return this;
  }

  xor(optb: Option<T>): Option<T> {
    return optb.isNone() ? this : None<T>();
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    return other.isSome() ? Some<[T, U]>([this.value, other.unwrap()]) : None<[T, U]>();
  }

  inspect(f: (value: T) => void): Option<T> {
    f(this.value);
    return this;
  }

  match<U>(patterns: { Some: (value: T) => U; None: () => U }): U {
    return patterns.Some(this.value);
  }

  toUndefined(): T | undefined {
    return this.value;
  }

  toNull(): T | null {
    return this.value;
  }

  toString(): string {
    return `Some(${this.value})`;
  }
}

class NoneOption<T> extends Option<T> {
  isSome(): boolean {
    return false;
  }

  isNone(): boolean {
    return true;
  }

  unwrap(): T {
    throw new Error('Called unwrap on a None value');
  }

  expect(msg: string): T {
    throw new Error(msg);
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse(f: () => T): T {
    return f();
  }

  map<U>(_f: (value: T) => U): Option<U> {
    return None<U>();
  }

  flatMap<U>(_f: (value: T) => Option<U>): Option<U> {
    return None<U>();
  }

  filter(_predicate: (value: T) => boolean): Option<T> {
    return this;
  }

  and<U>(_optb: Option<U>): Option<U> {
    return None<U>();
  }

  or(optb: Option<T>): Option<T> {
    return optb;
  }

  orElse(f: () => Option<T>): Option<T> {
    return f();
  }

  xor(optb: Option<T>): Option<T> {
    return optb.isSome() ? optb : None<T>();
  }

  zip<U>(_other: Option<U>): Option<[T, U]> {
    return None<[T, U]>();
  }

  inspect(_f: (value: T) => void): Option<T> {
    return this;
  }

  match<U>(patterns: { Some: (value: T) => U; None: () => U }): U {
    return patterns.None();
  }

  toUndefined(): T | undefined {
    return undefined;
  }

  toNull(): T | null {
    return null;
  }

  toString(): string {
    return 'None';
  }
}

/**
 * Creates an `Option` containing a value.
 * @param value - The value to wrap.
 *
 * @example
 * ```ts
 * const opt = Some(42);
 * opt.unwrap(); // 42
 * ```
 */
export function Some<T>(value: T): Option<T> {
  return new SomeOption(value);
}

/**
 * Creates an empty `Option`.
 *
 * @example
 * ```ts
 * const opt = None<number>();
 * opt.isNone(); // true
 * ```
 */
export function None<T>(): Option<T> {
  return new NoneOption<T>();
}
