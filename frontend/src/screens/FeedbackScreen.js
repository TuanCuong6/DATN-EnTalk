//frontend/src/screens/FeedbackScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { sendFeedback } from '../api/feedback';
import ImageResizer from 'react-native-image-resizer';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function FeedbackScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel && result.assets?.[0]) {
      const original = result.assets[0];

      // Nén ảnh lại trước khi gửi
      const resized = await ImageResizer.createResizedImage(
        original.uri,
        800,
        800,
        'JPEG',
        70,
      );

      setImage({
        uri: resized.uri,
        name: resized.name || 'screenshot.jpg',
        type: 'image/jpeg',
      });
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert('Vui lòng nhập nội dung góp ý');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('screenshot', {
        uri: image.uri,
        name: image.fileName || 'screenshot.jpg',
        type: image.type || 'image/jpeg',
      });
    }

    setLoading(true);
    try {
      await sendFeedback(formData);
      Alert.alert('🎉 Gửi góp ý thành công!');
      setContent('');
      setImage(null);
      navigation.goBack();
    } catch (err) {
      console.error('❌ Lỗi gửi góp ý:', err);
      Alert.alert('Lỗi khi gửi góp ý, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
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
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>🧪 Góp ý / Báo lỗi</Text>

        <Text style={styles.label}>Nội dung góp ý:</Text>
        <TextInput
          multiline
          placeholder="Nhập nội dung góp ý của bạn..."
          placeholderTextColor="#888"
          style={styles.input}
          value={content}
          onChangeText={setContent}
        />

        <TouchableOpacity onPress={handlePickImage} style={styles.imageButton}>
          <Icon
            name={image ? 'check-circle' : 'add-photo-alternate'}
            size={24}
            color="#5E72EB"
          />
          <Text style={styles.imageButtonText}>
            {image ? 'Đã chọn ảnh' : 'Đính kèm ảnh màn hình (tuỳ chọn)'}
          </Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image.uri }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        )}

        <TouchableOpacity
          onPress={handleSend}
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Icon name="send" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Gửi góp ý</Text>
            </>
          )}
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
  content: {
    padding: 25,
    paddingTop: 10,
    zIndex: 10,
    paddingBottom: 30,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 25,
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
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#5E72EB',
    fontWeight: '500',
    marginLeft: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5E72EB',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
});
