//backend/services/geminiSuggest.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT_TEMPLATE = `
Bạn là chuyên gia huấn luyện phát âm tiếng Anh.

Tôi sẽ cung cấp cho bạn lịch sử đọc gần đây của một người học, bao gồm văn bản họ đã đọc (từ giọng nói) và điểm tổng thể mà hệ thống đánh giá.

Hãy phân tích điểm mạnh và điểm yếu, sau đó đề xuất:
- Một kỹ năng cần cải thiện (chỉ chọn 1 trong các kỹ năng: phát âm, ngữ điệu, lưu loát, tốc độ)
- Một chủ đề tiếng Anh nên luyện thêm (ví dụ: Du lịch, Khoa học, Tin tức, Thám hiểm, Sức khỏe, Gia đình, Công nghệ, Thể thao, Ẩm thực, Môi trường…)
- Một đoạn văn mẫu HOÀN TOÀN MỚI để luyện thêm (viết bằng tiếng Anh, độ dài khoảng 2-3 câu, nội dung phải khác hoàn toàn với các bài đã đọc trước đó)

QUAN TRỌNG: 
- Đoạn văn phải SÁNG TẠO, KHÁC BIỆT mỗi lần gọi
- KHÔNG lặp lại nội dung từ lịch sử đọc
- Tạo câu chuyện, tình huống, hoặc thông tin mới lạ
- Đa dạng về chủ đề và từ vựng

Chỉ trả về kết quả đúng định dạng JSON, không markdown, không giải thích:

{
  "focus": "ngữ điệu",
  "topic": "Khoa học",
  "suggestion": "Scientists recently discovered a new species of butterfly in the Amazon rainforest. This colorful insect has unique patterns on its wings that help it blend with flowers."
}

Dưới đây là lịch sử luyện tập (tối đa 3 bản ghi gần nhất):

{{transcriptWithScores}}
`;

function buildPrompt(records) {
  const transcriptWithScores = records
    .map((r, i) => {
      return `#${i + 1}\nTranscript: ${r.transcript}\nScore: ${
        r.score_overall
      }`;
    })
    .join("\n\n");

  return PROMPT_TEMPLATE.replace(
    "{{transcriptWithScores}}",
    transcriptWithScores
  );
}

async function generateSmartSuggestion(records) {
  const prompt = buildPrompt(records);

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🎯 Gemini Suggestion Response:", text);

    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error(
      "❌ Lỗi gọi Gemini Suggest:",
      err.response?.data || err.message
    );
    throw new Error("Không thể tạo gợi ý luyện tập với Gemini");
  }
}

module.exports = { generateSmartSuggestion };
