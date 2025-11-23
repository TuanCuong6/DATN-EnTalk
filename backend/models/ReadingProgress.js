// backend/models/ReadingProgress.js
const db = require("../config/db");

/**
 * Cập nhật tiến độ đọc của user
 * Tự động được gọi khi user hoàn thành bài đọc (có điểm)
 */
async function updateProgress(userId, readingId, score) {
  try {
    // Kiểm tra xem đã có progress chưa
    const [existing] = await db.execute(
      `SELECT * FROM reading_progress WHERE user_id = ? AND reading_id = ?`,
      [userId, readingId]
    );

    const now = new Date();

    if (existing.length > 0) {
      // Đã có progress -> cập nhật
      const current = existing[0];
      const newBestScore = Math.max(current.best_score || 0, score);
      const isCompleted = current.is_completed || score >= 5; // Điểm >= 5 là hoàn thành

      await db.execute(
        `UPDATE reading_progress 
         SET best_score = ?,
             is_completed = ?,
             completed_at = COALESCE(completed_at, ?),
             last_practiced_at = ?,
             practice_count = practice_count + 1
         WHERE user_id = ? AND reading_id = ?`,
        [
          newBestScore,
          isCompleted,
          isCompleted ? now : null,
          now,
          userId,
          readingId,
        ]
      );
    } else {
      // Chưa có progress -> tạo mới
      const isCompleted = score >= 5;

      await db.execute(
        `INSERT INTO reading_progress 
         (user_id, reading_id, is_completed, best_score, completed_at, last_practiced_at, practice_count)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [userId, readingId, isCompleted, score, isCompleted ? now : null, now]
      );
    }

    return { success: true };
  } catch (err) {
    console.error("❌ Lỗi cập nhật reading progress:", err);
    throw err;
  }
}

/**
 * Lấy tiến độ của user cho 1 bài đọc cụ thể
 */
async function getProgressByReading(userId, readingId) {
  const [rows] = await db.execute(
    `SELECT * FROM reading_progress WHERE user_id = ? AND reading_id = ?`,
    [userId, readingId]
  );
  return rows[0] || null;
}

/**
 * Lấy tất cả tiến độ của user theo topic
 */
async function getProgressByTopic(userId, topicId) {
  const [rows] = await db.execute(
    `SELECT rp.*, r.content, r.level 
     FROM reading_progress rp
     JOIN readings r ON rp.reading_id = r.id
     WHERE rp.user_id = ? AND r.topic_id = ?`,
    [userId, topicId]
  );
  return rows;
}

/**
 * Lấy thống kê tiến độ theo topic cho user
 */
async function getTopicProgressStats(userId, topicId) {
  const [stats] = await db.execute(
    `SELECT 
       COUNT(r.id) as total_readings,
       COUNT(rp.id) as practiced_readings,
       SUM(CASE WHEN rp.is_completed = TRUE THEN 1 ELSE 0 END) as completed_readings
     FROM readings r
     LEFT JOIN reading_progress rp ON r.id = rp.reading_id AND rp.user_id = ?
     WHERE r.topic_id = ? AND r.is_community_post = FALSE`,
    [userId, topicId]
  );
  return stats[0] || { total_readings: 0, practiced_readings: 0, completed_readings: 0 };
}

module.exports = {
  updateProgress,
  getProgressByReading,
  getProgressByTopic,
  getTopicProgressStats,
};
