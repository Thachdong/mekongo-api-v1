# Plan: Xoá address của account

## Mô tả
Endpoint `DELETE account/address` cho phép account đang đăng nhập xoá 1 address
trong sổ địa chỉ của mình (theo `addressId`). Nếu `addressId` đang là
`currentAddressId` của account → không cho xoá.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — tái dùng `Address`, `Account`
  (`currentAddressId` đã có sẵn). Không sửa entity.
- Domain-error nghi trùng lặp:
  - `AddressNotFoundError` (đã tạo ở chunk `account-set-current-address`) —
    tái dùng cho case address không tồn tại / không thuộc account đang gọi.
  - CHƯA có error cho case "đang là current address, không cho xoá" — cần tạo
    mới.
- Use-case/port nghi trùng lặp: KHÔNG có use-case xoá address. `IAddressRepository`
  hiện có `create()`, `findAllByAccountId()`, `findById()` — CHƯA có `delete()`,
  cần thêm.
- **Request DTO nghi trùng lặp**: `SetCurrentAddressRequestDto`
  (`infrastructure/http/dto/set-current-address-request.dto.ts`) có cùng shape
  (`addressId: string`, `@IsUUID @IsNotEmpty`). **Dev đã xác nhận (2026-09-03):
  tạo DTO riêng `DeleteAddressRequestDto`**, không tái dùng/rename DTO của
  set-current-address (giữ tách biệt theo action).
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ (TypeORM), KHÔNG cần `external-package`.
- Global exception filter: generic, tự đọc `.status`/`.code` từ `DomainError` —
  không cần sửa filter khi thêm domain-error mới.

### Domain mini-gate — dev đã xác nhận (2026-09-03)
1. Tạo `CannotDeleteCurrentAddressError extends DomainError` — code
   `CANNOT_DELETE_CURRENT_ADDRESS`, **status 409 Conflict**, message
   `Cannot delete the current address`. Đặt tại
   `src/modules/account/domain/errors/cannot-delete-current-address.error.ts`.

## Chunk tree

### Chunk 1: Delete address (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Address`, `Account` (không sửa entity)
- Steps (atomic skill theo thứ tự):
  1. domain — tạo `CannotDeleteCurrentAddressError` (409) tại `domain/errors/`
     (mini-gate xác nhận với dev theo điểm 1 ở trên).
  2. infrastructure (adapter) — thêm `delete(id: string): Promise<void>` vào
     `IAddressRepository` (`application/ports/address-repository.interface.ts`)
     và implement trong `TypeOrmAddressRepository` (dùng
     `repository.delete({ id })`).
  3. use-case — tạo `DeleteAddressUseCase`
     (`application/use-cases/delete-address.use-case.ts`) + port
     `IDeleteAddressUseCase`
     (`application/ports/delete-address-use-case.interface.ts`), token
     `DELETE_ADDRESS_USECASE`. Input: `{ accountId, addressId }`. Logic:
     `addressRepository.findById(addressId)` → nếu null hoặc
     `address.accountId !== accountId` → throw `AddressNotFoundError` (tái
     dùng); `accountRepository.findById(accountId)` → nếu null → throw
     `AccountNotFoundError` (tái dùng, theo pattern đã áp dụng ở
     `SetCurrentAddressUseCase`); nếu
     `account.currentAddressId === addressId` → throw
     `CannotDeleteCurrentAddressError`; else `addressRepository.delete(addressId)`.
  4. infrastructure (endpoint) — `DELETE account/address` trong
     `AccountController` (`@UseGuards(JwtAuthGuard)`), body
     `DeleteAddressRequestDto` (`infrastructure/http/dto/delete-address-request.dto.ts`,
     field `addressId: string` `@IsUUID @IsNotEmpty`, DTO riêng theo xác nhận
     dev). Response: trả `null`.
  5. doc — `delete-address.doc.ts` (swagger: 200 null, 400 validate addressId,
     401 chưa auth, 404 `ADDRESS_NOT_FOUND`/`ACCOUNT_NOT_FOUND`, 409
     `CANNOT_DELETE_CURRENT_ADDRESS`, 500).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
</content>
