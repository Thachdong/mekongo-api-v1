# Plan: Cập nhật profile account (displayName / avatarUrl)

## Mô tả
Endpoint `PUT account/update` cho phép account tự cập nhật `displayName` và/hoặc
`avatarUrl`. `avatarUrl` truyền lên là key file đang nằm ở `/TMP`, cần move sang
bucket `/ACCOUNT/<accountId>/` rồi lưu key đích.

## Discovery
- Entity nghi trùng lặp: KHÔNG có — `Account` (`src/modules/account/domain/account.entity.ts`)
  đã có sẵn field `displayName`, `avatarUrl` và method `changeDisplayName()`,
  `changeAvatar()`. Tái dùng, không tạo entity mới.
- Repository: `IAccountRepository.update()` đã có sẵn, tái dùng.
- Storage port: `IFileStorage` (`src/shared/infrastructure/storage/file-storage.interface.ts`)
  đã có `moveObject(sourceKey, destinationKey)`. `StorageModule` export `FILE_STORAGE`
  nhưng KHÔNG phải `@Global()` — `AccountModule` phải tự import `StorageModule`.
  `storage-key.util.ts` có sẵn `TMP_STORAGE_PREFIX = 'TMP'` + `buildTmpObjectKey()`.
- Use-case/port tương tự đã tồn tại: `ChangeOwnPasswordUseCase` dùng làm pattern
  tham chiếu (self-service, lấy `accountId` từ `CurrentUser`, response `null`).
- Package cần thiết: đã có đủ ở `shared/` (Firebase storage đã wrap sẵn), KHÔNG
  cần chạy `external-package`.

### Điểm cần dev xác nhận trước khi code
1. **Validate displayName (min 5 ký tự sau trim)**: đề xuất đặt rule này ở
   DOMAIN layer — sửa `Account.changeDisplayName()` để tự trim + throw domain
   error mới (`InvalidDisplayNameError`, 422) nếu độ dài sau trim < 5. Lý do:
   đây là invariant của entity, áp dụng bất kể caller nào gọi entity này trong
   tương lai, không chỉ riêng use-case update-profile.
   → Đồng ý theo hướng domain, hay muốn validate ở DTO (class-validator) thay vì
   entity?
2. **Xác thực avatarUrl là key hợp lệ trong TMP**: đề xuất validate prefix
   (`avatarUrl` phải bắt đầu bằng `TMP/`) ở use-case, sau đó gọi thẳng
   `moveObject()` — nếu file không tồn tại ở TMP, Firebase SDK sẽ throw, use-case
   bắt lỗi đó và map sang domain error mới `AvatarSourceNotFoundError` (404).
   KHÔNG thêm method `exists()` mới vào `IFileStorage` (tránh phải chạy thêm
   `external-package`/sửa port). Đồng ý cách này?
3. **Key đích lưu trong bucket ACCOUNT**: đề xuất
   `ACCOUNT/<accountId>/<phần filename giữ nguyên từ source key sau khi bỏ prefix TMP/>`
   (vd source `TMP/<uuid>-avatar.png` → dest `ACCOUNT/<accountId>/<uuid>-avatar.png`).
   Giá trị lưu vào `account.avatarUrl` là key đích (không phải public URL), đúng
   như field hiện tại đang lưu string key/url thô. Đồng ý convention này?

**Dev đã xác nhận (2026-09-03): cả 3 điểm theo hướng đề xuất (domain validate,
catch moveObject error thay vì thêm exists(), giữ nguyên filename từ TMP key).**

## Chunk tree

### Chunk 1: Update account profile (module: account)
- status: done
- Approved by: dev (2026-09-03)
- Entity: tái dùng `Account` (không tạo entity mới)
- Steps (atomic skill theo thứ tự):
  1. domain — sửa `Account.changeDisplayName()` để trim + validate min-length
     (mini-gate xác nhận với dev nếu tạo domain error mới); thêm
     `InvalidDisplayNameError` (422) và `AvatarSourceNotFoundError` (404) vào
     `domain/errors/`.
  2. use-case — tạo `UpdateAccountProfileUseCase`
     (`application/use-cases/update-account-profile.use-case.ts`) +
     port `IUpdateAccountProfileUseCase`
     (`application/ports/update-account-profile-use-case.interface.ts`), token
     `UPDATE_ACCOUNT_PROFILE_USECASE`. Input: `{ accountId, displayName?, avatarUrl? }`.
     Logic: load account by id → nếu có `displayName` thì
     `account.changeDisplayName(displayName)`; nếu có `avatarUrl` thì validate
     prefix `TMP/`, build destination key `ACCOUNT/<accountId>/<...>`, gọi
     `FILE_STORAGE.moveObject()`, rồi `account.changeAvatar(destinationKey)` →
     `accountRepository.update(account)`. KHÔNG cần adapter mới (repo +
     FILE_STORAGE port đã có sẵn).
  3. infrastructure (endpoint) — `PUT account/update` trong `AccountController`,
     DTO mới `UpdateAccountProfileRequestDto`
     (`infrastructure/http/dto/update-account-profile-request.dto.ts`) với
     cross-field validator "ít nhất 1 trong 2 field" (400 nếu thiếu cả hai qua
     `ValidationPipe`, không phải domain error). `AccountModule` cần import
     `StorageModule` để có `FILE_STORAGE`. Response: trả `null` (theo pattern
     `changePassword`).
  4. doc — `update-account-profile.doc.ts` (swagger cho endpoint mới, trace qua
     use-case + domain error để liệt kê đủ response status: 400 thiếu field,
     422 displayName không hợp lệ, 404 account/avatar-source not found, 401
     chưa auth).
- Integrate into: không có module khác consume (self-service endpoint), không
  cần export qua `public-api.ts`.
- Gate: build xong nội bộ module account, endpoint gọi được end-to-end (không
  cross-module nên chỉ cần điều kiện (1) trong gate chuẩn).
- Commit range: (điền sau khi chạy xong)
- Approved by: (điền khi dev duyệt)
