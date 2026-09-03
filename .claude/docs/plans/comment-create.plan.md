# Plan: Tạo comment (POST /comments)

## Mô tả
Account đã đăng nhập tạo comment cho 1 post (comment gốc hoặc reply 1 comment
khác qua `parentId`). `profileId` server tự suy ra từ JWT (giống `POST /posts`).

## Discovery
- Entity nghi trùng lặp: `Comment` (đã tồn tại,
  `src/modules/comment/domain/comment.entity.ts`, tạo ở lần chạy `/domain` trước)
  — TÁI DÙNG. Fields: `content`, `parentId` (nullable), `postId`, `profileId`,
  `childIds: string[]`, `id`/`createdAt`/`updatedAt` (nullable). Methods:
  `updateContent`, `addChild`. KHÔNG có `removeChild` (dev đã bỏ ở lần trước).
- Use-case/port nghi trùng lặp: không có (module `comment` mới chỉ có domain +
  module scaffold rỗng).
- Cross-module cần:
  - Post module (`src/modules/post/`) hiện KHÔNG export gì (`public-api.ts` chưa
    tồn tại), repository `IPostRepository` chỉ có `create` — CẦN thêm
    `findById` + use-case `FindPostByIdUseCase` + `PostNotFoundError` mới, export
    qua `public-api.ts` mới của post module. (đã hỏi dev, xác nhận cần verify
    postId thật qua cross-module thay vì tin client).
  - `profileId`: lấy thẳng từ JWT (`req.user.profileId`), giống pattern
    `CreatePostUseCase` — không cần cross-module thêm cho phần này.
- Package cần thiết: không có gì mới ngoài TypeORM (đã có ở `shared/`).
- Transaction: tạo child comment + update `parent.childIds` phải atomic (đã hỏi
  dev, xác nhận CẦN transaction). Account module đã có `ITransactionManager` +
  `TypeOrmTransactionManager` + `transactionContext` NHƯNG khai báo cục bộ trong
  `modules/account/` (không export, không dùng chung được) — comment module sẽ
  tự có bản riêng tương tự (duplicate pattern, không refactor lên `shared/` ở
  chunk này — nếu sau này có module thứ 3 cần transaction, sẽ cân nhắc promote
  lên `shared/` qua skill `external-package`, ngoài scope hiện tại).

## Quyết định đã chốt với dev (AskUserQuestion)
1. Verify `postId` tồn tại qua cross-module (`FindPostByIdUseCase` mới export từ
   post module), KHÔNG tin client / KHÔNG chỉ dựa DB FK.
2. Khi `parentId` có giá trị: cập nhật `parent.childIds` (gọi `addChild` + lưu
   lại parent) và BỌC TRANSACTION (tạo transaction manager riêng cho comment
   module, theo đúng pattern account module).

## Chunk tree

### Chunk 1: Post — expose FindPostByIdUseCase cho cross-module (module: post)
- status: done
- Entity: tái dùng `Post`, không sửa entity.
- Steps:
  1. domain — thêm `PostNotFoundError` (post module, `POST_NOT_FOUND`, HTTP 404)
     — mini-gate xác nhận khi chạy skill `domain`.
  2. infrastructure (adapter) — thêm method `findById(id): Promise<Post | null>`
     vào `IPostRepository` + implement trong `TypeOrmPostRepository`.
  3. use-case — `FindPostByIdUseCase` (port `IFindPostByIdUseCase`, input
     `{ postId: string }`, output `Post`), throw `PostNotFoundError` nếu không
     tìm thấy. Tạo `src/modules/post/public-api.ts` (MỚI — post module hiện chưa
     có file này), export token `FIND_POST_BY_ID_USECASE` +
     `IFindPostByIdUseCase` + `TFindPostByIdInput` + type `Post`.
  4. infrastructure (endpoint) — không có, chunk này không expose API mới.
  5. doc — không cần (không có endpoint mới).
- `post.module.ts`: đăng ký provider `FindPostByIdUseCase` + token, thêm token
  vào mảng `exports`.
- Integrate into: Chunk 3 (`comment` module) sẽ import `PostModule` + inject
  `FIND_POST_BY_ID_USECASE`.
- Gate: build post module thành công, chưa có consumer thực sự (xác nhận ở
  Chunk 3).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `jest` (toàn bộ, gồm
  `find-post-by-id.use-case.spec.ts` mới + fix mock `create-post.use-case.spec.ts`
  do `IPostRepository` thêm `findById`) pass 24/24, `nest build` sạch.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-03, qua AskUserQuestion)

### Chunk 2: Comment — persistence infra + transaction manager (module: comment)
- status: done
- Entity: tái dùng `Comment`, không sửa entity.
- Steps:
  1. domain — thêm 2 domain-error mới (mini-gate xác nhận khi chạy skill
     `domain`):
     - `ProfileNotActiveError` (comment module, `PROFILE_NOT_ACTIVE`, HTTP 422 —
       khớp convention đã dùng ở post module cho lỗi tương tự).
     - `ParentCommentNotFoundError` (comment module, `PARENT_COMMENT_NOT_FOUND`,
       HTTP 404 — khi `parentId` không tồn tại hoặc không thuộc cùng `postId`).
  2. infrastructure (adapter):
     - Port `ICommentRepository` (`create`, `findById`, `update`) trong
       `application/ports/comment-repository.interface.ts`.
     - Port `ITransactionManager` (`runInTransaction<T>(work): Promise<T>`) —
       copy pattern từ account module, đặt tại
       `application/ports/transaction-manager.interface.ts` (comment module tự
       có bản riêng, không import từ account module — 2 module không được share
       nội bộ của nhau).
     - `CommentTypeOrmEntity`, `comment.mapper.ts`, `TypeOrmCommentRepository`
       (dùng `transactionContext` riêng của comment module để hỗ trợ
       transaction, giống `AddressRepository`/`transaction-context.ts` bên
       account).
     - `TypeOrmTransactionManager` (comment module, copy pattern account).
     - Migration bảng `comments` (`content`, `parent_id` nullable FK tự tham
       chiếu, `post_id`, `profile_id`, `child_ids` text array, timestamps).
  3-5. Không có use-case/endpoint/doc ở chunk này — thuần persistence layer.
- `comment.module.ts`: đăng ký `TypeOrmModule.forFeature([CommentTypeOrmEntity])`,
  provider cho `COMMENT_REPOSITORY` + `TRANSACTION_MANAGER` (token mới trong
  `comment-application.tokens.ts`).
- Integrate into: Chunk 3 sẽ dùng 2 port này trong `CreateCommentUseCase`.
- Gate: build comment module thành công (chưa có use-case dùng, nhưng adapter
  compile + migration chạy được trên DB local).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `nest build` sạch, migration
  `1788451666380-AddCommentEntity.ts` generate + chạy thành công trên DB local
  (bảng `comments` tạo đúng: `parent_id` nullable, `child_ids` text array default
  `'{}'`), boot thử app thật — `CommentModule` init OK, không lỗi DI. `jest` toàn
  bộ vẫn 24/24 (chunk này không thêm use-case nên không thêm test).
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-03, qua AskUserQuestion)

### Chunk 3: Comment — CreateCommentUseCase + endpoint (assembly)
- status: pending
- Entity: tái dùng `Comment`.
- Steps:
  1. domain — không cần thêm (đã đủ ở Chunk 2).
  2. infrastructure (adapter) — không cần thêm (đã đủ ở Chunk 2).
  3. use-case — `CreateCommentUseCase` (port `ICreateCommentUseCase`):
     - Input: `{ accountId, profileId, postId, parentId, content }` (accountId
       lấy từ JWT dù không dùng trực tiếp trong Comment, giữ lại cho log/audit
       tương lai — CHỈ nếu cần, nếu không cần thì bỏ, sẽ xác nhận lúc code).
     - Nếu `profileId` rỗng → `ProfileNotActiveError`.
     - Gọi `FindPostByIdUseCase` (post module, qua public-api) để verify
       `postId` tồn tại → bubble `PostNotFoundError` (từ post module) nếu
       không tìm thấy (không wrap lại thành lỗi riêng của comment module, giữ
       nguyên precedent `AccountNotFoundError` bubble qua trong
       `CreatePostUseCase`).
     - Nếu `parentId` có giá trị: `commentRepository.findById(parentId)` → nếu
       không tồn tại hoặc `parent.postId !== postId` → `ParentCommentNotFoundError`.
     - Trong `transactionManager.runInTransaction`: tạo `Comment` mới (childIds:
       `[]`) → `commentRepository.create(comment)`; nếu có `parentId`:
       `parent.addChild(created.id)` → `commentRepository.update(parent)`.
     - Return comment vừa tạo.
  4. infrastructure (endpoint) — `CommentController` (`POST /comments`,
     `@UseGuards(JwtAuthGuard)`):
     - `CreateCommentRequestDto`: `content` (`IsString`, `IsNotEmpty`),
       `parentId` (`IsOptional`, `IsString`), `postId` (`IsString`,
       `IsNotEmpty`).
     - Map DTO + `CurrentUser()` → input use-case thủ công trong controller.
     - `CommentResponseDto`: `id, content, parentId, postId, profileId,
       childIds, createdAt, updatedAt`.
  5. doc — `create-comment.doc.ts`, trace qua `CreateCommentUseCase` +
     `ProfileNotActiveError` (422) + `PostNotFoundError` (404, từ post module) +
     `ParentCommentNotFoundError` (404) + validation pipe (400) + JWT (401).
- `comment.module.ts`: thêm import `PostModule` (lấy `FIND_POST_BY_ID_USECASE`),
  đăng ký provider `CreateCommentUseCase` + token, controller.
- Integrate into: `app.module.ts` đã có `CommentModule` sẵn (từ commit scaffold
  trước) — chỉ cần xác nhận vẫn đúng.
- Gate: vertical slice build được, endpoint `POST /comments` chạy end-to-end
  (gọi được, trả về comment đã tạo, parent.childIds cập nhật đúng khi có
  parentId).
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev duyệt Plan)
