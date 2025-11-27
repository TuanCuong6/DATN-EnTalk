//frontend/src/screens/PracticeCustomReadingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Easing } from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { submitRecording } from '../api/reading';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TextToSpeechPlayer from '../components/TextToSpeechPlayer';
import WordAnalysisDisplay from '../components/WordAnalysisDisplay';

export default function PracticeCustomReadingScreen({ route }) {
  const navigation = useNavigation();
  const { customText } = route.params || {};
  const [profile, setProfile] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [resetRecorder, setResetRecorder] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const [audioPath, setAudioPath] = useState(null);

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
      const res = await submitRecording(filePath, null, customText);
      setScoreResult(res.data);
      setShowScoreModal(true);
      setAudioPath(null);
    } catch (err) {
      console.error('❌ Lỗi gửi file:', err);
      Alert.alert('Lỗi khi gửi file ghi âm', err?.response?.data?.message || 'Server lỗi');
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F0F7FF', '#E6FCFF']} style={styles.background} />

      <Animated.View
        style={[styles.circle1, { transform: [{ rotate: rotateInterpolation }] }]}
      />
      <Animated.View
        style={[styles.circle2, { transform: [{ rotate: rotateInterpolation }] }]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Luyện đọc</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Content Display */}
        <View style={styles.contentCard}>
          <View style={styles.contentLabelRow}>
            <Icon name="article" size={18} color="#495057" />
            <Text style={styles.contentLabel}>Nội dung bạn sẽ đọc:</Text>
          </View>
          <Text style={styles.contentText}>{customText}</Text>
          <TextToSpeechPlayer text={customText} style={styles.ttsPlayer} />
        </View>

        {/* Audio Recorder */}
        <View style={styles.recorderCard}>
          <AudioRecorder 
            onFinish={handleRecordingComplete}
            onSubmit={handleSubmit}
            resetTrigger={resetRecorder}
          />
        </View>

        {/* Loading Overlay */}
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
            <LinearGradient colors={['#5E72EB', '#3D50EB']} style={styles.modalHeader}>
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
                      originalText={customText}
                      transcript={scoreResult.transcript}
                    />
                  )}

                  {/* Comment Section */}
                  <View style={styles.commentContainer}>
                    <View style={styles.commentLabelRow}>
                      <Icon name="comment" size={16} color="#495057" />
                      <Text style={styles.commentLabel}>Nhận xét</Text>
                    </View>
                    <Text style={styles.commentText}>{scoreResult.comment}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                setShowScoreModal(false);
                setResetRecorder(prev => prev + 1);
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
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { padding: 25, paddingTop: 10 },
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 25,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  contentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  contentText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#343A40',
    marginBottom: 10,
  },
  ttsPlayer: {
    marginTop: 10,
  },
  recorderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: { color: '#fff', marginTop: 12, fontSize: 16 },
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
  modalHeader: { padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  scoreScrollView: {
    maxHeight: 500,
  },
  scoreContainer: { padding: 20 },
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
  closeButton: { backgroundColor: '#5E72EB', padding: 15, alignItems: 'center' },
  closeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
