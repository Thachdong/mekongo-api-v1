# Project Constitution (Technical)

> File này chỉ chứa quy ước KỸ THUẬT/KIẾN TRÚC. KHÔNG chứa business rule của bất kỳ
> feature/module cụ thể nào. Mọi skill trong `.claude/skills/` PHẢI đọc file này trước
> khi thực hiện Plan hoặc code. Chỉ skill `constitution` được phép ghi vào file này.
>
> Trạng thái: ĐÃ ĐIỀN.

## 1. Layer boundaries (Hexagonal)

- `domain/`: entity, value-object, domain-error. KHÔNG import bất kỳ package ngoài
  nào (không ORM decorator, không HTTP, không framework NestJS decorator).
- `application/`: use-case, port (interface), DI token. KHÔNG import trực tiếp SDK/
  package ngoài (phải qua adapter đã implement port). KHÔNG chứa logic transport
  (HTTP, validation request).
- `infrastructure/`: controller, DTO, adapter (implement port), TypeORM entity/
  repository, gọi external package đã được wrap ở `shared/`.
- `shared/`: nơi duy nhất được phép import trực tiếp SDK/package ngoài (typeorm,
  swagger, redis client, http client...).
- `configs/`: cấu hình env, không chứa business logic.

## 2. Import rules giữa module

- Module A KHÔNG được import thẳng file `application/` hoặc `domain/` nội bộ của
  module B.
- Module A CHỈ được import qua `modules/<B>/public-api.ts` (token + interface +
  type), không bao giờ import class implementation.
- `public-api.ts` chỉ tồn tại ở module nào thực sự có use-case cần export ra ngoài.

## 3. Cross-module composition

- Mặc định: KHÔNG dùng facade pattern. Consumer module tự inject token của use-case
  cần dùng qua `public-api.ts`.
- Facade chỉ dùng khi cần compose ≥ 2 use-case thành 1 lời gọi và có lý do rõ ràng
  ghi lại trong Plan.

## 4. Naming convention

- File: kebab-case, hậu tố theo vai trò:
  - Entity: `<name>.entity.ts` (vd `account.entity.ts`)
  - Value object / enum: `<name>.enum.ts` hoặc `<name>.vo.ts`
  - Domain error: `<name>.error.ts`
  - Port (interface): `<name>-repository.interface.ts`, `<name>-use-case.interface.ts`
  - DI token file: `<module>-application.tokens.ts`
  - Use-case impl: `<name>.use-case.ts`
  - Adapter (TypeORM repository): `<name>.repository.ts`
  - TypeORM entity: `<name>.typeorm-entity.ts` (trong `infrastructure/typeorm/entities/`)
  - Mapper (domain <-> typeorm entity): `<name>.mapper.ts` (trong `infrastructure/typeorm/mappers/`)
  - Controller: `<module>.controller.ts`
  - Request/response DTO: `<action>-request.dto.ts` / `<action>-response.dto.ts` (trong `infrastructure/http/dto/`)
  - Swagger doc decorator: `<action>.doc.ts` (trong `infrastructure/http/docs/`, do skill `doc` ghi)
  - Module wiring: `<module>.module.ts`
- Class: PascalCase. Use-case impl = tên use-case + hậu tố `UseCase`
  (vd `RegisterAccountUseCase`). Entity không hậu tố (vd `Account`, `Address`).
- Interface: prefix `I` (vd `IAccountRepository`, `IRegisterAccountUseCase`).
- Type alias: prefix `T` (vd `TRegisterAccountInput`, `TAccountLoginType`).
- DI token: `SCREAMING_SNAKE_CASE`, khai báo dạng `Symbol('TÊN')`, đặt chung trong
  `<module>-application.tokens.ts`. Hậu tố `_REPOSITORY` cho port repository,
  `_USECASE` cho port use-case (vd `ACCOUNT_REPOSITORY`, `REGISTER_ACCOUNT_USECASE`).
- Private class member: prefix `_` (vd `private readonly _accountRepository`).

## 5. Folder structure chuẩn 1 module

```
modules/<name>/
├── domain/
│   ├── errors/
│   ├── value-objects/
│   └── <entity>.entity.ts
├── application/
│   ├── ports/
│   │   ├── <module>-application.tokens.ts
│   │   ├── <name>-repository.interface.ts
│   │   └── <name>-use-case.interface.ts
│   ├── use-cases/
│   │   └── <name>.use-case.ts
│   └── public-api.ts        (chỉ có nếu export)
├── infrastructure/
│   ├── http/
│   │   ├── <module>.controller.ts
│   │   ├── dto/
│   │   │   └── <action>-request.dto.ts
│   │   └── docs/
│   │       └── <action>.doc.ts    (do skill `doc` ghi)
│   └── typeorm/
│       ├── entities/
│       │   └── <name>.typeorm-entity.ts
│       ├── mappers/
│       │   └── <name>.mapper.ts
│       └── <name>.repository.ts
└── <name>.module.ts
```

## 5.1 File dùng chung — mọi skill đều được sửa

- `main.ts`
- `app.module.ts`
- `modules/<name>/<name>.module.ts`
- `modules/<name>/application/public-api.ts` (composition/export point)

## 6. Error convention

- Domain error: throw trong `domain/` hoặc `application/`, extend base
  `DomainError` (định nghĩa tại `shared/kernel/errors/domain-error.ts`).
- Global exception filter: mapping domain error → HTTP status. File:
  `src/shared/common/filters/global-exception.filter.ts` (đăng ký global qua
  `APP_FILTER` trong `app.module.ts`). Filter bắt `HttpException` (Nest built-in),
  `DomainError` (custom, đọc `.status`/`.code`/`.message`/`.extra`), và fallback
  500 cho exception không xác định.
- Nếu 1 domain error mới chưa có mapping trong global filter → BẮT BUỘC flag ra,
  không được tự đoán status code.

## 7. DTO / validation / response convention

- Validation: `class-validator` + `class-transformer`, áp qua global `ValidationPipe`
  (`APP_PIPE` trong `app.module.ts`) với `whitelist: true`, `forbidNonWhitelisted: true`,
  `transform: true`, `transformOptions: { enableImplicitConversion: true }`.
- Response envelope: global `ResponseInterceptor`
  (`src/shared/common/interceptors/response.interceptor.ts`, đăng ký qua
  `APP_INTERCEPTOR`) tự bọc mọi response thành công thành `{ data, meta? }`.
  Controller method chỉ cần return data thô (hoặc `{ data, meta }` nếu cần phân
  trang/meta), không tự bọc envelope thủ công.
- Response type: `TResponse<T>` tại `src/shared/common/http/response.type.ts`.
- DTO request: đặt trong `infrastructure/http/dto/`, decorate bằng
  `class-validator`, map thủ công sang `T<UseCase>Input` trong controller
  (không dùng mapper tự động DTO -> input type).
- Error response (do `GlobalExceptionFilter` trả, không qua `ResponseInterceptor`):
  `{ statusCode, code?, message, extra? }`.

## 8. Tech stack cố định & external package policy

- ORM: TypeORM (`@nestjs/typeorm` + `typeorm`, driver `pg`).
- Validation: `class-validator` + `class-transformer`.
- Config: `@nestjs/config` + `joi` (validationSchema), load theo file
  `src/configs/<name>.config.ts`, mỗi domain config 1 file
  (`app.config.ts`, `db.config.ts`, `jwt.config.ts`, `firebase.config.ts`,
  `logger.config.ts`, `otp.config.ts`).
- Logger: `nestjs-pino` (`pino` + `pino-http` + `pino-pretty` dev).
- Auth: `@nestjs/passport` + `passport-jwt` + `@nestjs/jwt`.
- API doc: `@nestjs/swagger` + `swagger-ui-express`.
- QUY TẮC: mọi package ngoài phải được wrap ở `shared/` trước khi dùng ở nơi khác
  (xem skill `external-package`).

## 9. Test convention

- Test file: `*.spec.ts` đặt cạnh file gốc (Jest convention, `rootDir: src`,
  `testRegex: .*\.spec\.ts$`).
- Bắt buộc: mỗi use-case (application layer) phải có `<name>.use-case.spec.ts`
  cạnh `<name>.use-case.ts`, mock port qua interface.
- Domain entity/value-object: viết test khi có rule/logic phức tạp (không bắt
  buộc 100%, tuỳ leaf-case cụ thể).
- Không bắt buộc e2e/controller test (test/ dùng cho e2e khi cần, không phải
  default).
- Coverage: không set `coverageThreshold` cứng trong jest config, review bằng
  tay theo PR.

## 10. Domain method/error policy

- Entity/domain-error chỉ được tạo phục vụ trực tiếp use-case đang implement trong
  chunk hiện tại (YAGNI). Không suy đoán method cho tương lai.
- Method/error mới ngoài baseline dev cung cấp PHẢI qua bước suggest + confirm
  (xem skill `domain`).
