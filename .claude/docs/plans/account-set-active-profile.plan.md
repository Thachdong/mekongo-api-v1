# Plan: Set active profile cho account

## Mô tả
Endpoint `PUT account/set-active-profile` cho phép account đang đăng nhập đổi
`activeProfileId` sang 1 profile khác thuộc chính account đó (check tồn tại +
check ownership trước khi update).

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Profile` và `Account`
  (`Account.changeActiveProfileId()` đã có sẵn từ trước) tái dùng nguyên
  trạng, không sửa entity.
- Use-case/port nghi trùng lặp: KHÔNG có use-case set active profile. Pattern
  tham chiếu 1-1: `SetCurrentAddressUseCase`
  (`application/use-cases/address/set-current-address.use-case.ts`) — check
  `!entity || entity.accountId !== accountId` gộp exist + owner thành 1
  `NotFoundError`, rồi load account, gọi setter, `accountRepository.update()`.
  `IProfileRepository` hiện THIẾU `findById()` (giống
  `IAddressRepository.findById`) — cần thêm.
- Domain-error nghi thiếu: cần 1 error mới `ProfileNotFoundError` (404) —
  dùng chung cho cả trường hợp không tồn tại lẫn không thuộc account (đúng
  convention của `AddressNotFoundError`, không tách riêng lỗi "not owner").
- Response DTO: không cần (response `null`), tái dùng convention của
  `SetCurrentAddressDoc`.
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ, KHÔNG cần `external-package`.

## Chunk tree

### Chunk 1: Set active profile (module: account)
- status: done
- Entity: tái dùng `Profile`, `Account` (không sửa props/method có sẵn,
  `changeActiveProfileId` đã tồn tại)
- Steps (atomic skill theo thứ tự):
  1. domain — thêm domain-error mới `ProfileNotFoundError`
     (`domain/errors/profile-not-found.error.ts`, theo mẫu
     `AddressNotFoundError` — code `PROFILE_NOT_FOUND`, status 404).
  2. infrastructure (adapter) — thêm method `findById(id)` vào
     `IProfileRepository` + implement trong `TypeOrmProfileRepository`
     (dùng `ProfileMapper.toDomain`, giống
     `TypeOrmAddressRepository.findById`).
  3. use-case — `SetActiveProfileUseCase`
     (`application/use-cases/profile/set-active-profile.use-case.ts`) + port
     `ISetActiveProfileUseCase`
     (`application/ports/profile/set-active-profile-use-case.interface.ts`),
     token `SET_ACTIVE_PROFILE_USECASE`. Input: `{ accountId, profileId }`.
     Output: `void`. Logic: `profile = profileRepository.findById(profileId)`
     → nếu `!profile || profile.accountId !== accountId` ném
     `ProfileNotFoundError`; `account = accountRepository.findById(accountId)`
     → nếu `!account` ném `AccountNotFoundError` (tái dùng error có sẵn);
     `account.changeActiveProfileId(profileId)`; `accountRepository.update(account)`.
  4. infrastructure (endpoint) — `PUT account/set-active-profile` trong
     `AccountController` (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ
     `CurrentUser`, `HttpStatus.OK`, trả `null`). Request DTO mới
     `SetActiveProfileRequestDto`
     (`infrastructure/http/dto/set-active-profile-request.dto.ts`) — field
     `profileId` (`@IsUUID @IsNotEmpty`, theo mẫu
     `SetCurrentAddressRequestDto`).
  5. doc — `set-active-profile.doc.ts` (swagger: 200 null, 400 validate body,
     401 chưa auth, 404 `PROFILE_NOT_FOUND`/`ACCOUNT_NOT_FOUND`, 500 — theo
     mẫu `SetCurrentAddressDoc`).
- Integrate into: không có module khác consume (self-service endpoint),
  không cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end
  (không cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
- Approved by: dev (2026-09-03)
</content>
