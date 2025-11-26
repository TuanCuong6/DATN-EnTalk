/**
 * Level Helper - Đơn giản
 * Chuyển đổi giữa DB level (A1, B1, C1) và hiển thị (Dễ, Vừa, Khó)
 */

// Mapping hiển thị
const LEVEL_DISPLAY = {
  'A1': 'Dễ',
  'B1': 'Vừa',
  'C1': 'Khó'
};

// Mapping ngược (từ hiển thị về DB)
const DISPLAY_TO_LEVEL = {
  'Dễ': 'A1',
  'Vừa': 'B1',
  'Khó': 'C1'
};

/**
 * Chuyển level DB sang text hiển thị
 */
const getLevelText = (level) => {
  return LEVEL_DISPLAY[level] || level;
};

/**
 * Chuyển text hiển thị sang level DB
 */
const getDbLevel = (displayText) => {
  return DISPLAY_TO_LEVEL[displayText] || displayText;
};

module.exports = {
  LEVEL_DISPLAY,
  DISPLAY_TO_LEVEL,
  getLevelText,
  getDbLevel
};
