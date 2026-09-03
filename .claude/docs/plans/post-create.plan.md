# Plan: Tạo bài đăng (POST /posts)

## Mô tả
Tài khoản đã đăng nhập tạo 1 post (mua/bán), ảnh được move từ TMP storage sang
bucket `POST/<slug-title>/`, provinceCode + profileId server tự suy ra từ context
account hiện tại (không nhận từ client).

## Discovery
- Entity nghi trùng lặp: `Post` (đã tồn tại tại `src/modules/post/domain/post.entity.ts`,
  scaffold từ commit trước) — TÁI DÙNG, không tạo mới.
- Domain errors đã có ở post module: `ImageNotFoundError`, `InvalidCountOperationError`
  (dùng cho `removeImage`/count rule, không liên quan flow tạo post) — không tái dùng
  cho lỗi upload/context.
- Use-case/port nghi trùng lặp: không có (module `post` mới chỉ có domain scaffold,
  chưa có application/infrastructure).
- Cross-module cần: `provinceCode` lấy từ account's current address, `profileId` lấy
  thẳng từ JWT payload (`req.user.profileId`, đã có sẵn — xem `TJwtPayload`).
  - `FindAccountByIdUseCase` (account module) đã tồn tại, đã provide trong
    `account.module.ts`, NHƯNG chưa export qua `public-api.ts`/module `exports`.
  - `GetAccountAddressesUseCase` (account module) đã tồn tại, đã provide, NHƯNG
    chưa export qua `public-api.ts`/module `exports`.
  - QUYẾT ĐỊNH (đã hỏi dev, xác nhận): tái dùng 2 use-case trên (không tạo use-case
    account mới) — Post use-case sẽ tự lọc address có `id === account.currentAddressId`
    từ kết quả `GetAccountAddressesUseCase`.
- Package cần thiết: `IFileStorage` (đã có ở `shared/infrastructure/storage/`,
  có sẵn `moveObject`) — TÁI DÙNG, không cần external-package mới. Pattern move
  ảnh từ TMP tham khảo `UpdateAccountProfileUseCase._moveAvatarFromTmp`
  (`src/modules/account/application/use-cases/account/update-account-profile.use-case.ts:45`).

## Quyết định đã chốt với dev (AskUserQuestion)
1. `profileId`/`provinceCode`: server tự suy ra (JWT + account context), KHÔNG nhận
   từ client body.
2. `images` trong payload: là TMP storage key (`TMP/<uuid>-<filename>`, giống flow
   avatar hiện có), KHÔNG phải URL public.

## Chunk tree

### Chunk 1: Expose account read use-case cho cross-module (module: account)
- status: done
- Entity: không có thay đổi
- Steps:
  1. use-case — KHÔNG tạo use-case mới. Chỉ export 2 use-case đã tồn tại:
     `FIND_ACCOUNT_BY_ID_USECASE` (`IFindAccountByIdUseCase`, `TFindAccountByIdInput`)
     và `GET_ACCOUNT_ADDRESSES_USECASE` (`IGetAccountAddressesUseCase`,
     `TGetAccountAddressesInput`) qua `public-api.ts`; thêm 2 token vào mảng
     `exports` của `account.module.ts` (hiện provider đã có, chỉ thiếu export).
     Cũng cần export type `Address` (domain entity) vì `GetAccountAddressesUseCase`
     trả `Address[]` — export type-only qua `public-api.ts`.
- Integrate into: Chunk 2 (`post` module) sẽ import `AccountModule` + inject 2 token
  trên trong `CreatePostUseCase`.
- Gate: build account module thành công, chưa có consumer thực sự (sẽ xác nhận ở
  Chunk 2).
- Commit range: chưa commit (chờ dev xác nhận) — dự kiến 1 commit "feat(account):
  export find-account-by-id and get-account-addresses use-cases [plan: chunk-1]"
- Approved by: dev (2026-09-03, qua AskUserQuestion)

### Chunk 2: Tạo Post (module: post) — vertical slice + endpoint
- status: done
- Entity: tái dùng `Post` (không sửa, không tạo mới)
- Steps:
  1. domain — thêm domain errors mới trong `post` module (mini-gate xác nhận với
     dev khi chạy skill `domain`):
     - `ProfileNotActiveError` — JWT không có `profileId` (account chưa chọn/không
       có active profile).
     - `CurrentAddressNotFoundError` — account chưa có `currentAddressId` hoặc
       address tương ứng không tồn tại trong danh sách trả về.
     - `PostImageSourceInvalidError` — 1 phần tử trong `images` không phải TMP key
       hợp lệ hoặc move thất bại.
  2. infrastructure (adapter) — implement `IPostRepository` (port mới, method
     `create(post: Post): Promise<Post>`):
     - `PostTypeOrmEntity` (`infrastructure/typeorm/entities/post.typeorm-entity.ts`)
     - `post.mapper.ts`
     - `post.repository.ts` (TypeOrmPostRepository)
  3. use-case — `CreatePostUseCase` (port `ICreatePostUseCase`):
     - Input: `{ accountId, profileId, postType, title, content, images }`
       (accountId/profileId lấy từ JWT ở controller, không phải body).
     - Flow: lấy account qua `FindAccountByIdUseCase` → lấy danh sách address qua
       `GetAccountAddressesUseCase` → tìm address có `id === account.currentAddressId`
       (không có thì throw `CurrentAddressNotFoundError`) → lấy `provinceCode`.
       Nếu `profileId` rỗng → throw `ProfileNotActiveError`. Move từng ảnh trong
       `images` (phải bắt đầu bằng `TMP/`) sang `POST/<slug(title)>/<filename>` qua
       `IFileStorage.moveObject` (lỗi → `PostImageSourceInvalidError`, theo đúng
       pattern try/catch của `_moveAvatarFromTmp`). Tạo `Post` entity mới với
       `likeCount: 0, commentCount: 0`, lưu qua `IPostRepository.create`.
     - Slug title: hàm private trong use-case, chuẩn hoá title thành chuỗi an toàn
       cho Firebase Storage path (bỏ dấu, lowercase, thay khoảng trắng/ký tự đặc
       biệt bằng `-`).
  4. infrastructure (endpoint) — `PostController` (`POST /posts`, `@UseGuards(JwtAuthGuard)`):
     - `CreatePostRequestDto`: `postType (TPostType)`, `title`, `content`,
       `images: string[]` — validate bằng `class-validator`.
     - Map DTO + `CurrentUser()` (accountId, profileId) → `TCreatePostInput` thủ
       công trong controller (không dùng mapper tự động).
     - `PostResponseDto`: map từ `Post` entity trả ra (`id, postType, title,
       content, images, provinceCode, profileId, likeCount, commentCount,
       createdAt, updatedAt`).
     - Response trả thô (không tự bọc envelope, `ResponseInterceptor` lo phần đó).
  5. doc — `create-post.doc.ts` (swagger decorator qua `applyDecorators`), trace
     qua `CreatePostUseCase` + 3 domain error mới + `AccountNotFoundError` (nếu
     `FindAccountByIdUseCase` có thể throw) để suy ra đầy đủ response status.
- `post.module.ts`: wire `TypeOrmModule.forFeature([PostTypeOrmEntity])`,
  `StorageModule`, `AccountModule` (import để lấy 2 use-case đã export ở Chunk 1),
  đăng ký provider + token mới (`post-application.tokens.ts`), export controller.
- Integrate into: `app.module.ts` đã có `PostModule` sẵn (từ commit scaffold trước) —
  chỉ cần xác nhận vẫn đúng, không cần sửa.
- Gate: vertical slice build được, endpoint `POST /posts` chạy end-to-end (gọi
  được, trả về post đã tạo), account use-case đã thực sự được inject + dùng.
- Điều chỉnh so với draft ban đầu (phát hiện lúc code, đã note lại):
  - `PostImageSourceInvalidError`: đổi status 400 → 404, khớp convention lỗi
    tương tự đã có (`AvatarSourceNotFoundError` cũng 404 "source not found").
  - `ProfileNotActiveError`: đổi status 400 → 422, khớp convention lỗi vi phạm
    business rule/precondition đã có (`InvalidDisplayNameError` dùng 422).
  - Thêm migration `1788431663798-AddPostEntity.ts` (bảng `posts`) — chunk gốc
    không liệt kê rõ bước này nhưng bắt buộc theo tech stack TypeORM
    (`synchronize: false`), đã generate + chạy thành công trên DB local.
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `jest` (toàn bộ + riêng
  post module) pass 20/20, `nest build` sạch, boot thử app thật (`node dist/main.js`)
  — DI resolve đủ, route `POST /api/posts` map đúng, không lỗi runtime.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-03, qua AskUserQuestion)
