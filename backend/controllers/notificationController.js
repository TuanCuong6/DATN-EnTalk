//backend/controllers/notificationController.js
const db = require("../config/db");

// Lưu FCM token
exports.saveFcmToken = async (req, res) => {
  const { fcm_token } = req.body;
  if (!fcm_token) return res.status(400).json({ message: "Thiếu FCM token" });

  try {
    await db.execute("UPDATE users SET fcm_token = ? WHERE id = ?", [
      fcm_token,
      req.user.id,
    ]);
    res.json({ message: "Đã lưu fcm_token" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông báo", error: err.message });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Thiếu ID" });

  try {
    await db.execute(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );
    res.json({ message: "Đã đánh dấu đã đọc" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật", error: err.message });
  }
};
