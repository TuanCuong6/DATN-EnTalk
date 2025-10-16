//frontend/src/screens/CustomReadingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { Easing } from 'react-native';
import textRecognition from '@react-native-ml-kit/text-recognition';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording } from '../api/reading';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CustomReadingScreen({ route }) {
  const navigation = useNavigation();
  const { customText: incomingText } = route.params || {};
  const [customText, setCustomText] = useState(incomingText || '');
  const [showRecorder, setShowRecorder] = useState(!!incomingText);
  const [profile, setProfile] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Animation values
  const scanButtonScale = useRef(new Animated.Value(1)).current;
  const startButtonScale = useRef(new Animated.Value(1)).current;
  const clearButtonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getProfile().then(res => setProfile(res.data));
    });
    return unsubscribe;
  }, [navigation]);

  const handlePressIn = buttonScale => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = buttonScale => {
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

  const handleStartPractice = () => {
    if (!customText.trim()) {
      Alert.alert('Vui lòng nhập nội dung để luyện đọc');
      return;
    }
    setShowRecorder(true);
  };

  const handleFinishRecording = async path => {
    setIsScoring(true);
    try {
      const res = await submitRecording(path, null, customText);
      setScoreResult(res.data);
      setShowScoreModal(true);
    } catch (err) {
      console.error('❌ Lỗi gửi file:', err);
      Alert.alert(
        'Lỗi khi gửi file ghi âm',
        err?.response?.data?.message || 'Server lỗi',
      );
    } finally {
      setIsScoring(false);
    }
  };

  const handleRescanImage = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 1 });
      if (result.didCancel || !result.assets?.[0]?.uri) return;

      const ocrResult = await textRecognition.recognize(result.assets[0].uri);
      const text = ocrResult?.text?.trim();

      if (!text || text.split(/\s+/).length < 4) {
        Alert.alert(
          'Không nhận diện được văn bản rõ ràng',
          'Ảnh có thể quá mờ, quá ít chữ, hoặc không chứa văn bản. Vui lòng chụp lại.',
        );
        return;
      }

      setCustomText(text);
      setShowRecorder(true);
    } catch (err) {
      console.error('❌ OCR lỗi:', err);
      Alert.alert('Lỗi khi quét ảnh', err.message || 'Không rõ nguyên nhân');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xoá toàn bộ nội dung?',
      'Bạn có chắc chắn muốn xoá và nhập lại từ đầu không?',
      [
        { text: 'Huỷ' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setCustomText('');
              setShowRecorder(false);
              fadeAnim.setValue(1);
            });
          },
        },
      ],
    );
  };

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

      {/* Header: Logo + Avatar + Tên */}
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

        {profile && (
          <View style={styles.userInfo}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={20} color="#5E72EB" />
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Nhập nội dung tùy chỉnh</Text>
        <Text style={styles.label}>📝 Nhập đoạn văn bạn muốn luyện:</Text>
        <TextInput
          multiline
          placeholder="Ví dụ: The quick brown fox jumps over the lazy dog..."
          placeholderTextColor="#888"
          style={styles.input}
          value={customText}
          onChangeText={setCustomText}
        />

        <View style={styles.buttonGroup}>
          {!showRecorder && (
            <Animated.View style={{ transform: [{ scale: startButtonScale }] }}>
              <TouchableOpacity
                onPressIn={() => handlePressIn(startButtonScale)}
                onPressOut={() => handlePressOut(startButtonScale)}
                onPress={handleStartPractice}
                style={[styles.actionButton, styles.startButton]}
              >
                <Icon
                  name="mic"
                  size={24}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>🚀 Bắt đầu luyện đọc</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View style={{ transform: [{ scale: scanButtonScale }] }}>
            <TouchableOpacity
              onPressIn={() => handlePressIn(scanButtonScale)}
              onPressOut={() => handlePressOut(scanButtonScale)}
              onPress={handleRescanImage}
              style={[styles.actionButton, styles.scanButton]}
            >
              <Icon
                name="camera-alt"
                size={24}
                color="#FFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {showRecorder
                  ? '📸 Chụp lại ảnh văn bản'
                  : '📸 Quét ảnh văn bản'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {showRecorder && (
          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>📖 Nội dung bạn sẽ đọc:</Text>

              <Animated.View
                style={{ transform: [{ scale: clearButtonScale }] }}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(clearButtonScale)}
                  onPressOut={() => handlePressOut(clearButtonScale)}
                  onPress={handleClearAll}
                  style={styles.clearButton}
                >
                  <Icon name="delete" size={20} color="#b94a46" />
                  <Text style={styles.clearButtonText}>Xoá tất cả</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.preview}>{customText}</Text>
            </View>

            <AudioRecorder onFinish={handleFinishRecording} />
          </Animated.View>
        )}

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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 150,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#343A40',
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#5E72EB',
  },
  scanButton: {
    backgroundColor: '#6A5ACD',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#495057',
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  preview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(185, 74, 70, 0.3)',
  },
  clearButtonText: {
    marginLeft: 6,
    color: '#b94a46',
    fontWeight: '600',
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
