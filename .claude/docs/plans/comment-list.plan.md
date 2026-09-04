# Plan: Danh sách comment (GET root có phân trang + GET children)

## Mô tả
Lấy comment của 1 post: root comment (level 0) phân trang kèm số lượng con;
comment con của 1 comment cha (1 cấp, không phân trang). Mỗi item kèm author
(displayName, avatarUrl, profileId).

## Discovery
- Entity nghi trùng lặp: `Comment` (tái dùng, không đổi — childrenCount/author
  là read-model của use-case, không phải field domain).
- Use-case/port nghi trùng lặp: không có use-case list nào ở module `comment`.
  Module `account`: `Profile`/`Account` đã có sẵn nhưng KHÔNG có method batch
  lookup theo danh sách id — cần thêm mới (không có endpoint/use-case nào trùng
  để tái dùng).
- Package cần thiết: không cần thêm (dùng TypeORM `findAndCount`/`In()` sẵn có
  qua `@nestjs/typeorm`).
- Phát hiện quan trọng: `displayName`/`avatarUrl` nằm trên `Account`
  (`src/modules/account/domain/account.entity.ts`), KHÔNG nằm trên `Profile`.
  Comment chỉ lưu `profileId` → phải tra `Profile.accountId` rồi mới ra
  `Account.displayName/avatarUrl`. Chưa có endpoint/route GET nào dùng query
  param hay pattern phân trang trong repo — đây là lần đầu, tự thiết lập
  convention `page`/`limit` + `meta: { total, page, limit }` (đúng
  `TResponse<T>` sẵn có ở `shared/common/http/response.type.ts`).

## Quyết định đã chốt với dev (AskUserQuestion)
1. Tách 2 endpoint riêng: `GET /comments` (root, phân trang) và
   `GET /comments/:parentId/children` (children, không phân trang).
2. Bỏ query `level` — không dùng nữa (root luôn là "không parentId", children
   luôn chỉ lấy 1 cấp trực tiếp).

## Quyết định mặc định (đã confirm qua AskUserQuestion, 2026-09-04)
3. Batch author lookup đặt ở module `account` dưới dạng 2 use-case thuần theo
   đúng khái niệm domain sẵn có (KHÔNG bịa khái niệm "Author" trong account
   module — đó là thuật ngữ trình bày riêng của comment module):
   - `IFindProfilesByIdsUseCase` (`profileIds: string[]` → `Profile[]`)
   - `IFindAccountsByIdsUseCase` (`accountIds: string[]` → `Account[]`)
   Comment module tự compose 2 lời gọi này để ráp ra `{ profileId, displayName,
   avatarUrl }` cho từng comment (giữ đúng nguyên tắc "CHỈ facade khi có lý do
   rõ ràng" — ở đây KHÔNG facade vì chỉ compose ngay trong 1 use-case, không
   lặp lại ở nhiều nơi).
4. Nếu `profileId`/`accountId` không tìm thấy (dữ liệu lệch — hiếm, không phải
   lỗi do request): KHÔNG throw, trả `author: { profileId, displayName: null,
   avatarUrl: null }` cho item đó — tránh vỡ cả danh sách vì 1 record rác.
5. Pagination convention mới (chưa có tiền lệ trong repo): query
   `page` (mặc định 1), `limit` (mặc định 20, max 50); response
   `{ data: items[], meta: { total, page, limit } }`.
6. `GET /comments/:parentId/children` vẫn bắt buộc query `postId` để validate
   `parent.postId === postId` (tái dùng đúng rule đã có ở
   `create-comment.use-case.ts`, lỗi `ParentCommentNotFoundError` khi lệch).

## Chunk tree

### Chunk 1: Account — batch lookup Profile/Account theo danh sách id (module: account)
- status: in-progress
- Entity: tái dùng `Profile`, `Account` — KHÔNG đổi.
- Steps:
  1. infrastructure (adapter) — thêm `findByIds(ids: string[]): Promise<Profile[]>`
     vào `IProfileRepository` + `TypeOrmProfileRepository` (dùng `In(ids)`).
     Thêm `findByIds(ids: string[]): Promise<Account[]>` vào `IAccountRepository`
     + `TypeOrmAccountRepository`.
  2. use-case — `FindProfilesByIdsUseCase` (port `IFindProfilesByIdsUseCase`,
     token `FIND_PROFILES_BY_IDS_USECASE`) và `FindAccountsByIdsUseCase` (port
     `IFindAccountsByIdsUseCase`, token `FIND_ACCOUNTS_BY_IDS_USECASE`) — mỗi
     use-case chỉ gọi thẳng repository, không thêm logic nghiệp vụ khác. Export
     cả 2 qua `account/public-api.ts` + thêm vào `AccountModule.exports`.
- Integrate into: `CommentModule` (chunk 3) sẽ import `AccountModule` và inject
  2 token trên.
- Gate: build sạch trong module `account`, 2 use-case có test (`*.use-case.spec.ts`
  mock repository).
- Commit range: (điền sau)
- Approved by: dev (2026-09-04, qua AskUserQuestion)

### Chunk 2: Comment — GET root list (phân trang + childrenCount) (module: comment)
- status: done
- Entity: tái dùng `Comment` — KHÔNG đổi.
- Steps:
  1. infrastructure (adapter) — thêm vào `ICommentRepository`:
     - `findRootByPostId(postId: string, page: number, limit: number): Promise<{ items: Comment[]; total: number }>`
       (`parentId IS NULL AND postId = :postId`, `findAndCount` + `skip/take`,
       order `createdAt ASC`).
     - `countChildrenByParentIds(parentIds: string[]): Promise<Record<string, number>>`
       (group by `parentId`, `parentId IN (:...ids)`).
  2. use-case — `GetCommentsUseCase` (port `IGetCommentsUseCase`, token
     `GET_COMMENTS_USECASE`). Input `{ postId: string; page: number; limit: number }`.
     Flow: `findRootByPostId` → `countChildrenByParentIds(ids đã lấy)` →
     gom `profileIds` (unique) → `FindProfilesByIdsUseCase` → gom
     `accountIds` → `FindAccountsByIdsUseCase` → ráp author theo
     `profileId → profile.accountId → account`. Output
     `{ items: TCommentListItem[]; total: number }` với
     `TCommentListItem = { id, content, level, parentId, childrenCount, author: { profileId, displayName, avatarUrl } }`.
     KHÔNG throw nếu postId không tồn tại/không có comment nào — trả list rỗng
     (giữ đơn giản, không cần gọi `FIND_POST_BY_ID_USECASE` để validate post vì
     GET không có side-effect, list rỗng đã đủ an toàn — flag rõ điểm này để
     dev xác nhận có cần validate post tồn tại hay không).
  3. infrastructure (endpoint) — `CommentController.getComments`:
     `GET /comments`, `@UseGuards(JwtAuthGuard)`, query DTO
     `GetCommentsRequestDto { postId: string; page?: number; limit?: number }`
     (`@Type(() => Number)` cho page/limit). Trả
     `{ data: CommentListItemResponseDto[]; meta: { total, page, limit } }`.
  4. doc — `get-comments.doc.ts`.
- `comment.module.ts`: import `AccountModule`, thêm provider
  `GET_COMMENTS_USECASE`.
- Integrate into: không cross-module tiêu thụ thêm (chỉ HTTP).
- Gate: build sạch, test `get-comments.use-case.spec.ts` (mock
  `ICommentRepository` + 2 use-case account), endpoint chạy thử.
- Verify đã chạy: tsc/eslint/nest build sạch, jest toàn repo 41/41 pass.
- Commit range: (chờ dev xác nhận)
- Approved by: dev (2026-09-04, qua AskUserQuestion)

### Chunk 3: Comment — GET children (1 cấp, không phân trang) (module: comment)
- status: pending
- Entity: tái dùng `Comment` — KHÔNG đổi.
- Steps:
  1. infrastructure (adapter) — thêm `findDirectChildren(parentId: string): Promise<Comment[]>`
     vào `ICommentRepository` (`parentId = :parentId`, order `createdAt ASC`,
     không limit).
  2. use-case — `GetCommentChildrenUseCase` (port
     `IGetCommentChildrenUseCase`, token `GET_COMMENT_CHILDREN_USECASE`).
     Input `{ postId: string; parentId: string }`. Flow: `findById(parentId)`
     → null hoặc `parent.postId !== postId` → `ParentCommentNotFoundError`
     (tái dùng đúng error đã có) → `findDirectChildren(parentId)` → author
     enrichment giống Chunk 2 (gọi lại `FindProfilesByIdsUseCase` +
     `FindAccountsByIdsUseCase`) → output `TCommentListItem[]` (KHÔNG có
     `childrenCount` — spec chỉ cần 1 cấp con, không cần đếm cháu).
  3. infrastructure (endpoint) — `CommentController.getCommentChildren`:
     `GET /comments/:parentId/children`, `@UseGuards(JwtAuthGuard)`, query DTO
     `GetCommentChildrenRequestDto { postId: string }`, path param `parentId`.
     Trả `{ data: CommentListItemResponseDto[] }` (không có `meta` phân
     trang).
  4. doc — `get-comment-children.doc.ts`, trace `ParentCommentNotFoundError`
     (404) + validation (400) + JWT (401).
- `comment.module.ts`: thêm provider `GET_COMMENT_CHILDREN_USECASE` (đã có
  `AccountModule` từ Chunk 2, không import lại).
- Integrate into: không cross-module tiêu thụ thêm.
- Gate: build sạch, test `get-comment-children.use-case.spec.ts`, endpoint
  chạy thử end-to-end.
- Commit range: (điền sau)
- Approved by: dev (2026-09-04, qua AskUserQuestion)
