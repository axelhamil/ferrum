# Ferrum

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
Clean Architecture with strict one-way dependency flow:
- `src/domain/` - Pure types, errors, contracts (no imports from other layers)
- `src/infrastructure/` - Concrete implementations (imports only from domain)
- `src/application/` - Orchestration (imports from domain + infrastructure)
- `src/index.ts` - Public API barrel export

## Code Style
- ESM only (`"type": "module"`)
- Biome for lint + format (single quotes, 2-space indent, 100-char lines, trailing commas, semicolons)
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Interfaces: `IPascalCase` for contracts
- Internal imports use `.js` extension
- Tests import from `../src/index.js` (public API)
- Conventional Commits for semantic-release
