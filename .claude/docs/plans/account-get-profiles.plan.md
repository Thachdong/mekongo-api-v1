# Plan: Lấy danh sách profile của account

## Mô tả
Endpoint `GET account/profile` trả về toàn bộ profile của account đang đăng
nhập.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Profile`
  (`src/modules/account/domain/profile.entity.ts`) tái dùng nguyên trạng.
- Use-case/port nghi trùng lặp: KHÔNG có use-case đọc list profile.
  `IProfileRepository.findAllByAccountId()` đã có sẵn (thêm ở chunk
  `account-create-profile`), tái dùng — không cần sửa adapter.
- Response DTO: `ProfileResponseDto`
  (`infrastructure/http/dto/profile-response.dto.ts`) đã đủ field, tái dùng.
- Module liên quan: `account` (đã tồn tại, tái dùng).
- Package cần thiết: đã có đủ, KHÔNG cần `external-package`.

## Chunk tree

### Chunk 1: Get account profiles (module: account)
- status: done
- Entity: tái dùng `Profile` (không có domain step)
- Steps (atomic skill theo thứ tự):
  1. use-case — `GetAccountProfilesUseCase`
     (`application/use-cases/profile/get-account-profiles.use-case.ts`) + port
     `IGetAccountProfilesUseCase`
     (`application/ports/profile/get-account-profiles-use-case.interface.ts`),
     token `GET_ACCOUNT_PROFILES_USECASE`. Input: `{ accountId }`. Output:
     `Profile[]`. Logic: gọi thẳng
     `profileRepository.findAllByAccountId(accountId)`.
  2. infrastructure (endpoint) — `GET account/profile` trong
     `AccountController` (`@UseGuards(JwtAuthGuard)`, lấy `accountId` từ
     `CurrentUser`, `HttpStatus.OK`). Không có request DTO (không param).
     Response: tái dùng `ProfileResponseDto[]`, map giống
     `_toProfileResponseDto` đã có.
  3. doc — `get-account-profiles.doc.ts` (swagger: 200 danh sách, 401 chưa
     auth, 500). Không có domain-error phát sinh từ use-case này.
- Integrate into: không có module khác consume (self-service endpoint),
  không cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end
  (không cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (chờ dev xác nhận commit)
- Approved by: dev (2026-09-03)
</content>
