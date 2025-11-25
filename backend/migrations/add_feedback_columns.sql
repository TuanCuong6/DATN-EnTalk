-- Thêm các cột mới cho bảng feedbacks
ALTER TABLE feedbacks 
ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER user_email,
ADD COLUMN type ENUM('bug', 'feature', 'feedback', 'other') DEFAULT 'feedback' AFTER title,
ADD COLUMN admin_note TEXT AFTER admin_reply,
MODIFY COLUMN status ENUM('pending', 'in_progress', 'resolved', 'closed', 'replied') DEFAULT 'pending';
