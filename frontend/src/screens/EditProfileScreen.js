// frontend/src/screens/EditProfileScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { getProfile, updateProfile, uploadAvatar } from '../api/account';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [avatar_url, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [profile, setProfile] = useState(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile().then(res => {
      setName(res.data.name);
      setAvatarUrl(res.data.avatar_url || '');
      setProfile(res.data);
    });

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

  // Format date function
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const tryUploadAvatar = async formData => {
    let retries = 2;
    while (retries > 0) {
      try {
        const res = await uploadAvatar(formData);
        return res;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
      }
    }
  };

  const handleImage = async sourceFn => {
    sourceFn(
      {
        mediaType: 'photo',
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
      },
      response => {
        if (response.didCancel || response.errorCode) return;
        const photo = response.assets[0];
        setLocalPreviewUri(photo.uri);
        setSelectedPhoto({
          uri: photo.uri,
          name: photo.fileName || 'photo.jpg',
          type: photo.type || 'image/jpeg',
        });
      },
    );
  };

  const handleSave = async () => {
    let finalAvatarUrl = avatar_url;

    if (selectedPhoto) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('avatar', selectedPhoto);
        const res = await tryUploadAvatar(formData);
        finalAvatarUrl = res?.data?.avatar_url || avatar_url;
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        return;
      } finally {
        setUploading(false);
      }
    }

    await updateProfile({ name, avatar_url: finalAvatarUrl });
    Alert.alert('Thành công', 'Đã cập nhật thông tin');
    navigation.goBack();
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

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: localPreviewUri || avatar_url }}
            style={styles.profileAvatar}
          />
          {uploading && (
            <ActivityIndicator
              size="small"
              color="#5E72EB"
              style={styles.uploadIndicator}
            />
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleImage(launchImageLibrary)}
          >
            <Icon
              name="photo-library"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.imageButtonText}>Chọn ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleImage(launchCamera)}
          >
            <Icon
              name="camera-alt"
              size={20}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.imageButtonText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon name="person" size={18} color="#495057" />
            <Text style={styles.label}>Tên của bạn</Text>
          </View>
          <TextInput
            placeholder="Nhập tên của bạn"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        {/* THÊM: Thông tin chỉ xem, không chỉnh sửa */}
        <View style={styles.infoGroup}>
          <View style={styles.labelRow}>
            <Icon name="email" size={18} color="#495057" />
            <Text style={styles.label}>Email</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {profile?.email || 'Chưa có email'}
            </Text>
          </View>
        </View>

        <View style={styles.infoGroup}>
          <View style={styles.labelRow}>
            <Icon name="event" size={18} color="#495057" />
            <Text style={styles.label}>Ngày tham gia</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {profile?.created_at
                ? formatDate(profile.created_at)
                : 'Chưa có thông tin'}
            </Text>
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleSave}
            disabled={uploading}
            style={[
              styles.actionButton,
              styles.saveButton,
              uploading && styles.disabledButton,
            ]}
          >
            <Icon
              name="save"
              size={24}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {uploading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
    alignItems: 'center',
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
  avatarContainer: {
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  profileAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6E9FF',
    borderWidth: 3,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  uploadIndicator: {
    position: 'absolute',
    top: '50%',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5E72EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  imageButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  infoGroup: {
    marginBottom: 20,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
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
    fontSize: 16,
    color: '#343A40',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 16,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#5E72EB',
  },
  disabledButton: {
    backgroundColor: '#A0A7E0',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
