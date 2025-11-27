//frontend/src/screens/AIGenerateReadingScreen.js
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
import { Picker } from '@react-native-picker/picker';
import { Easing } from 'react-native';
import { generateAIReading } from '../api/aiReading';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PRESET_TOPICS = [
  'Du lịch',
  'Khoa học',
  'Công nghệ',
  'Thể thao',
  'Ẩm thực',
  'Môi trường',
  'Sức khỏe',
  'Gia đình',
  'Giáo dục',
  'Nghệ thuật',
  'Tùy chỉnh',
];

export default function AIGenerateReadingScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('Du lịch');
  const [customTopic, setCustomTopic] = useState('');
  const [description, setDescription] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Animation values
  const generateButtonScale = useRef(new Animated.Value(1)).current;
  const practiceButtonScale = useRef(new Animated.Value(1)).current;
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

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGenerate = async () => {
    const topic = selectedTopic === 'Tùy chỉnh' ? customTopic : selectedTopic;
    
    if (!topic.trim()) {
      Alert.alert('Vui lòng chọn hoặc nhập chủ đề');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateAIReading(topic, description);
      setGeneratedText(response.data.content);
    } catch (err) {
      console.error('❌ Lỗi tạo bài đọc:', err);
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể tạo bài đọc');
    } finally {
      setIsGenerating(false);
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
    navigation.navigate('PracticeCustomReadingScreen', { customText: generatedText });
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
          <Text style={styles.title}>AI tạo bài đọc</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Chọn chủ đề và để AI tạo bài đọc cho bạn</Text>

        {/* Topic Selection */}
        <View style={styles.labelRow}>
          <Icon name="library-books" size={18} color="#495057" />
          <Text style={styles.label}>Chọn chủ đề:</Text>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTopic}
            onValueChange={(value) => {
              setSelectedTopic(value);
              // Khi chọn chủ đề có sẵn (không phải Tùy chỉnh), xóa custom topic
              if (value !== 'Tùy chỉnh') {
                setCustomTopic('');
              }
            }}
            style={styles.picker}
          >
            {PRESET_TOPICS.map(topic => (
              <Picker.Item key={topic} label={topic} value={topic} />
            ))}
          </Picker>
        </View>

        {/* Custom Topic Input - Always visible */}
        <View style={styles.labelRow}>
          <Icon name="edit" size={18} color="#495057" />
          <Text style={styles.label}>Hoặc nhập chủ đề tùy ý:</Text>
        </View>
        <TextInput
          placeholder="Ví dụ: Lịch sử Việt Nam"
          placeholderTextColor="#888"
          style={styles.input}
          value={customTopic}
          onChangeText={(text) => {
            setCustomTopic(text);
            // Khi nhập vào ô tùy chỉnh, tự động chuyển dropdown về "Tùy chỉnh"
            if (text.trim()) {
              setSelectedTopic('Tùy chỉnh');
            }
          }}
        />

        {/* Description Input */}
        <View style={styles.labelRow}>
          <Icon name="description" size={18} color="#495057" />
          <Text style={styles.label}>Mô tả chi tiết (tùy chọn):</Text>
        </View>
        <TextInput
          multiline
          placeholder="Ví dụ: Bài đọc về du lịch ở châu Âu, đi cùng gia đình, không khí vui vẻ"
          placeholderTextColor="#888"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
        />

        {/* Generate Button */}
        {!generatedText && (
          <Animated.View style={{ transform: [{ scale: generateButtonScale }] }}>
            <TouchableOpacity
              onPressIn={() => handlePressIn(generateButtonScale)}
              onPressOut={() => handlePressOut(generateButtonScale)}
              onPress={handleGenerate}
              disabled={isGenerating}
              style={[styles.actionButton, styles.generateButton]}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="auto-awesome" size={24} color="#FFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Tạo bài đọc</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Generated Text Display */}
        {generatedText && (
          <View style={styles.generatedContainer}>
            <View style={styles.generatedHeader}>
              <View style={styles.generatedTitleRow}>
                <Icon name="article" size={18} color="#495057" />
                <Text style={styles.generatedTitle}>Bài đọc đã tạo:</Text>
              </View>
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
                disabled={isGenerating}
                style={[styles.smallButton, styles.regenerateButton]}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Icon name="refresh" size={20} color="#FFF" />
                    <Text style={styles.smallButtonText}>Tạo lại</Text>
                  </>
                )}
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: practiceButtonScale }], flex: 1 }}>
                <TouchableOpacity
                  onPressIn={() => handlePressIn(practiceButtonScale)}
                  onPressOut={() => handlePressOut(practiceButtonScale)}
                  onPress={handleStartPractice}
                  style={[styles.smallButton, styles.practiceButton]}
                >
                  <Icon name="mic" size={20} color="#FFF" />
                  <Text style={styles.smallButtonText}>Luyện đọc</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { padding: 25, paddingTop: 10, zIndex: 10 },
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#495057' },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
  },
  picker: { 
    height: 56,
    marginVertical: 0,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#343A40',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
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
  generateButton: { backgroundColor: '#FF6B6B' },
  buttonIcon: { marginRight: 12 },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  generatedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  generatedHeader: { marginBottom: 12 },
  generatedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generatedTitle: { fontWeight: '600', fontSize: 16, color: '#495057' },
  generatedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  actionButtonGroup: { flexDirection: 'row', gap: 10 },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  regenerateButton: { backgroundColor: '#6c757d' },
  practiceButton: { backgroundColor: '#5E72EB', flex: 1 },
  smallButtonText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
});
