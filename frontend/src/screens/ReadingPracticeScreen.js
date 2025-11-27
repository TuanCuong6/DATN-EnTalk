//frontend/src/screens/ReadingPracticeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording, getReadingById } from '../api/reading';
import TextToSpeechPlayer from '../components/TextToSpeechPlayer';
import WordAnalysisDisplay from '../components/WordAnalysisDisplay';

export default function ReadingPracticeScreen({ route, navigation }) {
  const { readingId, reading: readingFromParams } = route.params || {};
  const [reading, setReading] = useState(readingFromParams || null);
  const [audioPath, setAudioPath] = useState(null);
  const [loading, setLoading] = useState(readingFromParams ? false : true);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [resetRecorder, setResetRecorder] = useState(0);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Trong useEffect fetch reading, sửa phần xử lý lỗi:
  useEffect(() => {
    if (!reading && readingId) {
      const fetchReading = async () => {
        try {
          const res = await getReadingById(readingId);
          setReading(res.data);
        } catch (err) {
          // Nếu bài đọc bị xóa, điều hướng về CustomReadingScreen
          if (err.response?.status === 404) {
            Alert.alert(
              'Bài đọc không khả dụng',
              'Bài đọc này đã bị xóa. Bạn có thể luyện tập với nội dung cũ hoặc chọn bài mới.',
              [
                {
                  text: 'Chọn bài khác',
                  onPress: () => navigation.navigate('Home'),
                },
                {
                  text: 'Luyện với nội dung cũ',
                  onPress: () => {
                    // Cần lấy original_content từ record trước đó
                    // Tạm thời điều hướng về màn hình chi tiết
                    navigation.goBack();
                  },
                },
              ],
            );
          } else {
            Alert.alert('Lỗi', 'Không lấy được bài đọc');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchReading();
    }
  }, [readingId]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRecordingComplete = path => {
    setAudioPath(path);
  };

  const handleSubmit = async (path) => {
    const filePath = path || audioPath;
    if (!filePath) {
      Alert.alert('Lỗi', 'Không có file ghi âm');
      return;
    }
    
    setIsScoring(true);
    try {
      const res = await submitRecording(filePath, reading.id);
      setScoreResult(res.data);
      setShowScoreModal(true);
      setAudioPath(null);
    } catch (err) {
      console.error('❌ Gửi file lỗi:', err);
      Alert.alert(
        '😢 Không thể chấm điểm',
        err?.response?.data?.message ||
          err.message ||
          'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
      );
    } finally {
      setIsScoring(false);
    }
  };

  if (loading || !reading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F7FF', '#020f10ff']}
          style={styles.background}
        />
        <ActivityIndicator
          size="large"
          color="#5E72EB"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

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

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>

        <View style={styles.userInfo}>
          <Icon name="menu-book" size={24} color="#5E72EB" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Luyện Đọc</Text>

        <View style={styles.card}>
          <Text style={styles.title}>{reading.title || 'Bài đọc'}</Text>
          <Text style={styles.contentText}>{reading.content}</Text>
          <TextToSpeechPlayer text={reading.content} readingId={reading.id} style={styles.ttsPlayer} />
        </View>

        <View style={styles.recorderContainer}>
          <AudioRecorder
            onFinish={handleRecordingComplete}
            onSubmit={handleSubmit}
            resetTrigger={resetRecorder}
            buttonStyle={styles.recordButton}
            textStyle={styles.recordButtonText}
            iconStyle={styles.recordIcon}
          />
        </View>

        {/* Loading Overlay khi chấm điểm */}
        <Modal visible={isScoring} transparent animationType="fade">
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Đang chấm điểm...</Text>
          </View>
        </Modal>
      </ScrollView>

      {/* Score Result Modal */}
      <Modal
        visible={showScoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowScoreModal(false);
          setResetRecorder(prev => prev + 1);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#5E72EB', '#3D50EB']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Kết quả đánh giá</Text>
            </LinearGradient>

            {scoreResult && (
              <ScrollView style={styles.scoreScrollView}>
                <View style={styles.scoreContainer}>
                  {/* Compact Score Summary */}
                  <View style={styles.compactScoreCard}>
                    <View style={styles.overallScoreCompact}>
                      <Text style={styles.overallLabelCompact}>Tổng điểm</Text>
                      <Text style={styles.overallValueCompact}>
                        {scoreResult.scores.overall}
                        <Text style={styles.overallTotalCompact}>/10</Text>
                      </Text>
                    </View>
                    
                    <View style={styles.scoreDetailsCompact}>
                      <View style={styles.scoreItemCompact}>
                        <Text style={styles.scoreLabelCompact}>Phát âm</Text>
                        <Text style={styles.scoreValueCompact}>{scoreResult.scores.pronunciation}</Text>
                      </View>
                      <View style={styles.scoreItemCompact}>
                        <Text style={styles.scoreLabelCompact}>Ngữ điệu</Text>
                        <Text style={styles.scoreValueCompact}>{scoreResult.scores.intonation}</Text>
                      </View>
                      <View style={styles.scoreItemCompact}>
                        <Text style={styles.scoreLabelCompact}>Lưu loát</Text>
                        <Text style={styles.scoreValueCompact}>{scoreResult.scores.fluency}</Text>
                      </View>
                      <View style={styles.scoreItemCompact}>
                        <Text style={styles.scoreLabelCompact}>Tốc độ</Text>
                        <Text style={styles.scoreValueCompact}>{scoreResult.scores.speed}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Word Analysis */}
                  {scoreResult.wordAnalysis && scoreResult.wordAnalysis.length > 0 && (
                    <WordAnalysisDisplay 
                      wordAnalysis={scoreResult.wordAnalysis}
                      originalText={reading?.content}
                      transcript={scoreResult.transcript}
                    />
                  )}

                  {/* Comment Section */}
                  <View style={styles.commentContainer}>
                    <Text style={styles.commentLabel}>💬 Nhận xét</Text>
                    <Text style={styles.commentText}>{scoreResult.comment}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowScoreModal(false);
                setResetRecorder(prev => prev + 1); // Trigger reset AudioRecorder
              }}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 25,
    paddingTop: 10,
    zIndex: 10,
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
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3D50EB',
    letterSpacing: 0.5,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
    marginBottom: 25,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
  },
  recorderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#5E72EB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  recordIcon: {
    color: '#FFF',
    marginRight: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },

  // New styles for score modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreScrollView: {
    maxHeight: 500,
  },
  scoreContainer: {
    padding: 20,
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
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
    paddingBottom: 8,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#495057',
  },
  closeButton: {
    backgroundColor: '#5E72EB',
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
