/**
 * Represents the outcome of a fallible operation: either `Ok(value)` or `Fail(error)`.
 *
 * Use {@link Ok} and {@link Fail} factory functions to create instances.
 *
 * @typeParam T - The type of the success value.
 * @typeParam E - The type of the error value. Defaults to `string`.
 *
 * @example
 * ```ts
 * const parsed = Result.fromThrowable(() => JSON.parse(input));
 * const value = parsed.unwrapOr({});
 * ```
 */
export abstract class Result<T, E = string> {
  /** Returns `true` if the result is `Ok`. */
  abstract isOk(): boolean;

  /** Returns `true` if the result is `Err`. */
  abstract isErr(): boolean;

  /**
   * Returns the success value.
   * @throws If the result is `Err`.
   */
  abstract unwrap(): T;

  /**
   * Returns the error value.
   * @throws If the result is `Ok`.
   */
  abstract unwrapErr(): E;

  /**
   * Returns the success value.
   * @param msg - Error message to throw if the result is `Err`.
   * @throws With `msg` if the result is `Err`.
   */
  abstract expect(msg: string): T;

  /**
   * Returns the error value.
   * @param msg - Error message to throw if the result is `Ok`.
   * @throws With `msg` if the result is `Ok`.
   */
  abstract expectErr(msg: string): E;

  /**
   * Returns the success value, or `defaultValue` if `Err`.
   * @param defaultValue - Value to return if `Err`.
   */
  abstract unwrapOr(defaultValue: T): T;

  /**
   * Returns the success value, or computes it from the error using `f`.
   * @param f - Function to compute the default from the error.
   */
  abstract unwrapOrElse(f: (error: E) => T): T;

  /**
   * Transforms the success value by applying `f`.
   * Returns the original `Err` if the result is `Err`.
   * @param f - Function to apply to the success value.
   */
  abstract map<U>(f: (value: T) => U): Result<U, E>;

  /**
   * Transforms the error value by applying `f`.
   * Returns the original `Ok` if the result is `Ok`.
   * @param f - Function to apply to the error value.
   */
  abstract mapErr<F>(f: (error: E) => F): Result<T, F>;

  /**
   * Applies `f` to the success value, or returns `defaultValue` if `Err`.
   * @param defaultValue - Value to return if `Err`.
   * @param f - Function to apply to the success value.
   */
  abstract mapOr<U>(defaultValue: U, f: (value: T) => U): U;

  /**
   * Applies `f` to the success value, or `defaultFn` to the error.
   * @param defaultFn - Function to apply to the error.
   * @param f - Function to apply to the success value.
   */
  abstract mapOrElse<U>(defaultFn: (error: E) => U, f: (value: T) => U): U;

  /**
   * Transforms the success value by applying `f`, which itself returns a `Result`.
   * Flattens the result (avoids `Result<Result<U, E>, E>`).
   * @param f - Function returning a `Result`.
   */
  abstract flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * Returns `Err` if this result is `Err`, otherwise returns `res`.
   * @param res - The other result.
   */
  abstract and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Returns this result if it is `Ok`, otherwise returns `res`.
   * @param res - Fallback result.
   */
  abstract or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * Returns this result if it is `Ok`, otherwise calls `f` with the error and returns the result.
   * @param f - Function producing the fallback result from the error.
   */
  abstract orElse<F>(f: (error: E) => Result<T, F>): Result<T, F>;

  /**
   * Calls `f` with the success value if `Ok`, then returns `this` unchanged.
   * Useful for side effects in a chain.
   * @param f - Function to call with the success value.
   */
  abstract inspect(f: (value: T) => void): Result<T, E>;

  /**
   * Calls `f` with the error value if `Err`, then returns `this` unchanged.
   * Useful for side effects in a chain.
   * @param f - Function to call with the error value.
   */
  abstract inspectErr(f: (error: E) => void): Result<T, E>;

  /**
   * Exhaustive pattern matching on the result.
   * @param patterns - Object with `Ok` and `Err` handlers.
   *
   * @example
   * ```ts
   * Ok(42).match({
   *   Ok: v => `got ${v}`,
   *   Err: e => `error: ${e}`,
   * });
   * ```
   */
  abstract match<U>(patterns: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  /**
   * Wraps a potentially throwing function into a `Result`.
   * Returns `Ok(value)` on success, `Fail(error)` on exception.
   * Non-`Error` exceptions are wrapped in `new Error(String(e))`.
   * @param f - Function that may throw.
   */
  static fromThrowable<T>(f: () => T): Result<T, Error> {
    try {
      return Ok(f());
    } catch (e) {
      return Fail(e instanceof Error ? e : new Error(String(e)));
    }
  }

  /**
   * Collects an array of results into a single result.
   * Returns `Ok(values[])` if all succeed, or the first `Err` encountered.
   * @param results - Array of results to combine.
   *
   * @example
   * ```ts
   * Result.combine([Ok(1), Ok(2), Ok(3)]); // Ok([1, 2, 3])
   * Result.combine([Ok(1), Fail('no')]); // Fail('no')
   * ```
   */
  static combine<E = string>(results: Result<unknown, E>[]): Result<unknown[], E> {
    const values: unknown[] = [];
    for (const result of results) {
      if (result.isErr()) return Fail(result.unwrapErr());
      values.push(result.unwrap());
    }
    return Ok(values);
  }
}

class OkResult<T, E = string> extends Result<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isOk(): boolean {
    return true;
  }

  isErr(): boolean {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): E {
    throw new Error('Called unwrapErr on an Ok value');
  }

  expect(_msg: string): T {
    return this.value;
  }

  expectErr(msg: string): E {
    throw new Error(msg);
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_f: (error: E) => T): T {
    return this.value;
  }

  map<U>(f: (value: T) => U): Result<U, E> {
    return Ok(f(this.value));
  }

  mapErr<F>(_f: (error: E) => F): Result<T, F> {
    return Ok(this.value);
  }

  mapOr<U>(_defaultValue: U, f: (value: T) => U): U {
    return f(this.value);
  }

  mapOrElse<U>(_defaultFn: (error: E) => U, f: (value: T) => U): U {
    return f(this.value);
  }

  flatMap<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    return f(this.value);
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return res;
  }

  or<F>(_res: Result<T, F>): Result<T, F> {
    return Ok(this.value);
  }

  orElse<F>(_f: (error: E) => Result<T, F>): Result<T, F> {
    return Ok(this.value);
  }

  inspect(f: (value: T) => void): Result<T, E> {
    f(this.value);
    return this;
  }

  inspectErr(_f: (error: E) => void): Result<T, E> {
    return this;
  }

  match<U>(patterns: { Ok: (value: T) => U; Err: (error: E) => U }): U {
    return patterns.Ok(this.value);
  }

  toString(): string {
    return `Ok(${this.value})`;
  }
}

class ErrResult<T, E = string> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isOk(): boolean {
    return false;
  }

  isErr(): boolean {
    return true;
  }

  unwrap(): T {
    throw new Error(`Called unwrap on an Err value: ${this.error}`);
  }

  unwrapErr(): E {
    return this.error;
  }

  expect(msg: string): T {
    throw new Error(msg);
  }

  expectErr(_msg: string): E {
    return this.error;
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse(f: (error: E) => T): T {
    return f(this.error);
  }

  map<U>(_f: (value: T) => U): Result<U, E> {
    return Fail(this.error);
  }

  mapErr<F>(f: (error: E) => F): Result<T, F> {
    return Fail(f(this.error));
  }

  mapOr<U>(defaultValue: U, _f: (value: T) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: (error: E) => U, _f: (value: T) => U): U {
    return defaultFn(this.error);
  }

  flatMap<U>(_f: (value: T) => Result<U, E>): Result<U, E> {
    return Fail(this.error);
  }

  and<U>(_res: Result<U, E>): Result<U, E> {
    return Fail(this.error);
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return res;
  }

  orElse<F>(f: (error: E) => Result<T, F>): Result<T, F> {
    return f(this.error);
  }

  inspect(_f: (value: T) => void): Result<T, E> {
    return this;
  }

  inspectErr(f: (error: E) => void): Result<T, E> {
    f(this.error);
    return this;
  }

  match<U>(patterns: { Ok: (value: T) => U; Err: (error: E) => U }): U {
    return patterns.Err(this.error);
  }

  toString(): string {
    return `Err(${this.error})`;
  }
}

/**
 * Creates a successful `Result` containing a value.
 * @param value - The success value to wrap.
 *
 * @example
 * ```ts
 * const res = Ok(42);
 * res.unwrap(); // 42
 * ```
 */
export function Ok<T, E = string>(value: T): Result<T, E> {
  return new OkResult(value);
}

/**
 * Creates a failed `Result` containing an error.
 * @param error - The error value to wrap.
 *
 * @example
 * ```ts
 * const res = Fail('not found');
 * res.unwrapErr(); // 'not found'
 * ```
 */
export function Fail<T = never, E = string>(error: E): Result<T, E> {
  return new ErrResult(error);
}
