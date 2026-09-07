# Plan: Comment realtime + Notification system

## Mô tả
(1) Comment mới trong 1 post hiển thị realtime cho user khác đang xem post đó.
(2) Thông báo cho chủ post khi có người comment, và cho chủ comment khi có
người reply — CHỈ khi người nhận không đang xem đúng post đó (chưa join room
comment của post). Hiển thị ở icon notification (danh sách + unread count +
mark-as-read).

## Discovery
- Đã kiểm tra: CẢ 2 feature CHƯA implement. `CommentModule` chỉ có REST, không
  WebSocket, không emit event khi tạo comment. Không tồn tại `NotificationModule`
  hay bất kỳ entity/use-case notification nào (grep toàn repo ra rỗng).
- Entity nghi trùng lặp: không có — `Notification` là entity hoàn toàn mới.
- Use-case/port nghi trùng lặp: không có. Tái dùng pattern có sẵn:
  - `FIND_POST_BY_ID_USECASE` (post module) lấy `ownerProfileId`.
  - `FIND_PROFILES_BY_IDS_USECASE` (account module) + pattern
    `ResolveCommentAuthorsService` → tạo `ResolveNotificationActorsService`
    tương tự để đính kèm displayName/avatar actor.
  - Pattern gateway cá nhân `user:<profileId>` + `ws-auth.util.ts` (đã có từ
    feature chat-unread-notification) → tái dùng cho notification gateway.
- Package cần thiết: không cần package mới.

### Quyết định đã chốt với dev
1. **Data shape**: dùng cột cụ thể (không jsonb) — xem schema Chunk 2.
2. **Realtime transport**: gateway/namespace riêng `/notifications` (đúng
   precedent hiện có, mỗi module tự có gateway).
3. **Mark-as-read**: có cả mark-single VÀ mark-all ngay từ V1.
4. **Skip nếu đang xem post**: CÓ skip — nếu recipient đang ở trong room
   `post:<postId>` (đã `joinPostComments`) tại thời điểm có comment/reply mới
   → KHÔNG tạo notification. Hệ quả: `CommentModule` cần tự track "ai đang
   xem post nào" (in-memory Map trong `CommentGateway`), qua 1 port riêng của
   comment module (không phải notification module biết về khái niệm "room").
   Giới hạn: chỉ đúng khi chạy 1 instance server (không Redis pub/sub) — CHẤP
   NHẬN cho V1, không over-engineer multi-instance ngay.
5. **Phạm vi 2 case** (KHÔNG làm case thứ 3): comment top-level (parentId =
   null) → chỉ notify chủ post. Reply (parentId != null) → chỉ notify chủ
   comment cha, KHÔNG đồng thời notify chủ post.

## Chunk tree

### Chunk 1: Realtime hiển thị comment mới + presence tracking (module: comment)
- status: done
- Entity: tái dùng `Comment` (không đổi)
- Steps:
  1. infrastructure (adapter/gateway) — `CommentGateway` mới
     (`src/modules/comment/infrastructure/websocket/comment.gateway.ts`),
     namespace `/comments`, `WsJwtGuard` + `WsDomainExceptionFilter` (pattern
     giống `ChatGateway`).
     - `@SubscribeMessage('joinPostComments')` nhận `{postId}` →
       `client.join('post:' + postId)` → ghi nhận vào Map nội bộ
       `profileId -> Set<postId>` (đang xem post nào).
     - `@SubscribeMessage('leavePostComments')` nhận `{postId}` →
       `client.leave(...)` → gỡ khỏi Map.
     - `handleDisconnect` (implements `OnGatewayDisconnect`) → gỡ toàn bộ entry
       của profileId đó khỏi Map (dùng `client.data.user`, set lúc
       `handleConnection` xác thực JWT qua `verifyWsToken`, giống `ChatGateway`).
     - Method `broadcastNewComment(postId, comment)` → `server.to('post:' +
       postId).emit('newComment', payload)`.
     - Method `isProfileViewingPost(postId, profileId): boolean` — tra Map,
       dùng ở Chunk 3 qua port riêng (bước 2 dưới).
  2. use-case (application, chỉ định nghĩa port — KHÔNG có business flow use-case
     mới) — port `ICommentPresencePort` (`isViewingPost(postId, profileId):
     boolean`) trong `application/ports/comment-presence.interface.ts`, token
     `COMMENT_PRESENCE_PORT`. `CommentGateway` implement port này (bind trong
     `comment.module.ts`).
  3. infrastructure (endpoint) — sửa `CommentController.create`: inject
     `CommentGateway`, sau khi tạo comment thành công → gọi
     `this._commentGateway.broadcastNewComment(postId, dto)`.
  4. Đăng ký `CommentGateway` vào `comment.module.ts` (providers + bind
     `COMMENT_PRESENCE_PORT`).
- Integrate into: không cross-module ở chunk này (port dùng nội bộ, Chunk 3 sẽ
  inject `COMMENT_PRESENCE_PORT` vào `CreateCommentUseCase`).
- Gate: build/lint/test pass; test E2E bằng socket client thật (2 client cùng
  join `post:<id>`, xác nhận nhận `newComment`; test `isProfileViewingPost`
  qua unit test hoặc log tạm).
  ĐÃ TEST THẬT: viewer đã joinPostComments nhận `newComment` qua REST
  POST /comments thật; viewer chưa join thì không nhận. Nhân tiện fix 1 bug có
  sẵn (không liên quan chunk này) chặn test: `commentConfig` chưa được đăng ký
  vào `ConfigModule.forRoot({load})` trong app.module.ts → mọi POST /comments
  đều 500. Đã fix qua skill config-env.
- Commit range: a3e3dfa
- Approved by: dev (đã review + commit)

### Chunk 2: Notification module (mới) — persist + REST + realtime
- status: done
- Entity: MỚI — `Notification`:
  - `id` uuid
  - `recipientProfileId` uuid — người nhận
  - `actorProfileId` uuid — người gây hành động (người comment/reply)
  - `type`: `'NEW_COMMENT' | 'NEW_REPLY'`
  - `postId` uuid
  - `commentId` uuid — comment/reply vừa tạo
  - `contentPreview` string — preview nội dung
  - `isRead` boolean (default false)
  - `createdAt`
- Lý do gộp persist + realtime trong CÙNG 1 chunk: `CreateNotificationUseCase`
  bắt buộc phụ thuộc `INotificationRealtimePort` NGAY TỪ ĐẦU (không thể thiếu
  adapter cho port vì module sẽ không boot được). "Tạo thông báo" = lưu DB +
  đẩy realtime, là 1 đơn vị nghiệp vụ trọn vẹn.
- Steps:
  1. domain — `Notification` entity + `TNotificationType` + có thể cần
     `NotificationNotFoundError` (dùng cho mark-as-read sai chủ/không tồn tại).
     Mini-gate baseline/suggest/confirm khi chạy bước này.
  2. infrastructure (adapter) — `NotificationTypeOrmEntity` (bảng
     `notifications`, index `(recipient_profile_id, is_read)`), migration
     `AddNotificationEntity`, `INotificationRepository` (create,
     findByProfileId phân trang, countUnread, markAsRead(id, profileId),
     markAllAsRead(profileId)), `TypeOrmNotificationRepository`. Định nghĩa +
     implement `INotificationRealtimePort` (`notify(profileId, payload):
     void`) qua `NotificationGateway` (namespace `/notifications`,
     `handleConnection` join `user:<profileId>` — tái dùng `verifyWsToken`).
  3. use-case:
     - `CreateNotificationUseCase` (input {recipientProfileId, actorProfileId,
       type, postId, commentId, contentPreview}, output `Notification`) —
       persist rồi push realtime. SẼ export qua `public-api.ts`.
     - `GetNotificationsUseCase` (phân trang, dùng
       `ResolveNotificationActorsService` mới để đính kèm displayName/avatar).
     - `GetUnreadNotificationCountUseCase`.
     - `MarkNotificationAsReadUseCase` (throw `NotificationNotFoundError` nếu
       id không tồn tại/không thuộc requester).
     - `MarkAllNotificationsAsReadUseCase`.
  4. infrastructure (endpoint) — `GET /notifications` (phân trang), `GET
     /notifications/unread-count`, `POST /notifications/:id/read`, `POST
     /notifications/read-all`. Đều `JwtAuthGuard`.
  5. doc — swagger cho 4 endpoint trên.
- Integrate into: export `CREATE_NOTIFICATION_USECASE` +
  `ICreateNotificationUseCase` + type qua
  `modules/notification/application/public-api.ts` (dùng ở Chunk 3).
- Gate: vertical slice build được, 4 endpoint chạy end-to-end; test socket
  client thật xác nhận nhận `newNotification` khi gọi thử
  `CreateNotificationUseCase`.
  ĐÃ TEST THẬT qua REST (seed notification thẳng DB + JWT thật): GET list, GET
  unread-count, POST mark-single (1→0), POST mark-all — tất cả đúng. (Chưa test
  riêng socket `newNotification` push ở chunk này vì chưa có nơi gọi
  CreateNotificationUseCase thật — sẽ test cùng lúc E2E ở Chunk 3.)
- Commit range: d350763
- Approved by: dev (đã review + commit)

### Chunk 3: Comment → Notification (assembly, cross-module)
- status: pending
- Entity: tái dùng, không có entity mới.
- Steps:
  1. use-case — sửa `CreateCommentUseCase` (comment module): giữ lại biến
     `post` từ `_findPostByIdUseCase.execute(...)` (hiện đang gọi nhưng không
     giữ kết quả). Sau khi comment tạo thành công:
     - Nếu `input.parentId === null` (top-level comment) VÀ
       `comment.profileId !== post.profileId` (không tự comment bài mình) VÀ
       `COMMENT_PRESENCE_PORT.isViewingPost(postId, post.profileId) === false`
       → gọi `CREATE_NOTIFICATION_USECASE` với
       `{recipientProfileId: post.profileId, actorProfileId: comment.profileId,
       type: 'NEW_COMMENT', postId, commentId: comment.id, contentPreview:
       comment.content}`.
     - Nếu `input.parentId !== null` (reply) VÀ
       `parentComment.profileId !== comment.profileId` (không tự reply comment
       mình) VÀ
       `COMMENT_PRESENCE_PORT.isViewingPost(postId, parentComment.profileId)
       === false` → gọi `CREATE_NOTIFICATION_USECASE` với
       `{recipientProfileId: parentComment.profileId, actorProfileId:
       comment.profileId, type: 'NEW_REPLY', postId, commentId: comment.id,
       contentPreview: comment.content}`. (`parentComment` đã có sẵn trong
       use-case hiện tại khi validate level.)
  2. Wire `CommentModule` import `NotificationModule`, inject
     `CREATE_NOTIFICATION_USECASE` + `COMMENT_PRESENCE_PORT` vào
     `CreateCommentUseCase`.
- Integrate into: `comment.module.ts` import `NotificationModule`.
- Gate: end-to-end — test qua REST + 2 socket client thật:
  - Case A: chủ post KHÔNG join room → comment vào post → có notification +
    realtime.
  - Case B: chủ post ĐÃ join room `post:<id>` → comment vào post → KHÔNG có
    notification.
  - Case C: reply vào 1 comment → đúng chủ comment cha nhận notification (không
    phải chủ post, trừ khi trùng người).
- Commit range: (điền sau khi chạy xong)
- Approved by: (điền khi dev duyệt)
