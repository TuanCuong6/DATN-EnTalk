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

  const handleScanText = async uri => {
    try {
      setScanning(true);
      const result = await TextRecognition.recognize(uri);
      const text = result?.text?.trim();
      if (!text) {
        Alert.alert('Không nhận diện được chữ trong ảnh');
        return;
      }
      navigation.navigate('CustomReadingScreen', { customText: text });
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
