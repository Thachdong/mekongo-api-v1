# Plan: Set current address cho account

## Mô tả
Endpoint `PUT account/set-current-address` cho phép account tự chọn 1 address
(trong sổ địa chỉ của mình) làm `currentAddressId`.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Account`
  (`src/modules/account/domain/account.entity.ts`) đã có sẵn field
  `currentAddressId` và method `changeCurrentAddressId(addressId)`. Tái dùng,
  không sửa method này (đã đúng behaviour cần).
- Domain-error nghi trùng lặp: KHÔNG có error nào cho "address not found/not
  owned". Cần tạo mới `AddressNotFoundError` (404) — dùng chung cho cả 2 case
  (address không tồn tại HOẶC tồn tại nhưng không thuộc account đang gọi) để
  tránh leak thông tin address của account khác.
- Use-case/port nghi trùng lặp: KHÔNG có — `IAddressRepository` hiện có
  `create()`, `findAllByAccountId()`. Cần thêm `findById()`.
  `IAccountRepository.update()` đã có sẵn, tái dùng.
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ (TypeORM), KHÔNG cần `external-package`.
- Global exception filter: generic, tự đọc `.status`/`.code` từ `DomainError` —
  KHÔNG cần sửa filter khi thêm domain-error mới.

### Điểm cần dev xác nhận trước khi code (domain mini-gate)
1. Tạo `AddressNotFoundError extends DomainError` — `('ADDRESS_NOT_FOUND', 404,
   'Address not found')`, đặt tại
   `src/modules/account/domain/errors/address-not-found.error.ts`. Đồng ý?
2. Use-case sẽ throw error này cho CẢ 2 case (address không tồn tại / address
   thuộc account khác) — không phân biệt 403 riêng, để không leak sự tồn tại
   của address người khác. Đồng ý cách này, hay muốn tách riêng lỗi 403 khi
   address tồn tại nhưng không phải của account đang gọi?

## Chunk tree

### Chunk 1: Set current address (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Account` (không sửa entity), tái dùng `Address`
- Steps (atomic skill theo thứ tự):
  1. domain — tạo `AddressNotFoundError` (404) tại `domain/errors/` (mini-gate
     xác nhận với dev theo 2 điểm ở trên).
  2. infrastructure (adapter) — thêm `findById(id: string): Promise<Address | null>`
     vào `IAddressRepository` (`application/ports/address-repository.interface.ts`)
     và implement trong `TypeOrmAddressRepository`.
  3. use-case — tạo `SetCurrentAddressUseCase`
     (`application/use-cases/set-current-address.use-case.ts`) + port
     `ISetCurrentAddressUseCase`
     (`application/ports/set-current-address-use-case.interface.ts`), token
     `SET_CURRENT_ADDRESS_USECASE`. Input: `{ accountId, addressId }`. Logic:
     `addressRepository.findById(addressId)` → nếu null hoặc
     `address.accountId !== accountId` → throw `AddressNotFoundError`; load
     account qua `accountRepository.findById(accountId)` →
     `account.changeCurrentAddressId(addressId)` →
     `accountRepository.update(account)`.
     **[Điều chỉnh sau code review]**: ban đầu bỏ sót guard `if (!account)`
     trước khi gọi `account.changeCurrentAddressId()` — `findById` trả
     `Account | null` nên gọi method trên `null` sẽ crash runtime dù hiếm khi
     xảy ra (accountId lấy từ JWT). Đã thêm throw `AccountNotFoundError`
     (tái dùng error có sẵn, không tạo mới) khi `!account`. Doc (bước 5) cập
     nhật theo: response 404 giờ có 2 code `ADDRESS_NOT_FOUND` |
     `ACCOUNT_NOT_FOUND`.
  4. infrastructure (endpoint) — `PUT account/set-current-address` trong
     `AccountController`, DTO mới `SetCurrentAddressRequestDto`
     (`infrastructure/http/dto/set-current-address-request.dto.ts`) với field
     `addressId: string` (`@IsUUID()`, `@IsNotEmpty()`). Response: trả `null`
     (theo pattern `changePassword`/`updateProfile`).
  5. doc — `set-current-address.doc.ts` (swagger: 200 null, 400 validate
     addressId, 401 chưa auth, 404 `ADDRESS_NOT_FOUND`, 500).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
</content>
