// backend/services/gemini.js
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_KEY2 = process.env.GEMINI_API_KEY2;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_URL2 = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY2}`;

// PROMPT 1: CHỈ CHẤM ĐIỂM (Key 1)
const SCORING_PROMPT = `
Bạn là chuyên gia đánh giá phát âm tiếng Anh. Nhiệm vụ: So sánh văn bản gốc với transcript và chấm điểm theo tiêu chí chi tiết.

**Văn bản gốc (Original Text):**
"""{{originalText}}"""

**Văn bản người dùng đã đọc (Transcript):**
"""{{transcript}}"""

---

## BƯỚC 1: PHÂN TÍCH SỐ LƯỢNG TỪ

1. Đếm tổng số từ trong văn bản gốc (không tính dấu câu)
2. Đếm số từ người dùng đã đọc trong transcript
3. Tính % hoàn thành = (số từ đã đọc / tổng số từ gốc) × 100

**QUY TẮC GIỚI HẠN ĐIỂM THEO % HOÀN THÀNH:**
- Nếu đọc < 30% nội dung → ĐIỂM TỐI ĐA = 3.0
- Nếu đọc 30-50% nội dung → ĐIỂM TỐI ĐA = 5.0
- Nếu đọc > 50% nội dung → Không giới hạn, chấm bình thường

---

## BƯỚC 2: PHÂN TÍCH CHI TIẾT CÁC LỖI

So sánh từng từ giữa Original Text và Transcript, phân loại lỗi:

### A. LỖI NẶNG (trừ 0.5-1.0 điểm/lỗi):
- **Sai từ hoàn toàn**: "cat" → "dog"
- **Thiếu từ quan trọng**: "You must study" → "You study" (thiếu "must")
- **Thêm từ làm sai nghĩa**: "I like cats" → "I don't like cats"
- **Sai phủ định**: "I am happy" → "I am not happy"
- **Sai thì động từ**: "She is reading" → "She read"
- **Đảo thứ tự nhiều, khó hiểu**: "She quickly ran home" → "Home ran she quickly"

### B. LỖI TRUNG BÌNH (trừ 0.2-0.4 điểm/lỗi):
- **Sai mạo từ**: "The cat" → "A cat"
- **Sai giới từ**: "at school" → "in school"
- **Sai trạng từ**: "every morning" → "every day"
- **Thiếu từ không quan trọng**: "It's very very cold" → "It's very cold"
- **Sai cấu trúc câu hỏi**: "What is this?" → "This is what?"
- **Đảo thứ tự ít, nghĩa không đổi**: "I have a car" → "A car I have"

### C. LỖI NHẸ (trừ 0.1-0.15 điểm/lỗi):
- **Từ đồng nghĩa**: "very cold" → "really cold"
- **Thêm từ filler**: "Nice to meet you" → "Uhm... nice to meet you"
- **Accent Việt (phát âm sai nhưng từ đúng)**: "think" → "tink", "very" → "bery"

---

## BƯỚC 3: TÍNH ĐIỂM TỔNG THỂ (overall)

**Công thức:**
\`\`\`
Điểm = 10 - (Số lỗi nặng × 0.5-1.0) - (Số lỗi trung bình × 0.2-0.4) - (Số lỗi nhẹ × 0.1-0.15)
\`\`\`

**Sau đó áp dụng giới hạn:**
- Nếu đọc < 30% → Điểm tối đa = 3.0
- Nếu đọc 30-50% → Điểm tối đa = 5.0

**Làm tròn:** Làm tròn đến 0.5 (7.25→7.5, 7.24→7.0)

---

## BƯỚC 4: THANG ĐIỂM THAM KHẢO

**9.0-10.0 (HOÀN HẢO):**
- 10.0: Đọc chính xác 100%, không thiếu từ, không sai ngữ pháp
- 9.0-9.5: Gần hoàn hảo, chỉ 1-2 lỗi cực nhỏ (sai mạo từ, accent nhẹ)

**8.0-8.5 (TỐT):**
- Giữ được > 90% nội dung
- Vài lỗi nhỏ: sai trạng từ, từ đồng nghĩa
- Nghĩa không thay đổi

**7.0-7.5 (KHÁ):**
- Giữ được 70-80% nội dung
- Một số lỗi trung bình: sai ngữ pháp, sai thì
- Vẫn hiểu được ý chính

**5.0-6.5 (TRUNG BÌNH):**
- 6.0-6.5: Hiểu được ý chính, thiếu nhiều thành phần
- 5.0-5.5: Chỉ giữ được ~50% nội dung

**3.0-4.5 (YẾU):**
- 4.0-4.5: Đúng < 50% nội dung, sai nhiều từ khóa
- 3.0-3.5: Đọc < 30% nội dung, chỉ đúng vài từ rời rạc

**1.0-2.5 (RẤT YẾU):**
- 2.0-2.5: Hầu như sai toàn bộ, chỉ đúng 1-2 từ không quan trọng
- 1.0-1.5: Gần như không có từ nào đúng

**0.0 (KHÔNG ĐẠT):**
- Không đọc gì hoặc sai 100%

---

## BƯỚC 5: TÍNH ĐIỂM CHI TIẾT

Dựa trên phân tích ở Bước 2 và 3, tính:

1. **pronunciation (0-10)**: Độ chính xác từ vựng, ngữ pháp trong phần đã đọc
2. **intonation (0-10)**: Đánh giá dựa trên độ tự nhiên của câu (nếu đảo thứ tự, sai cấu trúc → điểm thấp)
3. **fluency (0-10)**: Độ trôi chảy (nếu có nhiều từ filler, thiếu từ → điểm thấp)
4. **speed (0-10)**: Tốc độ phù hợp (đánh giá dựa trên độ dài transcript so với gốc)
5. **overall (0-10)**: Điểm tổng thể theo công thức ở Bước 3

---

## BƯỚC 6: VIẾT NHẬN XÉT

**Yêu cầu:**
- Viết BẰNG TIẾNG VIỆT
- Giọng điệu TỰ NHIÊN, THÂN THIỆN, ĐỘNG VIÊN
- KHÔNG nêu điểm số cụ thể
- Nêu rõ: điểm mạnh, điểm cần cải thiện, khuyến khích

**Ví dụ nhận xét tốt:**
"Bạn đã đọc rất tốt! Phát âm rõ ràng và tự nhiên. Có một vài chỗ nhỏ về ngữ pháp cần chú ý thêm, nhưng nhìn chung bạn đã làm rất tốt. Tiếp tục luyện tập nhé!"

---

## OUTPUT (JSON hợp lệ, không markdown):

{
  "scores": {
    "pronunciation": 8.5,
    "intonation": 7.0,
    "fluency": 8.0,
    "speed": 7.5,
    "overall": 8.0
  },
  "comment": "Nhận xét chi tiết bằng tiếng Việt, tự nhiên, thân thiện, động viên."
}
`;

// PROMPT 2: CHỈ PHÂN TÍCH TỪ (Key 2)
const WORD_ANALYSIS_PROMPT = `
Bạn là chuyên gia đánh giá phát âm tiếng Anh với kiến thức sâu về ngữ âm học và IPA (International Phonetic Alphabet).

**Văn bản gốc:**
"""{{originalText}}"""

**Chỉ trả về JSON hợp lệ (không markdown, không giải thích):**

{
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

function buildScoringPrompt(transcript, originalText) {
  let prompt = SCORING_PROMPT.replace("{{transcript}}", transcript);
  if (originalText) {
    prompt = prompt.replace("{{#if originalText}}", "");
    prompt = prompt.replace("{{originalText}}", originalText);
    prompt = prompt.replace("{{/if}}", "");
  } else {
    prompt = prompt.replace(/{{#if originalText}}[\s\S]*?{{\/if}}/, "");
  }
  return prompt;
}

function buildWordAnalysisPrompt(originalText) {
  return WORD_ANALYSIS_PROMPT.replace("{{originalText}}", originalText);
}

// Function 1: Chấm điểm (Key 1)
async function getScores(transcript, originalText) {
  const prompt = buildScoringPrompt(transcript, originalText);

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🎯 Key1 (Scoring):", text.substring(0, 100));

    let cleaned = text;
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) cleaned = match[1].trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.scores || !parsed.comment) {
      throw new Error("Invalid scoring response");
    }

    return parsed;
  } catch (err) {
    console.error("❌ Key1 lỗi:", err.message);
    throw err;
  }
}

// Function 2: Phân tích từ (Key 2)
async function getWordAnalysis(originalText) {
  if (!originalText) return [];

  const prompt = buildWordAnalysisPrompt(originalText);

  try {
    const response = await axios.post(GEMINI_URL2, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 4096,
      },
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("🎯 Key2 (WordAnalysis):", text.substring(0, 100));

    let cleaned = text;
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) cleaned = match[1].trim();

    const parsed = JSON.parse(cleaned);

    return parsed.wordAnalysis || [];
  } catch (err) {
    console.error("❌ Key2 lỗi:", err.message);
    // Không throw, trả về mảng rỗng
    return [];
  }
}

// Main function: Chạy song song, đợi cả 2 xong
async function scoreWithGemini(transcript, originalText = null) {
  try {
    console.log("🚀 Bắt đầu chấm điểm song song với 2 keys...");

    // Chạy 2 tasks song song
    const [scoringResult, wordAnalysis] = await Promise.all([
      getScores(transcript, originalText),
      getWordAnalysis(originalText),
    ]);

    console.log("✅ Cả 2 tasks hoàn thành");

    // Trả về khi cả 2 xong
    return {
      scores: scoringResult.scores,
      comment: scoringResult.comment,
      wordAnalysis: wordAnalysis,
    };
  } catch (err) {
    console.error("❌ Lỗi gọi Gemini:", err.response?.data || err.message);

    if (err.response?.status === 429) {
      throw new Error("Hệ thống đang quá tải, vui lòng thử lại sau.");
    } else if (err.response?.status >= 500) {
      throw new Error("Lỗi từ phía Gemini, vui lòng thử lại sau.");
    } else if (err instanceof SyntaxError) {
      throw new Error(
        "Không thể phân tích kết quả chấm điểm. Vui lòng thử lại."
      );
    } else {
      throw new Error("Không thể chấm điểm với Gemini lúc này.");
    }
  }
}

module.exports = { scoreWithGemini };
