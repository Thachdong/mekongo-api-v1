# Out-of-scope Suggestion — Format chuẩn

Mọi skill khi phát hiện cần thay đổi code NGOÀI phạm vi ghi của mình PHẢI dùng đúng
format này khi báo cáo lại cho dev, để nhất quán giữa các skill.

```
## Ngoài phạm vi của skill này

### [Tên skill nên xử lý việc này] — <mô tả ngắn gọn 1 dòng>
Lý do cần: <1-2 câu>
Prompt gợi ý (copy để chạy skill tương ứng):
> "<prompt cụ thể, đủ ngữ cảnh để chạy được ngay, không cần dev soạn lại>"
```

Quy tắc:
- Group theo skill đích, không liệt kê phẳng.
- Prompt gợi ý phải đủ ngữ cảnh (tên module, tên use-case/port liên quan...) để dev
  copy-paste chạy ngay, không phải tự nhớ lại thêm chi tiết.
- Không tự ý code phần này, kể cả khi "tiện tay". Nếu chắc chắn cần và đơn giản,
  vẫn chỉ suggest — trừ khi đang chạy trong `full-feature` (lúc đó chính
  `full-feature` sẽ gọi đúng skill đích theo Plan, không phải skill hiện tại tự làm).
