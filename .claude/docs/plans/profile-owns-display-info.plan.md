# Plan: Chuyển displayName/avatarUrl về Profile (CR business)

## Mô tả
Business quyết định: `displayName`, `avatarUrl` thuộc về `Profile` (không phải
`Account`). Sửa TỐI THIỂU ở module `account` để `comment` (và tương lai `post`)
dùng được 2 field này từ `Profile` — dev sẽ làm lại đầy đủ (update-profile flow,
đồng bộ hoá, v.v.) ở nhánh khác sau khi xong feature "post".

## Discovery
- Entity nghi trùng lặp: `Profile` (tái dùng,
  `src/modules/account/domain/profile.entity.ts`) — hiện chỉ có `id`,
  `activeProfile`, `accountId`. `Account` đang giữ `displayName`/`avatarUrl`
  (`src/modules/account/domain/account.entity.ts`) — theo CR, Account SẼ
  KHÔNG bỏ 2 field này ngay (out-of-scope, tránh phá `UpdateAccountProfileUseCase`,
  auth flow, v.v.) — chỉ thêm bản sao ở Profile, KHÔNG đồng bộ 2 chiều (chấp
  nhận divergence tạm thời theo đúng ý dev "sẽ update lại sau").
- Use-case/port nghi trùng lặp:
  - `RegisterAccountUseCase` (tạo Account + Profile đầu tiên) — sửa để seed
    `displayName`/`avatarUrl` cho Profile từ input đăng ký (đã có sẵn
    `input.displayName`/`input.avatarUrl`).
  - `CreateProfileUseCase` (tạo thêm Profile cho account đã có) — hiện KHÔNG
    nhận `displayName`/`avatarUrl` ở input. Cần quyết định seed từ đâu (xem
    mục Quyết định).
  - `FindProfilesByIdsUseCase` (đã có, chunk trước) — KHÔNG đổi signature, chỉ
    output `Profile` giờ có thêm field.
  - `FindAccountsByIdsUseCase` + `IAccountRepository.findByIds` (đã thêm ở
    feature "comment-list" trước) — sau CR này, comment module KHÔNG còn cần
    Account nữa → 2 chỗ này thành DEAD CODE (grep xác nhận chỉ được dùng bởi
    `resolve-comment-authors.service.ts` của comment module, không nơi nào
    khác dùng). Đề xuất XOÁ hẳn — cần dev xác nhận (xem mục Quyết định).
- Module `post`: grep toàn bộ `src/modules/post` — KHÔNG có chỗ nào đang đọc
  `Account.displayName`/`avatarUrl` (chỉ dùng Account cho
  `currentAddressId` lúc tạo post). Kết luận: **không có code nào cần sửa ở
  Post module cho CR này** — ghi nhận cho tương lai khi Post thêm tính năng
  hiển thị author.
- Package cần thiết: không cần thêm.

## Quyết định đã chốt với dev (AskUserQuestion, 2026-09-04)
1. Profile thêm `displayName: string`, `avatarUrl: string | null` — KHÔNG
   thêm method mutate ở CR này.
2. `CreateProfileUseCase`: KHÔNG copy từ Account — set giá trị placeholder cố
   định (`"mock display name"`, `"mock-avatar-url.png"`) khi tạo profile mới.
   Chấp nhận placeholder vì dev sẽ làm lại đầy đủ ở nhánh sau.
   `RegisterAccountUseCase` vẫn seed từ input đăng ký thật (đã có sẵn dữ liệu,
   không lý do gì dùng placeholder ở đây).
3. Xoá `FindAccountsByIdsUseCase` + `IAccountRepository.findByIds` (dead code
   sau khi comment module bỏ dependency Account).

## Chunk tree

### Chunk 1: Account/Profile — thêm displayName/avatarUrl vào Profile (module: account)
- status: done
- Verify đã chạy: tsc/eslint/nest build sạch, jest module account 11/11 pass.
- Entity: tái dùng `Profile`, THÊM field mới (mini-gate xác nhận ở
  AskUserQuestion trước khi code).
- Steps:
  1. domain — `Profile` thêm `displayName: string`, `avatarUrl: string | null`
     vào `TProfileProps` + constructor + getter. Không thêm method mutate.
  2. infrastructure (adapter) — `ProfileTypeOrmEntity` thêm 2 cột
     (`display_name` text NOT NULL, `avatar_url` text NULL); `ProfileMapper`
     map 2 field; migration mới: ADD COLUMN + backfill từ
     `accounts.display_name`/`accounts.avatar_url` join qua `profiles.account_id`
     cho data cũ, rồi set NOT NULL cho `display_name` sau backfill.
  3. use-case — sửa `RegisterAccountUseCase` (seed từ input đăng ký) và
     `CreateProfileUseCase` (seed theo quyết định #2 ở trên). Update test liên
     quan.
- Integrate into: comment module (Chunk 2) sẽ đọc trực tiếp field mới qua
  `Profile` (đã export type qua `public-api.ts` từ trước, không cần export gì
  thêm).
- Gate: build sạch module account, test liên quan pass.
- Commit range: (điền sau)
- Approved by: (chờ AskUserQuestion)

### Chunk 2: Comment — dùng displayName/avatarUrl từ Profile, bỏ Account (module: comment)
- status: done
- Verify đã chạy: tsc/eslint/nest build sạch, jest toàn repo 47/47 pass.
- Entity: không đổi.
- Steps:
  1. use-case — sửa `ResolveCommentAuthorsService`
     (`src/modules/comment/application/services/resolve-comment-authors.service.ts`):
     bỏ dependency `FIND_ACCOUNTS_BY_IDS_USECASE`, chỉ còn gọi
     `FIND_PROFILES_BY_IDS_USECASE` rồi map thẳng
     `{ profileId: profile.id, displayName: profile.displayName, avatarUrl: profile.avatarUrl }`
     — không cần bước join qua `accountId` nữa. Update spec.
     `GetCommentsUseCase`/`GetCommentChildrenUseCase` không đổi (đã phụ thuộc
     service này, không phụ thuộc trực tiếp Account).
- Integrate into: không cross-module thêm (comment module bớt 1 dependency).
- Gate: build sạch, test comment pass, endpoint GET /comments trả đúng
  displayName/avatarUrl lấy từ Profile.
- Commit range: (điền sau)
- Approved by: (chờ AskUserQuestion)

### Chunk 3: Account — dọn dead code (nếu dev xác nhận xoá) (module: account)
- status: done
- Verify đã chạy: tsc/eslint/nest build sạch, jest toàn repo 46/46 pass, grep
  xác nhận không còn reference nào tới FindAccountsByIdsUseCase.
- Steps:
  1. infrastructure — xoá `IAccountRepository.findByIds` +
     `TypeOrmAccountRepository.findByIds`.
  2. use-case — xoá `FindAccountsByIdsUseCase` + spec,
     `find-accounts-by-ids-use-case.interface.ts`.
  3. dọn token `FIND_ACCOUNTS_BY_IDS_USECASE`, export ở `public-api.ts`,
     provider/export ở `account.module.ts`.
- Gate: build sạch, test toàn repo pass, grep xác nhận không còn reference nào.
- Commit range: (điền sau)
- Approved by: (chờ AskUserQuestion)

### Chunk 4: Hoàn thiện endpoint — UpdateProfileUseCase + response DTO trả đúng field từ Profile (module: account)
- status: pending
- Quyết định đã chốt với dev (AskUserQuestion, 2026-09-07):
  1. `UpdateAccountProfileUseCase` đổi hẳn sang sửa `Profile` (không còn sửa
     `Account` nữa). Request thêm `profileId` (bắt buộc).
  2. `GET account` (`AccountResponseDto`) BỎ `displayName`/`avatarUrl` khỏi
     response — client lấy 2 field này từ `GET account/profile`
     (`ProfileResponseDto`, thêm ở chunk này).
  3. `Account.displayName`/`avatarUrl` (entity + cột DB) giữ nguyên, không xoá
     — chỉ không còn endpoint nào đọc/ghi qua Account nữa (out-of-scope dọn
     dead code entity, để dành CR khác nếu cần).
- Phụ thuộc: cần `IProfileRepository.update` — nếu
  `.claude/docs/plans/address-profile-relation.plan.md` Chunk 1 đã chạy trước
  thì tái dùng method đó; nếu chưa, thêm mới ở đây (không thêm trùng lặp).
- Steps:
  1. domain — `Profile` thêm 2 mutator: `changeDisplayName(displayName: string): void`,
     `changeAvatarUrl(avatarUrl: string | null): void` (mini-gate xác nhận
     trước khi code — theo skill `domain`).
  2. infrastructure (adapter) — nếu `IProfileRepository.update` chưa tồn tại
     (xem mục Phụ thuộc), thêm vào `IProfileRepository` +
     `TypeOrmProfileRepository`.
  3. use-case — `UpdateAccountProfileUseCase`: `TUpdateAccountProfileInput`
     thêm `profileId: string` (bắt buộc); load `Profile` theo
     `profileId`, verify `profile.accountId === input.accountId`
     (`ProfileNotFoundError` nếu sai/không tồn tại); thay
     `account.changeDisplayName`/`changeAvatar` bằng
     `profile.changeDisplayName`/`changeAvatarUrl`; bỏ hẳn dependency
     `IAccountRepository` nếu không còn dùng chỗ nào khác trong use-case này
     (giữ lại nếu vẫn cần load account để verify accountId — ưu tiên cách này
     để tránh phải tin tưởng input mù). Update spec.
  4. infrastructure (endpoint) —
     - `UpdateAccountProfileRequestDto` thêm `profileId: string` (bắt buộc,
       `@IsUUID()`), giữ nguyên `displayName?`/`avatarUrl?` +
       `AtLeastOneOf` validator hiện có.
     - `ProfileResponseDto` + `_toProfileResponseDto` thêm
       `displayName: string`, `avatarUrl: string | null`.
     - `AccountResponseDto` + `_toAccountResponseDto`: XOÁ
       `displayName`/`avatarUrl` khỏi response.
  5. doc — cập nhật `update-account-profile.doc.ts`,
     `get-account-profiles.doc.ts`/tương đương, và doc của `GET account` nếu
     có field example cũ.
- Gate: build sạch, test account pass, grep xác nhận
  `AccountResponseDto` không còn `displayName`/`avatarUrl`, `ProfileResponseDto`
  có đủ 2 field.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt chunk tree)

## Ghi chú Post module
Không có chunk nào cho Post — hiện tại Post module không đọc
`displayName`/`avatarUrl` ở đâu cả (chỉ dùng Account cho `currentAddressId` lúc
tạo post). Khi Post thêm tính năng hiển thị tác giả (GET post list, v.v.), PHẢI
dùng `Profile.displayName`/`avatarUrl` (không phải Account) — ghi chú lại đây
để nhắc khi implement feature đó.
