# ferrum

Rust's `Option` and `Result` for TypeScript. Fully typed, tested, zero dependencies.

```bash
pnpm add ferrum
```

## Why

TypeScript lacks a standard way to represent optional values and fallible operations without `null`, `undefined`, or `try/catch`. Ferrum brings Rust's algebraic types to TypeScript with an idiomatic API and complete type safety.

- **Option\<T\>** replaces `T | null | undefined`
- **Result\<T, E\>** replaces `try/catch` and `{ data, error }` patterns
- **match()** provides exhaustive pattern matching for both types
- 100% test coverage, 112 tests, zero runtime dependencies

## Usage

### Option

```typescript
import { Some, None, Option } from 'ferrum';

const name = Some('Alice');
const empty = None<string>();

// Transform
const upper = name.map((n) => n.toUpperCase()); // Some("ALICE")

// Chain
const first = name.flatMap((n) => (n.length > 0 ? Some(n[0]) : None()));

// Extract
const value = empty.unwrapOr('default'); // "default"

// Pattern match
name.match({
  Some: (n) => console.log(`Hello, ${n}`),
  None: () => console.log('No name'),
});

// Convert from nullable
const opt = Option.fromNullable(document.getElementById('app'));
```

#### Option API

| Method | Description |
|---|---|
| `isSome()` | Returns `true` if the option contains a value |
| `isNone()` | Returns `true` if the option is empty |
| `unwrap()` | Returns the value or throws |
| `expect(msg)` | Returns the value or throws with a custom message |
| `unwrapOr(default)` | Returns the value or a default |
| `unwrapOrElse(fn)` | Returns the value or computes a default |
| `map(fn)` | Transforms the inner value |
| `flatMap(fn)` | Transforms and flattens `Option<Option<U>>` |
| `filter(predicate)` | Returns `None` if the predicate fails |
| `and(other)` | Returns `other` if both are `Some`, otherwise `None` |
| `or(other)` | Returns `self` if `Some`, otherwise `other` |
| `orElse(fn)` | Returns `self` if `Some`, otherwise calls `fn` |
| `xor(other)` | Returns `Some` if exactly one is `Some` |
| `zip(other)` | Combines two `Some` values into a tuple |
| `inspect(fn)` | Calls `fn` on the value without consuming it |
| `match({ Some, None })` | Exhaustive pattern matching |
| `toUndefined()` | Converts to `T \| undefined` |
| `toNull()` | Converts to `T \| null` |
| `Option.fromNullable(v)` | Creates `Some(v)` or `None` from a nullable value |

### Result

```typescript
import { Ok, Fail, Result } from 'ferrum';

const success = Ok(42);
const failure = Fail('something went wrong');

// Transform
const doubled = success.map((n) => n * 2); // Ok(84)

// Chain
const parsed = Ok('42').flatMap((s) => {
  const n = Number(s);
  return Number.isNaN(n) ? Fail('not a number') : Ok(n);
});

// Extract
const value = failure.unwrapOr(0); // 0

// Pattern match
parsed.match({
  Ok: (n) => console.log(`Parsed: ${n}`),
  Err: (e) => console.error(`Error: ${e}`),
});

// Catch exceptions
const result = Result.fromThrowable(() => JSON.parse(input));

// Combine multiple results
const combined = Result.combine([Ok(1), Ok(2), Ok(3)]); // Ok([1, 2, 3])
```

#### Result API

| Method | Description |
|---|---|
| `isOk()` | Returns `true` if the result is `Ok` |
| `isErr()` | Returns `true` if the result is `Err` |
| `unwrap()` | Returns the value or throws |
| `unwrapErr()` | Returns the error or throws |
| `expect(msg)` | Returns the value or throws with a custom message |
| `expectErr(msg)` | Returns the error or throws with a custom message |
| `unwrapOr(default)` | Returns the value or a default |
| `unwrapOrElse(fn)` | Returns the value or computes from the error |
| `map(fn)` | Transforms the `Ok` value |
| `mapErr(fn)` | Transforms the `Err` value |
| `mapOr(default, fn)` | Transforms `Ok` or returns a default |
| `mapOrElse(errFn, okFn)` | Transforms both branches |
| `flatMap(fn)` | Transforms and flattens `Result<Result<U, E>, E>` |
| `and(other)` | Returns `other` if both are `Ok`, otherwise the first `Err` |
| `or(other)` | Returns `self` if `Ok`, otherwise `other` |
| `orElse(fn)` | Returns `self` if `Ok`, otherwise calls `fn` with the error |
| `inspect(fn)` | Calls `fn` on the `Ok` value without consuming it |
| `inspectErr(fn)` | Calls `fn` on the `Err` value without consuming it |
| `match({ Ok, Err })` | Exhaustive pattern matching |
| `Result.fromThrowable(fn)` | Wraps a throwing function into `Result<T, Error>` |
| `Result.combine(results)` | Collects an array of results into `Result<T[], E>` |

### Standalone match

```typescript
import { match, Some, Ok } from 'ferrum';

// Works with both Option and Result
const msg = match(Some(42), {
  Some: (v) => `got ${v}`,
  None: () => 'nothing',
});

const status = match(Ok(200), {
  Ok: (code) => `status ${code}`,
  Err: (e) => `failed: ${e}`,
});
```

## Compatibility

- Node.js >= 20
- TypeScript >= 5.0
- ESM only

## License

MIT
