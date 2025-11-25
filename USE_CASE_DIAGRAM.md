# BIỂU ĐỒ USE CASE - HỆ THỐNG ENTALK

## MÔ TẢ TỔNG QUAN HỆ THỐNG

Hệ thống EnTalk là ứng dụng luyện đọc tiếng Anh với AI, bao gồm 3 actor chính:
- **User (Người dùng)**: Người học tiếng Anh sử dụng app mobile
- **Admin (Quản trị viên)**: Người quản lý hệ thống qua web admin
- **System (Hệ thống)**: Các tác vụ tự động (Cron job, AI)

---

## BIỂU ĐỒ USE CASE TỔNG QUÁT

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HỆ THỐNG ENTALK                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐                                                          │
│  │   USER   │                                                          │
│  │ (Người   │                                                          │
│  │  dùng)   │                                                          │
│  └────┬─────┘                                                          │
│       │                                                                │
│       ├──────► UC1: Quản lý tài khoản                                 │
│       │                                                                │
│       ├──────► UC2: Luyện đọc với bài có sẵn                          │
│       │                                                                │
│       ├──────► UC3: Luyện đọc với nội dung tùy chỉnh                  │
│       │                                                                │
│       ├──────► UC4: Xem lịch sử & tiến độ                             │
│       │                                                                │
│       ├──────► UC5: Quản lý streak (chuỗi luyện tập)                  │
│       │                                                                │
│       ├──────► UC6: Nhận và xem thông báo                             │
│       │                                                                │
│       ├──────► UC7: Chat với AI Bot                                   │
│       │                                                                │
│       └──────► UC8: Gửi góp ý / báo lỗi                               │
│                                                                         │
│                                                                         │
│  ┌──────────┐                                                          │
│  │  ADMIN   │                                                          │
│  │ (Quản trị│                                                          │
│  │   viên)  │                                                          │
│  └────┬─────┘                                                          │
│       │                                                                │
│       ├──────► UC9: Đăng nhập admin                                   │
│       │                                                                │
│       ├──────► UC10: Quản lý người dùng                               │
│       │                                                                │
│       ├──────► UC11: Quản lý chủ đề                                   │
│       │                                                                │
│       ├──────► UC12: Quản lý bài đọc                                  │
│       │                                                                │
│       ├──────► UC13: Quản lý bản ghi luyện tập                        │
│       │                                                                │
│       ├──────► UC14: Quản lý góp ý                                    │
│       │                                                                │
│       ├──────► UC15: Xem thống kê dashboard                           │
│       │                                                                │
│       └──────► UC16: Email Marketing                                  │
│                                                                         │
│                                                                         │
│  ┌──────────┐                                                          │
│  │  SYSTEM  │                                                          │
│  │ (Hệ thống│                                                          │
│  │ tự động) │                                                          │
│  └────┬─────┘                                                          │
│       │                                                                │
│       ├──────► UC17: Gửi thông báo gợi ý tự động                      │
│       │                                                                │
│       ├──────► UC18: Chấm điểm phát âm (Whisper + Gemini AI)          │
│       │                                                                │
│       ├──────► UC19: Tạo giọng đọc mẫu (Piper TTS)                    │
│       │                                                                │
│       └──────► UC20: Cập nhật streak tự động                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CHI TIẾT CÁC USE CASE

### 📱 **NHÓM USE CASE: USER (NGƯỜI DÙNG)**

---

### **UC1: QUẢN LÝ TÀI KHOẢN**

**Actor**: User

**Mô tả**: Người dùng quản lý thông tin tài khoản cá nhân

**Use Case con:**
- UC1.1: Đăng ký tài khoản
- UC1.2: Xác minh email
- UC1.3: Đăng nhập
- UC1.4: Quên mật khẩu
- UC1.5: Xem thông tin cá nhân
- UC1.6: Chỉnh sửa thông tin
- UC1.7: Đổi mật khẩu
- UC1.8: Upload ảnh đại diện

**Luồng chính:**
```
UC1.1: Đăng ký tài khoản
1. User nhập thông tin (tên, email, mật khẩu)
2. System kiểm tra email đã tồn tại chưa
3. System tạo mã xác nhận 6 số
4. System gửi email chứa mã xác nhận
5. User nhập mã xác nhận (UC1.2)
6. System xác minh và tạo tài khoản
7. Thông báo đăng ký thành công

UC1.3: Đăng nhập
1. User nhập email + password
2. System kiểm tra thông tin
3. System tạo JWT token
4. Trả về token + thông tin user
5. User vào màn hình Home

UC1.4: Quên mật khẩu
1. User nhập email
2. System tạo mật khẩu mới (6 số)
3. System gửi email chứa mật khẩu mới
4. User đăng nhập bằng mật khẩu mới
5. User có thể đổi mật khẩu sau (UC1.7)

UC1.6: Chỉnh sửa thông tin
1. User vào màn hình "Tài khoản"
2. User nhấn "Chỉnh sửa"
3. User thay đổi tên hoặc upload ảnh đại diện
4. System cập nhật thông tin
5. Thông báo cập nhật thành công

UC1.7: Đổi mật khẩu
1. User vào "Đổi mật khẩu"
2. User nhập mật khẩu cũ, mật khẩu mới, xác nhận
3. System kiểm tra mật khẩu cũ
4. System cập nhật mật khẩu mới
5. Thông báo đổi mật khẩu thành công
```

**Điều kiện tiên quyết:**
- UC1.1: Email chưa tồn tại trong hệ thống
- UC1.3: Tài khoản đã được xác minh (is_verified = TRUE)
- UC1.7: User đã đăng nhập

**Điều kiện sau:**
- UC1.1: Tài khoản được tạo trong DB, email được xác minh
- UC1.3: User nhận được JWT token
- UC1.7: Mật khẩu được cập nhật trong DB

---

### **UC2: LUYỆN ĐỌC VỚI BÀI CÓ SẴN**

**Actor**: User, System (Whisper, Piper, Gemini AI)

**Mô tả**: Người dùng luyện đọc với bài đọc có sẵn trong hệ thống

**Use Case con:**
- UC2.1: Xem danh sách chủ đề
- UC2.2: Chọn chủ đề
- UC2.3: Xem danh sách bài đọc theo chủ đề
- UC2.4: Chọn bài đọc
- UC2.5: Nghe bài mẫu (TTS)
- UC2.6: Ghi âm giọng đọc
- UC2.7: Gửi file và nhận kết quả chấm điểm
- UC2.8: Xem kết quả chi tiết

**Luồng chính:**
```
UC2.1-2.2: Chọn chủ đề
1. User vào màn hình Home
2. User chọn "Bài đọc theo chủ đề"
3. System hiển thị danh sách chủ đề (Du lịch, Khoa học, Tin tức...)
4. User chọn 1 chủ đề

UC2.3-2.4: Chọn bài đọc
1. System hiển thị danh sách bài đọc thuộc chủ đề
   - Hiển thị nội dung (rút gọn)
   - Hiển thị level (A1, A2, B1...)
   - Hiển thị điểm cao nhất (nếu đã luyện)
   - Hiển thị trạng thái hoàn thành
2. User chọn 1 bài đọc
3. Chuyển sang màn hình ReadingPracticeScreen

UC2.5: Nghe bài mẫu
1. User nhấn nút "Nghe bài mẫu"
2. System gửi text đến Piper Server (UC19)
3. Piper Server trả về file audio WAV
4. System chuyển WAV sang MP3
5. App phát audio cho user nghe

UC2.6: Ghi âm giọng đọc
1. User nhấn "Bắt đầu ghi âm"
2. App bắt đầu ghi âm (WAV, 16kHz, mono)
3. User đọc theo nội dung bài
4. User nhấn "Dừng ghi âm"
5. File WAV được lưu tạm

UC2.7: Gửi file và nhận kết quả
1. App gửi file WAV + readingId lên backend
2. System gửi file đến Whisper Server (UC18)
3. Whisper trả về transcript (văn bản AI nghe được)
4. System gọi Gemini AI chấm điểm (UC18)
5. Gemini trả về điểm chi tiết + nhận xét
6. System lưu kết quả vào DB (records, reading_progress)
7. System cập nhật streak (UC20)
8. System trả kết quả về app

UC2.8: Xem kết quả
1. App hiển thị modal kết quả:
   - Điểm tổng thể (lớn, nổi bật)
   - Điểm chi tiết (phát âm, ngữ điệu, lưu loát, tốc độ)
   - Nhận xét từ AI
   - Nút "Luyện lại" hoặc "Về trang chủ"
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- Có bài đọc trong hệ thống
- Whisper Server và Piper Server đang chạy

**Điều kiện sau:**
- Kết quả được lưu vào bảng records
- Tiến độ được cập nhật trong reading_progress
- Streak được cập nhật nếu hôm nay chưa luyện

---

### **UC3: LUYỆN ĐỌC VỚI NỘI DUNG TÙY CHỈNH**

**Actor**: User, System (Whisper, Gemini AI, ML Kit OCR)

**Mô tả**: Người dùng luyện đọc với nội dung tự tạo

**Use Case con:**
- UC3.1: Nhập văn bản thủ công
- UC3.2: Quét văn bản từ ảnh (OCR)
- UC3.3: Tạo bài đọc bằng AI
- UC3.4: Ghi âm và chấm điểm

**Luồng chính:**
```
UC3.1: Nhập văn bản thủ công
1. User vào Home → "Nội dung tùy chỉnh" → "Nhập văn bản"
2. User nhập đoạn văn muốn luyện đọc
3. User nhấn "Bắt đầu luyện"
4. Chuyển sang màn hình PracticeCustomReadingScreen
5. User ghi âm giọng đọc (tương tự UC2.6)
6. System chấm điểm (UC18)
7. System tạo bài đọc mới trong DB (is_community_post = TRUE)
8. Hiển thị kết quả

UC3.2: Quét văn bản từ ảnh
1. User chọn "Quét văn bản từ ảnh"
2. User chụp ảnh hoặc chọn từ thư viện
3. App dùng ML Kit Text Recognition nhận diện chữ (offline)
4. App hiển thị văn bản đã quét
5. User có thể chỉnh sửa văn bản
6. User nhấn "Luyện đọc"
7. Tiếp tục như UC3.1 (bước 4-8)

UC3.3: Tạo bài đọc bằng AI
1. User chọn "Tạo bài đọc bằng AI"
2. User nhập chủ đề (ví dụ: "Du lịch Đà Nẵng")
3. User nhập mô tả chi tiết (tuỳ chọn)
4. User nhấn "Tạo bài đọc"
5. System gọi Gemini AI:
   - Lấy 5 bài gần nhất của user (tránh trùng lặp)
   - Gửi prompt yêu cầu tạo bài đọc ngắn (2-4 câu, A1-A2)
   - Gemini trả về nội dung bài đọc mới
6. App hiển thị bài đọc
7. User có thể:
   - Chỉnh sửa nội dung
   - Tạo lại (quay lại bước 5)
   - Luyện đọc (tiếp tục như UC3.1 bước 4-8)
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- UC3.2: Thiết bị có camera hoặc thư viện ảnh
- UC3.3: Có kết nối internet, Gemini API hoạt động

**Điều kiện sau:**
- Bài đọc custom được lưu vào bảng readings
- Kết quả được lưu vào bảng records (có cột custom_text)

---

### **UC4: XEM LỊCH SỬ & TIẾN ĐỘ**

**Actor**: User

**Mô tả**: Người dùng xem lại lịch sử luyện tập và tiến độ học tập

**Use Case con:**
- UC4.1: Xem biểu đồ tiến độ
- UC4.2: Xem danh sách bài đã luyện
- UC4.3: Xem chi tiết 1 bài đã luyện
- UC4.4: Luyện lại bài cũ
- UC4.5: Lọc lịch sử theo chủ đề
- UC4.6: Xem bài đã luyện theo ngày

**Luồng chính:**
```
UC4.1: Xem biểu đồ tiến độ
1. User vào tab "Lịch sử"
2. User chọn khoảng thời gian (7 ngày hoặc 30 ngày)
3. System tính điểm trung bình theo từng ngày
4. App vẽ biểu đồ đường (LineChart)
5. User có thể nhấn vào điểm trên biểu đồ
6. Hiển thị chi tiết các bài đọc trong ngày đó (UC4.6)

UC4.2: Xem danh sách bài đã luyện
1. System hiển thị danh sách records (có phân trang):
   - Nội dung bài đọc (rút gọn)
   - Điểm tổng thể
   - Thời gian luyện
   - Chủ đề
2. User cuộn xuống → App tự động load thêm (pagination)
3. User có thể lọc theo chủ đề (UC4.5)

UC4.3: Xem chi tiết 1 bài đã luyện
1. User nhấn vào 1 record
2. Chuyển sang RecordDetailScreen
3. System hiển thị:
   - Nội dung gốc (original_content hoặc reading.content)
   - Transcript (văn bản AI nghe được)
   - Điểm chi tiết từng tiêu chí
   - Nhận xét từ AI
   - Thời gian luyện
4. User có thể "Luyện lại" (UC4.4)

UC4.4: Luyện lại bài cũ
1. User nhấn "Luyện lại" trong RecordDetailScreen
2. System kiểm tra:
   - Nếu bài đọc gốc còn tồn tại → Chuyển sang màn hình luyện với readingId
   - Nếu bài đã bị xóa → Dùng original_content để luyện lại
3. Tiếp tục như UC2.6-2.8 hoặc UC3.4

UC4.5: Lọc lịch sử theo chủ đề
1. User chọn chủ đề từ dropdown
2. System lọc và hiển thị chỉ các bài thuộc chủ đề đó
3. User có thể chọn "Tất cả chủ đề" để bỏ lọc

UC4.6: Xem bài đã luyện theo ngày
1. User chọn 1 ngày cụ thể (từ biểu đồ hoặc calendar)
2. System hiển thị tất cả bài đã luyện trong ngày đó
3. Hiển thị điểm trung bình của ngày
4. User có thể xem chi tiết từng bài (UC4.3)
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- User đã luyện ít nhất 1 bài

**Điều kiện sau:**
- Không có thay đổi dữ liệu (chỉ xem)

---

### **UC5: QUẢN LÝ STREAK (CHUỖI LUYỆN TẬP)**

**Actor**: User, System

**Mô tả**: Theo dõi và duy trì chuỗi luyện tập hàng ngày

**Use Case con:**
- UC5.1: Xem thông tin streak
- UC5.2: Cập nhật streak khi luyện đọc
- UC5.3: Xem chi tiết streak

**Luồng chính:**
```
UC5.1: Xem thông tin streak
1. User vào màn hình Home
2. System hiển thị icon lửa + số ngày streak
3. Màu sắc thay đổi theo cấp độ:
   - 1-10 ngày: Beginner Flame (đỏ) 🔥
   - 10-50 ngày: Intermediate Master (vàng) 🔥
   - 50-100 ngày: Advanced Speaker (xanh lá) 🔥
   - 100-200 ngày: Proficient Legend (xanh dương) 🔥
   - 200+ ngày: Native Immortal (tím) 🔥

UC5.2: Cập nhật streak khi luyện đọc
1. User hoàn thành 1 bài đọc (có điểm)
2. System gọi hàm updateStreakOnPractice(userId) (UC20)
3. System kiểm tra:
   - Lấy ngày luyện gần nhất (last_practice_date)
   - Tính ngày hôm nay (theo giờ VN, UTC+7)
4. Logic cập nhật:
   - Nếu hôm nay đã luyện → Không làm gì
   - Nếu hôm nay chưa luyện:
     * Ngày gần nhất là hôm qua → Tăng current_streak += 1
     * Ngày gần nhất là hôm kia trở về trước → Reset current_streak = 1
   - Cập nhật last_practice_date = hôm nay
   - Cập nhật longest_streak nếu current_streak lớn hơn
5. Hiển thị animation streak tăng (nếu có)

UC5.3: Xem chi tiết streak
1. User nhấn vào icon streak
2. Hiển thị modal chi tiết:
   - Streak hiện tại (current_streak)
   - Streak dài nhất (longest_streak)
   - Số lần phục hồi còn lại (streak_freeze_count)
   - Trạng thái hôm nay (đã luyện chưa)
   - Lịch sử streak (tuỳ chọn)
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- UC5.2: User hoàn thành ít nhất 1 bài đọc

**Điều kiện sau:**
- UC5.2: Streak được cập nhật trong bảng user_streaks
- Mỗi đầu tháng: streak_freeze_count reset về 3

---

### **UC6: NHẬN VÀ XEM THÔNG BÁO**

**Actor**: User, System

**Mô tả**: Người dùng nhận và quản lý thông báo từ hệ thống

**Use Case con:**
- UC6.1: Đăng ký nhận thông báo
- UC6.2: Nhận thông báo đẩy (Push Notification)
- UC6.3: Xem danh sách thông báo
- UC6.4: Xem chi tiết thông báo
- UC6.5: Đánh dấu đã đọc

**Luồng chính:**
```
UC6.1: Đăng ký nhận thông báo
1. User cài đặt app lần đầu
2. App yêu cầu quyền nhận thông báo
3. User chấp nhận
4. Firebase Messaging tạo FCM token (unique cho thiết bị)
5. App gửi token lên backend
6. System lưu token vào cột fcm_token trong bảng users

UC6.2: Nhận thông báo đẩy
1. System gửi thông báo (UC17)
2. Firebase gửi push notification đến thiết bị
3. User nhận thông báo:
   - Nếu app đang mở → Hiển thị banner trong app
   - Nếu app đang đóng → Hiển thị notification trên màn hình
4. User nhấn vào thông báo
5. App mở và điều hướng đến nội dung tương ứng (UC6.4)

UC6.3: Xem danh sách thông báo
1. User vào tab "Thông báo"
2. System hiển thị danh sách thông báo (mới nhất trước):
   - Tiêu đề
   - Nội dung (rút gọn)
   - Thời gian
   - Trạng thái đã đọc/chưa đọc (badge)
3. User cuộn xuống → Load thêm (pagination)

UC6.4: Xem chi tiết thông báo
1. User nhấn vào 1 thông báo
2. System đánh dấu đã đọc (UC6.5)
3. System điều hướng đến màn hình tương ứng:
   - Nếu có readingId → Màn hình luyện đọc bài có sẵn (UC2)
   - Nếu có customText → Màn hình luyện đọc custom (UC3)
   - Nếu có recordId → Màn hình chi tiết bài đã luyện (UC4.3)

UC6.5: Đánh dấu đã đọc
1. System cập nhật is_read = TRUE trong bảng notifications
2. Badge "chưa đọc" biến mất
3. Số lượng thông báo chưa đọc giảm đi
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- UC6.1: User chấp nhận quyền nhận thông báo
- UC6.2: Thiết bị có kết nối internet

**Điều kiện sau:**
- UC6.1: FCM token được lưu trong DB
- UC6.5: Thông báo được đánh dấu đã đọc

---

### **UC7: CHAT VỚI AI BOT**

**Actor**: User, System (Gemini AI)

**Mô tả**: Người dùng hỏi đáp với chatbot về tiếng Anh

**Use Case con:**
- UC7.1: Mở màn hình chatbot
- UC7.2: Hỏi câu hỏi
- UC7.3: Nhận câu trả lời
- UC7.4: Xem lịch sử chat

**Luồng chính:**
```
UC7.1: Mở màn hình chatbot
1. User vào màn hình Chatbot
2. Lần đầu vào → System tự động gửi lời chào:
   "👋 Xin chào! Tôi là EnTalk Chatbot. 
    Bạn có thể hỏi tôi bất cứ điều gì liên quan đến việc học tiếng Anh..."
3. System load lịch sử chat (UC7.4)

UC7.2: Hỏi câu hỏi
1. User nhập câu hỏi vào ô chat
2. User nhấn gửi
3. App hiển thị tin nhắn user (bên phải)
4. App hiển thị "Bot đang trả lời..."

UC7.3: Nhận câu trả lời
1. System lưu câu hỏi vào chat_messages (role = 'user')
2. System gọi Gemini AI:
   - Gửi prompt kiểm tra câu hỏi có liên quan đến tiếng Anh không
   - Nếu KHÔNG liên quan → Trả lời: 
     "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến học tiếng Anh."
   - Nếu CÓ liên quan → Trả lời ngắn gọn (dưới 12 dòng), dễ hiểu, có ví dụ
3. System lưu câu trả lời vào chat_messages (role = 'assistant')
4. App hiển thị tin nhắn bot (bên trái)
5. User có thể tiếp tục hỏi (quay lại UC7.2)

UC7.4: Xem lịch sử chat
1. System lấy toàn bộ lịch sử chat của user (sắp xếp theo thời gian)
2. App hiển thị lịch sử khi vào màn hình Chatbot
3. User có thể cuộn lên xem tin nhắn cũ
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- Có kết nối internet
- Gemini API hoạt động

**Điều kiện sau:**
- Tin nhắn được lưu vào bảng chat_messages
- Lịch sử chat được giữ lại

---

### **UC8: GỬI GÓP Ý / BÁO LỖI**

**Actor**: User

**Mô tả**: Người dùng gửi góp ý hoặc báo lỗi cho admin

**Use Case con:**
- UC8.1: Viết góp ý
- UC8.2: Đính kèm ảnh (screenshot)
- UC8.3: Gửi góp ý
- UC8.4: Nhận email phản hồi từ admin

**Luồng chính:**
```
UC8.1: Viết góp ý
1. User vào màn hình "Góp ý"
2. User nhập nội dung góp ý/báo lỗi vào textarea

UC8.2: Đính kèm ảnh
1. User nhấn "Đính kèm ảnh"
2. User chọn ảnh từ thư viện hoặc chụp ảnh mới
3. App tự động nén ảnh (800x800, JPEG 70%)
4. Hiển thị preview ảnh
5. User có thể xóa và chọn ảnh khác

UC8.3: Gửi góp ý
1. User nhấn "Gửi góp ý"
2. App gửi FormData lên backend:
   - content: Nội dung góp ý
   - screenshot: File ảnh (nếu có)
3. System upload ảnh lên Cloudinary (nếu có)
4. System lưu vào bảng feedbacks:
   - user_id, user_email, content, screenshot_url
   - status = 'pending' (chờ admin trả lời)
5. App hiển thị thông báo "🎉 Gửi góp ý thành công!"
6. Quay về màn hình trước

UC8.4: Nhận email phản hồi
1. Admin trả lời góp ý (UC14.2)
2. System gửi email phản hồi đến user
3. User nhận email với nội dung trả lời từ admin
```

**Điều kiện tiên quyết:**
- User đã đăng nhập
- UC8.2: Thiết bị có camera hoặc thư viện ảnh
- UC8.3: Có kết nối internet

**Điều kiện sau:**
- Góp ý được lưu vào bảng feedbacks
- Admin có thể xem và trả lời (UC14)

---


### 🖥️ **NHÓM USE CASE: ADMIN (QUẢN TRỊ VIÊN)**

---

### **UC9: ĐĂNG NHẬP ADMIN**

**Actor**: Admin

**Mô tả**: Quản trị viên đăng nhập vào web admin

**Luồng chính:**
```
1. Admin truy cập web admin (React app)
2. Admin nhập username + password
3. Web gọi API POST /api/admin/login
4. System kiểm tra:
   - Username có tồn tại trong bảng admins không?
   - Password có khớp không? (so sánh hash)
5. System tạo JWT token (dùng JWT_ADMIN_SECRET)
6. Trả về token + thông tin admin
7. Web lưu token vào localStorage
8. Chuyển đến trang Dashboard
```

**Điều kiện tiên quyết:**
- Tài khoản admin đã được tạo trong DB

**Điều kiện sau:**
- Admin nhận được JWT token
- Token được lưu trong localStorage

---

### **UC10: QUẢN LÝ NGƯỜI DÙNG**

**Actor**: Admin

**Mô tả**: Quản trị viên quản lý danh sách người dùng

**Use Case con:**
- UC10.1: Xem danh sách người dùng
- UC10.2: Thêm người dùng mới
- UC10.3: Chỉnh sửa thông tin người dùng
- UC10.4: Xóa người dùng
- UC10.5: Vô hiệu hóa/Kích hoạt tài khoản

**Luồng chính:**
```
UC10.1: Xem danh sách người dùng
1. Admin vào trang "Users"
2. Web gọi API GET /api/admin/users
3. System trả về danh sách users (mới nhất trước):
   - ID, Tên, Email, Trình độ, Ảnh đại diện
   - Ngày tạo, Trạng thái xác minh, Trạng thái hoạt động
4. Web hiển thị bảng với các cột
5. Admin có thể:
   - Tìm kiếm theo tên/email
   - Sắp xếp theo cột
   - Phân trang

UC10.2: Thêm người dùng mới
1. Admin nhấn "Thêm người dùng"
2. Web hiển thị form:
   - Tên (bắt buộc)
   - Email (bắt buộc, unique)
   - Mật khẩu (bắt buộc)
   - Level (dropdown: A1-C2)
3. Admin nhập thông tin → Nhấn "Tạo"
4. Web gọi API POST /api/admin/users
5. System tạo user mới (password được hash)
6. Thông báo thành công
7. Quay về danh sách users

UC10.3: Chỉnh sửa thông tin người dùng
1. Admin nhấn "Sửa" trên 1 user
2. Web hiển thị form với dữ liệu hiện tại
3. Admin thay đổi thông tin (tên, email, level)
4. Admin nhấn "Lưu"
5. Web gọi API PUT /api/admin/users/:id
6. System cập nhật bảng users
7. Thông báo cập nhật thành công

UC10.4: Xóa người dùng
1. Admin nhấn "Xóa" trên 1 user
2. Web hiển thị xác nhận: "Bạn có chắc muốn xóa user này?"
3. Admin xác nhận
4. Web gọi API DELETE /api/admin/users/:id
5. System xóa user (cascade: xóa luôn records, chat_messages, feedbacks...)
6. Thông báo xóa thành công
7. Danh sách users được cập nhật

UC10.5: Vô hiệu hóa/Kích hoạt tài khoản
1. Admin nhấn nút "Vô hiệu hóa" hoặc "Kích hoạt"
2. Web gọi API PUT /api/admin/users/:id/toggle-status
3. System cập nhật is_active (TRUE/FALSE)
4. User bị vô hiệu hóa không thể đăng nhập
5. Thông báo cập nhật thành công
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập (có admin token)

**Điều kiện sau:**
- UC10.2: User mới được tạo trong DB
- UC10.3: Thông tin user được cập nhật
- UC10.4: User và dữ liệu liên quan bị xóa
- UC10.5: Trạng thái tài khoản được thay đổi

---

### **UC11: QUẢN LÝ CHỦ ĐỀ**

**Actor**: Admin

**Mô tả**: Quản trị viên quản lý danh sách chủ đề bài đọc

**Use Case con:**
- UC11.1: Xem danh sách chủ đề
- UC11.2: Thêm chủ đề mới
- UC11.3: Chỉnh sửa chủ đề
- UC11.4: Xóa chủ đề

**Luồng chính:**
```
UC11.1: Xem danh sách chủ đề
1. Admin vào trang "Topics"
2. Web gọi API GET /api/admin/topics
3. System trả về danh sách topics:
   - ID, Tên, Mô tả, Hình ảnh
4. Web hiển thị bảng với preview hình ảnh

UC11.2: Thêm chủ đề mới
1. Admin nhấn "Thêm chủ đề"
2. Web hiển thị form:
   - Tên chủ đề (bắt buộc, unique)
   - Mô tả (tuỳ chọn)
   - Upload hình ảnh (tuỳ chọn)
3. Admin nhập thông tin
4. Admin chọn file ảnh (nếu có)
5. Admin nhấn "Tạo"
6. Web gửi FormData lên API POST /api/admin/topics
7. System upload ảnh lên Cloudinary (nếu có)
8. System lưu vào bảng topics
9. Thông báo thành công

UC11.3: Chỉnh sửa chủ đề
1. Admin nhấn "Sửa" trên 1 topic
2. Web hiển thị form với dữ liệu hiện tại
3. Admin thay đổi tên, mô tả, hoặc upload ảnh mới
4. Admin nhấn "Lưu"
5. Web gọi API PUT /api/admin/topics/:id
6. System cập nhật (nếu có ảnh mới → upload lên Cloudinary)
7. Thông báo cập nhật thành công

UC11.4: Xóa chủ đề
1. Admin nhấn "Xóa" trên 1 topic
2. Web hiển thị cảnh báo: 
   "Xóa chủ đề sẽ xóa tất cả bài đọc thuộc chủ đề này. Bạn có chắc?"
3. Admin xác nhận
4. Web gọi API DELETE /api/admin/topics/:id
5. System xử lý:
   - Đặt reading_id = NULL cho tất cả records liên quan (giữ lại lịch sử)
   - Xóa tất cả readings thuộc topic này
   - Xóa topic
6. Thông báo xóa thành công
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập
- UC11.2: Tên chủ đề chưa tồn tại

**Điều kiện sau:**
- UC11.2: Chủ đề mới được tạo trong DB
- UC11.3: Chủ đề được cập nhật
- UC11.4: Chủ đề và bài đọc liên quan bị xóa

---

### **UC12: QUẢN LÝ BÀI ĐỌC**

**Actor**: Admin

**Mô tả**: Quản trị viên quản lý danh sách bài đọc

**Use Case con:**
- UC12.1: Xem danh sách bài đọc
- UC12.2: Thêm bài đọc mới
- UC12.3: Chỉnh sửa bài đọc
- UC12.4: Xóa bài đọc
- UC12.5: Lọc bài đọc theo chủ đề/level

**Luồng chính:**
```
UC12.1: Xem danh sách bài đọc
1. Admin vào trang "Readings"
2. Web gọi API GET /api/admin/readings
3. System trả về danh sách readings (kèm tên chủ đề):
   - ID, Nội dung (rút gọn), Level, Chủ đề, Ngày tạo
4. Web hiển thị bảng
5. Admin có thể lọc theo chủ đề/level (UC12.5)

UC12.2: Thêm bài đọc mới
1. Admin nhấn "Thêm bài đọc"
2. Web hiển thị form:
   - Nội dung (textarea, bắt buộc)
   - Level (dropdown: A1, A2, B1, B2, C1, C2)
   - Chủ đề (dropdown: danh sách topics)
3. Admin nhập thông tin → Nhấn "Tạo"
4. Web gọi API POST /api/admin/readings
5. System lưu vào bảng readings:
   - created_by = NULL (của hệ thống)
   - is_community_post = FALSE
6. Thông báo thành công

UC12.3: Chỉnh sửa bài đọc
1. Admin nhấn "Sửa" trên 1 reading
2. Web hiển thị form với dữ liệu hiện tại
3. Admin thay đổi nội dung, level, hoặc chủ đề
4. Admin nhấn "Lưu"
5. Web gọi API PUT /api/admin/readings/:id
6. System cập nhật bảng readings
7. Lưu ý: Các record cũ vẫn giữ original_content để so sánh
8. Thông báo cập nhật thành công

UC12.4: Xóa bài đọc
1. Admin nhấn "Xóa" trên 1 reading
2. Web hiển thị cảnh báo:
   "Xóa bài đọc sẽ ảnh hưởng đến lịch sử luyện tập. Bạn có chắc?"
3. Admin xác nhận
4. Web gọi API DELETE /api/admin/readings/:id
5. System xử lý:
   - Đặt reading_id = NULL cho tất cả records liên quan (giữ lại lịch sử)
   - Xóa reading
6. Thông báo xóa thành công

UC12.5: Lọc bài đọc theo chủ đề/level
1. Admin chọn chủ đề từ dropdown (hoặc "Tất cả")
2. Admin chọn level từ dropdown (hoặc "Tất cả")
3. Web gọi API với query params: ?topic_id=X&level=Y
4. System trả về danh sách bài đọc đã lọc
5. Web hiển thị kết quả
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập
- UC12.2: Có ít nhất 1 chủ đề trong hệ thống

**Điều kiện sau:**
- UC12.2: Bài đọc mới được tạo trong DB
- UC12.3: Bài đọc được cập nhật
- UC12.4: Bài đọc bị xóa, records liên quan giữ lại

---

### **UC13: QUẢN LÝ BẢN GHI LUYỆN TẬP**

**Actor**: Admin

**Mô tả**: Quản trị viên xem và quản lý bản ghi luyện tập của users

**Use Case con:**
- UC13.1: Xem danh sách records
- UC13.2: Xem chi tiết 1 record
- UC13.3: Xóa record
- UC13.4: Lọc records theo user/chủ đề/ngày

**Luồng chính:**
```
UC13.1: Xem danh sách records
1. Admin vào trang "Records"
2. Web gọi API GET /api/admin/records
3. System trả về danh sách records (kèm tên user):
   - ID, Người dùng, Nội dung bài đọc (rút gọn)
   - Điểm tổng thể, Thời gian
4. Web hiển thị bảng với phân trang
5. Admin có thể lọc (UC13.4)

UC13.2: Xem chi tiết 1 record
1. Admin nhấn vào 1 record
2. Web hiển thị modal hoặc trang chi tiết:
   - Thông tin user (tên, email)
   - Nội dung gốc (original_content)
   - Transcript (văn bản AI nghe được)
   - Điểm chi tiết từng tiêu chí
   - Nhận xét từ AI
   - Thời gian luyện
3. Admin có thể xóa record (UC13.3)

UC13.3: Xóa record
1. Admin nhấn "Xóa" trong chi tiết record
2. Web hiển thị xác nhận
3. Admin xác nhận
4. Web gọi API DELETE /api/admin/records/:id
5. System xóa record khỏi DB
6. Thông báo xóa thành công

UC13.4: Lọc records
1. Admin chọn tiêu chí lọc:
   - Theo user (dropdown hoặc search)
   - Theo chủ đề (dropdown)
   - Theo khoảng thời gian (date picker)
   - Theo điểm (slider: 0-10)
2. Web gọi API với query params
3. System trả về danh sách records đã lọc
4. Web hiển thị kết quả
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập

**Điều kiện sau:**
- UC13.3: Record bị xóa khỏi DB

---

### **UC14: QUẢN LÝ GÓP Ý**

**Actor**: Admin

**Mô tả**: Quản trị viên xem và trả lời góp ý từ users

**Use Case con:**
- UC14.1: Xem danh sách góp ý
- UC14.2: Trả lời góp ý
- UC14.3: Lọc góp ý theo trạng thái

**Luồng chính:**
```
UC14.1: Xem danh sách góp ý
1. Admin vào trang "Feedbacks"
2. Web gọi API GET /api/admin/feedbacks
3. System trả về danh sách feedbacks:
   - ID, Email user, Nội dung (rút gọn)
   - Ảnh đính kèm, Trạng thái (pending/replied)
   - Thời gian gửi
4. Web hiển thị bảng với badge trạng thái
5. Admin có thể lọc theo trạng thái (UC14.3)

UC14.2: Trả lời góp ý
1. Admin nhấn "Trả lời" trên 1 feedback
2. Web hiển thị modal hoặc trang chi tiết:
   - Nội dung góp ý gốc
   - Ảnh đính kèm (nếu có) - hiển thị full size
   - Thông tin user (email, tên)
   - Textarea để nhập câu trả lời
3. Admin nhập câu trả lời
4. Admin nhấn "Gửi"
5. Web gọi API POST /api/admin/feedbacks/:id/reply
6. System xử lý:
   - Cập nhật admin_reply, replied_at
   - Cập nhật status = 'replied'
   - Gửi email trả lời đến user (qua Nodemailer)
7. Thông báo gửi thành công
8. Badge trạng thái chuyển sang "Đã trả lời"

UC14.3: Lọc góp ý theo trạng thái
1. Admin chọn trạng thái:
   - Tất cả
   - Chờ trả lời (pending)
   - Đã trả lời (replied)
2. Web gọi API với query param: ?status=pending
3. System trả về danh sách feedbacks đã lọc
4. Web hiển thị kết quả
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập
- UC14.2: Email service (Nodemailer) hoạt động

**Điều kiện sau:**
- UC14.2: Góp ý được đánh dấu đã trả lời
- UC14.2: User nhận email phản hồi

---

### **UC15: XEM THỐNG KÊ DASHBOARD**

**Actor**: Admin

**Mô tả**: Quản trị viên xem thống kê tổng quan hệ thống

**Use Case con:**
- UC15.1: Xem thống kê tổng quan
- UC15.2: Xem biểu đồ người dùng mới
- UC15.3: Xem biểu đồ hoạt động luyện tập
- UC15.4: Xem top users

**Luồng chính:**
```
UC15.1: Xem thống kê tổng quan
1. Admin vào trang Dashboard
2. Web gọi API GET /api/admin/dashboard
3. System tính toán:
   - Tổng số người dùng (COUNT(*) FROM users)
   - Tổng số bài đọc (COUNT(*) FROM readings)
   - Tổng số bản ghi luyện tập (COUNT(*) FROM records)
   - Tổng số admin (COUNT(*) FROM admins)
   - Điểm trung bình toàn hệ thống (AVG(score_overall) FROM records)
   - Số người dùng mới trong 7 ngày
   - Số bài luyện trong 7 ngày
4. Web hiển thị các thẻ thống kê (cards) với icon và màu sắc

UC15.2: Xem biểu đồ người dùng mới
1. System tính số người dùng mới theo từng ngày (7 ngày gần nhất)
2. Web vẽ biểu đồ cột (Bar Chart)
3. Admin có thể hover để xem chi tiết từng ngày

UC15.3: Xem biểu đồ hoạt động luyện tập
1. System tính số bài luyện theo từng ngày (7 ngày gần nhất)
2. Web vẽ biểu đồ đường (Line Chart)
3. Hiển thị xu hướng tăng/giảm

UC15.4: Xem top users
1. System lấy top 10 users có:
   - Điểm trung bình cao nhất
   - Số bài luyện nhiều nhất
   - Streak dài nhất
2. Web hiển thị bảng xếp hạng
3. Admin có thể nhấn vào user để xem chi tiết
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập

**Điều kiện sau:**
- Không có thay đổi dữ liệu (chỉ xem)

---

### **UC16: EMAIL MARKETING**

**Actor**: Admin

**Mô tả**: Quản trị viên gửi email marketing đến tất cả users

**Use Case con:**
- UC16.1: Tạo campaign email
- UC16.2: Gửi email hàng loạt
- UC16.3: Xem lịch sử campaigns
- UC16.4: Xem chi tiết campaign

**Luồng chính:**
```
UC16.1: Tạo campaign email
1. Admin vào trang "Email Marketing"
2. Admin nhấn "Tạo campaign mới"
3. Web hiển thị form:
   - Tiêu đề campaign (nội bộ)
   - Subject email (tiêu đề email)
   - Nội dung HTML (rich text editor)
   - Preview email
4. Admin nhập thông tin
5. Admin xem preview
6. Admin nhấn "Gửi ngay"

UC16.2: Gửi email hàng loạt
1. Web gọi API POST /api/admin/email-marketing/send
2. System xử lý:
   - Tạo campaign trong bảng marketing_campaigns
   - Lấy danh sách tất cả users có email verified
   - Gửi email từng user (qua Nodemailer)
   - Cập nhật sent_count, failed_count
   - Cập nhật status (sending → completed/failed)
3. Web hiển thị progress bar (nếu có)
4. Thông báo hoàn thành:
   - Số email gửi thành công
   - Số email thất bại

UC16.3: Xem lịch sử campaigns
1. Admin vào tab "Lịch sử campaigns"
2. Web gọi API GET /api/admin/email-marketing/campaigns
3. System trả về danh sách campaigns:
   - ID, Tiêu đề, Subject
   - Tổng số người nhận, Số gửi thành công, Số thất bại
   - Trạng thái, Thời gian gửi
4. Web hiển thị bảng với badge trạng thái

UC16.4: Xem chi tiết campaign
1. Admin nhấn vào 1 campaign
2. Web hiển thị chi tiết:
   - Thông tin campaign
   - Nội dung HTML (preview)
   - Thống kê gửi
   - Danh sách users nhận email (nếu có)
3. Admin có thể gửi lại campaign (quay lại UC16.2)
```

**Điều kiện tiên quyết:**
- Admin đã đăng nhập
- Có ít nhất 1 user trong hệ thống
- Email service (Nodemailer) hoạt động

**Điều kiện sau:**
- UC16.2: Campaign được lưu trong bảng marketing_campaigns
- UC16.2: Email được gửi đến tất cả users

---


### 🤖 **NHÓM USE CASE: SYSTEM (HỆ THỐNG TỰ ĐỘNG)**

---

### **UC17: GỬI THÔNG BÁO GỢI Ý TỰ ĐỘNG**

**Actor**: System (Cron Job)

**Mô tả**: Hệ thống tự động gửi thông báo gợi ý luyện tập cho users

**Use Case con:**
- UC17.1: Chạy cron job định kỳ
- UC17.2: Chọn chiến lược gợi ý
- UC17.3: Tìm bài phù hợp
- UC17.4: Gửi push notification
- UC17.5: Lưu thông báo vào DB

**Luồng chính:**
```
UC17.1: Chạy cron job định kỳ
1. Cron job chạy vào 8h sáng, 14h và 20h tối mỗi ngày
2. System gọi hàm recommendOnce() trong dailyRecommender.js
3. System lấy danh sách tất cả users có FCM token

UC17.2: Chọn chiến lược gợi ý
1. Với mỗi user:
2. System lấy last_suggestion_type (0-4) để xoay vòng tiêu chí
3. System thử 5 chiến lược theo thứ tự:

CHIẾN LƯỢC 1: Gợi ý bài tự nhập điểm thấp chưa cải thiện
- Tìm bài custom_text có điểm < 7 và chưa cải thiện lên >= 8
- Nếu tìm thấy → Gửi thông báo:
  "📉 Luyện lại bài tự nhập - Bài: '...' có điểm X, hãy thử cải thiện nhé!"
- Data: { customText, suggestionReason }

CHIẾN LƯỢC 2: Gợi ý bài hệ thống từng luyện có điểm thấp
- Tìm bài đọc có sẵn (không phải custom) có điểm < 7.5
- Nếu tìm thấy → Gửi thông báo:
  "📉 Luyện lại bài hệ thống - Bài: '...' điểm X, thử lại nhé!"
- Data: { readingId, recordId, suggestionReason }

CHIẾN LƯỢC 3: Bài hệ thống chưa từng luyện
- Tìm bài đọc có sẵn mà user chưa luyện lần nào
- Chọn ngẫu nhiên 1 bài
- Nếu tìm thấy → Gửi thông báo:
  "🆕 Bài mới cho bạn - Thử đọc bài: '...' nhé!"
- Data: { readingId, suggestionReason }

CHIẾN LƯỢC 4: Chủ đề ít luyện
- Tìm chủ đề mà user luyện ít nhất
- Chọn 1 bài chưa đọc hoặc ít đọc trong chủ đề đó
- Nếu tìm thấy → Gửi thông báo:
  "📚 Chủ đề: [Tên] - Thử bài này: '...'"
- Data: { readingId, suggestionReason }

CHIẾN LƯỢC 5: AI đề xuất sinh đoạn văn mới
- Lấy 3 bài gần nhất của user (transcript + điểm)
- Gọi Gemini AI phân tích:
  * Điểm yếu của user (phát âm, ngữ điệu, từ vựng...)
  * Tạo đoạn văn mới phù hợp để luyện tập
- Nếu thành công → Gửi thông báo:
  "🎯 Gợi ý từ AI - AI gợi ý bài mới: '...'"
- Data: { customText, suggestionReason }

UC17.4: Gửi push notification
1. System gọi Firebase Admin SDK
2. Gửi notification đến FCM token:
   - title: Tiêu đề thông báo
   - body: Nội dung thông báo
   - data: { readingId, customText, recordId, suggestionReason }
3. Firebase gửi push notification đến thiết bị
4. User nhận thông báo trên màn hình

UC17.5: Lưu thông báo vào DB
1. System lưu vào bảng notifications:
   - user_id, title, body
   - reading_id, custom_text, record_id
   - is_read = FALSE
   - created_at = hiện tại
2. User có thể xem lại trong app (UC6.3)

3. System cập nhật last_suggestion_type:
   - Tăng lên 1 (0→1, 1→2, ..., 4→0)
   - Để lần sau dùng chiến lược khác
```

**Điều kiện tiên quyết:**
- Có users trong hệ thống
- Users đã đăng ký FCM token
- Firebase Admin SDK được cấu hình đúng

**Điều kiện sau:**
- Thông báo được gửi đến users
- Thông báo được lưu trong bảng notifications
- last_suggestion_type được cập nhật

---

### **UC18: CHẤM ĐIỂM PHÁT ÂM (WHISPER + GEMINI AI)**

**Actor**: System (Whisper Server, Gemini AI)

**Mô tả**: Hệ thống tự động chấm điểm phát âm của user

**Use Case con:**
- UC18.1: Chuyển đổi giọng nói thành văn bản (STT)
- UC18.2: Gọi Gemini AI chấm điểm
- UC18.3: Lưu kết quả vào DB

**Luồng chính:**
```
UC18.1: Chuyển đổi giọng nói thành văn bản
1. Backend nhận file WAV từ app (UC2.7 hoặc UC3.4)
2. Backend lưu file tạm vào folder uploads/
3. Backend gửi file đến Whisper Server:
   - POST http://localhost:5000/transcribe
   - FormData: { audio: file }
4. Whisper Server xử lý:
   - Lưu file tạm vào folder temp/
   - Load model Whisper (base hoặc small)
   - Gọi model.transcribe(file_path, language="en")
   - Trả về JSON: { "transcript": "..." }
   - Xóa file tạm
5. Backend nhận transcript
6. Backend xóa file audio gốc

UC18.2: Gọi Gemini AI chấm điểm
1. Backend chuẩn bị dữ liệu:
   - transcript: Văn bản AI nghe được
   - originalText: Nội dung bài đọc gốc
2. Backend tạo prompt:
   """
   Bạn là chuyên gia đánh giá phát âm tiếng Anh.
   
   Dưới đây là đoạn người dùng đã đọc:
   """{{transcript}}"""
   
   Đoạn này cần được so sánh với nội dung chuẩn:
   """{{originalText}}"""
   
   Hãy đánh giá theo các tiêu chí (thang điểm 10):
   - Phát âm (pronunciation)
   - Trọng âm và ngữ điệu (intonation)
   - Lưu loát (fluency)
   - Tốc độ (speed)
   - Tổng thể (overall)
   
   Chỉ trả về JSON đúng định dạng, không markdown:
   {
     "scores": {
       "pronunciation": 8.5,
       "intonation": 7.0,
       "fluency": 8.0,
       "speed": 7.5,
       "overall": 7.8
     },
     "comment": "Bạn phát âm khá tốt nhưng cần cải thiện ngữ điệu..."
   }
   """
3. Backend gọi Gemini API:
   - POST https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent
   - Body: { contents: [{ parts: [{ text: prompt }] }] }
4. Gemini AI phân tích và trả về JSON
5. Backend parse JSON để lấy scores và comment

UC18.3: Lưu kết quả vào DB
1. Backend lưu vào bảng records:
   - user_id, reading_id (hoặc NULL nếu custom)
   - original_content (nội dung gốc)
   - transcript (văn bản AI nghe được)
   - score_pronunciation, score_fluency, score_intonation, score_speed
   - score_overall (điểm tổng thể)
   - comment (nhận xét từ AI)
   - custom_text (nếu là bài tự nhập)
   - created_at (thời gian hiện tại)

2. Backend cập nhật bảng reading_progress:
   - Nếu điểm >= 5 → Đánh dấu is_completed = TRUE
   - Cập nhật best_score nếu điểm cao hơn lần trước
   - Tăng practice_count
   - Cập nhật last_practiced_at

3. Backend cập nhật streak (UC20)

4. Backend trả kết quả về app:
   {
     "success": true,
     "scores": { ... },
     "comment": "...",
     "transcript": "...",
     "recordId": 123
   }
```

**Điều kiện tiên quyết:**
- Whisper Server đang chạy (port 5000)
- Gemini API key hợp lệ
- File audio đúng định dạng (WAV, 16kHz, mono)

**Điều kiện sau:**
- Kết quả được lưu vào bảng records
- Tiến độ được cập nhật trong reading_progress
- Streak được cập nhật (nếu hôm nay chưa luyện)

---

### **UC19: TẠO GIỌNG ĐỌC MẪU (PIPER TTS)**

**Actor**: System (Piper Server)

**Mô tả**: Hệ thống tự động tạo giọng đọc mẫu từ văn bản

**Use Case con:**
- UC19.1: Nhận yêu cầu TTS
- UC19.2: Tạo audio WAV
- UC19.3: Chuyển đổi sang MP3
- UC19.4: Trả về app

**Luồng chính:**
```
UC19.1: Nhận yêu cầu TTS
1. Backend nhận request từ app (UC2.5):
   - POST /api/tts/synthesize
   - Body: { text: "..." }
2. Backend kiểm tra Piper Server có hoạt động không:
   - GET http://localhost:5001/health
   - Nếu không hoạt động → Trả lỗi

UC19.2: Tạo audio WAV
1. Backend gửi text đến Piper Server:
   - POST http://localhost:5001/synthesize
   - Body: { text: "..." }
2. Piper Server xử lý:
   - Load model en_US-lessac-medium.onnx
   - Gọi voice.synthesize(text) → Tạo audio chunks
   - Ghép các chunks thành audio data
   - Tạo WAV header với sample rate 19000Hz (giọng đọc chậm hơn)
   - Ghép header + audio data thành file WAV
   - Trả về file WAV
3. Backend nhận file WAV

UC19.3: Chuyển đổi sang MP3
1. Backend lưu WAV tạm vào folder uploads/
2. Backend dùng FFmpeg chuyển WAV sang MP3:
   - ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3
3. Backend xóa file WAV tạm
4. Backend đọc file MP3 thành buffer

UC19.4: Trả về app
1. Backend trả file MP3 về app:
   - Content-Type: audio/mpeg
   - Body: MP3 buffer
2. App nhận file MP3
3. App phát audio bằng React Native Sound
4. User nghe giọng đọc mẫu
```

**Điều kiện tiên quyết:**
- Piper Server đang chạy (port 5001)
- FFmpeg được cài đặt trên server
- Model en_US-lessac-medium.onnx đã được tải

**Điều kiện sau:**
- File MP3 được tạo và trả về app
- File tạm được xóa

---

### **UC20: CẬP NHẬT STREAK TỰ ĐỘNG**

**Actor**: System

**Mô tả**: Hệ thống tự động cập nhật streak khi user luyện đọc

**Use Case con:**
- UC20.1: Kiểm tra ngày luyện gần nhất
- UC20.2: Tính toán streak mới
- UC20.3: Cập nhật DB
- UC20.4: Reset số lần phục hồi (đầu tháng)

**Luồng chính:**
```
UC20.1: Kiểm tra ngày luyện gần nhất
1. User hoàn thành 1 bài đọc (UC2.7 hoặc UC3.4)
2. Backend gọi hàm updateStreakOnPractice(userId)
3. Backend lấy thông tin streak từ bảng user_streaks:
   - current_streak
   - longest_streak
   - last_practice_date
   - streak_freeze_count
4. Backend tính ngày hôm nay theo giờ Việt Nam (UTC+7):
   - const now = new Date()
   - const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
   - const today = vnTime.toISOString().split('T')[0] // YYYY-MM-DD

UC20.2: Tính toán streak mới
1. Backend so sánh last_practice_date với today:

TRƯỜNG HỢP 1: Hôm nay đã luyện rồi
- last_practice_date === today
- Không làm gì, return

TRƯỜNG HỢP 2: Hôm nay chưa luyện, ngày gần nhất là hôm qua
- last_practice_date === yesterday
- Tăng streak: current_streak += 1
- Cập nhật last_practice_date = today
- Cập nhật longest_streak nếu current_streak > longest_streak

TRƯỜNG HỢP 3: Hôm nay chưa luyện, ngày gần nhất là hôm kia trở về trước
- last_practice_date < yesterday
- Reset streak: current_streak = 1
- Cập nhật last_practice_date = today

TRƯỜNG HỢP 4: Chưa có streak (lần đầu luyện)
- last_practice_date === NULL
- Tạo streak mới: current_streak = 1
- Cập nhật last_practice_date = today

UC20.3: Cập nhật DB
1. Backend cập nhật bảng user_streaks:
   UPDATE user_streaks 
   SET 
     current_streak = ?,
     longest_streak = ?,
     last_practice_date = ?,
     updated_at = NOW()
   WHERE user_id = ?

2. Nếu chưa có record → Tạo mới:
   INSERT INTO user_streaks 
   (user_id, current_streak, longest_streak, last_practice_date)
   VALUES (?, 1, 1, ?)

UC20.4: Reset số lần phục hồi (đầu tháng)
1. Backend kiểm tra tháng hiện tại:
   - const currentMonth = new Date().getMonth() + 1 // 1-12
2. Backend so sánh với last_freeze_reset_month:
   - Nếu khác tháng → Reset:
     * streak_freeze_count = 3
     * last_freeze_reset_month = currentMonth
3. Backend cập nhật DB
```

**Điều kiện tiên quyết:**
- User đã hoàn thành ít nhất 1 bài đọc

**Điều kiện sau:**
- Streak được cập nhật trong bảng user_streaks
- Số lần phục hồi được reset vào đầu tháng

---

## BẢNG TỔNG HỢP USE CASE

| ID | Tên Use Case | Actor | Mô tả ngắn |
|----|-------------|-------|-----------|
| UC1 | Quản lý tài khoản | User | Đăng ký, đăng nhập, quên mật khẩu, chỉnh sửa thông tin |
| UC2 | Luyện đọc với bài có sẵn | User, System | Chọn chủ đề, chọn bài, nghe mẫu, ghi âm, chấm điểm |
| UC3 | Luyện đọc với nội dung tùy chỉnh | User, System | Nhập văn bản, quét OCR, tạo bằng AI, ghi âm, chấm điểm |
| UC4 | Xem lịch sử & tiến độ | User | Xem biểu đồ, danh sách bài đã luyện, chi tiết, luyện lại |
| UC5 | Quản lý streak | User, System | Xem streak, cập nhật khi luyện, xem chi tiết |
| UC6 | Nhận và xem thông báo | User, System | Đăng ký FCM, nhận push, xem danh sách, đánh dấu đã đọc |
| UC7 | Chat với AI Bot | User, System | Hỏi câu hỏi, nhận trả lời, xem lịch sử chat |
| UC8 | Gửi góp ý / báo lỗi | User | Viết góp ý, đính kèm ảnh, gửi, nhận email phản hồi |
| UC9 | Đăng nhập admin | Admin | Đăng nhập vào web admin |
| UC10 | Quản lý người dùng | Admin | Xem, thêm, sửa, xóa, vô hiệu hóa users |
| UC11 | Quản lý chủ đề | Admin | Xem, thêm, sửa, xóa topics |
| UC12 | Quản lý bài đọc | Admin | Xem, thêm, sửa, xóa, lọc readings |
| UC13 | Quản lý bản ghi luyện tập | Admin | Xem, chi tiết, xóa, lọc records |
| UC14 | Quản lý góp ý | Admin | Xem, trả lời, lọc feedbacks |
| UC15 | Xem thống kê dashboard | Admin | Xem thống kê tổng quan, biểu đồ, top users |
| UC16 | Email Marketing | Admin | Tạo campaign, gửi email hàng loạt, xem lịch sử |
| UC17 | Gửi thông báo gợi ý tự động | System | Chạy cron, chọn chiến lược, gửi push notification |
| UC18 | Chấm điểm phát âm | System | Whisper STT, Gemini AI chấm điểm, lưu kết quả |
| UC19 | Tạo giọng đọc mẫu | System | Piper TTS, chuyển WAV sang MP3, trả về app |
| UC20 | Cập nhật streak tự động | System | Kiểm tra ngày, tính streak, cập nhật DB, reset phục hồi |

---

## MỐI QUAN HỆ GIỮA CÁC USE CASE

### Include (Bao gồm)
- UC2 **include** UC18 (Luyện đọc bao gồm chấm điểm)
- UC2 **include** UC19 (Luyện đọc bao gồm nghe mẫu)
- UC2 **include** UC20 (Luyện đọc bao gồm cập nhật streak)
- UC3 **include** UC18 (Luyện custom bao gồm chấm điểm)
- UC3 **include** UC20 (Luyện custom bao gồm cập nhật streak)
- UC6 **include** UC17 (Nhận thông báo từ hệ thống gửi tự động)
- UC17 **include** UC18 (Gợi ý AI có thể dùng Gemini)

### Extend (Mở rộng)
- UC4.4 **extend** UC2 (Luyện lại bài cũ mở rộng từ xem lịch sử)
- UC4.4 **extend** UC3 (Luyện lại bài custom mở rộng từ xem lịch sử)
- UC6.4 **extend** UC2 (Xem thông báo có thể dẫn đến luyện đọc)
- UC6.4 **extend** UC3 (Xem thông báo có thể dẫn đến luyện custom)
- UC6.4 **extend** UC4.3 (Xem thông báo có thể dẫn đến xem chi tiết record)

### Generalization (Tổng quát hóa)
- UC3.1, UC3.2, UC3.3 là các dạng cụ thể của UC3
- UC10.2, UC10.3, UC10.4, UC10.5 là các dạng cụ thể của UC10
- UC11.2, UC11.3, UC11.4 là các dạng cụ thể của UC11
- UC12.2, UC12.3, UC12.4 là các dạng cụ thể của UC12

---

## LƯU Ý KHI VẼ BIỂU ĐỒ

### Công cụ đề xuất:
1. **Draw.io / Diagrams.net** (miễn phí, online)
2. **Lucidchart** (có phiên bản miễn phí)
3. **PlantUML** (vẽ bằng code)
4. **Visual Paradigm** (chuyên nghiệp)
5. **Microsoft Visio** (nếu có license)

### Ký hiệu UML Use Case:
- **Actor**: Hình người que (stick figure)
- **Use Case**: Hình oval (ellipse)
- **System Boundary**: Hình chữ nhật bao quanh các use case
- **Association**: Đường thẳng nối actor với use case
- **Include**: Đường nét đứt với mũi tên, ghi «include»
- **Extend**: Đường nét đứt với mũi tên, ghi «extend»
- **Generalization**: Đường thẳng với mũi tên tam giác rỗng

### Gợi ý bố cục:
1. Đặt actors ở 2 bên (User bên trái, Admin bên phải, System ở dưới)
2. Đặt use cases ở giữa trong system boundary
3. Nhóm các use case liên quan gần nhau
4. Sử dụng màu sắc để phân biệt nhóm chức năng
5. Vẽ biểu đồ tổng quát trước, sau đó vẽ chi tiết từng nhóm

---

## KẾT LUẬN

File này mô tả chi tiết 20 use case chính của hệ thống EnTalk, bao gồm:
- **8 use case cho User** (UC1-UC8)
- **8 use case cho Admin** (UC9-UC16)
- **4 use case cho System** (UC17-UC20)

Mỗi use case được mô tả với:
- Actor tham gia
- Mô tả chức năng
- Use case con (nếu có)
- Luồng chính chi tiết
- Điều kiện tiên quyết
- Điều kiện sau

Bạn có thể sử dụng file này để:
1. Vẽ biểu đồ Use Case tổng quát
2. Vẽ biểu đồ Use Case chi tiết cho từng nhóm
3. Làm tài liệu phân tích yêu cầu
4. Làm cơ sở cho thiết kế hệ thống

---

**Ngày tạo**: 25/11/2025  
**Phiên bản**: 1.0  
**Tác giả**: Kiro AI Assistant
