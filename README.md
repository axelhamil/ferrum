# galvorn

Rust's `Option` and `Result` for TypeScript. Fully typed, tested, zero dependencies.

[![NPM Version](https://img.shields.io/npm/v/galvorn)](https://www.npmjs.com/package/galvorn)
[![CI](https://img.shields.io/github/actions/workflow/status/axelhamil/galvorn/release.yml)](https://github.com/axelhamil/galvorn/actions)
[![Bundle size](https://deno.bundlejs.com/badge?q=galvorn&treeshake=[*])](https://bundlejs.com/?q=galvorn&treeshake=[*])
[![NPM Downloads](https://img.shields.io/npm/dm/galvorn)](https://npmtrends.com/galvorn)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/galvorn)](https://github.com/axelhamil/galvorn/blob/main/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/galvorn)

## Install

```bash
pnpm add galvorn  # or npm i galvorn
```

## Quick Start

```typescript
import { Some, None, Ok, Fail, match } from 'galvorn';

const user = Some('Alice');
const greeting = user.map((n) => `Hello, ${n}`).unwrapOr('Hello, stranger');

const parsed = Ok('42').flatMap((s) => {
  const n = Number(s);
  return Number.isNaN(n) ? Fail('NaN') : Ok(n);
});

match(parsed, {
  Ok: (n) => console.log(`Parsed: ${n}`),
  Err: (e) => console.error(`Failed: ${e}`),
});
```

## Why

TypeScript lacks a standard way to represent optional values and fallible operations without `null`, `undefined`, or `try/catch`. Galvorn brings Rust's algebraic types to TypeScript with an idiomatic API and complete type safety.

- **Option\<T\>** replaces `T | null | undefined` — no more `if (x !== null && x !== undefined)`
- **Result\<T, E\>** replaces `try/catch` and `{ data, error }` patterns — errors are values, not exceptions
- **match()** provides exhaustive pattern matching for both types — standalone or method
- **100% test coverage**, 112 tests, zero runtime dependencies

## Features

### Option — Safe Nullable Handling

```typescript
import { Some, None, Option } from 'galvorn';

const name = Some('Alice');
const empty = None<string>();

// Transform
const upper = name.map((n) => n.toUpperCase()); // Some("ALICE")

// Chain
const first = name.flatMap((n) => (n.length > 0 ? Some(n[0]) : None()));

// Extract with default
const value = empty.unwrapOr('default'); // "default"

// Pattern match
name.match({
  Some: (n) => console.log(`Hello, ${n}`),
  None: () => console.log('No name'),
});

// Convert from nullable
const opt = Option.fromNullable(document.getElementById('app'));
```

### Result — Error as Values

```typescript
import { Ok, Fail, Result } from 'galvorn';

const success = Ok(42);
const failure = Fail('something went wrong');

// Transform
const doubled = success.map((n) => n * 2); // Ok(84)

// Chain
const parsed = Ok('42').flatMap((s) => {
  const n = Number(s);
  return Number.isNaN(n) ? Fail('not a number') : Ok(n);
});

// Extract with default
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

### Standalone match

Works with both `Option` and `Result` — useful for pipelines and functional composition:

```typescript
import { match, Some, Ok } from 'galvorn';

const msg = match(Some(42), {
  Some: (v) => `got ${v}`,
  None: () => 'nothing',
});

const status = match(Ok(200), {
  Ok: (code) => `status ${code}`,
  Err: (e) => `failed: ${e}`,
});
```

## Examples

| Example | Run | Showcases |
|---|---|---|
| [option-basics.ts](examples/option-basics.ts) | `npx tsx examples/option-basics.ts` | Some/None, map, flatMap, filter, unwrapOr |
| [result-basics.ts](examples/result-basics.ts) | `npx tsx examples/result-basics.ts` | Ok/Fail, fromThrowable, combine, mapErr |
| [real-world.ts](examples/real-world.ts) | `npx tsx examples/real-world.ts` | Option + Result in realistic scenarios |

## Architecture

```
src/
  index.ts     # public barrel — only file consumers import
  option.ts    # Option<T> abstract class + SomeOption/NoneOption + Some()/None() factories
  result.ts    # Result<T, E> abstract class + OkResult/ErrResult + Ok()/Fail() factories
  match.ts     # Standalone match() with overloads for Option and Result
```

Internal classes (`SomeOption`, `NoneOption`, `OkResult`, `ErrResult`) are NOT exported. Only factory functions and abstract types are public — this keeps the API surface minimal and prevents `instanceof` checks against internals.

## LLM / AI Integration

This package ships with [llms.txt](https://llmstxt.org/) files for AI-assisted development:

- **`llms.txt`** — Concise index following the llms.txt standard
- **`llms-full.txt`** — Complete API reference optimized for LLM context windows

Compatible with [Context7](https://context7.com/) and any tool that supports the llms.txt standard.

## API Reference

### Factory Functions

| Export | Description |
|---|---|
| `Some(value)` | Creates an `Option` containing a value |
| `None<T>()` | Creates an empty `Option` |
| `Ok(value)` | Creates a successful `Result` |
| `Fail(error)` | Creates a failed `Result` |
| `match(value, patterns)` | Standalone pattern matching for `Option` or `Result` |

### Option Methods

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

### Option Static Methods

| Method | Description |
|---|---|
| `Option.fromNullable(value)` | Creates `Some(v)` or `None` from a nullable value |

### Result Methods

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

### Result Static Methods

| Method | Description |
|---|---|
| `Result.fromThrowable(fn)` | Wraps a throwing function into `Result<T, Error>` |
| `Result.combine(results)` | Collects an array of results into `Result<T[], E>` |

### Types

| Export | Description |
|---|---|
| `Option<T>` | Abstract class for optional values |
| `Result<T, E>` | Abstract class for fallible operations (E defaults to `string`) |

## Compatibility

- Node.js >= 20
- TypeScript >= 5.0
- ESM only

## License

MIT
