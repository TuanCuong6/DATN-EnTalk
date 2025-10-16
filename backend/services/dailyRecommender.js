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
      `SELECT custom_text FROM records
       WHERE user_id = ? AND custom_text IS NOT NULL
       AND custom_text NOT IN (
         SELECT custom_text FROM notifications
         WHERE user_id = ? AND custom_text IS NOT NULL
         GROUP BY custom_text HAVING COUNT(*) >= 2
       )
       GROUP BY custom_text
       HAVING MIN(score_overall) < 6 AND MAX(score_overall) < 7.5
       ORDER BY MAX(created_at) ASC LIMIT 1`,
      [userId, userId]
    );

    if (customs.length > 0) {
      const shortText = shorten(customs[0].custom_text);
      return {
        title: "📉 Luyện lại bài tự nhập",
        body: `Bài: \"${shortText}\" có điểm thấp, hãy thử cải thiện nhé!`,
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
      `SELECT r.reading_id, r.id AS record_id, rd.content
       FROM records r
       JOIN readings rd ON r.reading_id = rd.id
       WHERE r.user_id = ? AND r.score_overall < 7.5
       AND r.reading_id NOT IN (
         SELECT reading_id FROM notifications
         WHERE user_id = ? AND reading_id IS NOT NULL
         GROUP BY reading_id HAVING COUNT(*) >= 2
       )
       ORDER BY r.created_at ASC LIMIT 1`,
      [userId, userId]
    );

    if (readings.length > 0) {
      const shortText = shorten(readings[0].content);
      return {
        title: "📉 Luyện lại bài hệ thống",
        body: `Bài: \"${shortText}\" bạn từng luyện có điểm thấp, thử lại nhé!`,
        data: {
          readingId: readings[0].reading_id.toString(),
          recordId: readings[0].record_id.toString(),
          suggestionReason: "Điểm thấp chưa cải thiện",
        },
      };
    }
    return null;
  },

  // 3. Bài chưa từng luyện
  async (userId) => {
    const [unread] = await db.execute(
      `SELECT id, content FROM readings
       WHERE id NOT IN (SELECT reading_id FROM records WHERE user_id = ?)
       AND id NOT IN (
         SELECT reading_id FROM notifications
         WHERE user_id = ? AND reading_id IS NOT NULL
         GROUP BY reading_id HAVING COUNT(*) >= 2
       )
       ORDER BY created_at DESC LIMIT 1`,
      [userId, userId]
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

  // 4. Chủ đề ít luyện
  async (userId) => {
    const [topics] = await db.execute(
      `SELECT t.id AS topic_id FROM topics t
       LEFT JOIN readings r ON r.topic_id = t.id
       LEFT JOIN records rec ON rec.reading_id = r.id AND rec.user_id = ?
       GROUP BY t.id ORDER BY COUNT(rec.id) ASC LIMIT 1`,
      [userId]
    );

    if (topics.length > 0) {
      const topicId = topics[0].topic_id;
      const [reading] = await db.execute(
        `SELECT id, content FROM readings
         WHERE topic_id = ? AND id NOT IN (
           SELECT reading_id FROM records WHERE user_id = ?
         ) AND id NOT IN (
           SELECT reading_id FROM notifications
           WHERE user_id = ? AND reading_id IS NOT NULL
           GROUP BY reading_id HAVING COUNT(*) >= 2
         )
         LIMIT 1`,
        [topicId, userId, userId]
      );

      if (reading.length > 0) {
        const shortText = shorten(reading[0].content);
        return {
          title: "📚 Chủ đề ít luyện",
          body: `Thử bài mới trong chủ đề này: \"${shortText}\"`,
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

    if (recent.length > 0) {
      const result = await generateSmartSuggestion(recent);
      const suggestionText = result.suggestion || "";
      const shortText = shorten(suggestionText);

      // Kiểm tra nếu đoạn văn AI này từng được gửi rồi thì bỏ qua
      const [exist] = await db.execute(
        `SELECT COUNT(*) AS total FROM notifications
         WHERE user_id = ? AND custom_text = ?`,
        [userId, suggestionText]
      );

      if (exist[0].total >= 2) return null;

      return {
        title: "🎯 Gợi ý từ AI",
        body: `AI gợi ý bài: \"${shortText}\" (${result.focus})`,
        data: {
          customText: suggestionText,
          suggestionReason: `AI đề xuất luyện thêm ${result.focus}`,
        },
      };
    }
    return null;
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

    for (let offset = 1; offset <= suggestionStrategies.length; offset++) {
      const currentType = (lastType + offset) % suggestionStrategies.length;
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
            `✅ Gửi gợi ý cho user ${userId} theo tiêu chí ${currentType}`
          );
        } catch (err) {
          console.error(`❌ Gửi thất bại user ${userId}:`, err.message);
        }

        break; // Gửi 1 thông báo duy nhất
      }
    }
  }

  console.log("🎉 Hoàn tất gửi gợi ý cho toàn bộ người dùng");
}

module.exports = { recommendOnce };
