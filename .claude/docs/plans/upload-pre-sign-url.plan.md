# Plan: Gen pre-sign upload URL (POST /uploads/pre-sign-url)

## Mô tả
Client gửi danh sách filename, server sinh TMP object key cho từng file (dùng lại
convention `TMP/<uuid>-<filename>` đã có) + signed upload URL tương ứng để client
upload thẳng lên Firebase Storage. Key trả về sẽ được dùng lại làm input `images`
cho `POST /posts` (và các flow khác sau này, vd avatar).

## Discovery
- Entity nghi trùng lặp: không có — nghiệp vụ này thuần túy generate signed URL +
  key, không có invariant/state cần entity domain.
- Use-case/port nghi trùng lặp: không có use-case nào sẵn expose ra HTTP; NHƯNG
  `IFileStorage.getSignedUploadUrl` + `buildTmpObjectKey` đã tồn tại sẵn ở
  `shared/infrastructure/storage/` (dùng lại y nguyên, không cần external-package
  hay adapter mới). Pattern TMP key đã dùng ở `UpdateAccountProfileUseCase` và
  `CreatePostUseCase` — endpoint này chính là mắt xích còn thiếu để client CÓ
  key TMP hợp lệ trước khi gọi các flow đó.
- Module liên quan đã tồn tại chưa: KHÔNG — tạo module mới `upload` (đã hỏi dev,
  xác nhận dùng module riêng dùng chung toàn project, không gắn cứng vào `post`).
- Package cần thiết: `IFileStorage` (port thuần, không phải SDK cụ thể) đã có ở
  `shared/`, module nào cũng được phép `@Inject(FILE_STORAGE)` trực tiếp (đúng
  precedent 2 use-case trên) — không cần external-package mới.

## Quyết định đã chốt với dev (AskUserQuestion)
1. Response: `{ keys: string[], presignUrls: string[] }` — 2 mảng song song,
   cùng index tương ứng 1 file input (KHÔNG dùng mảng object `{key, presignUrl}`).
2. Module: tạo module mới `upload` (không gắn vào `post`), route
   `POST /uploads/pre-sign-url`, để module khác (post, account/avatar...) tái sử
   dụng sau này qua HTTP — module không cần `public-api.ts` export use-case nội
   bộ (chưa có nhu cầu inject use-case này từ module khác qua DI, chỉ cần gọi
   qua HTTP).

## Chunk tree

### Chunk 1: Upload module — pre-sign URL endpoint (module: upload)
- status: done
- Entity: không tạo (domain-less module, chỉ có application + infrastructure)
- Steps:
  1. domain — SKIP (không có entity/domain-error mới; xác nhận nhanh qua skill
     `domain` rồi dừng nếu đúng là không cần gì).
  2. infrastructure (adapter) — SKIP (tái dùng `FILE_STORAGE`/`IFileStorage`
     + `buildTmpObjectKey` có sẵn, không cần adapter mới).
  3. use-case — `GeneratePreSignUploadUrlsUseCase` (port
     `IGeneratePreSignUploadUrlsUseCase`): input `{ files: string[] }`, output
     `{ keys: string[], presignUrls: string[] }`. Với mỗi filename: build key qua
     `buildTmpObjectKey(fileName)`, gọi `fileStorage.getSignedUploadUrl(key)`
     (không truyền `contentType`, client chưa gửi). Không cross-module, không
     export public-api (module khác gọi qua HTTP, không qua DI).
  4. infrastructure (endpoint) — `UploadController` (`POST /uploads/pre-sign-url`,
     `@UseGuards(JwtAuthGuard)` — mặc định yêu cầu đăng nhập để tránh lạm dụng
     storage; sẽ flag lại nếu dev muốn public):
     - `PreSignUploadRequestDto`: `files: string[]` (`ArrayNotEmpty`,
       `IsString({ each: true })`, giống pattern `images` ở `CreatePostRequestDto`).
     - `PreSignUploadResponseDto`: `keys: string[]`, `presignUrls: string[]`.
     - Controller chỉ orchestrate: gọi use-case, trả thô kết quả (đã đúng shape
       response DTO, không cần map thủ công entity).
  5. doc — `pre-sign-upload.doc.ts`, trace qua use-case (không throw domain-error
     nào ngoài lỗi validate DTO chuẩn 400 + 401 JWT) + global filter/pipe.
- `upload.module.ts` (mới): `imports: [StorageModule]`, `controllers:
  [UploadController]`, `providers: [GeneratePreSignUploadUrlsUseCase]` (không cần
  DI token/export vì không ai inject use-case này qua DI, chỉ NestJS tự resolve
  trong controller).
- `app.module.ts`: thêm `UploadModule` vào `imports`.
- Integrate into: không có consumer module nào cần import use-case này qua DI
  (chunk không cross-module ở mức DI — chỉ là HTTP endpoint độc lập, FE gọi trực
  tiếp).
- Gate: vertical slice build được trong module `upload`, endpoint chạy end-to-end
  (gọi thử trả về key + presignUrl hợp lệ).
- Verify đã chạy: `tsc --noEmit` sạch, `eslint` sạch, `jest` (toàn bộ, gồm
  `generate-pre-sign-upload-urls.use-case.spec.ts` mới) pass 22/22, `nest build`
  sạch, boot thử app thật — `UploadModule` init OK, route
  `POST /api/uploads/pre-sign-url` map đúng, không lỗi DI/runtime.
- Commit range: chưa commit (chờ dev xác nhận)
- Approved by: dev (2026-09-03, qua AskUserQuestion)
