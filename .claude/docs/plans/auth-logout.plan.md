# Plan: POST auth/logout

## Mô tả
Đăng xuất session hiện tại: client gửi kèm `refreshToken` đang dùng, server thu hồi (revoke) đúng token đó
(`isAlive = false`), không trả response.

## Discovery
- Entity nghi trùng lặp: `RefreshToken` (`src/modules/auth/domain/refresh-token.entity.ts`) đã có sẵn, có
  `_isAlive` + `_revokedAt` nhưng CHƯA có method revoke chủ động (chỉ có side-effect trong
  `checkReusedDetected()`). Cần thêm method mới `revoke()`, KHÔNG sửa field có sẵn.
- Use-case/port nghi trùng lặp: `IRefreshTokenRepository` hiện có đủ `create/findByTokenHash/update` —
  KHÔNG cần thêm method mới, tái dùng `findByTokenHash(hash)` (giống cách `RefreshTokenUseCase` đang làm) +
  `update()`.
- Guard nghi trùng lặp: `JwtAuthGuard` ('jwt', access token còn hạn) đã có, dùng lại nguyên trạng — KHÔNG
  dùng `JwtRefreshAuthGuard` (guard đó dành riêng cho endpoint refresh, ignore expiration).
- Package cần thiết: đã có đủ, không cần thêm (hash sha256 dùng `node:crypto` như `RefreshTokenUseCase`).
- KHÔNG cross-module — gói gọn trong `auth` module.

### Quyết định đã chốt với dev
1. **Phạm vi revoke**: request CÓ payload `{ refreshToken: string }` — chỉ revoke đúng 1 token (kill session
   hiện tại), KHÔNG revoke toàn bộ session của account.
2. **Guard xác thực**: `JwtAuthGuard` chuẩn (access token còn hạn, lấy `accountId` qua `@CurrentUser`).
3. **Idempotent / không leak thông tin**: nếu `findByTokenHash` không ra record, hoặc record thuộc account
   khác, hoặc record đã revoke sẵn → coi như thành công (no-op), KHÔNG throw domain error — logout không nên
   tiết lộ trạng thái token.
4. **Response**: trả `null`, `HttpStatus.OK` — theo đúng pattern `activate`/`change-password` hiện có.

## Chunk tree

### Chunk 1: Logout endpoint (module: auth)
- status: done
- Entity: tái dùng `RefreshToken`, thêm method mới `revoke()`.
- Steps (atomic skill theo thứ tự):
  1. domain — thêm method `revoke(): void` vào `RefreshToken` entity: set `_isAlive = false`,
     `_revokedAt = new Date()`. Không throw nếu gọi lại trên token đã revoke (idempotent).
  2. infrastructure (adapter) — không cần sửa, `findByTokenHash`/`update` đã đủ dùng.
  3. use-case — tạo `LogoutUseCase` (`logout.use-case.ts`):
     - input `{ accountId: string; refreshToken: string }`
     - hash sha256 (giống `RefreshTokenUseCase`)
     - `findByTokenHash(hash)` → nếu không có, hoặc `record.accountId !== input.accountId`, hoặc
       `!record.isAlive` → return, không làm gì thêm (no-op, coi như thành công)
     - ngược lại `record.revoke()` rồi `repository.update(record)`
     - KHÔNG throw domain error trong mọi trường hợp (idempotent theo quyết định #3).
     - KHÔNG export qua public-api (dùng nội bộ module auth).
  4. infrastructure (endpoint) — `POST auth/logout` trong `AuthController`, `@UseGuards(JwtAuthGuard)`, lấy
     `accountId` qua `@CurrentUser()`, request DTO `LogoutRequestDto { refreshToken: string }`
     (`@IsString() @IsNotEmpty()`), trả `null`.
  5. doc — `LogoutDoc` (`logout.doc.ts`): `@ApiBearerAuth`, 401 do guard (invalid/expired access token), 400
     validation — không có domain error riêng vì use-case không throw.
- Integrate into: không có consumer module khác (endpoint là entry point cuối).
- Gate: endpoint chạy được end-to-end trong module auth. Build + test suite pass.
- Commit range: (không commit — user tự review + commit)
- Approved by: user (2026-09-01)
