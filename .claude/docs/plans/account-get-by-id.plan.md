# Plan: Lấy thông tin account theo accountId

## Mô tả
Endpoint `GET account` trả về thông tin account (không leak field nhạy cảm như
`passwordHash`, `identifierHash`).

## Discovery
- Entity nghi trùng lặp: KHÔNG có — tái dùng `Account`
  (`src/modules/account/domain/account.entity.ts`), không sửa entity.
- Use-case/port nghi trùng lặp: `IAccountRepository.findById(id)` đã có sẵn,
  tái dùng — không cần thêm adapter method. Có `FindAccountByIdentifierUseCase`
  (tìm theo `identifierHash`, dùng cho flow login) nhưng KHÔNG cùng mục đích —
  cần use-case mới tìm theo `id`.
- Response DTO: CHƯA có `AccountResponseDto` nào trong codebase — cần tạo mới.
- Domain-error: tái dùng `AccountNotFoundError` (đã có sẵn,
  `src/modules/account/domain/errors/account-not-found.error.ts`) cho case
  không tìm thấy.
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ (TypeORM), KHÔNG cần `external-package`.

### Dev đã xác nhận (2026-09-03)
1. **Nguồn `accountId`**: self-service, lấy từ `CurrentUser`/JWT — cùng pattern
   các endpoint khác trong `AccountController`, không nhận path param.
2. **Field expose trong `AccountResponseDto`**: `id`, `loginType`, `status`,
   `displayName`, `avatarUrl`, `currentAddressId`, `activeProfileId`,
   `blockUntil`, `createdAt`, `updatedAt` — loại bỏ `identifierHash`,
   `passwordHash` (nhạy cảm). Có thêm `blockUntil` (client biết khi nào hết
   block) so với đề xuất ban đầu.

## Chunk tree

### Chunk 1: Get account by id (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Account` (không có domain step)
- Steps (atomic skill theo thứ tự):
  1. use-case — tạo `FindAccountByIdUseCase`
     (`application/use-cases/find-account-by-id.use-case.ts`) + port
     `IFindAccountByIdUseCase`
     (`application/ports/find-account-by-id-use-case.interface.ts`), token
     `FIND_ACCOUNT_BY_ID_USECASE`. Input: `{ accountId }`. Output: `Account`.
     Logic: `accountRepository.findById(accountId)` → nếu null throw
     `AccountNotFoundError` (tái dùng) → return account.
  2. infrastructure (endpoint) — `GET account` trong `AccountController`
     (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ `CurrentUser`). Response
     DTO mới `AccountResponseDto`
     (`infrastructure/http/dto/account-response.dto.ts`) — field: `id`,
     `loginType`, `status`, `displayName`, `avatarUrl`, `currentAddressId`,
     `activeProfileId`, `blockUntil`, `createdAt`, `updatedAt`. Map `Account`
     → DTO thủ công trong controller (không trả entity domain thẳng).
  3. doc — `get-account.doc.ts` (swagger: 200 AccountResponseDto, 401 chưa
     auth, 404 ACCOUNT_NOT_FOUND, 500).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
</content>
