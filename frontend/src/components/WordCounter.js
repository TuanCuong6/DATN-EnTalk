// frontend/src/components/WordCounter.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Component hiển thị bộ đếm từ với validation
 * @param {string} text - Văn bản cần đếm
 * @param {number} min - Số từ tối thiểu
 * @param {number} max - Số từ tối đa
 * @param {function} onValidationChange - Callback khi trạng thái validation thay đổi
 */
const WordCounter = ({ text, min, max, onValidationChange }) => {
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
    if (wordCount === 0) return '#999';
    if (wordCount < min) return '#FF6B6B'; // Đỏ - quá ngắn
    if (wordCount > max) return '#FF6B6B'; // Đỏ - quá dài
    return '#4CAF50'; // Xanh - hợp lệ
  };

  const getStatusMessage = () => {
    if (wordCount === 0) return `Nhập nội dung (${min}-${max} từ)`;
    if (wordCount < min) return `Cần thêm ${min - wordCount} từ`;
    if (wordCount > max) return `Vượt quá ${wordCount - max} từ`;
    return 'Độ dài hợp lệ';
  };

  return (
    <View style={styles.container}>
      <View style={styles.counterRow}>
        <Text style={[styles.counterText, { color: getStatusColor() }]}>
          Số từ: {wordCount}/{max}
        </Text>
        {!isValid && wordCount > 0 && (
          <Text style={styles.statusText}>{getStatusMessage()}</Text>
        )}
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${Math.min((wordCount / max) * 100, 100)}%`,
              backgroundColor: getStatusColor()
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default WordCounter;
