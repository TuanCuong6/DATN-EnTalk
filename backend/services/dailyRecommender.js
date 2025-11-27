// backend/services/dailyRecommender.js
const db = require("../config/db");
const { generateSmartSuggestion } = require("./geminiSuggest");
const { sendPushNotification } = require("./notification");

function shorten(text, maxLength = 50) {
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

const suggestionStrategies = [
  // 1. Gợi ý bài tự nhập điểm thấp chưa cải thiện
  async (userId) => {
    const [customs] = await db.execute(
      `SELECT custom_text, MIN(score_overall) as min_score, MAX(score_overall) as max_score
       FROM records
       WHERE user_id = ? AND custom_text IS NOT NULL
       GROUP BY custom_text
       HAVING MIN(score_overall) < 7 AND MAX(score_overall) < 8
       ORDER BY MAX(created_at) ASC 
       LIMIT 1`,
      [userId]
    );

    if (customs.length > 0) {
      const shortText = shorten(customs[0].custom_text);
      return {
        title: "Luyện lại bài tự nhập",
        body: `Bài: \"${shortText}\" có điểm ${customs[0].max_score.toFixed(1)}, hãy thử cải thiện nhé!`,
        data: {
          customText: customs[0].custom_text,
          suggestionReason: "Điểm thấp chưa cải thiện",
        },
      };
    }
    return null;
  },

  // 2. Gợi ý bài hệ thống từng luyện có điểm thấp
  async (userId) => {
    const [readings] = await db.execute(
      `SELECT r.reading_id, r.id AS record_id, rd.content, MAX(r.score_overall) as max_score
       FROM records r
       JOIN readings rd ON r.reading_id = rd.id
       WHERE r.user_id = ? 
       AND rd.created_by IS NULL
       GROUP BY r.reading_id
       HAVING MAX(r.score_overall) < 7.5
       ORDER BY MAX(r.created_at) ASC 
       LIMIT 1`,
      [userId]
    );

    if (readings.length > 0) {
      const shortText = shorten(readings[0].content);
      return {
        title: "Luyện lại bài hệ thống",
        body: `Bài: \"${shortText}\" điểm ${readings[0].max_score.toFixed(1)}, thử lại nhé!`,
        data: {
          readingId: readings[0].reading_id.toString(),
          recordId: readings[0].record_id.toString(),
          suggestionReason: "Điểm thấp chưa cải thiện",
        },
      };
    }
    return null;
  },

  // 3. Bài hệ thống chưa từng luyện
  async (userId) => {
    const [unread] = await db.execute(
      `SELECT id, content FROM readings
       WHERE created_by IS NULL
       AND id NOT IN (SELECT DISTINCT reading_id FROM records WHERE user_id = ? AND reading_id IS NOT NULL)
       ORDER BY RAND()
       LIMIT 1`,
      [userId]
    );

    if (unread.length > 0) {
      const shortText = shorten(unread[0].content);
      return {
        title: "🆕 Bài mới cho bạn",
        body: `Thử đọc bài: \"${shortText}\" nhé!`,
        data: {
          readingId: unread[0].id.toString(),
          suggestionReason: "Bài chưa luyện",
        },
      };
    }
    return null;
  },

  // 4. Chủ đề ít luyện (bài hệ thống)
  async (userId) => {
    // Tìm chủ đề ít luyện nhất
    const [topics] = await db.execute(
      `SELECT t.id AS topic_id, t.name, COUNT(DISTINCT rec.id) as practice_count
       FROM topics t
       LEFT JOIN readings r ON r.topic_id = t.id AND r.created_by IS NULL
       LEFT JOIN records rec ON rec.reading_id = r.id AND rec.user_id = ?
       GROUP BY t.id
       ORDER BY practice_count ASC, RAND()
       LIMIT 1`,
      [userId]
    );

    if (topics.length > 0) {
      const topicId = topics[0].topic_id;
      // Tìm 1 bài chưa đọc hoặc ít đọc trong chủ đề đó
      const [reading] = await db.execute(
        `SELECT r.id, r.content
         FROM readings r
         LEFT JOIN records rec ON rec.reading_id = r.id AND rec.user_id = ?
         WHERE r.topic_id = ? AND r.created_by IS NULL
         GROUP BY r.id
         ORDER BY COUNT(rec.id) ASC, RAND()
         LIMIT 1`,
        [userId, topicId]
      );

      if (reading.length > 0) {
        const shortText = shorten(reading[0].content);
        return {
          title: `Chủ đề: ${topics[0].name}`,
          body: `Thử bài này: \"${shortText}\"`,
          data: {
            readingId: reading[0].id.toString(),
            suggestionReason: "Chủ đề ít luyện",
          },
        };
      }
    }
    return null;
  },

  // 5. AI đề xuất sinh đoạn văn mới (không dùng bài đọc cũ)
  async (userId) => {
    const [recent] = await db.execute(
      `SELECT transcript, score_overall FROM records
       WHERE user_id = ? AND transcript IS NOT NULL
       ORDER BY created_at DESC LIMIT 3`,
      [userId]
    );

    // Nếu chưa có lịch sử, tạo gợi ý chung
    const recordsToAnalyze = recent.length > 0 ? recent : [
      { transcript: "Hello, how are you today?", score_overall: 5.0 }
    ];

    try {
      const result = await generateSmartSuggestion(recordsToAnalyze);
      const suggestionText = result.suggestion || "";
      const shortText = shorten(suggestionText);

      return {
        title: "Gợi ý từ AI",
        body: `AI gợi ý bài mới: \"${shortText}\"`,
        data: {
          customText: suggestionText,
          suggestionReason: `AI đề xuất luyện thêm ${result.focus}`,
        },
      };
    } catch (err) {
      console.error("❌ Lỗi tạo gợi ý AI:", err.message);
      return null;
    }
  },
];

async function recommendOnce() {
  console.log("🚀 Bắt đầu gợi ý luyện tập cho từng người...");

  const [users] = await db.execute(
    "SELECT id, fcm_token, last_suggestion_type FROM users WHERE fcm_token IS NOT NULL"
  );

  for (const user of users) {
    const userId = user.id;
    const lastType = user.last_suggestion_type || 0;

    let suggestionSent = false;

    // Thử tất cả các chiến lược theo vòng xoay
    for (let offset = 1; offset <= suggestionStrategies.length; offset++) {
      const currentType = (lastType + offset) % suggestionStrategies.length;
      
      console.log(`🔍 User ${userId}: Thử tiêu chí ${currentType}...`);
      
      try {
        const suggestion = await suggestionStrategies[currentType](userId);

        if (suggestion) {
          try {
            await sendPushNotification(
              user.fcm_token,
              suggestion.title,
              suggestion.body,
              suggestion.data
            );

            await db.execute(
              `INSERT INTO notifications (user_id, title, body, reading_id, custom_text, record_id)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                userId,
                suggestion.title,
                suggestion.body,
                suggestion.data.readingId || null,
                suggestion.data.customText || null,
                suggestion.data.recordId || null,
              ]
            );

            await db.execute(
              `UPDATE users SET last_suggestion_type = ? WHERE id = ?`,
              [currentType, userId]
            );

            console.log(
              `✅ User ${userId}: Gửi thành công tiêu chí ${currentType} - ${suggestion.title}`
            );
            suggestionSent = true;
            break; // Gửi 1 thông báo duy nhất
          } catch (err) {
            console.error(`❌ Gửi thất bại user ${userId}:`, err.message);
          }
        } else {
          console.log(`⚠️ User ${userId}: Tiêu chí ${currentType} không có gợi ý`);
        }
      } catch (err) {
        console.error(`❌ User ${userId}: Lỗi tiêu chí ${currentType}:`, err.message);
      }
    }

    if (!suggestionSent) {
      console.log(`⚠️ User ${userId}: Không tìm được gợi ý phù hợp`);
    }
  }

  console.log("🎉 Hoàn tất gửi gợi ý cho toàn bộ người dùng");
}

module.exports = { recommendOnce };
