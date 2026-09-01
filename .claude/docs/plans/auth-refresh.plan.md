# Plan: POST auth/refresh

## Mô tả
Validate refresh token hiện có, phát hành lại cặp accessToken + refreshToken mới (rotation), phát hiện reuse attack.

## Discovery
- Entity nghi trùng lặp: `RefreshToken` (`src/modules/auth/domain/refresh-token.entity.ts`) đã có sẵn `renew()`,
  `checkIsExpired()`, `checkReusedDetected()` — tái dùng NGUYÊN TRẠNG, không sửa entity, không thêm field.
- Domain error nghi trùng lặp: `RefreshTokenExpiredError`, `RefreshTokenRevokedError` đã có. Còn thiếu
  `RefreshTokenNotFoundError` (case: hash không khớp record nào, hoặc record thuộc account khác) — tạo mới.
- Use-case/port nghi trùng lặp:
  - `IRefreshTokenRepository` hiện chỉ có `create()`. Cần thêm `findByTokenHash(hash)` và `update(refreshToken)`.
  - `ITokenIssuer.signAccessToken` tái dùng nguyên trạng.
  - QUYẾT ĐỊNH (dev xác nhận): `accountId` + `profileId` cho access token mới lấy từ chính access token cũ (dù đã
    expired) qua `@CurrentUser`, KHÔNG lấy từ DB (không cần entity lưu profileId, không cần gọi account module).
    Endpoint yêu cầu cả 2: header `Authorization: Bearer <accessToken cũ>` + body `{ refreshToken }`.
- QUYẾT ĐỊNH kỹ thuật kèm theo (cần dev xác nhận vì đụng `shared/common/auth/`, không thuộc riêng 1 module):
  hiện có `JwtAccessStrategy` ('jwt') với `ignoreExpiration: false` → guard thường sẽ tự chặn access token đã hết
  hạn trước khi tới controller, không dùng được cho refresh. Cần thêm 1 strategy/guard song song
  `JwtRefreshAccessStrategy` ('jwt-refresh-access', `ignoreExpiration: true`) + `JwtRefreshAuthGuard`, đặt cạnh
  file hiện có trong `shared/common/auth/`, wire vào `AuthPassportModule` — theo đúng pattern đã có (mở rộng
  package `passport-jwt` đã wrap sẵn, không phải package mới).
- Package cần thiết: đã có đủ (crypto node built-in như `LoginUseCase`; `passport-jwt` đã wrap sẵn ở shared).
- Config: `jwt.refreshTkenExpiredIn`, `jwt.accessTokenSecret` đã có sẵn, tái dùng.
- KHÔNG cross-module — gói gọn trong `auth` module + phần mở rộng nhỏ ở `shared/common/auth/`.

## Chunk tree

### Chunk 1: Refresh token endpoint (module: auth)
- status: in-progress
- Entity: tái dùng `RefreshToken` nguyên trạng (không sửa).
- Steps (atomic skill theo thứ tự):
  1. domain — thêm error mới `RefreshTokenNotFoundError` (401, code `REFRESH_TOKEN_NOT_FOUND`) tại
     `domain/errors/refresh-token-not-found.error.ts`.
  2. infrastructure (adapter) —
     - `IRefreshTokenRepository`: thêm `findByTokenHash(hash: string): Promise<RefreshToken | null>` (match
       `current_token_hash = :hash OR previous_token_hash = :hash`) và `update(refreshToken): Promise<RefreshToken>`.
       Implement cả 2 trong `TypeOrmRefreshTokenRepository`.
     - `shared/common/auth/`: thêm `jwt-refresh-access.strategy.ts` (`ignoreExpiration: true`, cùng secret
       `jwt.accessTokenSecret`) + `jwt-refresh-auth.guard.ts`, đăng ký provider/export trong `AuthPassportModule`.
  3. use-case —
     - tạo `RefreshTokenUseCase` (`refresh-token.use-case.ts`):
       - input `{ accountId: string; profileId: string | null; refreshToken: string }` (accountId/profileId lấy
         từ access token cũ đã decode ở controller, refreshToken là raw token trong body)
       - hash sha256 (giống `LoginUseCase`)
       - `findByTokenHash` → không có, hoặc `record.accountId !== input.accountId` → `RefreshTokenNotFoundError`
       - `record.checkReusedDetected(hash)` true → `repository.update(record)` → throw `RefreshTokenRevokedError`
       - `record.renew(newHash, newExpiredAt)` (tự throw `RefreshTokenRevokedError`/`RefreshTokenExpiredError`)
       - `repository.update(record)`
       - `tokenIssuer.signAccessToken({ accountId: input.accountId, profileId: input.profileId })`
       - output `{ accessToken, refreshToken: newRawToken }`
       - KHÔNG export qua public-api (dùng nội bộ module auth, giống `LoginUseCase`).
  4. infrastructure (endpoint) — `POST auth/refresh` trong `AuthController`, `@UseGuards(JwtRefreshAuthGuard)`,
     lấy `accountId`/`profileId` qua `@CurrentUser()`, DTO request `RefreshTokenRequestDto { refreshToken: string }`
     (`@IsString() @IsNotEmpty()`), response type
     `TAuthRefreshTokenOutput = { accessToken: string; refreshToken: string }`.
  5. doc — `RefreshTokenDoc` (`refresh-token.doc.ts`): `@ApiBearerAuth`, trace domain error để liệt kê 401
     (not found/expired/revoked/invalid access token), 400 (validation).
- Integrate into: không có consumer module khác (endpoint là entry point cuối).
- Gate: endpoint chạy được end-to-end trong module auth.
- Commit range: (điền sau khi chạy xong)
- Approved by: user (2026-09-01)
