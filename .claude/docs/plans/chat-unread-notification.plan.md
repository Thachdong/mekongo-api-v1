# Plan: Thông báo tin nhắn đến (unread badge trên icon chat)

## Mô tả
User thấy badge/thông báo trên icon chat khi có tin nhắn mới đến mà chưa mở cửa
sổ chat đó (giống Messenger). Cần: track trạng thái đã đọc theo từng room, đếm
unread để hiển thị badge lúc load app, và đẩy realtime qua socket khi có tin
nhắn mới tới người nhận (kể cả khi họ chưa join room đó).

## Discovery
- Entity nghi trùng lặp: không có sẵn — `ChatReadState` (postId, buyerProfileId,
  profileId, lastReadAt) là entity mới.
- Use-case/port nghi trùng lặp: không tạo port mới trùng — MỞ RỘNG
  `IChatRepository` hiện có (thêm method upsertReadState/countUnread...) thay vì
  tách `IChatReadStateRepository` riêng (đã chốt với dev).
- Package cần thiết: không cần package mới. `ChatGateway` hiện chỉ có
  `@UseGuards(WsJwtGuard)` áp cho từng `@SubscribeMessage`, CHƯA có
  `handleConnection` để join phòng cá nhân lúc socket connect. Cần trích logic
  verify JWT trong `WsJwtGuard` (`src/shared/websocket/ws-jwt.guard.ts`) ra 1
  helper dùng chung (`shared/websocket/ws-auth.util.ts`) để tái dùng trong
  `handleConnection` — chỉnh sửa nhỏ ở `shared/`, làm trong bước infrastructure
  của Chunk 2, không cần skill `external-package`.

### Quyết định nghiệp vụ đã chốt với dev
1. Badge số hiển thị = **số room có tin chưa đọc** (kiểu Messenger).
2. Mở rộng `IChatRepository` (thêm method), không tách port mới.
3. FE connect socket namespace `/chat` ngay lúc load app (nhận `chatNotification`
   nền, không cần mở cửa sổ chat).

## Chunk tree

### Chunk 1: Theo dõi trạng thái đã đọc & đếm tin chưa đọc (module: chat)
- status: done
- Entity: mới — `ChatReadState` (props: postId, buyerProfileId, profileId,
  lastReadAt)
- Steps:
  1. domain — entity `ChatReadState` (mini-gate baseline/suggest/confirm khi
     chạy).
  2. infrastructure (adapter) — TypeORM entity `ChatReadStateTypeOrmEntity`
     (bảng `chat_read_states`, unique index `(post_id, buyer_profile_id,
     profile_id)`), mapper, migration `AddChatReadStateEntity`; mở rộng
     `IChatRepository` (hoặc port mới, theo quyết định #2) thêm:
     `upsertReadState(profileId, postId, buyerProfileId, readAt)`,
     `countUnreadRooms(profileId): Promise<number>`.
  3. use-case — `MarkChatAsReadUseCase` (input: postId, buyerProfileId,
     requesterProfileId; validate qua `ValidateChatParticipantService` có sẵn;
     gọi `upsertReadState`).
  4. use-case — `GetUnreadChatCountUseCase` (input: profileId; output:
     `{ unreadRooms: number }`).
  5. infrastructure (endpoint) — `POST /chats/rooms/read` (JwtAuthGuard, body
     postId + buyerProfileId) gọi `MarkChatAsReadUseCase`; `GET
     /chats/unread-count` (JwtAuthGuard) gọi `GetUnreadChatCountUseCase`.
  6. doc — swagger cho 2 endpoint trên.
- Integrate into: nội bộ module `chat` (REST), không cross-module, không cần
  `public-api.ts`.
- Gate: vertical slice build xong trong module chat, 2 endpoint chạy
  end-to-end.
- Commit range: 98e461c..08d2603
- Approved by: dev (đã review + commit)

### Chunk 2: Thông báo realtime khi có tin nhắn đến (module: chat)
- status: done
- Entity: tái dùng (không entity mới)
- Steps:
  1. infrastructure (adapter/gateway) — thêm `handleConnection` (implements
     `OnGatewayConnection`) trong `ChatGateway`, dùng helper JWT dùng chung để
     lấy `profileId` và `client.join('user:' + profileId)` ngay khi connect.
  2. infrastructure (gateway) — trong `handleSendMessage`, sau khi tạo tin nhắn
     thành công: xác định `recipientProfileId` (người không phải sender), gọi
     `GetUnreadChatCountUseCase(recipientProfileId)`, emit `chatNotification`
     tới room `user:<recipientProfileId>` với payload `{postId,
     buyerProfileId, senderProfileId, content, createdAt, unreadRooms}`.
  3. infrastructure (gateway) — trong `handleJoinRoom` hiện có, sau khi
     validate participant + join socket room thành công: gọi
     `MarkChatAsReadUseCase` cho chính requester (join room = coi như đã đọc
     đến hiện tại), rồi emit `unreadCountUpdated` `{unreadRooms}` về chính
     client đó (đồng bộ đa thiết bị/tab). Không cần `@SubscribeMessage('markRead')`
     riêng — REST `POST /chats/rooms/read` (chunk 1) vẫn giữ cho trường hợp FE
     cần mark-as-read mà không qua socket.
- Integrate into: không cross-module. FE lắng nghe `chatNotification` /
  `unreadCountUpdated` trên namespace `/chat` đã kết nối sẵn từ lúc load app.
- Gate: test thủ công qua 2 socket client (sender + recipient) xác nhận
  recipient nhận `chatNotification` dù chưa `joinRoom`; build/lint pass.
  ĐÃ TEST THẬT: seed post thật + JWT thật + socket.io-client thật (script tạm ở
  scratchpad, không thuộc repo) — owner nhận `chatNotification` (unreadRooms: 1)
  ngay khi buyer gửi tin dù owner chưa joinRoom; owner joinRoom xong nhận
  `unreadCountUpdated` (unreadRooms: 0). Dữ liệu test đã xoá khỏi DB.
- Commit range: (điền sau khi commit)
- Approved by: dev (đã duyệt commit)
