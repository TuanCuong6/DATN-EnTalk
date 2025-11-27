// frontend/src/screens/YoutubeReadingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { analyzeYoutubeVideo, generateYoutubeReading } from '../api/youtubeReading';

export default function YoutubeReadingScreen() {
  const navigation = useNavigation();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState('');
  const [generatedText, setGeneratedText] = useState('');

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập link YouTube');
      return;
    }

    setAnalyzing(true);
    setSummary('');
    setGeneratedText('');

    try {
      const result = await analyzeYoutubeVideo(videoUrl);
      
      if (result.hasSubtitle) {
        setSummary(result.summary);
      } else {
        Alert.alert(
          'Không có phụ đề',
          'Video này không có phụ đề. Vui lòng chọn video khác có phụ đề.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Không thể phân tích video này';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const result = await generateYoutubeReading(videoUrl);
      setGeneratedText(result.content);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Không thể tạo bài đọc';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await handleGenerate();
  };

  const handleStartPractice = () => {
    if (!generatedText.trim()) {
      Alert.alert('Chưa có nội dung để luyện đọc');
      return;
    }
    navigation.navigate('PracticeCustomReadingScreen', {
      customText: generatedText,
      source: 'youtube',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F0F7FF', '#E6FCFF']} style={styles.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#5E72EB" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Bài đọc từ YouTube</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Icon name="info-outline" size={24} color="#5E72EB" style={styles.infoIcon} />
          <Text style={styles.instructionText}>
            Dán link video YouTube (TED Talks, bài hát, podcast...) có phụ đề để tạo bài đọc tiếng Anh
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputCard}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Link YouTube</Text>
            {videoUrl.trim() && (
              <TouchableOpacity
                onPress={() => {
                  setVideoUrl('');
                  setSummary('');
                  setGeneratedText('');
                }}
                style={styles.clearButton}
              >
                <Icon name="delete" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon name="search" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Phân tích video</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Icon name="video-library" size={24} color="#9D4EDD" />
              <Text style={styles.summaryTitle}>Nội dung video</Text>
            </View>

            <Text style={styles.summaryText}>{summary}</Text>

            {!generatedText && (
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.buttonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Icon name="auto-awesome" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Tạo bài đọc</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Generated Text Display */}
        {generatedText && (
          <View style={styles.generatedContainer}>
            <View style={styles.generatedHeader}>
              <Text style={styles.generatedTitle}>📖 Bài đọc đã tạo:</Text>
            </View>

            <TextInput
              multiline
              style={styles.generatedText}
              value={generatedText}
              onChangeText={setGeneratedText}
              spellCheck={false}
              autoCorrect={false}
            />

            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                onPress={handleRegenerate}
                disabled={loading}
                style={[styles.smallButton, styles.regenerateButton]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Icon name="refresh" size={20} color="#FFF" />
                    <Text style={styles.smallButtonText}>Tạo lại</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartPractice}
                style={[styles.smallButton, styles.practiceButton]}
              >
                <Icon name="mic" size={20} color="#FFF" />
                <Text style={styles.smallButtonText}>Luyện đọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Examples */}
        <View style={styles.examplesCard}>
          <Text style={styles.examplesTitle}>💡 Gợi ý video phù hợp:</Text>
          <Text style={styles.exampleItem}>• TED Talks về công nghệ, khoa học</Text>
          <Text style={styles.exampleItem}>• Bài hát có phụ đề (bất kỳ ngôn ngữ)</Text>
          <Text style={styles.exampleItem}>• Podcast, phỏng vấn</Text>
          <Text style={styles.exampleItem}>• Video giáo dục, hướng dẫn</Text>
          <Text style={styles.noteText}>
            ⚠️ Lưu ý: Video phải có phụ đề (tiếng Anh, Việt, hoặc ngôn ngữ khác)
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5E72EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5E72EB',
  },
  infoIcon: {
    marginRight: 10,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#343A40',
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  clearButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#343A40',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 50,
  },
  analyzeButton: {
    backgroundColor: '#5E72EB',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButton: {
    backgroundColor: '#9D4EDD',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 4,
    borderTopColor: '#9D4EDD',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginLeft: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 15,
  },
  generatedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  generatedHeader: {
    marginBottom: 12,
  },
  generatedTitle: {
    fontWeight: '700',
    fontSize: 18,
    color: '#343A40',
  },
  generatedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  regenerateButton: {
    backgroundColor: '#6C757D',
  },
  practiceButton: {
    backgroundColor: '#9D4EDD',
  },
  smallButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  examplesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 10,
  },
  exampleItem: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 5,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 13,
    color: '#FF6B6B',
    marginTop: 10,
    fontWeight: '500',
  },
});
