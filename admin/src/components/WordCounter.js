// admin/src/components/WordCounter.js
import React, { useEffect, useState } from 'react';

/**
 * Component hiển thị bộ đếm từ với validation cho Admin
 * @param {string} text - Văn bản cần đếm
 * @param {number} min - Số từ tối thiểu
 * @param {number} max - Số từ tối đa
 * @param {function} onValidationChange - Callback khi trạng thái validation thay đổi
 * @param {string} label - Nhãn hiển thị (optional)
 */
const WordCounter = ({ text, min, max, onValidationChange, label }) => {
  const [wordCount, setWordCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Đếm số từ
    const count = countWords(text);
    setWordCount(count);

    // Kiểm tra validation
    const valid = count >= min && count <= max;
    setIsValid(valid);

    // Gọi callback nếu có
    if (onValidationChange) {
      onValidationChange(valid, count);
    }
  }, [text, min, max]);

  const countWords = (str) => {
    if (!str || typeof str !== 'string') return 0;
    const trimmed = str.trim();
    if (trimmed.length === 0) return 0;
    return trimmed.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getStatusColor = () => {
    if (wordCount === 0) return 'text-gray-500';
    if (wordCount < min) return 'text-red-600'; // Đỏ - quá ngắn
    if (wordCount > max) return 'text-red-600'; // Đỏ - quá dài
    return 'text-green-600'; // Xanh - hợp lệ
  };

  const getProgressColor = () => {
    if (wordCount === 0) return 'bg-gray-300';
    if (wordCount < min) return 'bg-red-500';
    if (wordCount > max) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusMessage = () => {
    if (wordCount === 0) return `${label || 'Nhập nội dung'} (${min}-${max} từ)`;
    if (wordCount < min) return `Cần thêm ${min - wordCount} từ`;
    if (wordCount > max) return `Vượt quá ${wordCount - max} từ - vui lòng cắt ngắn`;
    return 'Độ dài hợp lệ ✓';
  };

  const progressPercentage = Math.min((wordCount / max) * 100, 100);

  return (
    <div className="my-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-semibold ${getStatusColor()}`}>
          Số từ: {wordCount}/{max}
        </span>
        {wordCount > 0 && (
          <span className={`text-xs italic ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {getStatusMessage()}
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Hiển thị cảnh báo nếu không hợp lệ */}
      {!isValid && wordCount > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          ⚠️ {getStatusMessage()}
        </div>
      )}
    </div>
  );
};

export default WordCounter;
