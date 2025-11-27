// frontend/src/screens/RecordDetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { getRecordDetail } from '../api/history';
import { getReadingById, checkReadingModified } from '../api/reading';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import WordAnalysisDisplay from '../components/WordAnalysisDisplay';

export default function RecordDetailScreen({ route }) {
  const navigation = useNavigation();
  const { recordId } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingStatus, setReadingStatus] = useState('checking'); // 'checking', 'valid', 'modified', 'deleted'
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const res = await getRecordDetail(recordId);
        setDetail(res.data);

        // KIỂM TRA CHI TIẾT trạng thái bài đọc
        if (res.data.reading_id) {
          try {
            // Gọi API kiểm tra bài đọc có bị sửa
            const checkRes = await checkReadingModified({
              readingId: res.data.reading_id,
              originalContent:
                res.data.original_content || res.data.reading_content,
            });

            if (!checkRes.data.exists) {
              setReadingStatus('deleted');
            } else if (checkRes.data.modified) {
              setReadingStatus('modified');
            } else {
              setReadingStatus('valid');
            }
          } catch (err) {
            console.error('❌ Lỗi kiểm tra bài đọc:', err);
            // Nếu API lỗi, mặc định cho là bài đọc hợp lệ
            setReadingStatus('valid');
          }
        } else {
          // Không có reading_id -> đây là custom text
          setReadingStatus('deleted');
        }
      } catch (err) {
        console.error('❌ Lỗi lấy chi tiết record:', err);
        Alert.alert('Lỗi', 'Không thể tải chi tiết bản ghi');
      } finally {
        setLoading(false);
      }
    })();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // SỬA hàm handleRetry - CHUYỂN ĐÚNG MÀN HÌNH
  const handleRetry = () => {
    if (readingStatus === 'valid') {
      // Bài đọc còn tồn tại và không sửa -> ReadingPractice
      navigation.navigate('ReadingPractice', {
        readingId: detail.reading_id,
      });
    } else {
      // Bài đọc bị xóa/sửa -> PracticeCustomReadingScreen với nội dung cũ
      navigation.navigate('PracticeCustomReadingScreen', {
        customText: detail.original_content || detail.reading_content,
      });
    }
  };

  // SỬA: Chuyển sang màn hình TopicList thay vì Home
  const handleChooseNewReading = () => {
    navigation.navigate('TopicList');
  };

  // HIỆN CẢNH BÁO KHI BÀI ĐỌC BỊ SỬA/XÓA
  const showWarning =
    readingStatus === 'modified' || readingStatus === 'deleted';

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F7FF', '#E6FCFF']}
          style={styles.background}
        />
        <ActivityIndicator
          size="large"
          color="#5E72EB"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  if (!detail) return null;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={styles.background}
      />

      {/* Decorative circles */}
      <Animated.View
        style={[
          styles.circle1,
          { transform: [{ rotate: rotateInterpolation }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle2,
          { transform: [{ rotate: rotateInterpolation }] },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chi tiết bản ghi</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* CẢNH BÁO KHI BÀI ĐỌC BỊ SỬA/XÓA */}
        {showWarning && (
          <View style={styles.warningSection}>
            <View style={styles.warningTextRow}>
              <Icon name="warning" size={18} color="#856404" />
              <Text style={styles.warningText}>
                {readingStatus === 'deleted'
                  ? 'Bài đọc này đã bị xóa'
                  : 'Bài đọc này đã bị sửa đổi'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleChooseNewReading}
              style={styles.chooseButton}
            >
              <Icon
                name="menu-book"
                size={24}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.chooseButtonText}>Chọn bài mới</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compact Score Summary */}
        <View style={styles.compactScoreCard}>
          <View style={styles.overallScoreCompact}>
            <Text style={styles.overallLabelCompact}>Tổng điểm</Text>
            <Text style={styles.overallValueCompact}>
              {detail.score_overall?.toFixed(1)}
              <Text style={styles.overallTotalCompact}>/10</Text>
            </Text>
          </View>
          
          <View style={styles.scoreDetailsCompact}>
            <View style={styles.scoreItemCompact}>
              <Text style={styles.scoreLabelCompact}>Phát âm</Text>
              <Text style={styles.scoreValueCompact}>{parseFloat(detail.score_pronunciation).toFixed(1)}</Text>
            </View>
            <View style={styles.scoreItemCompact}>
              <Text style={styles.scoreLabelCompact}>Ngữ điệu</Text>
              <Text style={styles.scoreValueCompact}>{parseFloat(detail.score_intonation).toFixed(1)}</Text>
            </View>
            <View style={styles.scoreItemCompact}>
              <Text style={styles.scoreLabelCompact}>Lưu loát</Text>
              <Text style={styles.scoreValueCompact}>{parseFloat(detail.score_fluency).toFixed(1)}</Text>
            </View>
            <View style={styles.scoreItemCompact}>
              <Text style={styles.scoreLabelCompact}>Tốc độ</Text>
              <Text style={styles.scoreValueCompact}>{parseFloat(detail.score_speed).toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Word Analysis - bao gồm cả nội dung gốc và transcript */}
        {detail.word_analysis && detail.word_analysis.length > 0 && (
          <WordAnalysisDisplay 
            wordAnalysis={detail.word_analysis}
            originalText={detail.reading_content}
            transcript={detail.transcript}
          />
        )}
        
        {/* Nếu không có word_analysis, hiển thị nội dung gốc và transcript riêng */}
        {(!detail.word_analysis || detail.word_analysis.length === 0) && (
          <>
            <View style={styles.contentContainer}>
              <View style={styles.contentLabelRow}>
                <Icon name="article" size={16} color="#495057" />
                <Text style={styles.contentLabel}>Nội dung gốc</Text>
              </View>
              <Text style={styles.contentText}>{detail.reading_content}</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.contentLabelRow}>
                <Icon name="record-voice-over" size={16} color="#495057" />
                <Text style={styles.contentLabel}>Bạn đã đọc</Text>
              </View>
              <Text style={styles.contentText}>{detail.transcript}</Text>
            </View>
          </>
        )}

        {/* Comment Section */}
        <View style={styles.commentContainer}>
          <View style={styles.commentLabelRow}>
            <Icon name="comment" size={16} color="#495057" />
            <Text style={styles.commentLabel}>Nhận xét</Text>
          </View>
          <Text style={styles.commentText}>{detail.comment}</Text>
        </View>

        {/* NÚT LUYỆN LẠI - LUÔN HIỂN THỊ */}
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Icon
            name="replay"
            size={24}
            color="#FFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.retryButtonText}>
            {showWarning ? 'Luyện với nội dung cũ' : 'Luyện lại'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(94, 114, 235, 0.05)',
    top: -100,
    left: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    bottom: -50,
    right: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingBottom: 10,
    zIndex: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5E72EB',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  compactScoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  overallScoreCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
  },
  overallLabelCompact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  overallValueCompact: {
    fontSize: 32,
    fontWeight: '700',
    color: '#5E72EB',
  },
  overallTotalCompact: {
    fontSize: 18,
    color: '#6c757d',
  },
  scoreDetailsCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItemCompact: {
    alignItems: 'center',
  },
  scoreLabelCompact: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  scoreValueCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  commentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  commentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
    paddingBottom: 8,
    gap: 6,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#495057',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  contentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
    paddingBottom: 8,
    gap: 6,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#495057',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#5E72EB',
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  warningSection: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderWidth: 1,
    borderColor: '#FFEaaA',
  },
  warningTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 6,
  },
  warningText: {
    color: '#856404',
    fontSize: 16,
    fontWeight: '600',
  },
  chooseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chooseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
