// backend/controllers/historyController.js
const db = require("../config/db");

// 📈 Dữ liệu cho biểu đồ tiến bộ - ĐÃ SỬA
exports.getChartData = async (req, res) => {
  const userId = req.user.id;
  const range = req.query.range || "7";

  try {
    let dateFilter = "";
    if (range !== "all") {
      const days = parseInt(range);
      if (!isNaN(days)) {
        dateFilter = `
          AND DATE(r.created_at) BETWEEN 
              DATE_SUB(CURDATE(), INTERVAL ${days - 1} DAY)
              AND CURDATE()
        `;
      }
    }

    const [rows] = await db.execute(
      `
      SELECT DATE(r.created_at) AS date,
             ROUND(AVG(score_overall), 2) AS avg_score
      FROM records r
      WHERE r.user_id = ? ${dateFilter}
        AND r.score_overall IS NOT NULL
      GROUP BY DATE(r.created_at)
      ORDER BY DATE(r.created_at)
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy dữ liệu biểu đồ:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🧾 Danh sách bản ghi mới nhất - ĐÃ SỬA
exports.getRecordList = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `
      SELECT r.id, r.reading_id, r.score_overall,
             r.score_pronunciation, r.score_fluency, r.score_intonation,
             r.created_at, 
             COALESCE(r.original_content, rd.content) AS content,
             rd.topic_id, rd.is_community_post, tp.name AS topic_name,
             DATE_FORMAT(CONVERT_TZ(r.created_at, '+00:00', '+07:00'), '%Y-%m-%d %H:%i:%s') AS local_created_at
      FROM records r
      LEFT JOIN readings rd ON r.reading_id = rd.id
      LEFT JOIN topics tp ON rd.topic_id = tp.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách lịch sử:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 📆 Danh sách bản ghi theo ngày cụ thể - ĐÃ SỬA (FIX AMBIGUOUS COLUMN)
exports.getRecordsByDate = async (req, res) => {
  const userId = req.user.id;
  const date = req.query.date;

  try {
    const [rows] = await db.execute(
      `
      SELECT r.id, r.reading_id, r.score_overall,
             r.score_pronunciation, r.score_fluency, r.score_intonation,
             r.created_at, 
             COALESCE(r.original_content, rd.content) AS content,
             rd.topic_id, rd.is_community_post, tp.name AS topic_name,
             DATE_FORMAT(CONVERT_TZ(r.created_at, '+00:00', '+07:00'), '%H:%i') AS display_time
      FROM records r
      LEFT JOIN readings rd ON r.reading_id = rd.id
      LEFT JOIN topics tp ON rd.topic_id = tp.id
      WHERE r.user_id = ? AND DATE(r.created_at) = ?
      ORDER BY r.created_at DESC
      `,
      [userId, date]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi lấy records theo ngày:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🔍 Chi tiết bản ghi - ĐÃ SỬA
exports.getRecordDetail = async (req, res) => {
  const userId = req.user.id;
  const recordId = req.params.id;

  try {
    const [rows] = await db.execute(
      `
      SELECT r.id, r.reading_id, r.transcript, r.comment, r.original_content,
             r.score_overall, r.score_pronunciation, r.score_fluency,
             r.score_intonation, r.score_speed, r.created_at, r.word_analysis,
             COALESCE(r.original_content, rd.content) AS reading_content,
             rd.is_community_post, rd.topic_id, tp.name AS topic_name
      FROM records r
      LEFT JOIN readings rd ON r.reading_id = rd.id
      LEFT JOIN topics tp ON rd.topic_id = tp.id
      WHERE r.id = ? AND r.user_id = ?
      `,
      [recordId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    const record = rows[0];
    
    // Parse word_analysis nếu là JSON string
    if (record.word_analysis && typeof record.word_analysis === 'string') {
      try {
        record.word_analysis = JSON.parse(record.word_analysis);
      } catch (err) {
        console.error('❌ Lỗi parse word_analysis:', err);
        record.word_analysis = [];
      }
    }

    res.json(record);
  } catch (err) {
    console.error("❌ Lỗi lấy chi tiết bản ghi:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🆕 Danh sách bản ghi gần đây - ĐÃ SỬA
exports.getRecentRecords = async (req, res) => {
  const userId = req.user.id;
  const { topic_id, limit, page = 1 } = req.query;

  const finalLimit = [5, 10].includes(Number(limit)) ? Number(limit) : 10;
  const pageNum = Math.max(parseInt(page), 1);
  const offset = (pageNum - 1) * finalLimit;

  let params = [userId];
  let countParams = [userId];
  let topicFilter = "";

  if (topic_id) {
    topicFilter = "AND rd.topic_id = ?";
    params.push(topic_id);
    countParams.push(topic_id);
  }

  const dataSql = `
    SELECT r.id, r.reading_id, r.score_overall,
           r.score_pronunciation, r.score_fluency, r.score_intonation,
           r.created_at, 
           COALESCE(r.original_content, rd.content) AS content,
           rd.topic_id, rd.is_community_post, tp.name AS topic_name
    FROM records r
    LEFT JOIN readings rd ON r.reading_id = rd.id
    LEFT JOIN topics tp ON rd.topic_id = tp.id
    WHERE r.user_id = ? ${topicFilter}
    ORDER BY r.created_at DESC
    LIMIT ${finalLimit} OFFSET ${offset}
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM records r
    LEFT JOIN readings rd ON r.reading_id = rd.id
    WHERE r.user_id = ? ${topicFilter}
  `;

  try {
    const [[{ total }]] = await db.execute(countSql, countParams);
    const [rows] = await db.execute(dataSql, params);
    res.json({ total, records: rows });
  } catch (err) {
    console.error("❌ Lỗi lấy bản ghi gần đây:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};