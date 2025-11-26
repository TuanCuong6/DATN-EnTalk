/**
 * Level Helper cho Frontend
 * Chuyển đổi A1, B1, C1 → Dễ, Vừa, Khó
 */

export const getLevelText = (level) => {
  const levelMap = {
    'A1': 'Dễ',
    'B1': 'Vừa',
    'C1': 'Khó'
  };
  return levelMap[level] || level;
};

export const LEVEL_OPTIONS = [
  { value: 'A1', label: 'Dễ' },
  { value: 'B1', label: 'Vừa' },
  { value: 'C1', label: 'Khó' }
];
