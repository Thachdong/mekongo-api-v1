---
name: full-feature
description: Điều phối việc implement TRỌN VẸN 1 feature/endpoint từ đầu đến cuối (entity, module, port, adapter, use-case, endpoint, doc) bằng cách lập Plan dạng cây chunk theo sub-feature, lưu vào file, rồi lần lượt gọi các skill domain/use-case/infrastructure/doc/external-package theo đúng thứ tự phụ thuộc — dừng lại review sau mỗi chunk hoàn chỉnh. PHẢI dùng skill này khi dev mô tả 1 feature/endpoint lớn cần nhiều phần (vd "làm API login cần tạo account, address, profile, otp"), không dùng cho task chỉ động tới 1 layer duy nhất (lúc đó gọi thẳng atomic skill tương ứng).
---

# Full-feature Skill (Orchestration)

## Phạm vi ghi trực tiếp
- CHỈ file Plan: `.claude/docs/plans/<feature-slug>.plan.md`.
- Skill này KHÔNG tự viết business code — mọi thay đổi code thực tế đều do các
  atomic skill (`domain`, `use-case`, `infrastructure`, `doc`,
  `external-package`, `config-env`) thực hiện khi được skill này gọi.

## Bước 0 — Đọc constitution
Bắt buộc đọc `.claude/docs/architecture/constitution.md` trước khi Discovery. Nếu thiếu,
dừng lại, gọi `constitution` trước.

---

## Giai đoạn 1 — Discovery

Trước khi viết Plan, chủ động scan codebase:
- Entity/domain-error liên quan đã tồn tại chưa (theo tên business concept, không
  chỉ theo tên chính xác — vd tìm "Account", "User" nếu dev nói "account").
- Use-case/port tương tự đã tồn tại chưa.
- Module liên quan đã tồn tại chưa.
- Package cần thiết đã được wrap ở `shared/` chưa.

Nếu tìm thấy candidate nghi ngờ trùng lặp → KHÔNG tự quyết định tái dùng hay tạo
mới, phải flag rõ trong Plan ở bước sau: "Có thể tái dùng X — cần dev xác nhận".

---

## Giai đoạn 2 — Dựng Plan (cây chunk)

### Nguyên tắc chia chunk
- 1 chunk = 1 đơn vị nghiệp vụ độc lập, đủ để dev review riêng (KHÔNG chia theo
  layer kỹ thuật thuần tuý — vd "tất cả domain của mọi module" không phải 1
  chunk hợp lệ).
- Ranh giới chunk do skill này ĐỀ XUẤT dựa trên Discovery, nhưng dev/senior PHẢI
  duyệt lại danh sách chunk trước khi bắt đầu code — không tự cắt chunk giữa
  chừng lúc đang chạy.
- Chunk có thể lồng nhau (sub-chunk) nếu 1 chunk cần phân rã tiếp — dùng cấu
  trúc cây, không ép phẳng.
- Dù các chunk độc lập kỹ thuật (có thể chạy song song), vẫn chạy TUẦN TỰ theo
  đúng thứ tự trong Plan — mục tiêu là review tuyến tính, không phải tốc độ.

### Format file Plan — lưu tại `.claude/docs/plans/<feature-slug>.plan.md`

```markdown
# Plan: <Tên feature gốc>

## Mô tả
<1-2 câu mô tả business>

## Discovery
- Entity nghi trùng lặp: <liệt kê hoặc "không có">
- Use-case/port nghi trùng lặp: <liệt kê hoặc "không có">
- Package cần thiết: <đã có ở shared/ | cần thêm mới>

## Chunk tree

### Chunk 1: <Tên sub-feature> (module: <name>)
- status: pending | in-progress | done
- Entity: <mới | tái dùng: X>
- Steps (atomic skill theo thứ tự):
  1. external-package (nếu cần) — <mô tả>
  2. domain — <entity/method/error dự kiến, sẽ confirm với dev khi chạy>
  3. infrastructure (adapter) — <port nào implement>
  4. use-case — <input/output, có export không>
  5. infrastructure (endpoint) — <nếu chunk này có expose API riêng>
  6. doc — <nếu có endpoint>
- Integrate into: <module nào sẽ import use-case này, qua public-api.ts>
- Gate: dừng sau khi consumer đã import + wire xong (hoặc sau khi vertical slice
  chạy được nội bộ, nếu chunk không cross-module)
- Commit range: <điền sau khi chạy xong>
- Approved by: <điền khi dev duyệt>

### Chunk 2: ...
(tương tự)

### Chunk N: <Chunk lắp ráp cuối cùng — vd "Login assembly">
- Steps: use-case compose các use-case ở chunk trên → endpoint → doc
- Gate: endpoint chạy được end-to-end
```

Sau khi dựng xong, in toàn bộ Plan cho dev xem, hỏi rõ:
- Ranh giới chunk có hợp lý không?
- Các entity/use-case nghi trùng lặp ở Discovery: tái dùng hay tạo mới?
- Chỉ bắt đầu code khi dev xác nhận approve.

---

## Giai đoạn 3 — Thực thi từng chunk

### Thứ tự phụ thuộc cố định trong 1 chunk
```
external-package (nếu thiếu)
   → domain (entity/VO/error cần thiết — CÓ mini-gate tương tác nếu tạo mới)
      → infrastructure: adapter (implement port, cần entity xong trước)
         → use-case (định nghĩa/dùng port + gọi adapter qua DI)
            → infrastructure: endpoint (nếu chunk này expose API)
               → doc (nếu có endpoint)
```
Chỉ gọi các bước thực sự cần theo Plan của chunk đó — không phải chunk nào cũng
đủ cả 6 bước.

### Cách gọi atomic skill
- Với mỗi bước, gọi đúng atomic skill tương ứng, CHỈ truyền phần Plan liên quan
  đến bước đó (không đưa toàn bộ Plan feature gốc) — atomic skill chỉ cần biết
  phạm vi của mình.
- Mỗi bước chạy xong = **1 commit tiềm năng** (message trỏ về đúng mục Plan, vd
  `feat(account): add UserRepositoryPort adapter [plan: chunk-1.step-3]`) —
  nhưng KHÔNG tự chạy `git commit`. Trước khi commit, PHẢI hỏi dev có muốn
  commit bước này không (hiện diff/file thay đổi + message dự kiến). Chỉ commit
  khi dev xác nhận đồng ý; nếu dev từ chối hoặc muốn gộp commit khác, giữ working
  tree as-is và tiếp tục theo yêu cầu dev.
- Bước `domain` khi tạo entity mới: LUÔN có mini-gate tương tác riêng (baseline →
  suggest → confirm) như định nghĩa trong skill `domain` — đây là điểm DUY NHẤT
  trong 1 chunk được phép dừng tương tác giữa chừng; các bước còn lại chạy liền
  không dừng.
- Nếu lúc code phát hiện thực tế lệch Plan (vd port thiếu tham số):
  1. KHÔNG tự âm thầm sửa rồi đi tiếp.
  2. Cập nhật lại đúng mục trong file Plan (đánh dấu đã điều chỉnh + lý do).
  3. Quay lại bước trước đó nếu cần (vd sửa lại use-case đã dùng port cũ).
  4. Log rõ: "Plan đã điều chỉnh tại chunk X bước Y, lý do: ...".

### Gate cuối chunk
Một chunk được coi là hoàn tất (đủ điều kiện gate) khi CẢ 3 (nếu cross-module)
hoặc chỉ (1) (nếu chunk không cross-module):
1. Vertical slice build xong trong module của nó.
2. Use-case được export qua `public-api.ts` (nếu cần dùng ngoài module).
3. Consumer module đã import + wire (DI) xong — thực sự dùng được.

Tại gate, tổng hợp và in ra cho dev (không phải diff thô từng file):
- Danh sách file đã tạo/sửa, group theo atomic skill đã chạy trong chunk.
- Checklist review GỘP từ tất cả atomic skill đã tham gia chunk (lấy nguyên
  checklist từ mỗi SKILL.md tương ứng).
- Xác nhận: export đúng, import đúng, DI registration đúng.
- Trạng thái build/lint/test tự động của toàn bộ chunk.
- Cập nhật `status: done`, `commit range`, chờ dev xác nhận trước khi sang chunk
  tiếp theo. Nếu dev reject/yêu cầu sửa → không sang chunk sau, quay lại sửa
  trong chunk hiện tại.

---

## Resume sau gián đoạn
Đọc field `status` trong Plan file:
- Chunk `done` → bỏ qua.
- Chunk `in-progress` → coi như dở dang, chạy lại TOÀN BỘ chunk đó từ đầu (không
  cố resume nửa chừng bên trong 1 chunk — chunk được thiết kế đủ nhỏ để restart
  rẻ).
- Chunk `pending` → chạy theo thứ tự.

## Out-of-scope
Về nguyên tắc skill này không cần suggestion out-of-scope riêng — vì bản thân nó
chính là cơ chế điều phối atomic skill để không có phần nào bị "ngoài scope" một
cách vô chủ. Nếu phát sinh nhu cầu ngoài 8 skill hiện có (vd cần sửa global
exception filter, sửa constitution) → dừng chunk, báo rõ cho dev, không tự ý mở
rộng quyền ghi của bất kỳ atomic skill nào.
