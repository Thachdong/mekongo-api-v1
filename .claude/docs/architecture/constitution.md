# Project Constitution (Technical)

> File này chỉ chứa quy ước KỸ THUẬT/KIẾN TRÚC. KHÔNG chứa business rule của bất kỳ
> feature/module cụ thể nào. Mọi skill trong `.claude/skills/` PHẢI đọc file này trước
> khi thực hiện Plan hoặc code. Chỉ skill `constitution` được phép ghi vào file này.
>
> Trạng thái: CHƯA ĐIỀN — chạy skill `constitution` để phỏng vấn và điền đầy đủ.

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

<!-- Điền: naming file, class, port, adapter, DI token, DTO -->

## 5. Folder structure chuẩn 1 module

```
modules/<name>/
├── domain/
├── application/
│   ├── ports/
│   ├── use-cases/
│   └── public-api.ts        (chỉ có nếu export)
├── infrastructure/
│   ├── http/
│   │   ├── <name>.controller.ts
│   │   ├── dto/
│   │   └── <name>.decorators.ts   (do skill `doc` ghi)
│   └── adapters/
└── <name>.module.ts
```

## 5.1 File dùng chung — mọi skill đều được sửa

- `main.ts`
- `app.module.ts`
- `modules/<name>/<name>.module.ts`
- `modules/<name>/application/public-api.ts` (composition/export point)

## 6. Error convention

- Domain error: throw trong `domain/` hoặc `application/`, extend base
  `DomainError` (định nghĩa trong `shared/errors/`).
- Global exception filter: mapping domain error → HTTP status (đọc tại
  `<đường dẫn global filter>` khi điền).
- Nếu 1 domain error mới chưa có mapping trong global filter → BẮT BUỘC flag ra,
  không được tự đoán status code.

## 7. DTO / validation / response convention

<!-- Điền: response envelope format, validation pipe dùng gì, DTO mapping rule -->

## 8. Tech stack cố định & external package policy

- ORM: <điền>
- Validation: <điền>
- Config: <điền>
- QUY TẮC: mọi package ngoài phải được wrap ở `shared/` trước khi dùng ở nơi khác
  (xem skill `external-package`).

## 9. Test convention

<!-- Điền: vị trí test file, coverage tối thiểu, cái gì bắt buộc phải test -->

## 10. Domain method/error policy

- Entity/domain-error chỉ được tạo phục vụ trực tiếp use-case đang implement trong
  chunk hiện tại (YAGNI). Không suy đoán method cho tương lai.
- Method/error mới ngoài baseline dev cung cấp PHẢI qua bước suggest + confirm
  (xem skill `domain`).
