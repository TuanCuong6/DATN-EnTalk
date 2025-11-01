// frontend/src/screens/RegisterScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { register } from '../api/auth';
import { Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Thêm state cho hiển thị mật khẩu

  // Refs cho TextInput
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Animation values
  const registerButtonScale = useRef(new Animated.Value(1)).current;
  const loginButtonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Rotate animation for circles
  Animated.loop(
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 10000,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const focusInput = inputRef => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    if (isLoading) return;

    if (!name || !email || !password) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.',
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();

      await register({ name, email, password });
      Alert.alert('Đăng ký thành công', 'Vui lòng kiểm tra email để xác nhận');
      navigation.navigate('VerifyEmail', { name, email, password });
    } catch (err) {
      console.log('Register error:', err?.response?.data);
      Alert.alert('Lỗi', err.response?.data?.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={styles.background}
      />

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

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person-add" size={20} color="#5E72EB" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Tạo tài khoản mới</Text>

        <View style={styles.inputGroup}>
          {/* Name Input */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(nameInputRef)}
            activeOpacity={1}
          >
            <Icon
              name="person"
              size={20}
              color="#5E72EB"
              style={styles.inputIcon}
            />
            <TextInput
              ref={nameInputRef}
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(emailInputRef)}
            activeOpacity={1}
          >
            <Icon
              name="email"
              size={20}
              color="#5E72EB"
              style={styles.inputIcon}
            />
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
              autoCapitalize="none"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => focusInput(passwordInputRef)}
            activeOpacity={1}
          >
            <Icon
              name="lock"
              size={20}
              color="#5E72EB"
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              cursorColor="#5E72EB"
              selectionColor="rgba(94, 114, 235, 0.2)"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#6C757D"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: registerButtonScale }] }}>
          <TouchableOpacity
            onPressIn={() => !isLoading && handlePressIn(registerButtonScale)}
            onPressOut={() => !isLoading && handlePressOut(registerButtonScale)}
            onPress={handleRegister}
            style={[
              styles.actionButton,
              styles.registerButton,
              isLoading && styles.buttonDisabled,
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon
                  name="how-to-reg"
                  size={24}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Đăng ký tài khoản</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <Animated.View style={{ transform: [{ scale: loginButtonScale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(loginButtonScale)}
            onPressOut={() => handlePressOut(loginButtonScale)}
            onPress={() => !isLoading && navigation.navigate('Login')}
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            <Icon
              name="login"
              size={20}
              color="#5E72EB"
              style={styles.buttonIcon}
            />
            <Text style={styles.loginButtonText}>
              Đã có tài khoản? Đăng nhập
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
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(94, 114, 235, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 12,
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
    marginBottom: 20,
  },
  registerButton: {
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(94, 114, 235, 0.3)',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#495057',
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E72EB',
    marginLeft: 10,
  },
});
