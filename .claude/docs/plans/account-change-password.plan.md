# Plan: Account self-service change password

## Mô tả
Account đã đăng nhập tự đổi mật khẩu: nhập currentPassword + newPassword, verify
currentPassword khớp passwordHash hiện tại rồi update passwordHash mới.

## Discovery
- Entity nghi trùng lặp: không có. `Account` (domain/account.entity.ts) đã có sẵn
  method `changePaswordHash()`.
- Use-case/port nghi trùng lặp:
  - `IChangeAccountPasswordUseCase` / `ChangeAccountPasswordUseCase` (account module)
    đã tồn tại nhưng chỉ nhận `passwordHash` sẵn, KHÔNG verify current password —
    đang được dùng bởi `auth/change-password` (flow reset password qua OTP, không
    liên quan current password). Sẽ TÁI DÙNG use-case này làm bước update cuối,
    không sửa lại nó (tránh phá vỡ flow OTP reset đang dùng).
  - `IPasswordHasher` (shared/common/hashing) đã có `hash()` + `verify()` — dùng
    trực tiếp, không cần package mới.
  - `IAccountRepository.findById()` đã có sẵn.
  - `JwtAuthGuard` + `@CurrentUser()` decorator đã có sẵn (dùng ở `auth/logout`) —
    tái dùng để lấy `accountId` từ access token, không nhận accountId qua payload.
- Package cần thiết: đã có đủ ở `shared/` (hashing, JWT guard). Không cần
  `external-package`.

## Chunk tree

### Chunk 1: Account self-service change password (module: account)
- status: done
- Entity: tái dùng `Account` (method `changePaswordHash` có sẵn, không đổi domain)
- Steps (atomic skill theo thứ tự):
  1. domain — thêm domain-error mới `InvalidCurrentPasswordError` (401,
     code `INVALID_CURRENT_PASSWORD`) vào `modules/account/domain/errors/`, dùng
     khi currentPassword không khớp. Lý do cần mới: `InvalidCredentialsError`
     hiện tại nằm ở `auth/domain` (scope cho login), account module không được
     import domain error nội bộ module khác → phải có bản riêng scope account.
  2. use-case — use-case mới `ChangeOwnPasswordUseCase` trong
     `application/use-cases/`, port `IChangeOwnPasswordUseCase` /
     `CHANGE_OWN_PASSWORD_USECASE` trong `application/ports/`. Input:
     `{ accountId, currentPassword, newPassword }`, output: `void`. Logic:
     - `accountRepository.findById(accountId)` → nếu null throw
       `AccountNotFoundError` (đã có).
     - `passwordHasher.verify(currentPassword, account.passwordHash)` → nếu false
       throw `InvalidCurrentPasswordError` (mới ở bước 1).
     - `passwordHasher.hash(newPassword)` → gọi
       `changeAccountPasswordUseCase.execute({ accountId, passwordHash })` (tái
       dùng use-case có sẵn cùng module, inject thẳng qua token
       `CHANGE_ACCOUNT_PASSWORD_USECASE`, không qua `public-api.ts` vì cùng
       module).
     - Export `CHANGE_OWN_PASSWORD_USECASE` qua `public-api.ts`? KHÔNG cần — chỉ
       dùng nội bộ module account (controller cùng module), không module khác
       gọi tới ở phạm vi feature này.
  3. infrastructure (endpoint) — tạo mới:
     - `infrastructure/http/account.controller.ts` (controller mới của module
       account, chưa tồn tại).
     - `infrastructure/http/dto/change-password-request.dto.ts`:
       `{ currentPassword: string; newPassword: string }`, validate bằng
       `class-validator` (`@IsString`, `@IsNotEmpty`, có thể thêm `@MinLength`
       cho `newPassword` — confirm với dev).
     - Method `PATCH account/change-password`, `@UseGuards(JwtAuthGuard)`,
       `@CurrentUser() user: TJwtPayload` lấy `accountId`, gọi
       `ChangeOwnPasswordUseCase`, response trả `null` (interceptor tự bọc
       envelope).
     - Wire `AccountController` vào `account.module.ts` (`controllers: [...]`),
       đăng ký provider `ChangeOwnPasswordUseCase` +
       `{ provide: CHANGE_OWN_PASSWORD_USECASE, useExisting: ChangeOwnPasswordUseCase }`.
  4. doc — `infrastructure/http/docs/change-password.doc.ts`, `applyDecorators`,
     trace qua use-case + domain error (`AccountNotFoundError` 404,
     `InvalidCurrentPasswordError` 401) để liệt kê response status, gắn vào
     controller method.
- Integrate into: không có consumer module khác (endpoint tự đứng), không cần
  sửa `public-api.ts`.
- Gate: vertical slice build xong trong module `account`, endpoint chạy được
  end-to-end (không cross-module nên không cần điều kiện (2)/(3)).
- Commit range: 538d2da..4efd99d
- Approved by: dev (2026-09-01, qua AskUserQuestion)

### Chunk 2: Điều chỉnh HTTP method + field naming (module: account)
- status: done
- Điều chỉnh so với Chunk 1, lý do: dev yêu cầu `POST` thay vì `PATCH`, field
  `oldPassword` thay vì `currentPassword` trong request body. Business logic
  KHÔNG đổi (vẫn: lấy account theo accountId từ `@CurrentUser`, compare password
  qua `IPasswordHasher.verify`, update passwordHash, không OTP).
- Làm rõ ghi chú dev "endpoint hiện tại đang dùng chung use-case với
  auth/change-password (cần OTP)": ĐÃ KIỂM TRA LẠI code hiện tại — không đúng.
  `ChangeOwnPasswordUseCase` (account module) độc lập hoàn toàn với
  `ChangePasswordUseCase` (auth module, flow OTP reset). Hai use-case chỉ CÙNG
  gọi chung `ChangeAccountPasswordUseCase` ở bước update passwordHash cuối cùng
  (bước lưu DB thuần tuý, không có OTP). Route `account/change-password` không
  yêu cầu OTP ở bất kỳ đâu trong code hiện tại. Không cần sửa domain/use-case.
- Entity: không đổi.
- Steps (atomic skill theo thứ tự):
  1. infrastructure (endpoint) — sửa
     `infrastructure/http/dto/change-password-request.dto.ts`: rename field
     `currentPassword` → `oldPassword` (giữ `newPassword`). Sửa
     `infrastructure/http/account.controller.ts`: đổi decorator `@Patch` →
     `@Post`, map `body.oldPassword` → `input.currentPassword` khi gọi
     `ChangeOwnPasswordUseCase` (input type use-case giữ nguyên tên
     `currentPassword`, chỉ DTO đổi tên — không đụng application layer).
  2. doc — sửa mô tả trong `change-password.doc.ts` (dòng đang ghi
     "currentPassword không khớp mật khẩu hiện tại" → đổi thành
     "oldPassword không khớp mật khẩu hiện tại" cho khớp field mới).
- Integrate into: không đổi (vẫn không cross-module).
- Gate: build/lint/test pass, endpoint `POST account/change-password` nhận đúng
  `{ oldPassword, newPassword }`.
- Commit range: 7b731f2..7fcefe2
- Approved by: dev (2026-09-01, qua full-feature command trực tiếp — spec đã rõ,
  không cần hỏi lại)
