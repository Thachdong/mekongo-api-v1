# Plan: Tạo profile cho account

## Mô tả
Endpoint `POST account/profile` cho phép account đang đăng nhập tạo mới 1
profile (`profileType`: `INDIVIDUAL` | `DISTRIBUTOR` | `FACTORY`), giới hạn tối
đa 3 profile/account và không cho trùng loại, trả về profile vừa tạo.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Profile`
  (`src/modules/account/domain/profile.entity.ts`) đã đủ field cần
  (`id`, `activeProfile` [= profile type], `accountId`, `createdAt`,
  `updatedAt`). Hiện chỉ được tạo bên trong `RegisterAccountUseCase` lúc đăng
  ký (luôn tạo đúng 1 profile). Tái dùng entity, không sửa.
  - Field `activeProfile` trên `Profile` là kiểu profile (`TProfileType`) của
    chính row đó — KHÔNG phải cờ "đang active" — tên hơi gây nhầm nhưng đã có
    sẵn, không đổi tên trong chunk này (out of scope).
- Use-case/port nghi trùng lặp: KHÔNG có use-case tạo profile độc lập.
  `IProfileRepository` (`application/ports/profile-repository.interface.ts`)
  hiện chỉ có `create()` — THIẾU method đọc để check giới hạn/trùng lặp. Cần
  thêm `findAllByAccountId(accountId): Promise<Profile[]>` (theo đúng pattern
  `IAddressRepository.findAllByAccountId`).
- Domain-error nghi thiếu: cần 2 error mới —
  `MaxProfileLimitReachedError` (vượt quá 3 profile/account, status 422),
  `DuplicateProfileTypeError` (đã có profile cùng `profileType`, status 409).
  (Đã dev xác nhận status code.)
- Response DTO: chưa có `ProfileResponseDto`, cần tạo mới
  (`infrastructure/http/dto/profile-response.dto.ts`).
- Module liên quan: `account` (đã tồn tại, tái dùng). Không cross-module,
  không cần export qua `public-api.ts`.
- Package cần thiết: đã có đủ (TypeORM), KHÔNG cần `external-package`.

## Chunk tree

### Chunk 1: Create profile (module: account)
- status: done
- Entity: tái dùng `Profile` (không sửa entity/props)
- Steps (atomic skill theo thứ tự):
  1. domain — thêm 2 domain-error mới:
     - `MaxProfileLimitReachedError` (`domain/errors/max-profile-limit-reached.error.ts`)
     - `DuplicateProfileTypeError` (`domain/errors/duplicate-profile-type.error.ts`)
     (theo mẫu `AddressNotFoundError` — extends `DomainError`, có code +
     HTTP status riêng).
  2. infrastructure (adapter) — thêm method `findAllByAccountId(accountId)`
     vào `IProfileRepository` + implement trong `TypeOrmProfileRepository`
     (dùng `ProfileMapper.toDomain`, giống `TypeOrmAddressRepository.findAllByAccountId`).
  3. use-case — `CreateProfileUseCase`
     (`application/use-cases/profile/create-profile.use-case.ts`) + port
     `ICreateProfileUseCase`
     (`application/ports/profile/create-profile-use-case.interface.ts`), token
     `CREATE_PROFILE_USECASE`. Input: `{ accountId, profileType }`. Output:
     `Profile`. Logic: `findAllByAccountId(accountId)` → nếu `length >= 3`
     ném `MaxProfileLimitReachedError`; nếu tồn tại profile cùng
     `profileType` ném `DuplicateProfileTypeError`; ngược lại
     `profileRepository.create(new Profile({ id: null, activeProfile:
     profileType, accountId, createdAt: null, updatedAt: null }))`.
  4. infrastructure (endpoint) — `POST account/profile` trong
     `AccountController` (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ
     `CurrentUser`, `HttpStatus.CREATED`). Request DTO mới
     `CreateProfileRequestDto` (`infrastructure/http/dto/create-profile-request.dto.ts`)
     — field `profileType` (`@IsIn(['INDIVIDUAL','DISTRIBUTOR','FACTORY'])`).
     Response DTO mới `ProfileResponseDto` — field `id`, `profileType`
     (map từ `activeProfile`), `accountId`, `createdAt`, `updatedAt`.
  5. doc — `create-profile.doc.ts` (swagger: 201 tạo thành công, 400
     validate body, 401 chưa auth, 409/422 cho `MaxProfileLimitReachedError`
     + `DuplicateProfileTypeError` tuỳ status code gán ở bước domain, 500).
- Integrate into: không có module khác consume (self-service endpoint),
  không cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end
  (không cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
- Approved by: dev (2026-09-03)
</content>
