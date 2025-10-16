//backend//controllers/topicController.js
const db = require("../config/db");

exports.getAllTopics = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM topics");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy chủ đề", error: err.message });
  }
};
