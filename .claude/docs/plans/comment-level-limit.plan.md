# Plan: Giới hạn độ sâu reply comment (level + COMMENT_LEVEL_LIMIT)

## Mô tả
Comment có thêm field `level` (độ sâu reply). Comment gốc (`parentId = null`) có
`level = 0`; comment reply có `level = parent.level + 1`. Giới hạn độ sâu tối đa
qua env `COMMENT_LEVEL_LIMIT`; nếu `level` tính được `>= limit` thì reject tạo
comment.

## Discovery
- Entity nghi trùng lặp: không — sửa `Comment` (đã tồn tại,
  `src/modules/comment/domain/comment.entity.ts`), thêm field `level: number`.
- Use-case nghi trùng lặp: không — sửa `CreateCommentUseCase` đã tồn tại
  (`src/modules/comment/application/use-cases/create-comment.use-case.ts`).
  Use-case này ĐÃ fetch `parent` (`commentRepository.findById(parentId)`) để
  validate `ParentCommentNotFoundError` — tái dùng luôn record đó để lấy
  `parent.level`, không query thêm lần 2.
- Domain-error mới: `CommentLevelLimitExceededError` — theo precedent
  `MaxProfileLimitReachedError` (account module): code
  `COMMENT_LEVEL_LIMIT_EXCEEDED`, HTTP 422.
- Config env mới: chưa có `comment.config.ts` trong `src/configs/` — cần tạo mới
  (các module khác đều có 1 file config riêng, vd `otp.config.ts`). Biến
  `COMMENT_LEVEL_LIMIT` (số nguyên, có default hợp lý — sẽ hỏi dev giá trị
  default khi chạy skill `config-env` nếu cần).
- Package cần thiết: không có gì mới.
- Không cross-module — toàn bộ nằm trong `comment` module + `configs/`.

## Quyết định đã chốt với dev (AskUserQuestion)
1. Giữ 1 chunk duy nhất (không tách nhỏ config-env riêng).
2. `COMMENT_LEVEL_LIMIT` default = 3 (level hợp lệ: 0, 1, 2 — level tính được
   `>= 3` bị reject).

## Chunk tree

### Chunk 1: Comment — thêm level + giới hạn độ sâu (module: comment)
- status: done
- Entity: sửa `Comment` (thêm field `level: number`, không đổi field khác).
- Steps (atomic skill theo thứ tự):
  1. config-env — thêm `comment.config.ts` (`TCommentConfig { levelLimit: number }`),
     thêm `COMMENT_LEVEL_LIMIT` vào `validation.schema.ts` + `.env`, export ở
     `configs/index.ts`.
  2. domain — sửa `Comment` entity: thêm field `level: number` vào
     `TCommentProps` + constructor + getter (mini-gate xác nhận với dev). Thêm
     domain-error `CommentLevelLimitExceededError`
     (`COMMENT_LEVEL_LIMIT_EXCEEDED`, 422).
  3. infrastructure (adapter) — thêm cột `level` (`int`, not null) vào
     `CommentTypeOrmEntity`, cập nhật `comment.mapper.ts` (2 chiều), sinh
     migration mới (TypeORM migration, add column `level`).
  4. use-case — sửa `CreateCommentUseCase`:
     - Inject `ConfigService` (hoặc dùng `commentConfig` qua `@Inject`, theo
       convention project đã dùng ở use-case khác) để đọc `levelLimit`.
     - Nếu `parentId` null → `level = 0`.
     - Nếu có `parentId` → dùng `parent` đã fetch ở bước validate
       `ParentCommentNotFoundError` → `level = parent.level + 1`.
     - Nếu `level >= levelLimit` → throw `CommentLevelLimitExceededError`
       (check TRƯỚC khi gọi `commentRepository.create`).
     - Truyền `level` vào `Comment` khi tạo mới.
  5. infrastructure (endpoint) — `CommentResponseDto` thêm field `level`;
     `CommentController._toCommentResponseDto` map thêm `level`.
  6. doc — cập nhật `create-comment.doc.ts`: thêm response case 422
     `CommentLevelLimitExceededError` vào danh sách lỗi có thể xảy ra.
- `comment.module.ts`: không cần sửa (không thêm token/provider mới ngoài
  config, config module là global theo `@nestjs/config` pattern sẵn có).
- Integrate into: không cross-module — vertical slice nội bộ `comment` module.
- Gate: vertical slice build được, `POST /comments` chạy end-to-end với rule
  level mới (test thủ công/hoặc spec: reply vượt `COMMENT_LEVEL_LIMIT` bị
  reject 422).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch (1 lỗi format prettier đã
  auto-fix), `jest` toàn bộ 36/36 pass (bao gồm 3 test case mới trong
  `create-comment.use-case.spec.ts`: level=0 khi parentId null, level=parent+1
  khi có parentId, throw `CommentLevelLimitExceededError` khi level>=limit), fix
  `delete-comment.use-case.spec.ts` do `TCommentProps` thêm field `level` bắt
  buộc. `nest build` sạch. Migration `1788495297699-AddCommentLevel.ts` chạy
  thành công trên DB local (cột `level` NOT NULL, DEFAULT 0 lúc add rồi drop
  default — an toàn nếu bảng đã có data). Boot thử app thật —
  `CommentModule` init OK, route `POST /api/comments` và `DELETE /api/comments`
  map đúng, không lỗi DI/runtime.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-04, qua AskUserQuestion — 1 chunk, default limit = 3)
