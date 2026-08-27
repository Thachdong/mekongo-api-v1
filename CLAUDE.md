# Project Instructions

NestJS API, Hexagonal Architecture, modular monolith.

## Architecture

Each business module (`src/modules/<name>/`) split 3 layers:

- **domain/** — entities, value objects, domain services, repository interfaces (ports). Zero framework deps, zero infra deps. No NestJS decorators here except where unavoidable for DI tokens.
- **application/** — use cases / application services. Orchestrate domain, depend on domain ports (interfaces) only, never on infrastructure implementations directly.
- **infrastructure/** — adapters: DB repositories, external API clients, framework glue (controllers, NestJS providers). Implements domain ports. Wired into module's `*.module.ts` via DI token binding (`provide: <IPort>, useClass: <Adapter>`).

Dependency direction always: `infrastructure -> application -> domain`. Domain never imports from application or infrastructure. Application never imports concrete infrastructure classes, only domain interfaces.

`src/shared/`:
- **kernel/** — cross-module domain primitives (base entity, value object base, result/either type, domain error base). No module-specific logic.
- **common/** — cross-cutting app-layer utilities (decorators, pipes, guards, filters) usable by any module.
- **infrastructure/** — shared infra (base repository, DB connection, external service clients) reusable across modules.

Modules talk to each other through exported application services / interfaces only — never reach into another module's domain or infrastructure internals directly.

## Naming Convention

- Private class members prefixed `_`: `private _username`, `private _age`.
- Type aliases prefixed `T`: `TUser`, `TCreateAccountPayload`.
- Interfaces prefixed `I`: `IUserRepository`, `IAuthService`.
