# Plan: Chat riêng giữa user quan tâm post và chủ post

## Mô tả
User (profile B) có thể nhắn tin riêng 1-vs-1 với chủ post (profile A) gắn liền
1 post cố định. Mỗi cặp (postId, buyerProfileId) là 1 room riêng biệt — cùng 1
buyer chat 2 post khác nhau của cùng chủ post = 2 room khác nhau.

## Discovery
- Entity nghi trùng lặp: không có (module `chat` chưa tồn tại).
- Use-case/port tái dùng:
  - `FIND_POST_BY_ID_USECASE` (module `post`, đã export qua public-api) — lấy
    `ownerProfileId` = `post.profileId`.
  - `FIND_PROFILES_BY_IDS_USECASE` (module `account`, đã export qua public-api)
    — resolve display info cho danh sách room.
- Package cần thiết: đã có ở `shared/websocket/` (`WsJwtGuard`,
  `WsCurrentUser`, `ConfigSocketIoAdapter`, đăng ký sẵn ở `main.ts`) — CHƯA có
  module nào dùng, đây là consumer đầu tiên. Không cần thêm package mới.
- Quyết định thiết kế đã chốt với dev (2026-09-05):
  1. **1 entity `Chat`** (không tách `ChatRoom`/`ChatMessage` riêng), field:
     `id, postId, ownerProfileId (denormalize từ post.profileId lúc gửi),
     buyerProfileId (định danh room, luôn là profile không phải chủ post),
     senderProfileId (người gửi tin — = owner hoặc = buyer), content,
     createdAt`. Room = group theo `(postId, buyerProfileId)`. Không có
     method nghiệp vụ (giữ đúng "Methods: none" từ spec gốc) — logic xác thực
     participant nằm ở application layer (service dùng chung), không nằm
     trong entity.
  2. **Transport hybrid**: REST cho list room + lấy lịch sử tin nhắn
     (read-only), WebSocket cho gửi/nhận realtime (join room, send, broadcast).
- Field `ownerProfileId` là điều chỉnh so với spec gốc (spec gốc chỉ có 1
  `profileId`) — thêm để tránh phải join cross-module trong infra khi query
  "danh sách room của tôi" (cả khi tôi là chủ post lẫn khi tôi là buyer).
  Denormalize tại thời điểm gửi tin (đã có sẵn từ bước validate participant).

## Chunk tree

### Chunk 1: Domain + Persistence foundation (module: chat)
- status: done (chờ dev xác nhận trước khi sang chunk 2)
- Entity: mới — `Chat` (domain/chat.entity.ts)
- Steps:
  1. domain — entity `Chat` (props: id, postId, ownerProfileId,
     buyerProfileId, senderProfileId, content, createdAt). Không domain-error
     riêng ở bước này (lỗi nghiệp vụ nằm ở use-case, dùng lại
     `PostNotFoundError` có sẵn từ module post).
  2. infrastructure (adapter) — TypeORM entity `chat.typeorm-entity.ts`,
     mapper `chat.mapper.ts`, repository `chat.repository.ts` implement
     `IChatRepository`:
     - `create(chat): Promise<Chat>`
     - `findRoomsByProfileId(profileId): Promise<TChatRoomSummary[]>` (group
       theo postId+buyerProfileId, lấy tin nhắn mới nhất mỗi room, filter
       `ownerProfileId = profileId OR buyerProfileId = profileId`)
     - `findMessages(postId, buyerProfileId, page, limit): Promise<{items:
       Chat[]; total: number}>`
  3. application/ports — `chat-application.tokens.ts`
     (`CHAT_REPOSITORY`), `chat-repository.interface.ts`.
- Integrate into: chưa (nội bộ module, chưa có consumer ngoài)
- Gate: vertical slice build được nội bộ module (chưa cần use-case/endpoint).
- Điều chỉnh so với Plan gốc (đã confirm với dev qua mini-gate domain skill):
  - Thêm validate `content` không rỗng trong constructor `Chat` → domain-error
    mới `EmptyChatContentError`.
  - KHÔNG thêm validate `senderProfileId ∈ {owner, buyer}` ở entity (dev từ
    chối suggestion này) — giữ entity tối giản đúng spec gốc.
  - Ngoài phạm vi ghi mặc định của skill `infrastructure`/`domain` (không có
    skill nào sở hữu `shared/`), đã tự thêm 2 việc plumbing bắt buộc để build
    được (theo đúng pattern các module post/comment/like trước đó):
    `ChatTypeOrmEntity` vào registry `shared/infrastructure/database/entities.ts`,
    và chạy `migration:generate` → `1788602354430-AddChatEntity.ts` (đã dọn bỏ
    2 dòng thừa do lệch tên index cũ của bảng `likes`, không liên quan chat),
    đã `migration:run` thành công lên DB dev.
- Build/lint: `tsc --noEmit` sạch, `eslint src/modules/chat` sạch.
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev)

### Chunk 2: Use-case gửi tin nhắn (module: chat)
- status: done (chờ dev xác nhận trước khi sang chunk 3)
- Entity: tái dùng `Chat` (chunk 1)
- Steps:
  1. application/services — `validate-chat-participant.service.ts`
     (`ValidateChatParticipantService`): input `{postId, buyerProfileId,
     requesterProfileId}` → gọi `FIND_POST_BY_ID_USECASE` lấy
     `ownerProfileId`; nếu `buyerProfileId === ownerProfileId` → throw
     domain-error mới `SelfChatNotAllowedError` (mini-gate xác nhận khi chạy
     skill `domain`); nếu `requesterProfileId` không phải owner cũng không
     phải buyer → throw domain-error mới `ChatParticipantForbiddenError`
     (mini-gate xác nhận). Trả về `{ownerProfileId}` khi hợp lệ. Service này
     dùng chung cho chunk 2, chunk 3 (get messages) và chunk 5 (gateway join
     room) — tránh lặp logic 3 nơi.
  2. application/ports — `send-chat-message-use-case.interface.ts`
     (`ISendChatMessageUseCase`, input `{postId, buyerProfileId,
     senderProfileId, content}`).
  3. application/use-cases — `send-chat-message.use-case.ts` +
     `.spec.ts`: gọi `ValidateChatParticipantService` → tạo `Chat` entity với
     `ownerProfileId` trả về → `chatRepository.create`.
- Integrate into: chưa expose endpoint (dùng ở chunk 5 — gateway). Đã wire
  provider vào `chat.module.ts` (import `PostModule` để lấy
  `FIND_POST_BY_ID_USECASE`).
- Gate: use-case chạy được nội bộ, spec pass (6/6), mock port qua interface.
- Build/lint: `tsc --noEmit` sạch, `eslint src/modules/chat` sạch.
- 2 domain-error mới (`SelfChatNotAllowedError`, `ChatParticipantForbiddenError`)
  tạo qua skill `domain` đúng như mini-gate đã note ở chunk 1 — không có điều
  chỉnh so với baseline đã chốt.
- Điều chỉnh so với Plan gốc (dev bổ sung rule sau khi review chunk 2):
  - **Owner không được chủ động khởi tạo room** — chỉ được reply sau khi buyer
    đã gửi tin đầu tiên. `SendChatMessageUseCase` check: nếu
    `senderProfileId === ownerProfileId` và
    `chatRepository.findMessages(postId, buyerProfileId, 1, 1).total === 0` →
    throw domain-error mới `OwnerCannotInitiateChatError` (403, tạo qua skill
    `domain`). Dùng lại `findMessages` sẵn có (chunk 1), không cần thêm port
    mới.
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev)

### Chunk 3: Use-case đọc room list + lịch sử tin nhắn (module: chat)
- status: pending
- Entity: tái dùng `Chat`
- Steps:
  1. application/services — `resolve-chat-participants.service.ts`
     (theo pattern `ResolveCommentAuthorsService` bên module comment): input
     danh sách profileId liên quan trong room list → gọi
     `FIND_PROFILES_BY_IDS_USECASE` → map hiển thị (displayName, avatarUrl).
  2. application/ports — `get-chat-rooms-use-case.interface.ts`
     (`IGetChatRoomsUseCase`, input `{profileId}`, output list room summary
     kèm counterpart profile info + lastMessage/lastMessageAt),
     `get-chat-messages-use-case.interface.ts` (`IGetChatMessagesUseCase`,
     input `{postId, buyerProfileId, requesterProfileId, page, limit}` — gọi
     lại `ValidateChatParticipantService` (chunk 2) trước khi query).
  3. application/use-cases — `get-chat-rooms.use-case.ts` +
     `.spec.ts`, `get-chat-messages.use-case.ts` + `.spec.ts`.
- Integrate into: chưa (endpoint ở chunk 4).
- Gate: 2 use-case chạy được nội bộ, spec pass.
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev)

### Chunk 4: REST endpoint (list room + lịch sử tin nhắn) + doc (module: chat)
- status: pending
- Steps:
  1. infrastructure (endpoint) — `chat.controller.ts`:
     - `GET /chats/rooms` (JwtAuthGuard, CurrentUser) → wire
       `GetChatRoomsUseCase`.
     - `GET /chats/messages?postId=&buyerProfileId=&page=&limit=`
       (JwtAuthGuard, CurrentUser) → wire `GetChatMessagesUseCase`.
     - DTO: `get-chat-messages-request.dto.ts`, `chat-room-response.dto.ts`,
       `chat-message-response.dto.ts` (`infrastructure/http/dto/`).
  2. doc — `get-chat-rooms.doc.ts`, `get-chat-messages.doc.ts`
     (`infrastructure/http/docs/`), trace lỗi có thể xảy ra
     (`PostNotFoundError`, `ChatParticipantForbiddenError`) → confirm mapping
     đã có trong `GlobalExceptionFilter` chưa, nếu thiếu flag ra.
- Integrate into: `chat.module.ts` (controller providers), chưa cross-module
  export (không cần `public-api.ts` — chat không có use-case nào module khác
  cần dùng).
- Gate: 2 REST endpoint chạy end-to-end (build + lint + spec), response qua
  `ResponseInterceptor` envelope chuẩn.
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev)

### Chunk 5: WebSocket Gateway realtime (module: chat) — assembly cuối
- status: pending
- Steps:
  1. infrastructure (websocket) — `infrastructure/websocket/chat.gateway.ts`:
     - `@UseGuards(WsJwtGuard)`, namespace riêng (vd `/chat`).
     - `handleJoinRoom(postId, buyerProfileId)` — gọi lại
       `ValidateChatParticipantService` (chunk 2) qua profileId lấy từ
       `WsCurrentUser`, nếu hợp lệ `socket.join(roomKey)` (roomKey =
       `chat:${postId}:${buyerProfileId}`).
     - `@SubscribeMessage('sendMessage')` — gọi `SendChatMessageUseCase`
       (chunk 2), sau đó `server.to(roomKey).emit('newMessage', message)`.
  2. `chat.module.ts` — khai báo đầy đủ providers (repository, use-cases,
     services, controller, gateway) + import `TypeOrmModule.forFeature`.
  3. `app.module.ts` — thêm `ChatModule` vào danh sách imports.
- Integrate into: `app.module.ts` (file dùng chung, mọi skill được sửa theo
  §5.1 constitution).
- Gate:
  1. Build/lint toàn bộ module pass.
  2. Gateway compile, guard áp dụng đúng, emit/broadcast đúng room.
  3. REST (chunk 4) + WS (chunk 5) cùng hoạt động trên 1 module đã wire xong
     trong `app.module.ts` — coi là điểm lắp ráp cuối cùng của feature.
  - LƯU Ý: theo constitution §9, không bắt buộc e2e/controller test — gateway
    sẽ KHÔNG có test tự động kèm theo, chỉ verify build/lint. Nếu dev muốn
    test tay qua socket client, cần xác nhận cách test (vd script `wscat`)
    trước khi coi chunk done.
- Commit range: (điền sau khi chạy xong)
- Approved by: (chờ dev)
