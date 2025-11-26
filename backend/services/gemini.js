// backend/services/gemini.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const PROMPT_TEMPLATE = `
Bạn là chuyên gia đánh giá phát âm tiếng Anh với kiến thức sâu về ngữ âm học và IPA (International Phonetic Alphabet).

**Văn bản người dùng đã đọc (chuyển từ giọng nói):**
"""{{transcript}}"""

{{#if originalText}}
**Văn bản gốc cần so sánh:**
"""{{originalText}}"""
{{/if}}

**Tiêu chí đánh giá (thang điểm 0-10):**

**QUAN TRỌNG NHẤT - ĐỘ HOÀN THÀNH:**
- Đếm số câu trong văn bản gốc (phân tách bằng dấu chấm ., !, ?)
- Đếm số câu người dùng đã đọc trong transcript
- Tính % hoàn thành = (số câu đã đọc / tổng số câu) × 100
- **ĐIỂM TỔNG THỂ TỐI ĐA = % hoàn thành × 10 / 100**
- **NẾU KHÔNG ĐỌC HẾT, ĐIỂM TỔNG THỂ KHÔNG BAO GIỜ VƯỢT QUÁ ĐIỂM TỐI ĐA NÀY**

1. **Phát âm (0-10)**: Độ chính xác của từng âm vị, nguyên âm, phụ âm trong PHẦN ĐÃ ĐỌC.

2. **Ngữ điệu (0-10)**: Trọng âm, biến thiên cao độ, nhịp điệu trong PHẦN ĐÃ ĐỌC.

3. **Trôi chảy (0-10)**: Độ mượt mà, ngập ngừng, dừng nghỉ trong PHẦN ĐÃ ĐỌC.

4. **Tốc độ (0-10)**: Tốc độ nói phù hợp trong PHẦN ĐÃ ĐỌC.

5. **Tổng thể (0-10)**: Tính điểm dựa trên 4 tiêu chí trên NHƯNG PHẢI ÁP DỤNG GIỚI HẠN DỰA TRÊN % HOÀN THÀNH.

**HƯỚNG DẪN QUAN TRỌNG:**
- Cho điểm ĐA DẠNG dựa trên hiệu suất thực tế
- Hãy TRUNG THỰC và CỤ THỂ trong chấm điểm
- **NẾU ĐỌC THIẾU CÂU**: Nhắc nhở tự nhiên, thân thiện
- **KHÔNG NÊU ĐIỂM SỐ CỤ THỂ** trong nhận xét
- **NHẬN XÉT PHẢI VIẾT BẰNG TIẾNG VIỆT, GIỌNG ĐIỆU TỰ NHIÊN, THÂN THIỆN**

**Chỉ trả về JSON hợp lệ (không markdown, không giải thích):**

{
  "scores": {
    "pronunciation": 7.2,
    "intonation": 6.5,
    "fluency": 8.3,
    "speed": 7.8,
    "overall": 7.4
  },
  "comment": "Nhận xét chi tiết BẰNG TIẾNG VIỆT, tự nhiên, thân thiện.",
  "wordAnalysis": [
    {
      "word": "Paris",
      "ipa": "/ˈpærɪs/",
      "meaning": "thủ đô của Pháp",
      "wordType": "noun"
    }
  ]
}

**Lưu ý về wordAnalysis:**
- Bao gồm TẤT CẢ các từ từ văn bản gốc
- Mỗi từ phải có: word, ipa, meaning (tiếng Việt), wordType
- IPA phải chính xác theo chuẩn quốc tế
`;

function buildPrompt(transcript, originalText) {
  let prompt = PROMPT_TEMPLATE.replace("{{transcript}}", transcript);

  if (originalText) {
    prompt = prompt.replace("{{#if originalText}}", "");
    prompt = prompt.replace("{{originalText}}", originalText);
    prompt = prompt.replace("{{/if}}", "");
  } else {
    prompt = prompt.replace(/{{#if originalText}}[\s\S]*?{{\/if}}/, "");
  }

  return prompt;
}

async function scoreWithGemini(transcript, originalText = null) {
  const prompt = buildPrompt(transcript, originalText);

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🎯 Gemini response:", text);

    let cleaned = text;
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) cleaned = match[1].trim();

    const parsed = JSON.parse(cleaned);
    
    if (!parsed.scores || !parsed.comment) {
      throw new Error("Invalid response structure from Gemini");
    }
    
    if (!parsed.wordAnalysis) {
      parsed.wordAnalysis = [];
    }
    
    return parsed;
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err.response?.data || err.message);
    
    if (err.response?.status === 429) {
      throw new Error("Hệ thống đang quá tải, vui lòng thử lại sau.");
    } else if (err.response?.status >= 500) {
      throw new Error("Lỗi từ phía Gemini, vui lòng thử lại sau.");
    } else if (err instanceof SyntaxError) {
      throw new Error("Không thể phân tích kết quả chấm điểm. Vui lòng thử lại.");
    } else {
      throw new Error("Không thể chấm điểm với Gemini lúc này.");
    }
  }
}

module.exports = { scoreWithGemini };
