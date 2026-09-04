# Plan: Xóa comment (DELETE /comments)

## Mô tả
Account đã đăng nhập xóa 1 comment của chính mình (`profileId` khớp), chỉ cho
xóa khi comment không còn con (`childIds.length === 0`). Nếu comment có
`parentId`, dọn lại `parent.childIds` (bỏ id vừa xóa) để tránh id rác.

## Discovery
- Entity nghi trùng lặp: `Comment` (tái dùng, `src/modules/comment/domain/comment.entity.ts`).
  Hiện có `updateContent`, `addChild`. KHÔNG có method mutate xóa 1 childId (đã
  bỏ `removeChild` ở lần trước, giờ cần lại cho mục đích dọn `parent.childIds`
  sau khi xóa con — đã hỏi dev, xác nhận CẦN thêm method mới).
- Use-case/port nghi trùng lặp: không có `DeleteCommentUseCase` hay
  `ICommentRepository.delete` — cần thêm mới.
- Package cần thiết: không có gì mới (dùng lại `TRANSACTION_MANAGER` đã có từ
  feature `comment-create`).

## Quyết định đã chốt với dev (AskUserQuestion)
1. Xóa comment C có `parentId`: dọn lại `parent.childIds` (bỏ id C) — cần thêm
   method mutate mới trên `Comment` entity (mini-gate xác nhận tên/behavior lúc
   chạy skill `domain`).
2. Chỉ `profileId` đã tạo comment (so khớp JWT) mới được xóa — sai chủ →
   domain-error riêng (403-style).

## Chunk tree

### Chunk 1: Comment — DeleteCommentUseCase + endpoint (module: comment)
- status: done
- Entity: tái dùng `Comment`, THÊM 1 method mutate mới (tên/behavior confirm ở
  bước domain — dự kiến `removeChildId(childId: string): void`, no-op nếu
  không tìm thấy, KHÔNG throw — khớp tinh thần "giữ đơn giản" dev đã chọn lần
  trước khi bỏ `removeChild`).
- Steps:
  1. domain — mini-gate xác nhận khi chạy skill `domain`:
     - Method `Comment.removeChildId(childId)` — dọn `childIds`.
     - `CommentNotFoundError` (404) — `commentId` không tồn tại.
     - `CommentHasChildrenError` (422) — `childIds.length > 0`, khớp convention
       422 cho business-rule violation (giống `ProfileNotActiveError`,
       `InvalidDisplayNameError`).
     - `ForbiddenCommentDeletionError` (403) — `comment.profileId !== profileId`
       của người gọi.
  2. infrastructure (adapter) — thêm `delete(id): Promise<void>` vào
     `ICommentRepository` + implement trong `TypeOrmCommentRepository`.
  3. use-case — `DeleteCommentUseCase` (port `IDeleteCommentUseCase`):
     - Input: `{ profileId: string | null, commentId: string }`, output `void`.
     - Nếu `!profileId` → `ProfileNotActiveError` (đã có sẵn từ feature trước).
     - `commentRepository.findById(commentId)` → null → `CommentNotFoundError`.
     - `comment.profileId !== profileId` → `ForbiddenCommentDeletionError`.
     - `comment.childIds.length > 0` → `CommentHasChildrenError`.
     - Trong `transactionManager.runInTransaction`: nếu `comment.parentId` →
       fetch parent, `parent.removeChildId(comment.id)`, `commentRepository.update(parent)`
       (nếu parent không tồn tại — coi như đã lệch dữ liệu từ trước, BỎ QUA
       bước dọn dẹp, không throw, vẫn tiếp tục xóa comment — vì lỗi này không
       phải do request hiện tại gây ra). Sau đó `commentRepository.delete(commentId)`.
     - Không export qua `public-api.ts` (chưa module nào cần dùng qua DI).
  4. infrastructure (endpoint) — `CommentController` (đã có sẵn, method mới):
     - `DELETE /comments`, `@UseGuards(JwtAuthGuard)`, `@Body() body:
       DeleteCommentRequestDto { commentId: string }` (giống pattern
       `DELETE /account/address` — body, không phải path param), trả `null`.
  5. doc — `delete-comment.doc.ts`, trace `ProfileNotActiveError` (422),
     `CommentNotFoundError` (404), `ForbiddenCommentDeletionError` (403),
     `CommentHasChildrenError` (422) + validation (400) + JWT (401).
- `comment.module.ts`: không cần thêm import mới (đã có `PostModule`,
  `TRANSACTION_MANAGER`, `COMMENT_REPOSITORY` từ feature trước) — chỉ thêm
  provider `DeleteCommentUseCase` + token mới `DELETE_COMMENT_USECASE`.
- Integrate into: không cross-module mới.
- Gate: vertical slice build được, endpoint `DELETE /comments` chạy end-to-end
  (xóa được comment không con, từ chối comment có con/không phải chủ, dọn đúng
  `parent.childIds` khi có `parentId`).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `jest` toàn bộ (gồm
  `delete-comment.use-case.spec.ts` mới, 7 test case) pass 36/36, `nest build`
  sạch, boot thử app thật — route `DELETE /api/comments` map đúng cạnh `POST`,
  không lỗi DI/runtime.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-04, qua AskUserQuestion)
