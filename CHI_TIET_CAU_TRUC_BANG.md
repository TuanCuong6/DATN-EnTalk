# CHI TIẾT CẤU TRÚC CÁC BẢNG - HỆ THỐNG ENTALK

## BẢNG 1: users

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR | 100 | NOT NULL |
| email | VARCHAR | 100 | NOT NULL, UNIQUE |
| password_hash | VARCHAR | 255 | NOT NULL |
| level | ENUM | | DEFAULT 'A1' |
| avatar_url | TEXT | | |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |
| is_verified | BOOLEAN | | DEFAULT FALSE |
| fcm_token | TEXT | | |
| last_suggestion_type | INT | | DEFAULT 0 |
| is_active | BOOLEAN | | DEFAULT TRUE |

---

## BẢNG 2: topics

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR | 100 | NOT NULL, UNIQUE |
| description | TEXT | | |
| image_url | TEXT | | |

---

## BẢNG 3: readings

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| content | TEXT | | NOT NULL |
| level | ENUM | | |
| created_by | INT | | FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL |
| topic_id | INT | | FOREIGN KEY REFERENCES topics(id) ON DELETE SET NULL |
| is_community_post | BOOLEAN | | DEFAULT FALSE |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |
| audio_file | VARCHAR | 255 | |
| audio_generated_at | DATETIME | | |

---

## BẢNG 4: records

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| reading_id | INT | | FOREIGN KEY REFERENCES readings(id) ON DELETE SET NULL |
| original_content | TEXT | | |
| transcript | TEXT | | |
| score_pronunciation | FLOAT | | |
| score_fluency | FLOAT | | |
| score_intonation | FLOAT | | |
| score_speed | FLOAT | | |
| score_overall | FLOAT | | |
| comment | TEXT | | |
| word_analysis | JSON | | |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |
| custom_text | TEXT | | |

---

## BẢNG 5: record_feedback

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| record_id | INT | | NOT NULL, FOREIGN KEY REFERENCES records(id) ON DELETE CASCADE |
| sentence | TEXT | | |
| error_type | ENUM | | NOT NULL |
| message | TEXT | | |

---

## BẢNG 6: user_stats

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| user_id | INT | | PRIMARY KEY, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| total_records | INT | | DEFAULT 0 |
| avg_score | FLOAT | | DEFAULT 0 |
| best_score | FLOAT | | DEFAULT 0 |
| last_practice | DATETIME | | |

---

## BẢNG 7: score_history

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| score | FLOAT | | NOT NULL |
| recorded_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |

---

## BẢNG 8: reading_progress

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| reading_id | INT | | NOT NULL, FOREIGN KEY REFERENCES readings(id) ON DELETE CASCADE |
| is_completed | BOOLEAN | | DEFAULT FALSE |
| best_score | FLOAT | | |
| completed_at | DATETIME | | |
| last_practiced_at | DATETIME | | |
| practice_count | INT | | DEFAULT 0 |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Ràng buộc bổ sung:**
- UNIQUE KEY (user_id, reading_id)
- INDEX (user_id, is_completed)
- INDEX (reading_id, is_completed)

---

## BẢNG 9: user_streaks

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| current_streak | INT | | DEFAULT 1 |
| longest_streak | INT | | DEFAULT 0 |
| last_practice_date | DATE | | |
| streak_freeze_count | INT | | DEFAULT 3 |
| last_freeze_reset_month | INT | | DEFAULT 1 |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Ràng buộc bổ sung:**
- UNIQUE KEY (user_id)
- INDEX (user_id)
- INDEX (last_practice_date)

---

## BẢNG 10: notifications

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| title | VARCHAR | 255 | NOT NULL |
| body | TEXT | | NOT NULL |
| reading_id | INT | | FOREIGN KEY REFERENCES readings(id) ON DELETE SET NULL |
| custom_text | TEXT | | |
| record_id | INT | | |
| is_read | BOOLEAN | | DEFAULT FALSE |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |

---

## BẢNG 11: chat_messages

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| role | ENUM | | NOT NULL |
| message | TEXT | | NOT NULL |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |

---

## BẢNG 12: feedbacks

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | | NOT NULL, FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE |
| user_email | VARCHAR | 100 | NOT NULL |
| content | TEXT | | NOT NULL |
| rating | INT | | |
| screenshot_url | TEXT | | |
| status | ENUM | | DEFAULT 'pending' |
| admin_reply | TEXT | | |
| replied_at | DATETIME | | |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |

---

## BẢNG 13: admins

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR | 50 | NOT NULL, UNIQUE |
| email | VARCHAR | 100 | NOT NULL, UNIQUE |
| password_hash | VARCHAR | 255 | NOT NULL |
| created_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP |

---

## BẢNG 14: email_verifications

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| email | VARCHAR | 100 | NOT NULL |
| verification_code | VARCHAR | 10 | NOT NULL |
| expires_at | DATETIME | | NOT NULL |

---

## BẢNG 15: marketing_campaigns

| Tên Trường | Kiểu Dữ Liệu | Kích Thước | Ràng Buộc |
|------------|--------------|------------|-----------|
| campaign_id | INT | | PRIMARY KEY, AUTO_INCREMENT |
| title | VARCHAR | 255 | NOT NULL |
| subject | VARCHAR | 255 | NOT NULL |
| html_content | LONGTEXT | | NOT NULL |
| total_recipients | INT | | DEFAULT 0 |
| sent_count | INT | | DEFAULT 0 |
| failed_count | INT | | DEFAULT 0 |
| status | ENUM | | DEFAULT 'sending' |
| created_at | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP |
| completed_at | TIMESTAMP | | |

**Ràng buộc bổ sung:**
- INDEX (status)
- INDEX (created_at)
- ENGINE = InnoDB
- CHARSET = utf8mb4
- COLLATE = utf8mb4_unicode_ci

---

## GHI CHÚ VỀ CÁC KIỂU DỮ LIỆU ENUM

**users.level:**
- Giá trị: 'A1', 'B1', 'C1'

**readings.level:**
- Giá trị: 'A1', 'B1', 'C1'

**record_feedback.error_type:**
- Giá trị: 'pronunciation', 'intonation', 'fluency', 'speed'

**chat_messages.role:**
- Giá trị: 'user', 'assistant'

**feedbacks.status:**
- Giá trị: 'pending', 'replied'

**marketing_campaigns.status:**
- Giá trị: 'sending', 'completed', 'failed'

---

**Ngày tạo:** 27/11/2025  
**Phiên bản:** 1.0  
**Tổng số bảng:** 15 bảng
