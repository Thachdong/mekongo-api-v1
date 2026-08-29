# POST auth/reset-password

DTO: `ResetPasswordRequestDto { identifier: string }` — đã tạo (`src/modules/auth/infrastructure/http/dto/reset-password-request.dto.ts`)

## 1. Use-case có sẵn (module `auth`)
- (không có)

## 2. Use-case cần tạo (module `auth`)
- `ResetPasswordUseCase` — hash identifier, gọi 2 use-case ở mục 3 lấy accountId và issue OTP.

## 3. Use-case cần lấy từ module khác
- `FindAccountByIdentifierUseCase` (module `account`) — trả accountId từ identifier (cần tạo)
- `IssueResetPasswordOtpUseCase` (module `verification`) — tạo + gửi OTP purpose `RESET_PASSWORD` (cần tạo)
