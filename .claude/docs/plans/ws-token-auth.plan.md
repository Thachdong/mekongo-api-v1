# Plan: WS-token riêng cho WebSocket gateway (chat/notification/comment)

## Mô tả
Hiện tại 3 gateway (`chat`, `notification`, `comment`) dùng chung accessToken (REST API)
để authenticate socket, ký/verify bằng cùng secret global (`jwt.accessTokenSecret`).
Nếu token lộ qua đường socket (query string, log, browser history) → attacker có full
quyền REST API. Giải pháp: mint 1 JWT riêng ("ws-token") — secret + expiresIn riêng,
issue qua endpoint `POST /auth/ws-token` (yêu cầu đã có accessToken hợp lệ), client
dùng ws-token này để connect socket thay vì accessToken.

## Quyết định đã chốt với dev
- Verify ws-token CHỈ ở `handleConnection` (lúc handshake) — bỏ re-verify mỗi
  message. `WsJwtGuard` (per-message reverify) trở thành dead code → xoá.
- Áp dụng cho cả 3 gateway: chat, notification, comment (không chỉ chat).
- Không cần revoke ws-token khi logout — dựa vào TTL ngắn, không thêm storage.

## Discovery
- Entity nghi trùng lặp: không có (không có domain entity mới, chỉ thêm 1 JWT
  payload/claim).
- Use-case/port nghi trùng lặp: `ITokenIssuer.signAccessToken`
  (`src/modules/auth/application/ports/token-issuer.interface.ts`) — **đã chốt
  với dev**: mở rộng interface này thêm `signWsToken`, cùng implementation
  `JwtTokenIssuer` (không tách port riêng).
- Package cần thiết: `@nestjs/jwt` đã có, nhưng cần 1 **provider JwtService thứ 2**
  (secret/expiresIn riêng cho ws-token) — không dùng chung token DI mặc định
  `JwtService` (đang bị global `AuthPassportModule` chiếm) để tránh nhầm lẫn/
  xung đột resolve. Đề xuất: custom token `WS_JWT_SERVICE`, định nghĩa ở
  `shared/websocket/` (nơi duy nhất hiện có wrap logic JWT cho WS), export cho
  cả auth module (issue) lẫn 3 gateway module (verify) dùng.
- File `shared/websocket/ws-jwt.guard.ts` sẽ bị xoá ở Chunk 2 (dead code sau khi
  đổi sang verify-once-at-handshake).

## Chunk tree

### Chunk 1: WS-token issuance (module: auth + shared/websocket)
- status: done
- Entity: không có (chỉ JWT claim, không phải domain entity)
- Steps (atomic skill theo thứ tự):
  1. config-env — thêm `WS_TOKEN_SECRET`, `WS_TOKEN_EXPIRED_IN` vào
     `configs/jwt.config.ts` (namespace `jwt.wsTokenSecret` /
     `jwt.wsTokenExpiredIn`), validate bắt buộc có secret.
  2. external-package — tạo `WS_JWT_SERVICE` provider trong
     `shared/websocket/` (factory tạo `JwtService` riêng, secret + expiresIn từ
     config `jwt.wsTokenSecret`/`jwt.wsTokenExpiredIn`), export qua 1
     module (vd `WsAuthModule`) để auth module + 3 gateway module import.
  3. use-case — mở rộng `ITokenIssuer` thêm `signWsToken(payload): string`
     (impl trong `JwtTokenIssuer`, inject `WS_JWT_SERVICE`); thêm use-case
     `IssueWsTokenUseCase` (input: accountId/profileId từ `@CurrentUser`, output:
     `{ wsToken }`).
  4. infrastructure (endpoint) — `POST /auth/ws-token` trong
     `auth.controller.ts`, `@UseGuards(JwtAuthGuard)`, response DTO
     `{ wsToken: string }`.
  5. doc — swagger doc cho `ws-token` endpoint (`ws-token.doc.ts`).
- Integrate into: `auth.module.ts` import `WsAuthModule`, wire provider mới.
- Gate: gọi `POST /auth/ws-token` với accessToken hợp lệ → nhận ws-token ký bằng
  secret riêng (khác accessToken secret).
- Commit range: _(điền sau)_
- Approved by: _(điền khi dev duyệt)_

### Chunk 2: Migrate 3 gateway sang verify ws-token (module: shared/websocket, chat, notification, comment)
- status: done
- Entity: không có
- Steps (atomic skill theo thứ tự):
  1. external-package — sửa `shared/websocket/ws-auth.util.ts`
     (`verifyWsToken`) dùng `WS_JWT_SERVICE` thay vì `JwtService` mặc định;
     xoá `shared/websocket/ws-jwt.guard.ts` (dead code, không còn nơi dùng sau
     khi bỏ per-message reverify).
  2. infrastructure — cập nhật 3 gateway:
     - `chat.gateway.ts`: bỏ `@UseGuards(WsJwtGuard)`; inject
       `@Inject(WS_JWT_SERVICE)` thay cho `JwtService` mặc định.
     - `comment.gateway.ts`: tương tự (bỏ `@UseGuards(WsJwtGuard)`, đổi inject).
     - `notification.gateway.ts`: không có guard sẵn (chỉ verify ở
       `handleConnection`) → chỉ đổi inject sang `WS_JWT_SERVICE`.
     - Cập nhật `chat.module.ts`, `notification.module.ts`, `comment.module.ts`
       import `WsAuthModule` (lấy `WS_JWT_SERVICE`).
- Integrate into: không có consumer ngoài — đây là thay đổi nội bộ hạ tầng auth
  của 3 gateway đã tồn tại.
- Gate:
  - Connect socket (`/chat`, `/notifications`, `/comments`) bằng ws-token mới
    → thành công, nhận đúng `client.data.user`.
  - Connect bằng accessToken thường (secret cũ) → bị reject/disconnect (vì
    secret khác nhau).
  - `sendMessage`/`joinRoom`/`joinPostComments` không còn re-verify token giữa
    chừng (đã bỏ guard) — hoạt động bình thường trong suốt phiên socket dù
    ws-token đã hết hạn sau handshake.
- Commit range: _(điền sau)_
- Approved by: _(điền khi dev duyệt)_
