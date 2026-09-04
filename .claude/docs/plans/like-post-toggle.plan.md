# Plan: Like/Unlike Post (toggle)

## Mô tả
1 endpoint `POST /likes` (payload: `postId`, response `data: null`). Server tự
toggle: chưa like → tạo Like record + tăng `Post.likeCount`; đã like → xóa Like
record + giảm `Post.likeCount`.

## Discovery
- Entity nghi trùng lặp: `Like` entity đã có sẵn (`modules/like/domain/like.entity.ts`,
  tạo ở phiên trước qua skill `domain`) — TÁI DÙNG, không tạo lại.
  - Fields: id, postId, profileId, reactionType ('LIKE'), createdAt.
  - Domain-error có sẵn: `DuplicateLikeError` — KHÔNG dùng trong flow toggle này
    (toggle luôn check tồn tại trước khi tạo nên không bao giờ trùng). Giữ nguyên
    file, không xóa (đã confirm ở phiên domain trước, có thể cần cho use-case
    khác sau này).
  - `Post` entity đã có sẵn `addLikeCount()` / `minusLikeCount()` — TÁI DÙNG.
- Use-case/port nghi trùng lặp: không có (chưa có use-case like/unlike nào).
- Gap phát hiện: `IPostRepository` (post module) hiện chỉ có `create`/`findById`,
  THIẾU `update` — cần thêm để persist likeCount sau khi gọi
  `addLikeCount()`/`minusLikeCount()`.
- Package cần thiết: đã có ở shared/ (TypeORM đã wrap sẵn, dùng lại pattern
  `comment`/`post` module).

## Chunk tree

### Chunk 1: Post module — expose khả năng cập nhật likeCount (module: post)
- status: done
- Entity: tái dùng `Post` (không sửa domain, method đã có sẵn)
- Steps:
  1. use-case — thêm method `update(post): Promise<Post>` vào `IPostRepository`
     port; thêm 2 use-case mới: `IncrementPostLikeCountUseCase`,
     `DecrementPostLikeCountUseCase` (port + impl + spec), token trong
     `post-application.tokens.ts`.
  2. infrastructure (adapter) — implement `update()` trong `TypeOrmPostRepository`.
  3. infrastructure (module wiring) — đăng ký 2 use-case mới trong `post.module.ts`.
- Integrate into: export `INCREMENT_POST_LIKE_COUNT_USECASE` +
  `DECREMENT_POST_LIKE_COUNT_USECASE` (kèm type) qua `post/public-api.ts` để
  module `like` dùng.
- Gate: post module build/test xong nội bộ + export đúng qua public-api.
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt Plan)

### Chunk 2: Like module — endpoint toggle like/unlike (module: like)
- status: pending
- Entity: tái dùng `Like` (không sửa domain)
- Steps:
  1. use-case — định nghĩa `ILikeRepository` port (`create`, `findByPostAndProfile`,
     `delete`), token trong `like-application.tokens.ts`; viết
     `ToggleLikeUseCase` (+ spec): validate post tồn tại qua
     `FIND_POST_BY_ID_USECASE` (public-api post), tìm like hiện có theo
     postId+profileId → nếu có thì xóa + gọi `DECREMENT_POST_LIKE_COUNT_USECASE`,
     nếu không thì tạo + gọi `INCREMENT_POST_LIKE_COUNT_USECASE`.
  2. infrastructure (adapter) — `LikeTypeOrmEntity`, `LikeMapper`,
     `TypeOrmLikeRepository` implement `ILikeRepository`; migration tạo bảng
     `likes` (unique index `post_id + profile_id`).
  3. infrastructure (endpoint) — `LikeController` (`POST /likes`, JWT guard,
     `CurrentUser` lấy `profileId`), `ToggleLikeRequestDto { postId }`, response
     `null`.
  4. doc — `ToggleLikeDoc` swagger decorator cho endpoint.
  5. infrastructure (module wiring) — `like.module.ts`: import `PostModule`,
     `TypeOrmModule.forFeature([LikeTypeOrmEntity])`, đăng ký providers/tokens.
- Integrate into: không export gì thêm (endpoint là điểm cuối, không module nào
  khác cần gọi use-case này qua public-api).
- Gate: `POST /likes` chạy end-to-end (like → likeCount +1, gọi lại → unlike →
  likeCount -1).
- Commit range: (điền sau)
- Approved by: (chờ dev duyệt Plan)
