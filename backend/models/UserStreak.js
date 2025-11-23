// backend/models/UserStreak.js
const db = require("../config/db");

class UserStreak {
  // Lấy thông tin streak của user
  static async getStreak(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM user_streaks WHERE user_id = ?",
      [userId]
    );
    return rows[0] || null;
  }

  // Tạo streak mới cho user (bắt đầu từ 1)
  static async createStreak(userId) {
    const [result] = await db.execute(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, streak_freeze_count, last_freeze_reset_month) 
       VALUES (?, 1, 1, 3, MONTH(CURRENT_TIMESTAMP))`,
      [userId]
    );
    return result.insertId;
  }

  // Cập nhật streak khi user luyện đọc
  static async updateStreak(userId, vnDate) {
    let streak = await this.getStreak(userId);
    
    if (!streak) {
      await this.createStreak(userId);
      streak = await this.getStreak(userId);
    }

    const today = vnDate;
    const lastPractice = streak.last_practice_date;
    
    // Reset freeze count nếu sang tháng mới
    const currentMonth = new Date().getMonth() + 1;
    if (streak.last_freeze_reset_month !== currentMonth) {
      await db.execute(
        "UPDATE user_streaks SET streak_freeze_count = 3, last_freeze_reset_month = ? WHERE user_id = ?",
        [currentMonth, userId]
      );
      streak.streak_freeze_count = 3;
    }

    // Nếu chưa có lần luyện nào - giữ nguyên streak = 1, chỉ cập nhật ngày
    if (!lastPractice) {
      await db.execute(
        `UPDATE user_streaks 
         SET last_practice_date = ?, longest_streak = GREATEST(longest_streak, 1)
         WHERE user_id = ?`,
        [today, userId]
      );
      return { current_streak: 1, is_new: true, first_time: true };
    }

    const lastDate = new Date(lastPractice);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Đã luyện hôm nay rồi
    if (diffDays === 0) {
      return { current_streak: streak.current_streak, is_new: false };
    }

    // Luyện liên tiếp ngày hôm sau
    if (diffDays === 1) {
      const newStreak = streak.current_streak + 1;
      await db.execute(
        `UPDATE user_streaks 
         SET current_streak = ?, longest_streak = GREATEST(longest_streak, ?), last_practice_date = ? 
         WHERE user_id = ?`,
        [newStreak, newStreak, today, userId]
      );
      return { current_streak: newStreak, is_new: true };
    }

    // Bỏ 1 ngày - có thể phục hồi
    if (diffDays === 2 && streak.streak_freeze_count > 0) {
      // Phục hồi streak
      await db.execute(
        `UPDATE user_streaks 
         SET streak_freeze_count = streak_freeze_count - 1, last_practice_date = ? 
         WHERE user_id = ?`,
        [today, userId]
      );
      return { current_streak: streak.current_streak, is_new: true, recovered: true };
    }

    // Bỏ quá 2 ngày hoặc hết lượt phục hồi - reset về 1 và cập nhật ngày
    await db.execute(
      `UPDATE user_streaks 
       SET current_streak = 1, last_practice_date = ? 
       WHERE user_id = ?`,
      [today, userId]
    );
    return { current_streak: 1, is_new: true, reset: true };
  }
}

module.exports = UserStreak;
