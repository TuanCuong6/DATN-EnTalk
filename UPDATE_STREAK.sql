-- Tắt safe mode tạm thời
SET SQL_SAFE_UPDATES = 0;

-- Cập nhật tất cả streak = 0 thành streak = 1
UPDATE user_streaks SET current_streak = 1 WHERE current_streak = 0;

-- Bật lại safe mode
SET SQL_SAFE_UPDATES = 1;

-- Hoặc nếu muốn xóa hết và tạo lại khi user luyện (chọn 1 trong 2)
-- DELETE FROM user_streaks WHERE id > 0;
