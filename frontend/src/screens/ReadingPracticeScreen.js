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

export default function ReadingPracticeScreen({ route, navigation }) {
  const { readingId, reading: readingFromParams } = route.params || {};
  const [reading, setReading] = useState(readingFromParams || null);
  const [audioPath, setAudioPath] = useState(null);
  const [loading, setLoading] = useState(readingFromParams ? false : true);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reading && readingId) {
      const fetchReading = async () => {
        try {
          const res = await getReadingById(readingId);
          setReading(res.data);
        } catch (err) {
          Alert.alert('Lỗi', 'Không lấy được bài đọc');
        } finally {
          setLoading(false);
        }
      };
      fetchReading();
    }

    // Rotate animation for circles
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

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

  const handleSubmit = async path => {
    setAudioPath(path);
    setIsScoring(true);
    try {
      const res = await submitRecording(path, reading.id);
      setScoreResult(res.data);
      setShowScoreModal(true);
    } catch (err) {
      console.error('❌ Gửi file lỗi:', err);
      Alert.alert(
        '😢 Không thể chấm điểm',
        err?.response?.data?.message ||
          err.message ||
          'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
      );
      x;
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
        </View>

        <View style={styles.recorderContainer}>
          <AudioRecorder
            onFinish={handleSubmit}
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
        onRequestClose={() => setShowScoreModal(false)}
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
              <View style={styles.scoreContainer}>
                {/* Overall Score */}
                <View style={styles.overallScore}>
                  <Text style={styles.overallLabel}>Tổng điểm</Text>
                  <Text style={styles.overallValue}>
                    {scoreResult.scores.overall}
                    <Text style={styles.overallTotal}>/10</Text>
                  </Text>
                </View>

                {/* Score Details */}
                <View style={styles.scoreGrid}>
                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, styles.pronunciation]}>
                      Phát âm
                    </Text>
                    <Text style={styles.scoreValue}>
                      {scoreResult.scores.pronunciation}/10
                    </Text>
                  </View>

                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, styles.intonation]}>
                      Ngữ điệu
                    </Text>
                    <Text style={styles.scoreValue}>
                      {scoreResult.scores.intonation}/10
                    </Text>
                  </View>

                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, styles.fluency]}>
                      Lưu loát
                    </Text>
                    <Text style={styles.scoreValue}>
                      {scoreResult.scores.fluency}/10
                    </Text>
                  </View>

                  <View style={styles.scoreItem}>
                    <Text style={[styles.scoreLabel, styles.speed]}>
                      Tốc độ
                    </Text>
                    <Text style={styles.scoreValue}>
                      {scoreResult.scores.speed}/10
                    </Text>
                  </View>
                </View>

                {/* Comment Section */}
                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>Nhận xét</Text>
                  <Text style={styles.commentText}>{scoreResult.comment}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowScoreModal(false)}
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
  scoreContainer: {
    padding: 20,
  },
  overallScore: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#5E72EB',
  },
  overallTotal: {
    fontSize: 24,
    color: '#6c757d',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#495057',
  },
  pronunciation: {
    color: '#5E72EB',
    borderLeftColor: '#5E72EB',
  },
  intonation: {
    color: '#FF6B6B',
    borderLeftColor: '#FF6B6B',
  },
  fluency: {
    color: '#4CD964',
    borderLeftColor: '#4CD964',
  },
  speed: {
    color: '#FF9500',
    borderLeftColor: '#FF9500',
  },
  commentContainer: {
    backgroundColor: '#f1f3f9',
    borderRadius: 12,
    padding: 15,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E72EB',
    marginBottom: 10,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 24,
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
