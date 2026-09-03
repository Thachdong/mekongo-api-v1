# Plan: Tạo address cho account

## Mô tả
Endpoint `POST account/address` cho phép account đang đăng nhập tạo mới 1
address (label, province, provinceCode, ward, details) trong sổ địa chỉ của
mình, trả về address vừa tạo.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Address`
  (`src/modules/account/domain/address.entity.ts`) đã đủ field cần. Tái dùng,
  không sửa entity. Constructor pattern tham chiếu:
  `register-account.use-case.ts` (`new Address({ id: null, ..., accountId,
  createdAt: null, updatedAt: null })`).
- Use-case/port nghi trùng lặp: KHÔNG có use-case tạo address độc lập (hiện
  chỉ có trong `RegisterAccountUseCase` lúc đăng ký). `IAddressRepository.create()`
  đã có sẵn, tái dùng — không cần thêm method adapter.
- Response DTO: `AddressResponseDto`
  (`infrastructure/http/dto/address-response.dto.ts`, tạo ở chunk
  `account-get-addresses`) đã đủ field, tái dùng — không tạo response DTO mới.
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ (TypeORM), KHÔNG cần `external-package`.

## Chunk tree

### Chunk 1: Create address (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Address` (không có domain step — không thêm method/error mới)
- Steps (atomic skill theo thứ tự):
  1. use-case — tạo `CreateAddressUseCase`
     (`application/use-cases/create-address.use-case.ts`) + port
     `ICreateAddressUseCase`
     (`application/ports/create-address-use-case.interface.ts`), token
     `CREATE_ADDRESS_USECASE`. Input: `{ accountId, label, province,
     provinceCode, ward, details }`. Output: `Address`. Logic: gọi thẳng
     `addressRepository.create(new Address({ id: null, label, province,
     provinceCode, ward, details, accountId, createdAt: null, updatedAt: null }))`.
  2. infrastructure (endpoint) — `POST account/address` trong
     `AccountController` (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ
     `CurrentUser`). Request DTO mới `CreateAddressRequestDto`
     (`infrastructure/http/dto/create-address-request.dto.ts`) — field
     `label` (`@IsString @IsNotEmpty`), `province` (`@IsString @IsNotEmpty`),
     `provinceCode` (`@IsInt`), `ward` (`@IsString @IsNotEmpty`), `details`
     (`@IsString @IsNotEmpty`). Response: tái dùng `AddressResponseDto`, map
     `Address` → DTO (cùng cách map như `getAddresses`), HTTP status 201.
  3. doc — `create-address.doc.ts` (swagger: 201 tạo thành công, 400 validate
     body, 401 chưa auth, 500). Không có domain-error nào phát sinh từ use-case
     này (không check trùng lặp, không có business rule nào ném lỗi).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
</content>
