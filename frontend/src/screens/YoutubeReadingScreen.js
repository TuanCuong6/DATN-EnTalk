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
          <Icon name="play-circle-filled" size={20} color="#FF0000" />
          <Text style={styles.headerTitle}>Bài đọc từ YouTube</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Icon name="link" size={22} color="#5E72EB" />
            <Text style={styles.inputTitle}>Dán link YouTube</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#ADB5BD"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <View style={styles.buttonRow}>
            {videoUrl.trim() && (
              <TouchableOpacity
                onPress={() => {
                  setVideoUrl('');
                  setSummary('');
                  setGeneratedText('');
                }}
                style={styles.clearBtn}
              >
                <Icon name="close" size={18} color="#6C757D" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.analyzeButton, analyzing && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Icon name="search" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Phân tích</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Icon name="description" size={20} color="#9D4EDD" />
              <Text style={styles.cardTitle}>Tóm tắt nội dung</Text>
            </View>
            <Text style={styles.summaryText}>{summary}</Text>

            {!generatedText && (
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.buttonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
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

        {/* Generated Text */}
        {generatedText && (
          <View style={styles.generatedCard}>
            <View style={styles.cardHeader}>
              <Icon name="article" size={20} color="#10B981" />
              <Text style={styles.cardTitle}>Bài đọc</Text>
            </View>

            <TextInput
              multiline
              style={styles.generatedText}
              value={generatedText}
              onChangeText={setGeneratedText}
              spellCheck={false}
              autoCorrect={false}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleRegenerate}
                disabled={loading}
                style={[styles.actionBtn, styles.regenerateBtn]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Icon name="refresh" size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Tạo lại</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartPractice}
                style={[styles.actionBtn, styles.practiceBtn]}
              >
                <Icon name="mic" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Luyện đọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hint */}
        {!summary && !generatedText && (
          <View style={styles.hintCard}>
            <Icon name="info-outline" size={20} color="#5E72EB" />
            <Text style={styles.hintText}>
              Video cần có phụ đề (TED Talks, bài hát, podcast...)
            </Text>
          </View>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
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
  inputCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#343A40',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 56,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#5E72EB',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#9D4EDD',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generatedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  generatedText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#343A40',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  regenerateBtn: {
    backgroundColor: '#6C757D',
  },
  practiceBtn: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 114, 235, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});
