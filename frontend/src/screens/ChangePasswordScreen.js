import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { changePassword } from '../api/account';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Refs cho TextInput
  const oldPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Hàm focus input
  const focusInput = inputRef => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  // Hàm toggle hiển thị mật khẩu
  const toggleShowPassword = type => {
    switch (type) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleChange = async () => {
    // Chặn spam - nếu đang loading thì không làm gì
    if (isLoading) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tất cả các trường mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss(); // Đóng bàn phím khi bắt đầu đổi mật khẩu

      await changePassword({ oldPassword, newPassword, confirmPassword });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi server');
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        >
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Đổi mật khẩu</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon name="lock" size={18} color="#495057" />
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
          </View>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(oldPasswordRef)}
            activeOpacity={1}
          >
            <TextInput
              ref={oldPasswordRef}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#888"
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
              style={styles.input}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword('old')}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Icon
                name={showOldPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6C757D"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon name="vpn-key" size={18} color="#495057" />
            <Text style={styles.label}>Mật khẩu mới</Text>
          </View>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(newPasswordRef)}
            activeOpacity={1}
          >
            <TextInput
              ref={newPasswordRef}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#888"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword('new')}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Icon
                name={showNewPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6C757D"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Icon name="check-circle" size={18} color="#495057" />
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
          </View>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(confirmPasswordRef)}
            activeOpacity={1}
          >
            <TextInput
              ref={confirmPasswordRef}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#888"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => toggleShowPassword('confirm')}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6C757D"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPressIn={() => !isLoading && handlePressIn()}
            onPressOut={() => !isLoading && handlePressOut()}
            onPress={handleChange}
            style={[
              styles.actionButton,
              styles.saveButton,
              isLoading && styles.buttonDisabled,
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon
                  name="lock-reset"
                  size={24}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Đổi Mật Khẩu</Text>
              </>
            )}
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
  inputGroup: {
    marginBottom: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#343A40',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
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
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#5E72EB',
  },
  buttonDisabled: {
    opacity: 0.6,
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
