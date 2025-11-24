# TÀI LIỆU HỆ THỐNG ENTALK - ỨNG DỤNG LUYỆN ĐỌC TIẾNG ANH

## TỔNG QUAN HỆ THỐNG

**EnTalk** là hệ thống luyện đọc tiếng Anh với AI, bao gồm:
- **Frontend App (React Native)**: Ứng dụng mobile cho người dùng
- **Backend (Node.js + Express)**: API server xử lý logic nghiệp vụ
- **Admin Web (React)**: Trang quản trị cho admin
- **Whisper Server (Python/Flask)**: Server chuyển đổi giọng nói thành văn bản (STT)
- **Piper Server (Python/Flask)**: Server chuyển văn bản thành giọng nói (TTS)
- **Database (MySQL)**: Lưu trữ dữ liệu
- **Gemini AI**: Chấm điểm, tạo nội dung, chatbot

---

## KIẾN TRÚC HỆ THỐNG

```
┌─────────────────┐
│  Frontend App   │ (React Native - iOS/Android)
│  (Người dùng)   │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐      ┌──────────────┐
│  Backend API    │◄────►│  MySQL DB    │
│  (Node.js)      │      └──────────────┘
└────────┬────────┘
         │
         ├──────► Whisper Server (STT - Speech to Text)
         ├──────► Piper Server (TTS - Text to Speech)
         ├──────► Gemini AI (Chấm điểm, Chatbot, Tạo nội dung)
         ├──────► Firebase (Push Notification)
         └──────► Cloudinary (Upload ảnh)

┌─────────────────┐
│   Admin Web     │ (React - Quản trị)
└────────┬────────┘
         │ HTTP/REST API
         ▼
    Backend API
```

---


## LUỒNG HOẠT ĐỘNG CHÍNH

### 1. LUỒNG ĐĂNG KÝ & ĐĂNG NHẬP

#### Đăng ký tài khoản:
1. **User nhập thông tin** (tên, email, mật khẩu) trên app
2. **Backend nhận request** → Kiểm tra email đã tồn tại chưa
3. **Backend tạo mã xác nhận** (6 số ngẫu nhiên) → Lưu vào bảng `email_verifications` (hết hạn sau 10 phút)
4. **Backend gửi email** chứa mã xác nhận qua Nodemailer
5. **User nhập mã xác nhận** trên app
6. **Backend xác minh mã** → Nếu đúng:
   - Tạo tài khoản mới trong bảng `users` (mật khẩu đã hash bằng bcrypt)
   - Đặt `is_verified = TRUE`
   - Xóa mã xác nhận khỏi DB
7. **Thông báo thành công** → User có thể đăng nhập

#### Đăng nhập:
1. **User nhập email + password**
2. **Backend kiểm tra**:
   - Email có tồn tại không?
   - Tài khoản đã xác minh chưa? (`is_verified = TRUE`)
   - Mật khẩu có khớp không? (so sánh hash)
3. **Backend tạo JWT token** (chứa user_id, email)
4. **Trả về token + thông tin user** (id, name, level)
5. **App lưu token** vào AsyncStorage → Dùng cho các request sau

#### Quên mật khẩu:
1. **User nhập email**
2. **Backend tạo mật khẩu mới** (6 số ngẫu nhiên)
3. **Backend hash và cập nhật** vào DB
4. **Gửi email** chứa mật khẩu mới
5. **User đăng nhập** bằng mật khẩu mới → Có thể đổi lại sau

---

### 2. LUỒNG LUYỆN ĐỌC VỚI BÀI CÓ SẴN (CHẤM ĐIỂM ĐỌC - WHISPER + GEMINI)

#### Bước 1: Chọn bài đọc
1. **User vào màn hình Home** → Chọn "Bài đọc theo chủ đề"
2. **App gọi API** `GET /api/topics` → Hiển thị danh sách chủ đề (Du lịch, Khoa học, Tin tức...)
3. **User chọn 1 chủ đề** → App gọi `GET /api/reading/topic/:id`
4. **Backend trả về danh sách bài đọc** thuộc chủ đề đó (kèm thông tin điểm cao nhất, trạng thái hoàn thành)
5. **User chọn 1 bài đọc** → Chuyển sang màn hình `ReadingPracticeScreen`

#### Bước 2: Nghe bài mẫu (TTS - Text to Speech)
1. **User nhấn nút "Nghe bài mẫu"** trên màn hình luyện đọc
2. **App gọi API** `POST /api/tts/synthesize` với `{ text: reading.content }`
3. **Backend nhận request** → Gửi text đến **Piper Server** (Python)
4. **Piper Server**:
   - Sử dụng model `en_US-lessac-medium.onnx`
   - Chuyển text thành audio WAV (sample rate 19000Hz để giọng đọc chậm hơn)
   - Trả về file WAV
5. **Backend nhận WAV** → Dùng FFmpeg chuyển sang MP3 (giảm dung lượng)
6. **Backend trả MP3** về app
7. **App phát audio** bằng React Native Sound

#### Bước 3: Ghi âm giọng đọc
1. **User nhấn nút "Bắt đầu ghi âm"**
2. **App bắt đầu ghi âm** bằng `react-native-audio-record` (định dạng WAV, 16kHz, mono)
3. **User đọc theo nội dung bài**
4. **User nhấn "Dừng ghi âm"** → File WAV được lưu tạm trong thiết bị

#### Bước 4: Gửi file và chấm điểm
1. **App gửi file WAV** lên backend qua API `POST /api/reading/record`
   - FormData: `audio` (file WAV), `readingId` (ID bài đọc)
2. **Backend nhận file** → Lưu tạm vào folder `uploads/`
3. **Backend gửi file đến Whisper Server** (Python/Flask) qua `POST http://localhost:5000/transcribe`
4. **Whisper Server**:
   - Load model Whisper (`base` hoặc `small`)
   - Chuyển đổi audio thành văn bản (transcript)
   - Trả về: `{ "transcript": "..." }`
5. **Backend nhận transcript** → Xóa file audio tạm
6. **Backend gọi Gemini AI** để chấm điểm:
   - Gửi prompt chứa:
     - `transcript` (văn bản AI nghe được)
     - `originalText` (nội dung bài đọc gốc)
   - Yêu cầu Gemini đánh giá theo 5 tiêu chí (thang điểm 10):
     - Phát âm (pronunciation)
     - Ngữ điệu (intonation)
     - Lưu loát (fluency)
     - Tốc độ (speed)
     - Tổng thể (overall)
   - Gemini trả về JSON:
     ```json
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
     ```
7. **Backend lưu kết quả** vào bảng `records`:
   - `user_id`, `reading_id`, `original_content` (nội dung gốc)
   - `transcript`, `score_*`, `comment`
8. **Backend cập nhật tiến độ** (`reading_progress`):
   - Nếu điểm >= 5 → Đánh dấu `is_completed = TRUE`
   - Cập nhật `best_score` nếu điểm cao hơn lần trước
   - Tăng `practice_count`
9. **Backend cập nhật streak** (chuỗi luyện tập):
   - Kiểm tra ngày luyện gần nhất
   - Nếu hôm nay chưa luyện → Tăng `current_streak`
   - Nếu bỏ lỡ 1 ngày → Reset streak về 1
10. **Backend trả kết quả** về app
11. **App hiển thị modal kết quả**:
    - Điểm tổng thể (lớn, nổi bật)
    - Điểm chi tiết từng tiêu chí
    - Nhận xét từ AI

---


### 3. LUỒNG LUYỆN ĐỌC VỚI NỘI DUNG TỰ NHẬP

#### Cách 1: Nhập văn bản thủ công
1. **User vào Home** → Chọn "Nội dung tùy chỉnh" → "Nhập văn bản"
2. **User nhập đoạn văn** muốn luyện đọc
3. **User nhấn "Bắt đầu luyện"** → Chuyển sang màn hình `PracticeCustomReadingScreen`
4. **User ghi âm giọng đọc** (tương tự luồng bài có sẵn)
5. **App gửi file WAV + customText** lên backend `POST /api/reading/record`
6. **Backend xử lý**:
   - Gửi audio đến Whisper → Nhận transcript
   - Tạo bài đọc mới trong bảng `readings` (đánh dấu `is_community_post = TRUE`, `created_by = user_id`)
   - Gọi Gemini chấm điểm (so sánh transcript với customText)
   - Lưu kết quả vào `records` (có cột `custom_text`)
7. **Trả kết quả** về app → Hiển thị điểm

#### Cách 2: Quét văn bản từ ảnh (OCR)
1. **User chọn "Quét văn bản từ ảnh"**
2. **User chụp ảnh hoặc chọn từ thư viện**
3. **App dùng ML Kit Text Recognition** (offline) để nhận diện chữ
4. **App hiển thị văn bản** đã quét → User có thể chỉnh sửa
5. **User nhấn "Luyện đọc"** → Chuyển sang màn hình luyện (tương tự cách 1)

#### Cách 3: Tạo bài đọc bằng AI (Gemini)
1. **User chọn "Tạo bài đọc bằng AI"**
2. **User nhập chủ đề** (ví dụ: "Du lịch Đà Nẵng") và mô tả (tuỳ chọn)
3. **App gọi API** `POST /api/ai-reading/generate` với `{ topic, description }`
4. **Backend gọi Gemini AI**:
   - Gửi prompt yêu cầu tạo bài đọc ngắn (2-4 câu, trình độ A1-A2)
   - Lấy lịch sử 5 bài gần nhất của user để tránh trùng lặp
   - Gemini trả về nội dung bài đọc mới
5. **Backend trả nội dung** về app
6. **App hiển thị bài đọc** → User có thể chỉnh sửa hoặc tạo lại
7. **User nhấn "Luyện đọc"** → Chuyển sang màn hình luyện

---

### 4. LUỒNG XEM LỊCH SỬ & TIẾN ĐỘ

#### Xem biểu đồ tiến độ:
1. **User vào tab "Lịch sử"** (`HistoryScreen`)
2. **App gọi API** `GET /api/history/chart?range=7` (hoặc 30 ngày)
3. **Backend tính điểm trung bình** theo từng ngày trong khoảng thời gian
4. **Trả về dữ liệu**:
   ```json
   [
     { "date": "2025-11-18", "avg_score": 7.5 },
     { "date": "2025-11-19", "avg_score": 8.2 }
   ]
   ```
5. **App vẽ biểu đồ đường** (LineChart) hiển thị tiến độ
6. **User nhấn vào điểm trên biểu đồ** → Xem chi tiết các bài đọc trong ngày đó

#### Xem danh sách bài đã luyện:
1. **App gọi API** `GET /api/history/recent?topicId=&limit=5&page=1`
2. **Backend trả về danh sách records** (có phân trang):
   - Nội dung bài đọc (rút gọn)
   - Điểm tổng thể
   - Thời gian luyện
   - Chủ đề
3. **User cuộn xuống** → App tự động load thêm (pagination)
4. **User lọc theo chủ đề** → App gọi lại API với `topicId`

#### Xem chi tiết 1 bài đã luyện:
1. **User nhấn vào 1 record** → Chuyển sang `RecordDetailScreen`
2. **App gọi API** `GET /api/history/record/:id`
3. **Backend trả về**:
   - Nội dung gốc (`original_content` hoặc `reading.content`)
   - Transcript (văn bản AI nghe được)
   - Điểm chi tiết từng tiêu chí
   - Nhận xét từ AI
   - Thời gian luyện
4. **App hiển thị đầy đủ thông tin**
5. **User có thể "Luyện lại"**:
   - Nếu bài đọc gốc còn tồn tại → Chuyển sang màn hình luyện với `readingId`
   - Nếu bài đã bị xóa → Dùng `original_content` để luyện lại

---

### 5. LUỒNG STREAK (CHUỖI LUYỆN TẬP HÀNG NGÀY)

#### Cập nhật streak khi luyện đọc:
1. **Sau khi user hoàn thành 1 bài đọc** (có điểm)
2. **Backend gọi hàm** `updateStreakOnPractice(userId)`
3. **Backend kiểm tra**:
   - Lấy thông tin streak hiện tại từ bảng `user_streaks`
   - Lấy ngày luyện gần nhất (`last_practice_date`)
   - Tính ngày hôm nay theo giờ Việt Nam (UTC+7)
4. **Logic cập nhật**:
   - **Nếu hôm nay đã luyện rồi** → Không làm gì
   - **Nếu hôm nay chưa luyện**:
     - Kiểm tra ngày gần nhất:
       - **Hôm qua** → Tăng `current_streak += 1`
       - **Hôm kia trở về trước** → Reset `current_streak = 1`
     - Cập nhật `last_practice_date = hôm nay`
     - Cập nhật `longest_streak` nếu `current_streak` lớn hơn
5. **Reset số lần phục hồi** (`streak_freeze_count`):
   - Mỗi đầu tháng → Reset về 3 lần

#### Hiển thị streak trên app:
1. **App gọi API** `GET /api/streak`
2. **Backend trả về**:
   ```json
   {
     "current_streak": 15,
     "longest_streak": 30,
     "last_practice_date": "2025-11-24",
     "practiced_today": true,
     "streak_freeze_count": 2
   }
   ```
3. **App hiển thị**:
   - Icon lửa + số ngày streak (trên HomeScreen)
   - Màu sắc thay đổi theo cấp độ:
     - 1-10 ngày: Beginner Flame (đỏ)
     - 10-50 ngày: Intermediate Master (vàng)
     - 50-100 ngày: Advanced Speaker (xanh lá)
     - 100-200 ngày: Proficient Legend (xanh dương)
     - 200+ ngày: Native Immortal (tím)
4. **User nhấn vào icon streak** → Hiển thị modal chi tiết:
   - Streak hiện tại
   - Streak dài nhất
   - Số lần phục hồi còn lại
   - Trạng thái hôm nay (đã luyện chưa)

---


### 6. LUỒNG THÔNG BÁO & GỢI Ý LUYỆN TẬP (PUSH NOTIFICATION)

#### Đăng ký nhận thông báo:
1. **User cài đặt app lần đầu** → App yêu cầu quyền nhận thông báo
2. **Firebase Messaging tạo FCM token** (unique cho mỗi thiết bị)
3. **App gửi token** lên backend `POST /api/notification/save-token`
4. **Backend lưu token** vào cột `fcm_token` trong bảng `users`

#### Hệ thống gợi ý tự động (Cron Job):
1. **Backend chạy cron job** vào 8h sáng, 14h và 20h tối mỗi ngày
2. **Cron gọi hàm** `recommendOnce()` trong `dailyRecommender.js`
3. **Với mỗi user có FCM token**:
   - Lấy `last_suggestion_type` (0-4) để xoay vòng tiêu chí
   - Thử 5 chiến lược gợi ý theo thứ tự:

#### Chiến lược 1: Gợi ý bài tự nhập điểm thấp chưa cải thiện
- Tìm bài `custom_text` có điểm < 7 và chưa cải thiện lên >= 8
- Gửi thông báo: "📉 Luyện lại bài tự nhập - Bài: '...' có điểm X, hãy thử cải thiện nhé!"
- Data: `{ customText, suggestionReason }`

#### Chiến lược 2: Gợi ý bài hệ thống từng luyện có điểm thấp
- Tìm bài đọc có sẵn (không phải custom) có điểm < 7.5
- Gửi thông báo: "📉 Luyện lại bài hệ thống - Bài: '...' điểm X, thử lại nhé!"
- Data: `{ readingId, recordId, suggestionReason }`

#### Chiến lược 3: Bài hệ thống chưa từng luyện
- Tìm bài đọc có sẵn mà user chưa luyện lần nào
- Chọn ngẫu nhiên 1 bài
- Gửi thông báo: "🆕 Bài mới cho bạn - Thử đọc bài: '...' nhé!"
- Data: `{ readingId, suggestionReason }`

#### Chiến lược 4: Chủ đề ít luyện
- Tìm chủ đề mà user luyện ít nhất
- Chọn 1 bài chưa đọc hoặc ít đọc trong chủ đề đó
- Gửi thông báo: "📚 Chủ đề: [Tên] - Thử bài này: '...'"
- Data: `{ readingId, suggestionReason }`

#### Chiến lược 5: AI đề xuất sinh đoạn văn mới
- Lấy 3 bài gần nhất của user (transcript + điểm)
- Gọi Gemini AI phân tích:
  - Điểm yếu của user (phát âm, ngữ điệu, từ vựng...)
  - Tạo đoạn văn mới phù hợp để luyện tập
- Gửi thông báo: "🎯 Gợi ý từ AI - AI gợi ý bài mới: '...'"
- Data: `{ customText, suggestionReason }`

4. **Gửi thông báo**:
   - Backend gọi Firebase Admin SDK
   - Gửi push notification đến FCM token
   - Lưu thông báo vào bảng `notifications` (để xem lại trong app)
5. **Cập nhật** `last_suggestion_type` để lần sau dùng tiêu chí khác

#### Xem thông báo trong app:
1. **User vào tab "Thông báo"** (`NotificationScreen`)
2. **App gọi API** `GET /api/notification/list`
3. **Backend trả về danh sách thông báo** (sắp xếp mới nhất trước)
4. **App hiển thị**:
   - Tiêu đề + nội dung
   - Thời gian
   - Trạng thái đã đọc/chưa đọc
5. **User nhấn vào thông báo**:
   - Đánh dấu đã đọc (`POST /api/notification/mark-read`)
   - Điều hướng đến màn hình tương ứng:
     - Nếu có `readingId` → Màn hình luyện đọc bài có sẵn
     - Nếu có `customText` → Màn hình luyện đọc custom
     - Nếu có `recordId` → Màn hình chi tiết bài đã luyện

---

### 7. LUỒNG CHATBOT HỎI ĐÁP TIẾNG ANH

#### Hỏi câu hỏi:
1. **User vào màn hình Chatbot** (`ChatbotScreen`)
2. **Lần đầu vào** → Backend tự động gửi lời chào:
   - "👋 Xin chào! Tôi là EnTalk Chatbot. Bạn có thể hỏi tôi bất cứ điều gì liên quan đến việc học tiếng Anh..."
3. **User nhập câu hỏi** → Nhấn gửi
4. **App gọi API** `POST /api/chat/ask` với `{ message: "..." }`
5. **Backend lưu câu hỏi** vào bảng `chat_messages` (role = 'user')
6. **Backend gọi Gemini AI**:
   - Gửi prompt kiểm tra câu hỏi có liên quan đến tiếng Anh không
   - Nếu KHÔNG liên quan → Trả lời: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến học tiếng Anh."
   - Nếu CÓ liên quan → Trả lời ngắn gọn (dưới 12 dòng), dễ hiểu, có ví dụ
7. **Backend lưu câu trả lời** vào `chat_messages` (role = 'assistant')
8. **Backend trả về** câu trả lời
9. **App hiển thị** trong giao diện chat (tin nhắn user bên phải, bot bên trái)

#### Xem lịch sử chat:
1. **App gọi API** `GET /api/chat/history`
2. **Backend trả về toàn bộ lịch sử** chat của user (sắp xếp theo thời gian)
3. **App hiển thị** lịch sử khi vào màn hình Chatbot

---

### 8. LUỒNG GÓP Ý / BÁO LỖI

#### Gửi góp ý:
1. **User vào màn hình "Góp ý"** (`FeedbackScreen`)
2. **User nhập nội dung** góp ý/báo lỗi
3. **User có thể đính kèm ảnh** (screenshot):
   - Chọn ảnh từ thư viện
   - App tự động nén ảnh (800x800, JPEG 70%) bằng ImageResizer
4. **User nhấn "Gửi góp ý"**
5. **App gửi FormData** lên backend `POST /api/feedback/send`:
   - `content`: Nội dung góp ý
   - `screenshot`: File ảnh (nếu có)
6. **Backend xử lý**:
   - Upload ảnh lên Cloudinary (nếu có)
   - Lưu vào bảng `feedbacks`:
     - `user_id`, `user_email`, `content`, `screenshot_url`
     - `status = 'pending'` (chờ admin trả lời)
7. **Backend trả về thành công**
8. **App hiển thị thông báo** "🎉 Gửi góp ý thành công!"

#### Admin xem và trả lời góp ý:
1. **Admin đăng nhập web** → Vào trang "Feedbacks"
2. **Web gọi API** `GET /api/admin/feedbacks`
3. **Backend trả về danh sách** feedbacks (có phân trang)
4. **Admin xem chi tiết** 1 feedback:
   - Nội dung góp ý
   - Ảnh đính kèm (nếu có)
   - Thông tin user (email, tên)
   - Thời gian gửi
5. **Admin nhập câu trả lời** → Nhấn "Gửi"
6. **Web gọi API** `POST /api/admin/feedbacks/:id/reply` với `{ reply: "..." }`
7. **Backend cập nhật**:
   - `admin_reply`, `replied_at`, `status = 'replied'`
8. **Backend gửi email** trả lời đến user (qua Nodemailer)

---


### 9. LUỒNG QUẢN LÝ TÀI KHOẢN

#### Xem thông tin cá nhân:
1. **User vào tab "Tài khoản"** (`AccountScreen`)
2. **App gọi API** `GET /api/auth/profile`
3. **Backend trả về**:
   - `id`, `name`, `email`, `avatar_url`, `level`, `created_at`
4. **App hiển thị** thông tin

#### Chỉnh sửa thông tin:
1. **User nhấn "Chỉnh sửa"** → Chuyển sang `EditProfileScreen`
2. **User thay đổi tên** hoặc **upload ảnh đại diện mới**:
   - Chọn ảnh từ thư viện
   - App upload lên backend `POST /api/auth/upload-avatar`
   - Backend upload lên Cloudinary → Trả về URL
3. **User nhấn "Lưu"**
4. **App gọi API** `PUT /api/auth/profile` với `{ name, avatar_url }`
5. **Backend cập nhật** bảng `users`
6. **Thông báo thành công**

#### Đổi mật khẩu:
1. **User vào "Đổi mật khẩu"** (`ChangePasswordScreen`)
2. **User nhập**:
   - Mật khẩu cũ
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
3. **App gọi API** `POST /api/auth/change-password`
4. **Backend kiểm tra**:
   - Mật khẩu cũ có đúng không?
   - Mật khẩu mới có khớp với xác nhận không?
5. **Backend hash mật khẩu mới** → Cập nhật DB
6. **Thông báo thành công**

---

## CHỨC NĂNG WEB ADMIN

### 1. ĐĂNG NHẬP ADMIN

1. **Admin truy cập web** (React app)
2. **Nhập username + password** (mặc định: admin / password)
3. **Web gọi API** `POST /api/admin/login`
4. **Backend kiểm tra**:
   - Username có tồn tại trong bảng `admins` không?
   - Password có khớp không? (so sánh hash)
5. **Backend tạo JWT token** (dùng `JWT_ADMIN_SECRET`)
6. **Trả về token + thông tin admin**
7. **Web lưu token** vào localStorage → Dùng cho các request sau

---

### 2. DASHBOARD (TRANG TỔNG QUAN)

1. **Admin vào trang Dashboard**
2. **Web gọi API** `GET /api/admin/dashboard`
3. **Backend tính toán**:
   - Tổng số người dùng (`COUNT(*) FROM users`)
   - Tổng số bài đọc (`COUNT(*) FROM readings`)
   - Tổng số bản ghi luyện tập (`COUNT(*) FROM records`)
   - Tổng số admin (`COUNT(*) FROM admins`)
   - Điểm trung bình toàn hệ thống (`AVG(score_overall) FROM records`)
4. **Backend trả về JSON**:
   ```json
   {
     "totalUsers": 150,
     "totalReadings": 45,
     "totalRecords": 1200,
     "totalAdmins": 2,
     "avgScore": 7.8
   }
   ```
5. **Web hiển thị** các thẻ thống kê (cards)

---

### 3. QUẢN LÝ NGƯỜI DÙNG

#### Xem danh sách người dùng:
1. **Admin vào trang "Users"**
2. **Web gọi API** `GET /api/admin/users`
3. **Backend trả về danh sách** users (sắp xếp mới nhất trước):
   - `id`, `name`, `email`, `level`, `avatar_url`, `created_at`, `is_verified`
4. **Web hiển thị bảng** với các cột:
   - ID, Tên, Email, Trình độ, Ảnh đại diện, Ngày tạo, Trạng thái xác minh

#### Chỉnh sửa người dùng:
1. **Admin nhấn "Sửa"** trên 1 user
2. **Web hiển thị form** chỉnh sửa (tên, email, level)
3. **Admin thay đổi thông tin** → Nhấn "Lưu"
4. **Web gọi API** `PUT /api/admin/users/:id`
5. **Backend cập nhật** bảng `users`

#### Xóa người dùng:
1. **Admin nhấn "Xóa"** → Hiển thị xác nhận
2. **Admin xác nhận**
3. **Web gọi API** `DELETE /api/admin/users/:id`
4. **Backend xóa user** (cascade: xóa luôn records, chat_messages, feedbacks...)

---

### 4. QUẢN LÝ CHỦ ĐỀ (TOPICS)

#### Xem danh sách chủ đề:
1. **Admin vào trang "Topics"**
2. **Web gọi API** `GET /api/admin/topics`
3. **Backend trả về danh sách** topics:
   - `id`, `name`, `description`, `image_url`
4. **Web hiển thị bảng** với các cột:
   - ID, Tên, Mô tả, Hình ảnh

#### Thêm chủ đề mới:
1. **Admin nhấn "Thêm chủ đề"**
2. **Web hiển thị form**:
   - Tên chủ đề (bắt buộc, unique)
   - Mô tả
   - Upload hình ảnh
3. **Admin nhập thông tin** → Nhấn "Tạo"
4. **Web gửi FormData** lên `POST /api/admin/topics`:
   - `name`, `description`, `image` (file)
5. **Backend xử lý**:
   - Upload ảnh lên Cloudinary (nếu có)
   - Lưu vào bảng `topics`
6. **Thông báo thành công**

#### Sửa chủ đề:
1. **Admin nhấn "Sửa"** trên 1 topic
2. **Web hiển thị form** với dữ liệu hiện tại
3. **Admin thay đổi** → Nhấn "Lưu"
4. **Web gọi API** `PUT /api/admin/topics/:id`
5. **Backend cập nhật** (nếu có ảnh mới → upload lên Cloudinary)

#### Xóa chủ đề:
1. **Admin nhấn "Xóa"** → Hiển thị cảnh báo
2. **Admin xác nhận**
3. **Web gọi API** `DELETE /api/admin/topics/:id`
4. **Backend xử lý**:
   - Đặt `reading_id = NULL` cho tất cả records liên quan (giữ lại lịch sử)
   - Xóa tất cả readings thuộc topic này
   - Xóa topic
5. **Thông báo thành công**

---

### 5. QUẢN LÝ BÀI ĐỌC (READINGS)

#### Xem danh sách bài đọc:
1. **Admin vào trang "Readings"**
2. **Web gọi API** `GET /api/admin/readings`
3. **Backend trả về danh sách** readings (kèm tên chủ đề):
   - `id`, `content`, `level`, `topic_name`, `created_at`
4. **Web hiển thị bảng** với các cột:
   - ID, Nội dung (rút gọn), Trình độ, Chủ đề, Ngày tạo

#### Thêm bài đọc mới:
1. **Admin nhấn "Thêm bài đọc"**
2. **Web hiển thị form**:
   - Nội dung (textarea, bắt buộc)
   - Trình độ (dropdown: A1, A2, B1, B2, C1, C2)
   - Chủ đề (dropdown: danh sách topics)
3. **Admin nhập thông tin** → Nhấn "Tạo"
4. **Web gọi API** `POST /api/admin/readings`
5. **Backend lưu** vào bảng `readings` (với `created_by = NULL`, `is_community_post = FALSE`)

#### Sửa bài đọc:
1. **Admin nhấn "Sửa"** trên 1 reading
2. **Web hiển thị form** với dữ liệu hiện tại
3. **Admin thay đổi** → Nhấn "Lưu"
4. **Web gọi API** `PUT /api/admin/readings/:id`
5. **Backend cập nhật** bảng `readings`
6. **Lưu ý**: Nếu bài đọc đã được user luyện, việc sửa sẽ làm thay đổi nội dung gốc
   - Các record cũ vẫn giữ `original_content` để so sánh

#### Xóa bài đọc:
1. **Admin nhấn "Xóa"** → Hiển thị cảnh báo
2. **Admin xác nhận**
3. **Web gọi API** `DELETE /api/admin/readings/:id`
4. **Backend xử lý**:
   - Đặt `reading_id = NULL` cho tất cả records liên quan (giữ lại lịch sử)
   - Xóa reading
5. **Thông báo thành công**

---

### 6. QUẢN LÝ BẢN GHI LUYỆN TẬP (RECORDS)

#### Xem danh sách records:
1. **Admin vào trang "Records"**
2. **Web gọi API** `GET /api/admin/records`
3. **Backend trả về danh sách** records (kèm tên user):
   - `id`, `user_name`, `reading_content` (hoặc `original_content`), `score_overall`, `created_at`
4. **Web hiển thị bảng** với các cột:
   - ID, Người dùng, Nội dung bài đọc, Điểm, Thời gian

#### Xem chi tiết 1 record:
1. **Admin nhấn vào 1 record**
2. **Web hiển thị chi tiết**:
   - Nội dung gốc
   - Transcript (văn bản AI nghe được)
   - Điểm chi tiết từng tiêu chí
   - Nhận xét từ AI
   - Thông tin user

#### Xóa record:
1. **Admin nhấn "Xóa"** → Xác nhận
2. **Web gọi API** `DELETE /api/admin/records/:id`
3. **Backend xóa** record khỏi DB

---

### 7. QUẢN LÝ GÓP Ý (FEEDBACKS)

#### Xem danh sách góp ý:
1. **Admin vào trang "Feedbacks"**
2. **Web gọi API** `GET /api/admin/feedbacks`
3. **Backend trả về danh sách** feedbacks:
   - `id`, `user_email`, `content`, `screenshot_url`, `status`, `created_at`
4. **Web hiển thị bảng** với các cột:
   - ID, Email user, Nội dung (rút gọn), Ảnh, Trạng thái (pending/replied), Thời gian

#### Trả lời góp ý:
1. **Admin nhấn "Trả lời"** trên 1 feedback
2. **Web hiển thị form** với:
   - Nội dung góp ý gốc
   - Ảnh đính kèm (nếu có)
   - Textarea để nhập câu trả lời
3. **Admin nhập câu trả lời** → Nhấn "Gửi"
4. **Web gọi API** `POST /api/admin/feedbacks/:id/reply` với `{ reply: "..." }`
5. **Backend xử lý**:
   - Cập nhật `admin_reply`, `replied_at`, `status = 'replied'`
   - Gửi email trả lời đến user (qua Nodemailer)
6. **Thông báo thành công**

---


## CÁC THÀNH PHẦN KỸ THUẬT CHI TIẾT

### 1. WHISPER SERVER (STT - SPEECH TO TEXT)

**Công nghệ**: Python + Flask + OpenAI Whisper

**Chức năng**: Chuyển đổi file audio (WAV) thành văn bản tiếng Anh

**Luồng hoạt động**:
1. Backend gửi file WAV đến `POST http://localhost:5000/transcribe`
2. Whisper Server:
   - Nhận file qua FormData
   - Lưu tạm vào folder `temp/`
   - Load model Whisper (`base` hoặc `small`)
   - Gọi `model.transcribe(file_path, language="en")`
   - Trả về JSON: `{ "transcript": "..." }`
   - Xóa file tạm
3. Backend nhận transcript → Xóa file audio gốc

**Model**: 
- `base`: Nhanh, độ chính xác trung bình (~74MB)
- `small`: Chậm hơn, độ chính xác cao hơn (~244MB)

**Lưu ý**:
- Server chạy trên port 5000
- Chỉ hỗ trợ tiếng Anh (`language="en"`)
- File audio tạm được xóa sau khi xử lý

---

### 2. PIPER SERVER (TTS - TEXT TO SPEECH)

**Công nghệ**: Python + Flask + Piper TTS

**Chức năng**: Chuyển đổi văn bản tiếng Anh thành giọng nói (audio WAV)

**Luồng hoạt động**:
1. Backend gửi text đến `POST http://localhost:5001/synthesize`
2. Piper Server:
   - Nhận JSON: `{ "text": "..." }`
   - Load model `en_US-lessac-medium.onnx`
   - Gọi `voice.synthesize(text)` → Tạo audio chunks
   - Ghép các chunks thành file WAV
   - Tạo WAV header với sample rate 19000Hz (giọng đọc chậm hơn)
   - Trả về file WAV
3. Backend nhận WAV → Dùng FFmpeg chuyển sang MP3 → Trả về app

**Model**: `en_US-lessac-medium.onnx` (giọng nam, chất lượng trung bình)

**Lưu ý**:
- Server chạy trên port 5001
- Sample rate 19000Hz (thay vì 22050Hz) để giọng đọc chậm hơn, dễ nghe
- Backend tự động chuyển WAV sang MP3 để giảm dung lượng

---

### 3. GEMINI AI (GOOGLE GENERATIVE AI)

**Công nghệ**: Google Gemini API (model: `gemini-2.0-flash`)

**Chức năng**:
1. **Chấm điểm phát âm**: So sánh transcript với nội dung gốc, đánh giá 5 tiêu chí
2. **Chatbot**: Trả lời câu hỏi về tiếng Anh
3. **Tạo bài đọc**: Sinh nội dung bài đọc mới theo chủ đề
4. **Gợi ý thông minh**: Phân tích lịch sử user, đề xuất bài luyện phù hợp

#### Chấm điểm phát âm:
**Input**:
- `transcript`: Văn bản AI nghe được từ giọng nói
- `originalText`: Nội dung bài đọc gốc

**Prompt**:
```
Bạn là chuyên gia đánh giá phát âm tiếng Anh.

Dưới đây là đoạn người dùng đã đọc (chuyển từ giọng nói thành văn bản):
"""{{transcript}}"""

Đoạn này cần được so sánh với nội dung chuẩn sau:
"""{{originalText}}"""

Hãy đánh giá phần đọc theo các tiêu chí sau (thang điểm 10):
- Phát âm
- Trọng âm và ngữ điệu
- Lưu loát
- Tốc độ
- Tổng thể

Chỉ trả về JSON đúng định dạng sau, không markdown, không giải thích:
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
```

**Output**: JSON chứa điểm và nhận xét

#### Chatbot:
**Input**: Câu hỏi của user

**Prompt**:
```
Bạn là trợ lý chuyên môn tiếng Anh. Yêu cầu:

1. Nếu câu hỏi KHÔNG liên quan đến tiếng Anh, trả lời:
"Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến học tiếng Anh."

2. Nếu CÓ liên quan, hãy trả lời:
- Ngắn gọn (dưới 12 dòng)
- Dễ hiểu, ngôn ngữ đơn giản
- Có thể kèm ví dụ nếu cần

Câu hỏi: {{message}}
```

**Output**: Câu trả lời văn bản

#### Tạo bài đọc:
**Input**: 
- `topic`: Chủ đề (ví dụ: "Du lịch Đà Nẵng")
- `description`: Mô tả chi tiết (tuỳ chọn)
- `recentReadings`: 5 bài gần nhất của user (để tránh trùng lặp)

**Prompt**:
```
Bạn là một giáo viên tiếng Anh chuyên nghiệp.

Hãy tạo một bài đọc tiếng Anh ngắn (2-4 câu) về chủ đề: "{{topic}}"

YÊU CẦU:
- Bài đọc phải HOÀN TOÀN MỚI và KHÁC BIỆT với các bài đã tạo trước đó
- Độ dài: 2-4 câu (khoảng 30-60 từ)
- Ngôn ngữ: Tiếng Anh đơn giản, dễ hiểu (trình độ A1-A2)
- Nội dung: Thú vị, thực tế, dễ hình dung

CÁC BÀI ĐÃ TẠO TRƯỚC ĐÓ (TRÁNH TRÙNG LẶP):
{{recentReadings}}

CHỈ TRẢ VỀ NỘI DUNG BÀI ĐỌC, KHÔNG GIẢI THÍCH.
```

**Output**: Nội dung bài đọc mới

---

### 4. FIREBASE CLOUD MESSAGING (PUSH NOTIFICATION)

**Công nghệ**: Firebase Admin SDK

**Chức năng**: Gửi thông báo đẩy đến thiết bị mobile

**Luồng hoạt động**:
1. App đăng ký FCM token khi cài đặt
2. Backend lưu token vào DB
3. Cron job chạy định kỳ → Gửi thông báo gợi ý
4. Backend gọi Firebase Admin SDK:
   ```javascript
   admin.messaging().send({
     token: fcmToken,
     notification: {
       title: "...",
       body: "..."
     },
     data: {
       readingId: "...",
       customText: "..."
     }
   })
   ```
5. Firebase gửi thông báo đến thiết bị
6. App nhận thông báo → Hiển thị banner hoặc lưu vào danh sách

**Lưu ý**:
- Cần file `firebase-service-account.json` (credentials)
- Token có thể thay đổi khi user gỡ/cài lại app
- Thông báo được lưu vào DB để xem lại sau

---

### 5. CLOUDINARY (UPLOAD ẢNH)

**Công nghệ**: Cloudinary API

**Chức năng**: Upload và lưu trữ ảnh (avatar, topic image, feedback screenshot)

**Luồng hoạt động**:
1. User chọn ảnh từ thiết bị
2. App gửi file lên backend (FormData)
3. Backend dùng `multer-storage-cloudinary` để upload:
   ```javascript
   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'entalk',
       allowed_formats: ['jpg', 'png', 'jpeg']
     }
   });
   ```
4. Cloudinary trả về URL ảnh
5. Backend lưu URL vào DB
6. App hiển thị ảnh từ URL

**Lưu ý**:
- Cần cấu hình `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Ảnh được lưu trong folder `entalk/`
- Hỗ trợ định dạng: JPG, PNG, JPEG

---

### 6. NODEMAILER (GỬI EMAIL)

**Công nghệ**: Nodemailer + Gmail SMTP

**Chức năng**: Gửi email xác nhận, mật khẩu mới, trả lời góp ý

**Cấu hình**:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

**Các loại email**:
1. **Email xác nhận đăng ký**:
   - Tiêu đề: "Mã xác nhận đăng ký EnTalk"
   - Nội dung: Mã 6 số, hết hạn sau 10 phút

2. **Email quên mật khẩu**:
   - Tiêu đề: "Mật khẩu mới EnTalk"
   - Nội dung: Mật khẩu mới (6 số)

3. **Email trả lời góp ý**:
   - Tiêu đề: "Phản hồi góp ý từ EnTalk"
   - Nội dung: Câu trả lời từ admin

**Lưu ý**:
- Cần bật "Less secure app access" hoặc dùng App Password cho Gmail
- Email gửi từ `process.env.EMAIL_USER`

---


## CẤU TRÚC DATABASE (MYSQL)

### Bảng `users` - Người dùng
```sql
- id: INT (PK, AUTO_INCREMENT)
- name: VARCHAR(100) - Tên người dùng
- email: VARCHAR(100) UNIQUE - Email đăng nhập
- password_hash: VARCHAR(255) - Mật khẩu đã mã hoá (bcrypt)
- level: ENUM('A1','A2','B1','B2','C1','C2') - Trình độ tiếng Anh
- avatar_url: TEXT - URL ảnh đại diện (Cloudinary)
- created_at: DATETIME - Thời điểm tạo tài khoản
- is_verified: BOOLEAN - Đã xác thực email chưa
- fcm_token: TEXT - Token Firebase để gửi push notification
- last_suggestion_type: INT - Xoay vòng tiêu chí gợi ý (0-4)
```

### Bảng `topics` - Chủ đề bài đọc
```sql
- id: INT (PK, AUTO_INCREMENT)
- name: VARCHAR(100) UNIQUE - Tên chủ đề (Du lịch, Khoa học...)
- description: TEXT - Mô tả chủ đề
- image_url: TEXT - URL hình ảnh chủ đề (Cloudinary)
```

### Bảng `readings` - Bài đọc
```sql
- id: INT (PK, AUTO_INCREMENT)
- content: TEXT - Nội dung đoạn văn
- level: ENUM('A1','A2','B1','B2','C1','C2') - Trình độ
- created_by: INT (FK → users.id) - ID người tạo (NULL nếu của hệ thống)
- topic_id: INT (FK → topics.id) - Chủ đề bài
- is_community_post: BOOLEAN - TRUE nếu do người dùng đăng
- created_at: DATETIME - Thời điểm tạo
```

### Bảng `records` - Bản ghi luyện tập
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id) - Người đọc
- reading_id: INT (FK → readings.id, NULL nếu bài bị xóa) - Bài đọc tương ứng
- original_content: TEXT - Nội dung gốc (lưu để so sánh khi bài bị sửa/xóa)
- transcript: TEXT - Văn bản AI nghe được (Whisper)
- score_pronunciation: FLOAT - Điểm phát âm (0-10)
- score_fluency: FLOAT - Điểm lưu loát (0-10)
- score_intonation: FLOAT - Điểm ngữ điệu (0-10)
- score_speed: FLOAT - Điểm tốc độ (0-10)
- score_overall: FLOAT - Tổng điểm trung bình (0-10)
- comment: TEXT - Gợi ý chung từ AI (Gemini)
- custom_text: TEXT - Lưu nội dung người dùng tự tạo để đọc
- created_at: DATETIME - Thời điểm luyện
```

### Bảng `reading_progress` - Tiến độ đọc của từng user
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id)
- reading_id: INT (FK → readings.id)
- is_completed: BOOLEAN - Đã hoàn thành bài đọc chưa (điểm >= 5)
- best_score: FLOAT - Điểm cao nhất đạt được
- completed_at: DATETIME - Thời điểm hoàn thành lần đầu
- last_practiced_at: DATETIME - Lần luyện gần nhất
- practice_count: INT - Số lần đã luyện
- created_at: DATETIME
- updated_at: DATETIME
- UNIQUE(user_id, reading_id) - Mỗi user chỉ có 1 progress cho 1 bài đọc
```

### Bảng `user_streaks` - Chuỗi luyện tập hàng ngày
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id, UNIQUE)
- current_streak: INT - Số ngày streak hiện tại
- longest_streak: INT - Streak dài nhất từng đạt được
- last_practice_date: DATE - Ngày luyện gần nhất (theo giờ VN)
- streak_freeze_count: INT - Số lần phục hồi còn lại trong tháng (reset đầu tháng)
- last_freeze_reset_month: INT - Tháng reset lần cuối (1-12)
- created_at: DATETIME
- updated_at: DATETIME
```

### Bảng `notifications` - Thông báo
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id) - Gửi cho người dùng cụ thể
- title: VARCHAR(255) - Tiêu đề thông báo
- body: TEXT - Nội dung thông báo
- reading_id: INT (FK → readings.id) - Nếu là bài đọc có sẵn
- custom_text: TEXT - Nếu là bài gợi ý AI tạo
- record_id: INT - ID bản ghi (nếu gợi ý luyện lại)
- is_read: BOOLEAN - Trạng thái đã đọc/chưa đọc
- created_at: DATETIME - Thời điểm gửi
```

### Bảng `chat_messages` - Lịch sử chat với bot
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id)
- role: ENUM('user', 'assistant') - Vai trò (user hoặc bot)
- message: TEXT - Nội dung tin nhắn
- created_at: DATETIME
```

### Bảng `feedbacks` - Góp ý từ người dùng
```sql
- id: INT (PK, AUTO_INCREMENT)
- user_id: INT (FK → users.id)
- user_email: VARCHAR(100) - Email người gửi
- content: TEXT - Nội dung góp ý
- screenshot_url: TEXT - URL ảnh đính kèm (Cloudinary)
- status: ENUM('pending', 'replied') - Trạng thái
- admin_reply: TEXT - Câu trả lời từ admin
- replied_at: DATETIME - Thời điểm admin trả lời
- created_at: DATETIME
```

### Bảng `admins` - Tài khoản admin
```sql
- id: INT (PK, AUTO_INCREMENT)
- username: VARCHAR(50) UNIQUE - Tên đăng nhập
- email: VARCHAR(100) UNIQUE - Email admin
- password_hash: VARCHAR(255) - Mật khẩu đã mã hoá
- created_at: DATETIME
```

### Bảng `email_verifications` - Mã xác nhận email
```sql
- id: INT (PK, AUTO_INCREMENT)
- email: VARCHAR(100) - Email cần xác nhận
- verification_code: VARCHAR(10) - Mã 6 số
- expires_at: DATETIME - Thời điểm hết hạn (10 phút)
```

---

## API ENDPOINTS

### Authentication (Auth)
```
POST   /api/auth/register              - Đăng ký tài khoản (gửi mã xác nhận)
POST   /api/auth/verify-email          - Xác minh email bằng mã
POST   /api/auth/resend-code           - Gửi lại mã xác nhận
POST   /api/auth/login                 - Đăng nhập
POST   /api/auth/forgot-password       - Quên mật khẩu (gửi mật khẩu mới)
GET    /api/auth/profile               - Lấy thông tin cá nhân (cần token)
PUT    /api/auth/profile               - Cập nhật thông tin cá nhân (cần token)
POST   /api/auth/change-password       - Đổi mật khẩu (cần token)
POST   /api/auth/upload-avatar         - Upload ảnh đại diện (cần token)
```

### Topics (Chủ đề)
```
GET    /api/topics                     - Lấy danh sách chủ đề
GET    /api/topics/:id                 - Lấy thông tin 1 chủ đề
```

### Readings (Bài đọc)
```
GET    /api/reading                    - Lấy tất cả bài đọc
GET    /api/reading/topic/:id          - Lấy bài đọc theo chủ đề (có thông tin progress nếu có token)
GET    /api/reading/:id                - Lấy chi tiết 1 bài đọc
POST   /api/reading/check-modified     - Kiểm tra bài đọc có bị sửa không
```

### Records (Luyện tập)
```
POST   /api/reading/record             - Gửi file ghi âm và chấm điểm (cần token)
                                         Body: FormData { audio, readingId?, customText? }
```

### History (Lịch sử)
```
GET    /api/history/chart?range=7      - Lấy dữ liệu biểu đồ tiến độ (cần token)
GET    /api/history/recent             - Lấy danh sách bài đã luyện (cần token)
                                         Query: topicId, limit, page
GET    /api/history/record/:id         - Lấy chi tiết 1 bản ghi (cần token)
GET    /api/history/by-date?date=...   - Lấy bài đã luyện trong 1 ngày (cần token)
```

### Streak (Chuỗi luyện tập)
```
GET    /api/streak                     - Lấy thông tin streak (cần token)
```

### Notifications (Thông báo)
```
POST   /api/notification/save-token    - Lưu FCM token (cần token)
GET    /api/notification/list          - Lấy danh sách thông báo (cần token)
POST   /api/notification/mark-read     - Đánh dấu đã đọc (cần token)
```

### Chat (Chatbot)
```
POST   /api/chat/ask                   - Hỏi chatbot (cần token)
                                         Body: { message }
GET    /api/chat/history               - Lấy lịch sử chat (cần token)
```

### Feedback (Góp ý)
```
POST   /api/feedback/send              - Gửi góp ý (cần token)
                                         Body: FormData { content, screenshot? }
```

### TTS (Text to Speech)
```
GET    /api/tts/health                 - Kiểm tra Piper server
POST   /api/tts/synthesize             - Chuyển văn bản thành giọng nói
                                         Body: { text }
```

### AI Reading (Tạo bài đọc bằng AI)
```
POST   /api/ai-reading/generate        - Tạo bài đọc mới bằng Gemini (cần token)
                                         Body: { topic, description? }
```

### Admin - Authentication
```
POST   /api/admin/login                - Đăng nhập admin
```

### Admin - Dashboard
```
GET    /api/admin/dashboard            - Lấy thống kê tổng quan (cần admin token)
```

### Admin - Users
```
GET    /api/admin/users                - Lấy danh sách người dùng (cần admin token)
PUT    /api/admin/users/:id            - Cập nhật thông tin user (cần admin token)
DELETE /api/admin/users/:id            - Xóa user (cần admin token)
```

### Admin - Topics
```
GET    /api/admin/topics               - Lấy danh sách chủ đề (cần admin token)
POST   /api/admin/topics               - Tạo chủ đề mới (cần admin token)
                                         Body: FormData { name, description, image? }
PUT    /api/admin/topics/:id           - Cập nhật chủ đề (cần admin token)
DELETE /api/admin/topics/:id           - Xóa chủ đề (cần admin token)
```

### Admin - Readings
```
GET    /api/admin/readings             - Lấy danh sách bài đọc (cần admin token)
POST   /api/admin/readings             - Tạo bài đọc mới (cần admin token)
                                         Body: { content, level, topic_id }
PUT    /api/admin/readings/:id         - Cập nhật bài đọc (cần admin token)
DELETE /api/admin/readings/:id         - Xóa bài đọc (cần admin token)
```

### Admin - Records
```
GET    /api/admin/records              - Lấy danh sách bản ghi (cần admin token)
DELETE /api/admin/records/:id          - Xóa bản ghi (cần admin token)
```

### Admin - Feedbacks
```
GET    /api/admin/feedbacks            - Lấy danh sách góp ý (cần admin token)
POST   /api/admin/feedbacks/:id/reply  - Trả lời góp ý (cần admin token)
                                         Body: { reply }
```

---


## CÔNG NGHỆ SỬ DỤNG

### Frontend App (React Native)
```json
{
  "react-native": "0.80.1",
  "react": "19.1.0",
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/bottom-tabs": "^7.4.2",
  "@react-navigation/native-stack": "^7.3.21",
  "axios": "^1.10.0",
  "@react-native-firebase/app": "^22.4.0",
  "@react-native-firebase/messaging": "^22.4.0",
  "react-native-audio-record": "^0.2.2",
  "react-native-sound": "^0.12.0",
  "@react-native-ml-kit/text-recognition": "^1.5.2",
  "react-native-image-picker": "^5.7.0",
  "react-native-image-resizer": "^1.4.5",
  "react-native-chart-kit": "^6.11.0",
  "react-native-linear-gradient": "^2.8.3",
  "react-native-vector-icons": "^10.3.0"
}
```

**Chức năng chính**:
- Navigation: React Navigation (Stack + Bottom Tabs)
- HTTP Client: Axios
- Push Notification: Firebase Messaging
- Audio Recording: react-native-audio-record
- Audio Playback: react-native-sound
- OCR: ML Kit Text Recognition (offline)
- Image Picker: react-native-image-picker
- Image Resize: react-native-image-resizer
- Charts: react-native-chart-kit
- UI: Linear Gradient, Vector Icons

---

### Backend (Node.js + Express)
```json
{
  "express": "^5.1.0",
  "mysql2": "^3.14.2",
  "axios": "^1.10.0",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "multer": "^2.0.2",
  "multer-storage-cloudinary": "^4.0.0",
  "cloudinary": "^1.41.3",
  "firebase-admin": "^13.4.0",
  "nodemailer": "^7.0.5",
  "node-cron": "^4.2.1",
  "fluent-ffmpeg": "^2.1.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.0"
}
```

**Chức năng chính**:
- Web Framework: Express
- Database: MySQL2 (promise-based)
- HTTP Client: Axios (gọi Whisper, Piper, Gemini)
- Authentication: bcryptjs (hash password), jsonwebtoken (JWT)
- File Upload: multer, multer-storage-cloudinary
- Cloud Storage: Cloudinary
- Push Notification: Firebase Admin SDK
- Email: Nodemailer
- Cron Job: node-cron (gửi thông báo định kỳ)
- Audio Processing: fluent-ffmpeg (chuyển WAV sang MP3)

---

### Admin Web (React)
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.9.4",
  "axios": "^1.12.2"
}
```

**Chức năng chính**:
- UI Framework: React
- Routing: React Router DOM
- HTTP Client: Axios
- State Management: React Hooks (useState, useEffect)

---

### Whisper Server (Python + Flask)
```python
{
  "Flask": "Micro web framework",
  "whisper": "OpenAI Whisper (STT)",
  "uuid": "Tạo tên file unique",
  "os": "Quản lý file"
}
```

**Model**: `base` hoặc `small` (có thể thay đổi)

---

### Piper Server (Python + Flask)
```python
{
  "Flask": "Micro web framework",
  "flask-cors": "CORS support",
  "piper": "Piper TTS library",
  "uuid": "Tạo tên file unique",
  "io": "BytesIO để trả file",
  "struct": "Tạo WAV header"
}
```

**Model**: `en_US-lessac-medium.onnx`

---

### Database (MySQL)
- Version: 8.0+
- Charset: utf8mb4
- Collation: utf8mb4_unicode_ci

---

### External Services
1. **Google Gemini AI**:
   - Model: `gemini-2.0-flash`
   - API Key: `GEMINI_API_KEY`

2. **Firebase Cloud Messaging**:
   - Service Account: `firebase-service-account.json`

3. **Cloudinary**:
   - Cloud Name: `CLOUDINARY_CLOUD_NAME`
   - API Key: `CLOUDINARY_API_KEY`
   - API Secret: `CLOUDINARY_API_SECRET`

4. **Gmail SMTP** (Nodemailer):
   - Email: `EMAIL_USER`
   - Password: `EMAIL_PASS`

---

## BIẾN MÔI TRƯỜNG (.env)

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=entalk

# JWT
JWT_SECRET=your_jwt_secret
JWT_ADMIN_SECRET=your_admin_jwt_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Servers
PIPER_SERVER_URL=http://localhost:5001
WHISPER_SERVER_URL=http://localhost:5000
```

---

## CÁCH CHẠY HỆ THỐNG

### 1. Cài đặt Database
```bash
# Tạo database và import schema
mysql -u root -p < db.sql
```

### 2. Chạy Backend
```bash
cd backend
npm install
node server.js
# Server chạy trên port 3000
```

### 3. Chạy Whisper Server
```bash
cd whisper
pip install flask whisper
python whisper_server.py
# Server chạy trên port 5000
```

### 4. Chạy Piper Server
```bash
cd piper
pip install flask flask-cors piper-tts
python piper_server.py
# Server chạy trên port 5001
```

### 5. Chạy Admin Web
```bash
cd admin
npm install
npm start
# Web chạy trên port 3001 (hoặc 3000)
```

### 6. Chạy Frontend App
```bash
cd frontend
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## LUỒNG DỮ LIỆU TỔNG QUAN

### Luồng chấm điểm đọc (STT + AI Scoring):
```
User ghi âm (App)
    ↓
Gửi file WAV (Backend)
    ↓
Whisper Server (STT) → Transcript
    ↓
Gemini AI (Scoring) → Điểm + Nhận xét
    ↓
Lưu vào DB (records, reading_progress, user_streaks)
    ↓
Trả kết quả về App
    ↓
Hiển thị modal điểm
```

### Luồng nghe bài mẫu (TTS):
```
User nhấn "Nghe bài mẫu" (App)
    ↓
Gửi text (Backend)
    ↓
Piper Server (TTS) → Audio WAV
    ↓
FFmpeg (Backend) → Chuyển WAV sang MP3
    ↓
Trả MP3 về App
    ↓
Phát audio
```

### Luồng gợi ý tự động (Cron + Push Notification):
```
Cron Job chạy (8h, 14h, 20h)
    ↓
Với mỗi user có FCM token:
    ↓
Chọn chiến lược gợi ý (xoay vòng 0-4)
    ↓
Tìm bài phù hợp (hoặc gọi Gemini tạo mới)
    ↓
Gửi Push Notification (Firebase)
    ↓
Lưu vào bảng notifications
    ↓
User nhận thông báo trên app
```

### Luồng chatbot:
```
User nhập câu hỏi (App)
    ↓
Gửi message (Backend)
    ↓
Lưu vào chat_messages (role = 'user')
    ↓
Gọi Gemini AI → Trả lời
    ↓
Lưu vào chat_messages (role = 'assistant')
    ↓
Trả về App
    ↓
Hiển thị trong chat
```

---

## ĐẶC ĐIỂM NỔI BẬT CỦA HỆ THỐNG

### 1. Hệ thống chấm điểm thông minh
- Sử dụng Whisper (OpenAI) để chuyển giọng nói thành văn bản với độ chính xác cao
- Gemini AI đánh giá chi tiết 5 tiêu chí: phát âm, ngữ điệu, lưu loát, tốc độ, tổng thể
- Nhận xét cụ thể giúp user cải thiện

### 2. Hệ thống gợi ý thông minh
- 5 chiến lược gợi ý xoay vòng:
  1. Bài tự nhập điểm thấp chưa cải thiện
  2. Bài hệ thống từng luyện có điểm thấp
  3. Bài hệ thống chưa từng luyện
  4. Chủ đề ít luyện
  5. AI đề xuất sinh đoạn văn mới (phân tích điểm yếu)
- Gửi thông báo đẩy định kỳ (8h, 14h, 20h)
- Lưu lại trong app để xem lại

### 3. Hệ thống Streak (Chuỗi luyện tập)
- Theo dõi số ngày luyện liên tục
- 5 cấp độ streak với icon và màu sắc khác nhau
- Tự động reset nếu bỏ lỡ 1 ngày
- Hiển thị trên HomeScreen để động viên user

### 4. Tính năng TTS (Text to Speech)
- Nghe bài mẫu trước khi luyện
- Giọng đọc tự nhiên (Piper TTS)
- Tốc độ đọc chậm hơn (19000Hz) để dễ nghe

### 5. Tính năng tạo nội dung linh hoạt
- Nhập văn bản thủ công
- Quét văn bản từ ảnh (OCR offline)
- Tạo bài đọc bằng AI (Gemini) theo chủ đề

### 6. Chatbot hỗ trợ học tiếng Anh
- Trả lời câu hỏi về ngữ pháp, từ vựng, phát âm...
- Lọc câu hỏi không liên quan
- Lưu lịch sử chat để xem lại

### 7. Hệ thống quản trị đầy đủ
- Admin web quản lý users, topics, readings, records, feedbacks
- Thống kê tổng quan (dashboard)
- Trả lời góp ý qua email

### 8. Bảo toàn dữ liệu lịch sử
- Khi xóa bài đọc/chủ đề → Giữ lại records (đặt reading_id = NULL)
- Lưu `original_content` để user có thể luyện lại
- Kiểm tra bài đọc có bị sửa không

### 9. Theo dõi tiến độ chi tiết
- Biểu đồ điểm theo thời gian (7 ngày, 30 ngày)
- Lọc lịch sử theo chủ đề
- Xem chi tiết từng bài đã luyện
- Theo dõi số lần luyện, điểm cao nhất, trạng thái hoàn thành

---

## KẾT LUẬN

Hệ thống **EnTalk** là một ứng dụng luyện đọc tiếng Anh toàn diện, tích hợp nhiều công nghệ AI hiện đại:
- **Whisper** (STT) để chuyển giọng nói thành văn bản
- **Piper** (TTS) để tạo giọng đọc mẫu
- **Gemini AI** để chấm điểm, tạo nội dung, chatbot, gợi ý thông minh

Hệ thống bao gồm:
- **App mobile** (React Native) cho người dùng
- **Web admin** (React) cho quản trị viên
- **Backend API** (Node.js + Express) xử lý logic
- **2 server Python** (Whisper + Piper) xử lý audio
- **Database MySQL** lưu trữ dữ liệu

Các tính năng nổi bật:
- Chấm điểm phát âm tự động với 5 tiêu chí chi tiết
- Gợi ý luyện tập thông minh với 5 chiến lược
- Hệ thống streak động viên user luyện đều đặn
- Tạo nội dung linh hoạt (nhập tay, OCR, AI)
- Chatbot hỗ trợ học tiếng Anh
- Theo dõi tiến độ chi tiết với biểu đồ
- Quản trị đầy đủ qua web admin

Hệ thống được thiết kế để giúp người học tiếng Anh cải thiện kỹ năng đọc một cách hiệu quả và thú vị.

---

**Tài liệu này mô tả đầy đủ kiến trúc, luồng hoạt động, và chức năng của hệ thống EnTalk.**

**Ngày tạo**: 24/11/2025
**Phiên bản**: 1.0
