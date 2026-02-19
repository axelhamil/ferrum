# Ferrum

Rust's Option and Result primitives for TypeScript. Zero dependencies, 100% test coverage.

## Commands

- Build: `pnpm build`
- Test all: `pnpm test`
- Test single: `pnpm vitest run tests/<name>.test.ts`
- Test watch: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- Lint: `pnpm lint`
- Lint fix: `pnpm lint:fix`
- Typecheck: `pnpm typecheck`

## Architecture

```
src/
  option.ts   Option<T> abstract class + SomeOption/NoneOption internal classes + Some()/None() factories
  result.ts   Result<T, E> abstract class + OkResult/ErrResult internal classes + Ok()/Fail() factories
  match.ts    Standalone match() with overloads for Option and Result
  index.ts    Barrel export (public API surface)

tests/
  option.test.ts   56 tests covering all Option methods
  result.test.ts   56 tests covering all Result methods
```

### Design Decisions

- **Abstract class + internal subclasses**: `Option<T>` and `Result<T, E>` are abstract classes. Concrete implementations (`SomeOption`, `NoneOption`, `OkResult`, `ErrResult`) are NOT exported — only factory functions are public.
- **Factory functions over constructors**: `Some()`, `None()`, `Ok()`, `Fail()` — not `new`. `Fail` is used instead of `Err` to avoid conflict with JavaScript's native `Error`.
- **Static utilities on abstract classes**: `Option.fromNullable()`, `Result.fromThrowable()`, `Result.combine()` live on the abstract class since they are constructors-of-sorts.
- **Consistent method ordering**: type checks > extraction > transformation > combination > side effects > match > conversion.

## Code Style

- ESM only (`"type": "module"`)
- Biome for lint + format (single quotes, 2-space indent, 100-char lines, trailing commas, semicolons)
- Files: `kebab-case.ts`
- Classes: `PascalCase`, functions: `PascalCase` for factories, `camelCase` for methods
- Internal imports use `.js` extension (ESM convention — TS doesn't rewrite import paths)
- Tests import from `../src/index.js` (public API only, never internal classes)
- Conventional Commits for semantic-release

## Testing

- Vitest with V8 coverage
- 90% threshold for statements, branches, functions, lines
- Current coverage: 100% across all files
- Tests are organized by type (Some/None, Ok/Err) then by method category
