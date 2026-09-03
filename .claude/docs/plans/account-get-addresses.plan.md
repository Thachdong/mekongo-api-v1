# Plan: Lấy danh sách address của account

## Mô tả
Endpoint `GET account/address` trả về toàn bộ address (sổ địa chỉ) của account
đang đăng nhập (self-service, lấy `accountId` từ `CurrentUser`).

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Address`
  (`src/modules/account/domain/address.entity.ts`) đã tồn tại đủ field
  (`label`, `province`, `provinceCode`, `ward`, `details`, `accountId`,
  `createdAt`, `updatedAt`). Tái dùng, không tạo entity mới, không cần domain
  step trong chunk này (không thêm method/error mới vào entity).
- Use-case/port nghi trùng lặp: KHÔNG có — `IAddressRepository` hiện chỉ có
  `create()`. Cần thêm method đọc theo `accountId` (đề xuất tên
  `findAllByAccountId`) vào port + adapter `TypeOrmAddressRepository`. Chưa có
  use-case nào lấy danh sách address.
- Module liên quan: `account` (đã tồn tại, tái dùng — không tạo module mới).
- Package cần thiết: đã có đủ ở `shared/` (TypeORM), KHÔNG cần chạy
  `external-package`.

## Chunk tree

### Chunk 1: Get account addresses (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Address` (không tạo entity mới, không có domain step)
- Steps (atomic skill theo thứ tự):
  1. infrastructure (adapter) — thêm `findAllByAccountId(accountId: string): Promise<Address[]>`
     vào `IAddressRepository`
     (`application/ports/address-repository.interface.ts`) và implement trong
     `TypeOrmAddressRepository`
     (`infrastructure/typeorm/address.repository.ts`), dùng
     `repository.find({ where: { accountId } })` rồi map qua `AddressMapper.toDomain`.
  2. use-case — tạo `GetAccountAddressesUseCase`
     (`application/use-cases/get-account-addresses.use-case.ts`) + port
     `IGetAccountAddressesUseCase`
     (`application/ports/get-account-addresses-use-case.interface.ts`), token
     `GET_ACCOUNT_ADDRESSES_USECASE`. Input: `{ accountId }`. Output:
     `Address[]`. Logic: gọi thẳng `addressRepository.findAllByAccountId(accountId)`.
  3. infrastructure (endpoint) — `GET account/address` trong `AccountController`
     (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ `CurrentUser`). Response
     DTO mới `AddressResponseDto`
     (`infrastructure/http/dto/address-response.dto.ts`) map field
     (`id`, `label`, `province`, `provinceCode`, `ward`, `details`,
     `createdAt`, `updatedAt`) — bỏ `accountId` (thừa, đã biết từ context
     đăng nhập). Response trả `Address[]` map sang `AddressResponseDto[]`
     (theo response envelope chuẩn `{ data }` của `ResponseInterceptor`).
  4. doc — `get-account-addresses.doc.ts` (swagger cho endpoint mới, trace qua
     use-case: không có domain error nào phát sinh từ chunk này ngoài lỗi hệ
     thống chung, chỉ cần 200 + 401).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
</content>
