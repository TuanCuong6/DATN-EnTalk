//backend//controllers/topicController.js
const db = require("../config/db");
const ReadingProgress = require("../models/ReadingProgress");

// Lấy tất cả topics với thống kê tiến độ cho user hiện tại
exports.getAllTopics = async (req, res) => {
  try {
    const userId = req.user?.id; // Lấy từ auth middleware
    const [topics] = await db.execute("SELECT * FROM topics");

    // Nếu có userId, thêm thống kê tiến độ
    if (userId) {
      const topicsWithProgress = await Promise.all(
        topics.map(async (topic) => {
          const stats = await ReadingProgress.getTopicProgressStats(
            userId,
            topic.id
          );
          return {
            ...topic,
            total_readings: stats.total_readings,
            completed_readings: stats.completed_readings,
            completion_percentage:
              stats.total_readings > 0
                ? Math.round(
                    (stats.completed_readings / stats.total_readings) * 100
                  )
                : 0,
          };
        })
      );
      return res.json(topicsWithProgress);
    }

    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy chủ đề", error: err.message });
  }
};
