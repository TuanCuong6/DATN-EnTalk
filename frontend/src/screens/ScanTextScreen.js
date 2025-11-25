// frontend/src/screens/ScanTextScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useNavigation } from '@react-navigation/native';

export default function ScanTextScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [scanning, setScanning] = useState(false);
  const navigation = useNavigation();

  const handleTakePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 1 });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Lỗi mở camera:', result.errorMessage);
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    setImageUri(uri);
    handleScanText(uri);
  };

  const cleanText = (text) => {
    if (!text) return '';
    
    let cleaned = text;
    
    // 1. Xóa các ký tự đặc biệt không cần thiết, giữ lại dấu câu cơ bản
    cleaned = cleaned.replace(/[^\w\s.,!?'-]/g, ' ');
    
    // 2. Thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // 3. Xóa khoảng trắng trước dấu câu
    cleaned = cleaned.replace(/\s+([.,!?])/g, '$1');
    
    // 4. Thêm khoảng trắng sau dấu câu nếu chưa có
    cleaned = cleaned.replace(/([.,!?])([^\s])/g, '$1 $2');
    
    // 5. Xóa khoảng trắng đầu/cuối
    cleaned = cleaned.trim();
    
    // 6. Viết hoa chữ cái đầu câu
    cleaned = cleaned.replace(/(^\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    
    return cleaned;
  };

  const handleScanText = async uri => {
    try {
      setScanning(true);
      const result = await TextRecognition.recognize(uri);
      const text = result?.text?.trim();
      if (!text) {
        Alert.alert('Không nhận diện được chữ trong ảnh');
        return;
      }
      
      // Clean text trước khi navigate
      const cleanedText = cleanText(text);
      navigation.navigate('PracticeCustomReadingScreen', { customText: cleanedText });
    } catch (err) {
      console.error('❌ OCR error:', err);
      Alert.alert('Lỗi khi quét văn bản');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Quét ảnh để luyện đọc</Text>
      <Button title="Chụp ảnh" onPress={handleTakePhoto} />
      {scanning && (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={styles.loading}
        />
      )}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  image: { width: '100%', height: 300, marginTop: 20, resizeMode: 'contain' },
  loading: { marginTop: 20 },
});
