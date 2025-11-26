const CONTENT_LIMITS = {
  // Bài đọc hệ thống (System Readings) - theo level
  SYSTEM_READING: {
    A1: { min: 20, max: 30, label: 'Dễ' },
    B1: { min: 30, max: 50, label: 'Vừa' },
    C1: { min: 50, max: 70, label: 'Khó' }
  },

  // Bài đọc người dùng nhập tay (Custom Reading)
  CUSTOM_READING: {
    min: 6,
    max: 100,
    label: 'Tự do'
  },

  // Bài đọc tạo từ AI (AI Generated)
  AI_GENERATED: {
    min: 25,
    max: 35,
    label: 'AI tạo'
  },

  // Bài đọc từ YouTube (YouTube Transcript)
  YOUTUBE_READING: {
    min: 25,
    max: 35,
    label: 'YouTube'
  }
};

/**
 * Đếm số từ trong văn bản
 * @param {string} text - Văn bản cần đếm
 * @returns {number} - Số từ
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Loại bỏ khoảng trắng thừa và đếm từ
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  
  // Split bằng khoảng trắng và filter các phần tử rỗng
  return trimmed.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate độ dài nội dung theo loại
 * @param {string} text - Nội dung cần validate
 * @param {string} type - Loại nội dung: 'SYSTEM_READING', 'CUSTOM_READING', 'AI_GENERATED', 'YOUTUBE_READING'
 * @param {string} level - Level (chỉ dùng cho SYSTEM_READING): 'A1', 'B1', 'C1'
 * @returns {object} - { valid: boolean, wordCount: number, min: number, max: number, message: string }
 */
function validateContentLength(text, type, level = null) {
  const wordCount = countWords(text);
  let limits;

  // Xác định giới hạn dựa trên loại nội dung
  switch (type) {
    case 'SYSTEM_READING':
      if (!level || !CONTENT_LIMITS.SYSTEM_READING[level]) {
        return {
          valid: false,
          wordCount,
          min: 0,
          max: 0,
          message: `Level không hợp lệ. Vui lòng chọn: ${Object.keys(CONTENT_LIMITS.SYSTEM_READING).join(', ')}`
        };
      }
      limits = CONTENT_LIMITS.SYSTEM_READING[level];
      break;

    case 'CUSTOM_READING':
      limits = CONTENT_LIMITS.CUSTOM_READING;
      break;

    case 'AI_GENERATED':
      limits = CONTENT_LIMITS.AI_GENERATED;
      break;

    case 'YOUTUBE_READING':
      limits = CONTENT_LIMITS.YOUTUBE_READING;
      break;

    default:
      return {
        valid: false,
        wordCount,
        min: 0,
        max: 0,
        message: 'Loại nội dung không hợp lệ'
      };
  }

  const { min, max, label } = limits;
  const valid = wordCount >= min && wordCount <= max;

  let message = '';
  if (!valid) {
    if (wordCount < min) {
      message = `Nội dung quá ngắn. Cần tối thiểu ${min} từ (hiện tại: ${wordCount} từ)`;
    } else {
      message = `Nội dung quá dài. Tối đa ${max} từ (hiện tại: ${wordCount} từ). Vui lòng cắt ngắn bớt.`;
    }
  } else {
    message = `Độ dài hợp lệ (${wordCount}/${max} từ)`;
  }

  return {
    valid,
    wordCount,
    min,
    max,
    label,
    message
  };
}

/**
 * Lấy giới hạn cho loại nội dung
 * @param {string} type - Loại nội dung
 * @param {string} level - Level (optional)
 * @returns {object} - { min, max, label }
 */
function getLimits(type, level = null) {
  switch (type) {
    case 'SYSTEM_READING':
      return level && CONTENT_LIMITS.SYSTEM_READING[level] 
        ? CONTENT_LIMITS.SYSTEM_READING[level]
        : null;
    case 'CUSTOM_READING':
      return CONTENT_LIMITS.CUSTOM_READING;
    case 'AI_GENERATED':
      return CONTENT_LIMITS.AI_GENERATED;
    case 'YOUTUBE_READING':
      return CONTENT_LIMITS.YOUTUBE_READING;
    default:
      return null;
  }
}

module.exports = {
  CONTENT_LIMITS,
  countWords,
  validateContentLength,
  getLimits
};
