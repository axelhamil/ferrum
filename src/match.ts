import type { Option } from './option.js';
import type { Result } from './result.js';

/**
 * Standalone pattern matching for `Option`.
 * @param value - The `Option` to match on.
 * @param patterns - Object with `Some` and `None` handlers.
 */
export function match<T, U>(
  value: Option<T>,
  patterns: { Some: (value: T) => U; None: () => U },
): U;
/**
 * Standalone pattern matching for `Result`.
 * @param value - The `Result` to match on.
 * @param patterns - Object with `Ok` and `Err` handlers.
 */
export function match<T, E, U>(
  value: Result<T, E>,
  patterns: { Ok: (value: T) => U; Err: (error: E) => U },
): U;
export function match(
  value: Option<unknown> | Result<unknown, unknown>,
  patterns: unknown,
): unknown {
  return value.match(patterns as never);
}
