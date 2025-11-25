# PHÂN TÍCH NGHIỆP VỤ - 2 CHỨC NĂNG MỚI

## 1. TẠO BÀI ĐỌC TỪ YOUTUBE

### Mô tả
User nhập link YouTube → Hệ thống lấy phụ đề → AI tạo bài đọc tiếng Anh → User luyện đọc

### Luồng hoạt động

**Bước 1: Nhập link và phân tích**
- User vào Home → "Nội dung tùy chỉnh" → "Bài đọc từ YouTube"
- Nhập link YouTube (hỗ trợ: video thường, Shorts, youtu.be)
- Nhấn "Phân tích video"

**Bước 2: Lấy phụ đề**
- App gọi `POST /api/youtube-reading/analyze`
- Backend trích xuất Video ID
- Gọi **vcyon API** để lấy phụ đề:
  ```
  GET https://api.vcyon.com/v1/youtube/transcript?videoId=...
  Headers: Authorization: Bearer ${VCYON_API_KEY}
  ```
- Kiểm tra video có phụ đề không

**Bước 3: Tóm tắt nội dung**
- Backend gọi **Gemini AI** tóm tắt phụ đề thành 1-2 câu tiếng Việt
- Trả về app hiển thị card "Nội dung video"

**Bước 4: Tạo bài đọc**
- User nhấn "Tạo bài đọc"
- App gọi `POST /api/youtube-reading/generate`
- Backend gọi **Gemini AI** tạo bài đọc tiếng Anh (3-5 câu hay nhất từ phụ đề)
- Nếu phụ đề không phải tiếng Anh → AI tự động dịch
- Trả về nội dung bài đọc

**Bước 5: Luyện đọc**
- User có thể chỉnh sửa bài đọc
- Nhấn "Tạo lại" để tạo bài khác
- Nhấn "Luyện đọc" → Chuyển sang màn hình luyện
- Ghi âm → Chấm điểm → Lưu vào `records` (với `custom_text`)

### API Endpoints
```
POST /api/youtube-reading/analyze   - Phân tích video, lấy phụ đề, tóm tắt
POST /api/youtube-reading/generate  - Tạo bài đọc từ phụ đề
```

### Công nghệ
- **vcyon API**: Lấy phụ đề YouTube (cần `VCYON_API_KEY`)
- **Gemini AI**: Tóm tắt và tạo bài đọc
- **Frontend**: `YoutubeReadingScreen.js`
- **Backend**: `youtubeReadingController.js`, `youtubeReadingService.js`

### Xử lý lỗi
- Video không có phụ đề → Alert thông báo
- Link không hợp lệ → Alert lỗi
- API vcyon lỗi (401/403) → Thông báo cấu hình API key

---

## 2. EMAIL MARKETING TỪ ADMIN

### Mô tả
Admin tạo email marketing với AI → Preview → Gửi đến tất cả users → Theo dõi lịch sử

### Luồng hoạt động

**Bước 1: Tạo email**
- Admin vào web → "Email Marketing"
- Nhập thông tin:
  - Tiêu đề campaign (lưu DB)
  - Subject email (hiển thị cho user)
  - Mô tả/Nội dung
  - Upload ảnh (tối đa 5, mỗi ảnh max 10MB) → Cloudinary
  - Link CTA + Text nút CTA
  - Màu chủ đạo (color picker)
  - Phong cách (modern/minimal/colorful/professional/friendly)

**Bước 2: Generate HTML với AI**
- Admin nhấn "Tạo Email"
- Web gọi `POST /api/admin/email-marketing/generate`
- Backend gọi **Gemini AI** với prompt chi tiết:
  - Yêu cầu tạo HTML/CSS responsive, hiện đại
  - Header có logo EnTalk
  - Layout 600px, bo góc, shadow
  - Ảnh xen kẽ với text (không để 2 ảnh dính nhau)
  - CTA button gradient, pill shape
  - Footer cố định (thông tin EnTalk)
- Gemini trả về HTML hoàn chỉnh
- Web hiển thị preview trong iframe

**Bước 3: Gửi email**
- Admin nhấn "Gửi Email" → Confirm
- Web gọi `POST /api/admin/email-marketing/send`
- Backend:
  - Lấy danh sách tất cả users có email
  - Tạo campaign trong bảng `marketing_campaigns` (status: 'sending')
  - Gửi email bất đồng bộ (delay 1s giữa mỗi email)
  - Dùng **Nodemailer** gửi qua Gmail SMTP
  - Cập nhật `sent_count`, `failed_count`
  - Đổi status thành 'completed' khi xong

**Bước 4: Xem lịch sử**
- Admin vào "Lịch sử Email Marketing"
- Web gọi `GET /api/admin/email-marketing/campaigns`
- Hiển thị bảng:
  - ID, Tiêu đề, Subject
  - Tổng người nhận, Đã gửi, Thất bại
  - Trạng thái (sending/completed/failed)
  - Ngày tạo, Hoàn thành

### API Endpoints
```
POST /api/admin/email-marketing/generate   - Tạo HTML email với Gemini
POST /api/admin/email-marketing/send       - Gửi email đến tất cả users
GET  /api/admin/email-marketing/campaigns  - Lấy lịch sử campaigns
```

### Database
Bảng `marketing_campaigns`:
```sql
- campaign_id, title, subject, html_content
- total_recipients, sent_count, failed_count
- status (sending/completed/failed)
- created_at, completed_at
```

### Công nghệ
- **Gemini AI**: Tạo HTML/CSS email tự động
- **Nodemailer**: Gửi email qua Gmail SMTP
- **Cloudinary**: Upload ảnh
- **Frontend**: `EmailMarketing.js`, `CampaignHistory.js`
- **Backend**: `emailMarketingController.js`, `emailMarketingService.js`

### Đặc điểm
- Email responsive, hiện đại (gradient, shadow, bo góc)
- Ảnh xen kẽ text (không dính nhau)
- Gửi bất đồng bộ (delay 1s tránh spam)
- Theo dõi số lượng gửi thành công/thất bại
- Admin có thể tạo lại email nhiều lần trước khi gửi

---

## TÓM TẮT

**Chức năng 1 - YouTube Reading:**
- Tích hợp vcyon API lấy phụ đề
- AI tóm tắt + tạo bài đọc tiếng Anh
- Hỗ trợ đa ngôn ngữ (AI tự dịch)

**Chức năng 2 - Email Marketing:**
- AI tự động thiết kế HTML/CSS email
- Gửi hàng loạt với tracking
- Preview trước khi gửi
- Lưu lịch sử campaigns
