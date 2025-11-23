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
import ImageCropPicker from 'react-native-image-crop-picker';
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
  const [profile, setProfile] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
    navigation.navigate('PracticeCustomReadingScreen', { customText });
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Chọn nguồn ảnh',
      'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: '📷 Chụp ảnh',
          onPress: () => handleCameraCapture(),
        },
        {
          text: '🖼️ Thư viện',
          onPress: () => handleGalleryPick(),
        },
      ],
    );
  };

  const handleCameraCapture = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        width: 1200,
        height: 1600,
        cropping: true,
        cropperToolbarTitle: 'Cắt ảnh',
        cropperChooseText: 'Xong',
        cropperCancelText: 'Hủy',
        freeStyleCropEnabled: true,
        includeBase64: false,
        compressImageQuality: 0.9,
      });

      await processImage(image.path);
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        console.error('❌ Camera error:', err);
        Alert.alert('Lỗi', 'Không thể chụp ảnh');
      }
    }
  };

  const handleRescanImage = handleImageSelection;

  const handleGalleryPick = async () => {
    try {
      const image = await ImageCropPicker.openPicker({
        width: 1200,
        height: 1600,
        cropping: true,
        cropperToolbarTitle: 'Cắt ảnh',
        cropperChooseText: 'Xong',
        cropperCancelText: 'Hủy',
        freeStyleCropEnabled: true,
        includeBase64: false,
        compressImageQuality: 0.9,
      });

      await processImage(image.path);
    } catch (err) {
      if (err.code !== 'E_PICKER_CANCELLED') {
        console.error('❌ Gallery error:', err);
        Alert.alert('Lỗi', 'Không thể chọn ảnh');
      }
    }
  };

  const processImage = async (imagePath) => {
    try {
      const ocrResult = await textRecognition.recognize(imagePath);
      const text = ocrResult?.text?.trim();

      if (!text || text.split(/\s+/).length < 4) {
        Alert.alert(
          'Không nhận diện được văn bản rõ ràng',
          'Ảnh có thể quá mờ, quá ít chữ, hoặc không chứa văn bản. Vui lòng thử lại.',
        );
        return;
      }

      setCustomText(text);
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
            setCustomText('');
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
        
        {/* Input Header with Clear Button */}
        <View style={styles.inputHeader}>
          <Text style={styles.label}>
            {customText.trim() ? '📖 Nội dung bạn sẽ đọc:' : '📝 Nhập nội dung bạn muốn luyện:'}
          </Text>
          {customText.trim() && (
            <Animated.View style={{ transform: [{ scale: clearButtonScale }] }}>
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
          )}
        </View>

        {/* Single Input Field */}
        <TextInput
          multiline
          placeholder="Ví dụ: The quick brown fox jumps over the lazy dog..."
          placeholderTextColor="#888"
          style={styles.input}
          value={customText}
          onChangeText={setCustomText}
          spellCheck={false}
          autoCorrect={false}
        />

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <Animated.View style={{ transform: [{ scale: startButtonScale }] }}>
            <TouchableOpacity
              onPressIn={() => handlePressIn(startButtonScale)}
              onPressOut={() => handlePressOut(startButtonScale)}
              onPress={handleStartPractice}
              style={[styles.actionButton, styles.startButton]}
            >
              <Icon name="mic" size={24} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>🚀 Bắt đầu luyện đọc</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scanButtonScale }] }}>
            <TouchableOpacity
              onPressIn={() => handlePressIn(scanButtonScale)}
              onPressOut={() => handlePressOut(scanButtonScale)}
              onPress={handleImageSelection}
              style={[styles.actionButton, styles.scanButton]}
            >
              <Icon name="camera-alt" size={24} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>📸 Quét ảnh văn bản</Text>
            </TouchableOpacity>
          </Animated.View>
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
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 17,
    lineHeight: 26,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(185, 74, 70, 0.3)',
  },
  clearButtonText: {
    marginLeft: 4,
    color: '#b94a46',
    fontWeight: '600',
    fontSize: 14,
  },
});
