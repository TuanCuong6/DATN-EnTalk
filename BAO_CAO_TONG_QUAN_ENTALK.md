# BÁO CÁO TỔNG QUAN HỆ THỐNG ENTALK

## 1. GIỚI THIỆU

**EnTalk** là hệ thống ứng dụng luyện đọc tiếng Anh tích hợp AI, giúp người học cải thiện kỹ năng phát âm, ngữ điệu và lưu loát thông qua công nghệ nhận diện giọng nói và chấm điểm tự động.

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Tổng quan kiến trúc

Hệ thống áp dụng kiến trúc **Client-Server** với các thành phần:

```
┌─────────────────┐
│  Mobile App     │ (React Native - iOS/Android)
│  (User)         │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐      ┌──────────────┐
│  Backend API    │◄────►│  MySQL DB    │
│  (Node.js)      │      └──────────────┘
└────────┬────────┘
         │
         ├──────► Whisper Server (STT)
         ├──────► Piper Server (TTS)
         ├──────► Gemini AI
         ├──────► Firebase (Push Notification)
         └──────► Cloudinary (Image Storage)

┌─────────────────┐
│   Admin Web     │ (React - Quản trị)
└────────┬────────┘
         │ REST API
         ▼
    Backend API
```

### 2.2. Các thành phần chính

**Frontend Mobile App (React Native)**
- Ứng dụng di động cho iOS và Android
- Giao diện người dùng luyện đọc, xem lịch sử, chatbot
- Ghi âm và phát audio

**Backend API (Node.js + Express)**
- Xử lý logic nghiệp vụ
- Quản lý authentication, authorization
- Tích hợp các dịch vụ AI và bên thứ ba
- Cron job gửi thông báo tự động

**Admin Web (React)**
- Trang quản trị cho admin
- Quản lý users, topics, readings, feedbacks
- Email marketing

**Whisper Server (Python/Flask)**
- Chuyển đổi giọng nói thành văn bản (Speech-to-Text)
- Sử dụng model OpenAI Whisper

**Piper Server (Python/Flask)**
- Chuyển văn bản thành giọng nói (Text-to-Speech)
- Tạo audio mẫu cho bài đọc

**Database (MySQL)**
- Lưu trữ dữ liệu người dùng, bài đọc, lịch sử luyện tập
- 15+ bảng với quan hệ rõ ràng

## 3. CÔNG NGHỆ SỬ DỤNG

### 3.1. Frontend Mobile (React Native)

**Core Technologies:**
- React Native 0.80.1
- React Navigation (Stack + Bottom Tabs)
- React Native Paper (UI Components)

**Key Libraries:**
- `axios`: HTTP client
- `@react-native-firebase/messaging`: Push notification
- `react-native-audio-record`: Ghi âm
- `react-native-sound`: Phát audio
- `@react-native-ml-kit/text-recognition`: OCR offline
- `react-native-chart-kit`: Biểu đồ tiến độ
- `react-native-image-picker`: Chọn ảnh
- `react-native-linear-gradient`: Gradient UI

### 3.2. Backend (Node.js)

**Core Technologies:**
- Express 5.1.0
- MySQL2 (Promise-based)
- JWT Authentication

**Key Libraries:**
- `bcryptjs`: Hash password
- `multer` + `cloudinary`: Upload ảnh
- `firebase-admin`: Push notification
- `nodemailer`: Gửi email
- `node-cron`: Scheduled tasks
- `fluent-ffmpeg`: Xử lý audio
- `axios`: Gọi external APIs

### 3.3. Admin Web (React)

**Core Technologies:**
- React 19.2.0
- React Router DOM 7.9.4
- Tailwind CSS

**Key Libraries:**
- `axios`: HTTP client
- `react-hot-toast`: Notifications
- `lucide-react`: Icons

### 3.4. AI & External Services

**Whisper Server:**
- Python + Flask
- OpenAI Whisper (model: base/small)
- Chuyển audio WAV thành text

**Piper Server:**
- Python + Flask
- Piper TTS (model: en_US-lessac-medium.onnx)
- Tạo audio WAV từ text

**Gemini AI:**
- Model: gemini-2.0-flash
- Chấm điểm phát âm
- Tạo nội dung bài đọc
- Chatbot hỗ trợ học tiếng Anh
- Gợi ý thông minh

**Firebase Cloud Messaging:**
- Push notification đến mobile app

**Cloudinary:**
- Lưu trữ ảnh (avatar, topic images, screenshots)

**vcyon API:**
- Lấy phụ đề YouTube

### 3.5. Database (MySQL)

**Các bảng chính:**
- `users`: Thông tin người dùng
- `topics`: Chủ đề bài đọc
- `readings`: Bài đọc
- `records`: Lịch sử luyện tập
- `reading_progress`: Tiến độ từng bài
- `user_streaks`: Chuỗi luyện tập hàng ngày
- `notifications`: Thông báo
- `chat_messages`: Lịch sử chatbot
- `feedbacks`: Góp ý người dùng
- `admins`: Tài khoản admin
- `marketing_campaigns`: Email marketing

## 4. CHỨC NĂNG CHÍNH

### 4.1. Chức năng người dùng

**Xác thực & Quản lý tài khoản:**
- Đăng ký với xác thực email (mã 6 số)
- Đăng nhập với JWT token
- Quên mật khẩu (gửi mật khẩu mới qua email)
- Chỉnh sửa profile (tên, avatar)
- Đổi mật khẩu

**Luyện đọc với bài có sẵn:**
- Chọn chủ đề (Du lịch, Khoa học, Tin tức...)
- Chọn bài đọc theo trình độ (A1, B1, C1)
- Nghe bài mẫu (TTS)
- Ghi âm giọng đọc
- Nhận điểm chi tiết 5 tiêu chí:
  - Phát âm (pronunciation)
  - Ngữ điệu (intonation)
  - Lưu loát (fluency)
  - Tốc độ (speed)
  - Tổng thể (overall)
- Nhận xét từ AI

**Luyện đọc với nội dung tùy chỉnh:**
- Nhập văn bản thủ công
- Quét văn bản từ ảnh (OCR offline)
- Tạo bài đọc bằng AI (nhập chủ đề)
- Tạo bài đọc từ YouTube (lấy phụ đề)

**Theo dõi tiến độ:**
- Biểu đồ điểm theo thời gian (7/30 ngày)
- Lịch sử bài đã luyện (có phân trang, lọc theo chủ đề)
- Xem chi tiết từng bài (điểm, transcript, nhận xét)
- Luyện lại bài cũ

**Hệ thống Streak:**
- Theo dõi chuỗi luyện tập hàng ngày
- 5 cấp độ với icon và màu sắc khác nhau
- Tự động reset nếu bỏ lỡ 1 ngày
- Hiển thị trên Home screen

**Thông báo thông minh:**
- Nhận gợi ý luyện tập (8h, 14h, 20h)
- 5 chiến lược gợi ý xoay vòng:
  1. Bài tự nhập điểm thấp chưa cải thiện
  2. Bài hệ thống từng luyện có điểm thấp
  3. Bài hệ thống chưa từng luyện
  4. Chủ đề ít luyện
  5. AI đề xuất sinh đoạn văn mới
- Xem lại thông báo trong app

**Chatbot hỗ trợ:**
- Hỏi đáp về tiếng Anh (ngữ pháp, từ vựng, phát âm)
- Lưu lịch sử chat
- Lọc câu hỏi không liên quan

**Góp ý & Báo lỗi:**
- Gửi góp ý với ảnh đính kèm
- Nhận phản hồi từ admin qua email

### 4.2. Chức năng Admin

**Dashboard:**
- Thống kê tổng quan (số users, readings, records, điểm TB)

**Quản lý Users:**
- Xem danh sách người dùng
- Chỉnh sửa thông tin (tên, email, level)
- Xóa user
- Vô hiệu hóa tài khoản

**Quản lý Topics:**
- Thêm/sửa/xóa chủ đề
- Upload hình ảnh chủ đề

**Quản lý Readings:**
- Thêm/sửa/xóa bài đọc
- Phân loại theo trình độ và chủ đề
- Generate audio tự động cho bài đọc

**Quản lý Records:**
- Xem lịch sử luyện tập của users
- Xem chi tiết điểm và transcript
- Xóa record

**Quản lý Feedbacks:**
- Xem danh sách góp ý
- Trả lời góp ý (gửi email tự động)
- Xem ảnh đính kèm

**Email Marketing:**
- Tạo email với AI (Gemini generate HTML/CSS)
- Upload ảnh, chọn màu, phong cách
- Preview email
- Gửi đến tất cả users
- Theo dõi lịch sử campaigns (số lượng gửi thành công/thất bại)

## 5. LUỒNG HOẠT ĐỘNG QUAN TRỌNG

### 5.1. Luồng chấm điểm đọc (Core Flow)

```
1. User ghi âm giọng đọc (WAV, 16kHz, mono)
2. App gửi file lên Backend
3. Backend gửi audio đến Whisper Server
4. Whisper chuyển audio → transcript (text)
5. Backend gọi Gemini AI:
   - Input: transcript + original text
   - Output: Điểm 5 tiêu chí + nhận xét
6. Backend lưu vào DB:
   - Bảng records (điểm, transcript, comment)
   - Bảng reading_progress (best_score, is_completed)
   - Bảng user_streaks (cập nhật streak)
7. Trả kết quả về App
8. App hiển thị modal điểm
```

### 5.2. Luồng gợi ý tự động (Cron Job)

```
1. Cron chạy 3 lần/ngày (8h, 14h, 20h)
2. Với mỗi user có FCM token:
   - Chọn chiến lược gợi ý (xoay vòng 0-4)
   - Tìm bài phù hợp hoặc gọi AI tạo mới
3. Gửi Push Notification qua Firebase
4. Lưu vào bảng notifications
5. User nhận thông báo trên app
6. Nhấn vào thông báo → Điều hướng đến bài luyện
```

### 5.3. Luồng tạo bài đọc từ YouTube

```
1. User nhập link YouTube
2. Backend trích xuất Video ID
3. Gọi vcyon API lấy phụ đề
4. Gemini AI tóm tắt nội dung (tiếng Việt)
5. User nhấn "Tạo bài đọc"
6. Gemini AI tạo bài đọc tiếng Anh (3-5 câu hay nhất)
7. User có thể chỉnh sửa hoặc tạo lại
8. Nhấn "Luyện đọc" → Chuyển sang màn hình luyện
```

### 5.4. Luồng Email Marketing

```
1. Admin nhập thông tin email (subject, nội dung, ảnh, CTA, màu, phong cách)
2. Nhấn "Tạo Email"
3. Backend gọi Gemini AI generate HTML/CSS responsive
4. Admin preview trong iframe
5. Nhấn "Gửi Email" → Confirm
6. Backend:
   - Lấy danh sách tất cả users
   - Tạo campaign (status: sending)
   - Gửi email bất đồng bộ (delay 1s/email)
   - Cập nhật sent_count, failed_count
   - Đổi status → completed
7. Admin xem lịch sử campaigns
```

## 6. ĐẶC ĐIỂM NỔI BẬT

### 6.1. Chấm điểm thông minh
- Whisper (OpenAI) chuyển giọng nói thành văn bản chính xác
- Gemini AI đánh giá chi tiết 5 tiêu chí
- Nhận xét cụ thể giúp cải thiện

### 6.2. Gợi ý thông minh
- 5 chiến lược xoay vòng
- AI phân tích điểm yếu và tạo bài phù hợp
- Push notification định kỳ

### 6.3. Streak động viên
- Theo dõi chuỗi luyện tập
- 5 cấp độ với icon đẹp mắt
- Hiển thị nổi bật trên Home

### 6.4. TTS chất lượng
- Giọng đọc tự nhiên (Piper TTS)
- Tốc độ chậm hơn để dễ nghe (19000Hz)

### 6.5. Tạo nội dung linh hoạt
- Nhập tay, OCR, AI, YouTube
- Đa dạng nguồn nội dung

### 6.6. Chatbot hỗ trợ
- Trả lời câu hỏi về tiếng Anh
- Lọc câu hỏi không liên quan
- Lưu lịch sử

### 6.7. Quản trị đầy đủ
- Dashboard thống kê
- CRUD đầy đủ cho tất cả entities
- Email marketing với AI

### 6.8. Bảo toàn dữ liệu
- Giữ lại records khi xóa bài đọc
- Lưu original_content để luyện lại
- Kiểm tra bài đọc có bị sửa

### 6.9. Theo dõi tiến độ chi tiết
- Biểu đồ điểm theo thời gian
- Lọc theo chủ đề
- Xem chi tiết từng bài

## 7. BẢO MẬT & AUTHENTICATION

**JWT Token:**
- User token: `JWT_SECRET`
- Admin token: `JWT_ADMIN_SECRET`
- Expire time: Cấu hình trong code

**Password:**
- Hash bằng bcryptjs (10 rounds)
- Không lưu plain text

**Email Verification:**
- Mã 6 số ngẫu nhiên
- Hết hạn sau 10 phút
- Lưu trong bảng `email_verifications`

**Authorization:**
- Middleware `authMiddleware`: Xác thực user
- Middleware `adminAuth`: Xác thực admin
- Kiểm tra token trong header: `Authorization: Bearer <token>`

## 8. TRIỂN KHAI & VẬN HÀNH

### 8.1. Yêu cầu hệ thống

**Backend:**
- Node.js 18+
- MySQL 8.0+
- FFmpeg (xử lý audio)

**Whisper Server:**
- Python 3.8+
- OpenAI Whisper
- Flask

**Piper Server:**
- Python 3.8+
- Piper TTS
- Flask

**Mobile App:**
- iOS 12+ / Android 6.0+
- React Native CLI

**Admin Web:**
- Modern browser (Chrome, Firefox, Safari)

### 8.2. Cấu hình môi trường

**Backend (.env):**
```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_ADMIN_SECRET
GEMINI_API_KEY, GEMINI_API_KEY2
VCYON_API_KEY
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
EMAIL_USER, EMAIL_PASS
```

**Firebase:**
- File `firebase-service-account.json` (credentials)

### 8.3. Ports

- Backend API: 3000
- Whisper Server: 5000
- Piper Server: 5001
- Admin Web: 3001 (hoặc 3000)

### 8.4. Cron Jobs

**Daily Recommendation:**
- Chạy 3 lần/ngày: 8h, 14h, 20h
- Gửi gợi ý luyện tập cho users

## 9. GIỚI HẠN & LƯU Ý

**Content Limits:**
- Bài đọc: 50-1000 ký tự
- Custom text: 50-1000 ký tự
- Feedback: 10-2000 ký tự
- Chat message: 1-500 ký tự

**File Upload:**
- Avatar: Max 5MB (JPG, PNG)
- Topic image: Max 10MB (JPG, PNG)
- Feedback screenshot: Max 5MB (JPG, PNG)
- Email marketing images: Max 10MB, tối đa 5 ảnh

**Audio:**
- Format: WAV, 16kHz, mono
- Tự động xóa sau khi xử lý

**API Rate Limits:**
- Gemini AI: Theo quota của Google
- vcyon API: Theo gói đăng ký
- Firebase: Theo gói đăng ký

## 10. KẾT LUẬN

**EnTalk** là hệ thống luyện đọc tiếng Anh toàn diện, tích hợp nhiều công nghệ AI hiện đại (Whisper, Piper, Gemini). Hệ thống bao gồm mobile app, web admin, backend API, và 2 server Python xử lý audio.

**Điểm mạnh:**
- Chấm điểm tự động chính xác với 5 tiêu chí
- Gợi ý thông minh dựa trên AI
- Tạo nội dung linh hoạt (nhập tay, OCR, AI, YouTube)
- Theo dõi tiến độ chi tiết
- Quản trị đầy đủ với email marketing

**Công nghệ:**
- Frontend: React Native, React
- Backend: Node.js + Express
- AI: Whisper (STT), Piper (TTS), Gemini (Scoring, Content Generation, Chatbot)
- Database: MySQL
- Cloud: Firebase, Cloudinary

**Mục tiêu:**
Giúp người học tiếng Anh cải thiện kỹ năng đọc một cách hiệu quả, thú vị và có hệ thống.

---

**Ngày tạo báo cáo:** 27/11/2025  
**Phiên bản:** 1.0
