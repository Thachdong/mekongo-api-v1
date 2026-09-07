# Plan: Address vừa thuộc Account vừa thuộc Profile

## Mô tả
CR: Account bỏ `currentAddressId`. Mỗi `Profile` tự chọn 1 `Address` làm địa chỉ
hiển thị của mình (`Profile.addressId`), các profile trong cùng account có thể
trỏ đến địa chỉ khác nhau hoặc giống nhau (cho phép share). `Address` thêm
`profileId` để biết address đó được tạo ra trong flow của profile nào (đăng ký
tài khoản hoặc tạo profile mới với địa chỉ mới) — field này KHÔNG dùng để suy ra
profile nào đang "chọn" address, chỉ dùng làm dấu vết tạo.

## Discovery
- Entity: `Account` (`src/modules/account/domain/account.entity.ts`) — có
  `currentAddressId`, `changeCurrentAddressId` — SẼ XOÁ.
- Entity: `Profile` (`.../domain/profile.entity.ts`) — chưa có `addressId` — SẼ
  THÊM (nullable, có mutator `changeAddressId`).
- Entity: `Address` (`.../domain/address.entity.ts`) — chưa có `profileId` — SẼ
  THÊM (nullable, set tại constructor, KHÔNG có mutator — address không đổi chủ
  sau khi tạo).
- `IProfileRepository` hiện chỉ có `create/findAllByAccountId/findById/findByIds`
  — THIẾU `update` — cần thêm (giống pattern `IAccountRepository.update`).
- Address không phải module riêng — nằm trong module `account`
  (`domain/address.entity.ts`, `application/ports/address/*`,
  `application/use-cases/address/*`, `infrastructure/typeorm/address.*`).
- Use-case nghi trùng lặp / cần sửa: `RegisterAccountUseCase`,
  `CreateAddressUseCase`, `CreateProfileUseCase`, `SetCurrentAddressUseCase`
  (sẽ đổi tên/target), `DeleteAddressUseCase` (đổi guard logic).
- Cross-module: `post` module (`CreatePostUseCase._resolveProvinceCode`) đang
  dùng `Account.currentAddressId` qua `public-api` của account — PHẢI đổi sang
  dùng `Profile.addressId` (post use-case đã có sẵn `input.profileId`, tái dùng
  `FIND_PROFILES_BY_IDS_USECASE` đã export sẵn, không cần export port mới).
- Package cần thiết: không cần thêm.

## Quyết định đã chốt với dev (AskUserQuestion, 2026-09-07)
1. `Address.profileId`: **optional/nullable** — không bắt buộc set khi tạo qua
   endpoint generic `POST account/address`.
2. Luồng gán địa chỉ cho profile:
   - Tạo account (`RegisterAccountUseCase`): user nhập thông tin address →
     tạo Address → gắn (`changeAddressId`) cho Profile đầu tiên.
   - Tạo profile mới (`CreateProfileUseCase`): user HOẶC chọn 1 address có sẵn
     của account (`addressId`), HOẶC nhập thông tin để tạo address mới → rồi
     gắn cho profile. Đúng 1 trong 2 nhánh (XOR).
   - Để tránh vòng lặp phụ thuộc dựng entity (Profile cần addressId lúc tạo,
     Address cần profileId lúc tạo): tạo Profile trước với `addressId: null`,
     tạo Address (set `profileId` = profile vừa tạo nếu là nhánh "tạo mới"),
     rồi `profile.changeAddressId(address.id)` + `profileRepository.update`.
     Nhánh "chọn address có sẵn": không đổi `Address.profileId` (giữ
     nguyên, hỗ trợ nhiều profile share 1 address).
3. `PUT account/set-current-address` → đổi thành `PUT account/set-profile-address`,
   body `{ profileId, addressId }`, set `Profile.addressId` (breaking change,
   chấp nhận).
4. `CreatePostUseCase._resolveProvinceCode`: dùng `Profile.addressId` của
   profile đang đăng bài (`input.profileId` đã có sẵn) thay vì
   `Account.currentAddressId`.

## Chunk tree

### Chunk 1: Domain + schema — Account bỏ currentAddressId, Profile/Address thêm field (module: account)
- status: done
- Verify đã chạy: tsc toàn repo — lỗi còn lại chỉ nằm ở đúng các file thuộc
  chunk 2-7 (create-address, register-account, create-profile,
  set-current-address, delete-address, post module) — xác nhận chunk 1 không
  làm lệch phạm vi. eslint sạch (đã --fix format migration mới).
- Entity: sửa cả 3 (mini-gate xác nhận field/method mới trước khi code — theo
  skill `domain`).
- Steps:
  1. domain —
     - `Account`: xoá `currentAddressId` khỏi `TAccountProps`, xoá field/getter,
       xoá `changeCurrentAddressId`.
     - `Profile`: thêm `addressId: string | null` vào `TProfileProps` +
       constructor + getter; thêm mutator `changeAddressId(addressId: string): void`.
     - `Address`: thêm `profileId: string | null` vào `TAddressProps` +
       constructor + getter (readonly, KHÔNG mutator).
  2. infrastructure (adapter) —
     - `AccountTypeOrmEntity`: xoá cột `current_address_id`.
     - `ProfileTypeOrmEntity`: thêm cột `address_id` (uuid, nullable, FK →
       `addresses.id`).
     - `AddressTypeOrmEntity`: thêm cột `profile_id` (uuid, nullable, FK →
       `profiles.id`).
     - Mapper 3 file tương ứng cập nhật field mới/bỏ field cũ.
     - `IProfileRepository` + `TypeOrmProfileRepository`: thêm method
       `update(profile: Profile): Promise<Profile>`.
     - Migration mới: `ADD COLUMN profiles.address_id` (nullable + FK),
       `ADD COLUMN addresses.profile_id` (nullable + FK), `DROP COLUMN
       accounts.current_address_id`. Không cần backfill (nullable, dữ liệu cũ
       chấp nhận `null`).
  3. infrastructure (endpoint, điều chỉnh phát sinh) — `AccountResponseDto` +
     `_toAccountResponseDto` (account.controller.ts): XOÁ field
     `currentAddressId` (hệ quả bắt buộc của việc xoá field khỏi domain, không
     phải business logic mới). *Điều chỉnh so với bản Plan gốc: bước này không
     nằm trong Plan ban đầu, phát hiện lúc build (tsc báo lỗi
     `account.controller.ts:228`) — bổ sung ngay tại đây vì thuần xoá field
     chết, không có quyết định thiết kế nào cần hỏi thêm.*
- Integrate into: các chunk sau trong module `account` + chunk cross-module
  `post` (Chunk 7).
- Gate: build sạch module account, migration chạy được, test hiện có (sẽ có
  test fail do field xoá — cập nhật cùng chunk này nếu là test entity/mapper
  thuần, KHÔNG sửa test use-case ở chunk này — để dành cho chunk use-case
  tương ứng).
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 2: CreateAddressUseCase — nhận profileId optional (module: account)
- status: done
- Verify đã chạy: tsc — lỗi CreateAddress đã hết, còn lại đúng phạm vi chunk
  3-7. eslint sạch (đã --fix). jest use-case address pass (2/2, spec mới tạo
  do trước đây chưa có). doc `create-address.doc.ts` không cần sửa (dùng DTO
  class trực tiếp, swagger tự đọc field mới qua `@ApiProperty`).
- Entity: tái dùng (không đổi thêm).
- Steps:
  1. use-case — `TCreateAddressInput` thêm `profileId?: string | null`;
     `CreateAddressUseCase` truyền vào `new Address({...})`. Update spec.
  2. infrastructure (endpoint) — `CreateAddressRequestDto` thêm `profileId?:
     string` (optional, validate UUID); controller `createAddress` truyền
     xuống use-case; `AddressResponseDto` + `_toAddressResponseDto` thêm
     `profileId`.
  3. doc — cập nhật `create-address.doc.ts` (field mới trong request/response
     example).
- Gate: build sạch, test account pass.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 3: RegisterAccountUseCase — bỏ currentAddressId, gắn address cho profile đầu tiên (module: account)
- status: pending
- Steps:
  1. use-case — đổi thứ tự dựng entity: Account (không còn
     `currentAddressId`) → Profile (`addressId: null`, seed
     displayName/avatarUrl như cũ) → Address (`profileId: profile.id`) →
     `profile.changeAddressId(address.id)` → `profileRepository.update(profile)`.
     Bỏ hẳn `account.changeCurrentAddressId`. Giữ nguyên
     `account.changeActiveProfileId`. Update spec.
- Gate: build sạch, test account pass (kể cả spec register-account đã sửa ở
  chunk 1 nếu có).
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 4: CreateProfileUseCase — chọn address có sẵn HOẶC tạo mới (module: account)
- status: pending
- Entity: có thể cần domain-error mới (vd `InvalidProfileAddressInputError` khi
  cả 2 hoặc không nhánh nào được truyền) — mini-gate xác nhận tên/message với
  dev khi chạy skill `domain`.
- Steps:
  1. domain (nếu cần error mới) — như trên.
  2. use-case — `TCreateProfileInput` thêm `addressId?: string` HOẶC
     `newAddress?: { label, province, provinceCode, ward, details }` (đúng 1
     trong 2, validate ở use-case hoặc DTO). Luồng:
     - Tạo Profile trước (`addressId: null`).
     - Nếu `addressId`: load Address, verify `address.accountId === accountId`
       (tái dùng `AddressNotFoundError` nếu không khớp), KHÔNG đổi
       `Address.profileId`.
     - Nếu `newAddress`: tạo Address mới với `profileId: profile.id`.
     - `profile.changeAddressId(address.id)` → `profileRepository.update`.
     Update spec.
  3. infrastructure (endpoint) — `CreateProfileRequestDto` thêm 2 field tuỳ
     chọn ở trên (custom XOR validator, tham khảo pattern `AtLeastOneOf` đã có
     ở `update-account-profile-request.dto.ts`); `ProfileResponseDto` +
     `_toProfileResponseDto` thêm `addressId`.
  4. doc — cập nhật doc tạo profile.
- Gate: build sạch, test account pass.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 5: Đổi set-current-address → set-profile-address (module: account)
- status: pending
- Steps:
  1. use-case — xoá `SetCurrentAddressUseCase` + port
     (`set-current-address-use-case.interface.ts`) + token
     `SET_CURRENT_ADDRESS_USECASE` + spec. Tạo `SetProfileAddressUseCase`
     (input `{ accountId, profileId, addressId }`): load Profile theo id +
     verify `profile.accountId === accountId`, load Address + verify
     `address.accountId === accountId`, `profile.changeAddressId(addressId)`,
     `profileRepository.update`. Token mới
     `SET_PROFILE_ADDRESS_USECASE`. Spec mới.
  2. infrastructure (endpoint) — controller: đổi method
     `setCurrentAddress` → `setProfileAddress`, route
     `PUT account/set-profile-address`; DTO
     `SetCurrentAddressRequestDto` → `SetProfileAddressRequestDto`
     `{ profileId, addressId }`.
  3. doc — đổi `set-current-address.doc.ts` →
     `set-profile-address.doc.ts`, cập nhật nội dung.
- Gate: build sạch, grep repo xác nhận không còn reference
  `SetCurrentAddressUseCase`/`SET_CURRENT_ADDRESS_USECASE`/
  `changeCurrentAddressId` ngoài migration history.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 6: DeleteAddressUseCase — đổi guard logic (module: account)
- status: pending
- Entity: có thể cần đổi tên `CannotDeleteCurrentAddressError` — flag, hỏi dev
  giữ tên hay đổi (vd `AddressAssignedToProfileError`) lúc chạy skill `domain`.
- Steps:
  1. domain (nếu đổi tên error) — như trên.
  2. use-case — bỏ check `account.currentAddressId === addressId`; thay bằng:
     load tất cả profile của account (`profileRepository.findAllByAccountId`),
     nếu có profile nào `profile.addressId === addressId` → throw error guard.
     Update spec.
  3. infrastructure (doc) — cập nhật `delete-address.doc.ts` nếu đổi tên error
     (response example).
- Gate: build sạch, test account pass.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 7: Post module — resolve provinceCode qua Profile.addressId (module: post)
- status: pending
- Steps:
  1. use-case — `CreatePostUseCase._resolveProvinceCode`: đổi tham số từ
     `accountId` sang dùng `input.profileId`; gọi
     `FIND_PROFILES_BY_IDS_USECASE` (đã export ở account `public-api.ts`) với
     `ids: [input.profileId]`, lấy `profile.addressId`; vẫn gọi
     `GET_ACCOUNT_ADDRESSES_USECASE` với `input.accountId` để lấy list rồi tìm
     theo `address.id === profile.addressId`; giữ nguyên
     `CurrentAddressNotFoundError` nếu không tìm thấy profile hoặc address.
     Bỏ import `FIND_ACCOUNT_BY_ID_USECASE` nếu không còn dùng chỗ khác trong
     file. Update spec.
- Integrate into: không cross-module thêm (post module đã import account
  public-api từ trước).
- Gate: build sạch, test post pass.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

### Chunk 8: Lắp ráp cuối — dọn sạch & kiểm tra toàn repo (module: account/post)
- status: pending
- Steps:
  1. grep toàn repo xác nhận không còn `currentAddressId`/`current_address_id`
     ngoài migration cũ, không còn `SetCurrentAddressUseCase`.
  2. Chạy build/lint/test toàn repo.
- Gate: build/lint/test toàn repo xanh.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)
