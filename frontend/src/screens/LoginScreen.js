// frontend/src/screens/LoginScreen.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { login as apiLogin } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { setupFCM } from '../utils/notification';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  // Refs cho TextInput
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Animation values
  const loginButtonScale = useRef(new Animated.Value(1)).current;
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

  // Hàm focus input
  const focusInput = inputRef => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  // Hàm toggle hiển thị mật khẩu
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    // Chặn spam - nếu đang loading thì không làm gì
    if (isLoading) return;

    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss(); // Đóng bàn phím khi bắt đầu đăng nhập

      const res = await apiLogin({ email, password });
      console.log('🎯 API login response:', res.data);
      const { token, user } = res.data;

      await login(token, user);
      await setupFCM();
    } catch (err) {
      console.log('❌ Login failed error:', err?.response?.data || err.message);
      Alert.alert('Đăng nhập thất bại', err.response?.data?.message || 'Lỗi');
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

      {/* Header: Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Đăng nhập tài khoản</Text>
        <Text style={styles.subtitle}>
          Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
        </Text>

        {/* Email Input */}
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
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            cursorColor="#5E72EB"
            selectionColor="rgba(94, 114, 235, 0.2)"
            underlineColorAndroid="transparent"
          />
        </TouchableOpacity>

        {/* Password Input */}
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
            placeholder="Mật khẩu"
            placeholderTextColor="#888"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
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

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: loginButtonScale }] }}>
          <TouchableOpacity
            onPressIn={() => !isLoading && handlePressIn(loginButtonScale)}
            onPressOut={() => !isLoading && handlePressOut(loginButtonScale)}
            onPress={handleLogin}
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => !isLoading && navigation.navigate('Register')}
            style={[styles.linkButton, isLoading && styles.linkDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => !isLoading && navigation.navigate('ForgotPassword')}
            style={[styles.linkButton, isLoading && styles.linkDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
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
    paddingTop: 40,
    zIndex: 10,
    flexGrow: 1,
    justifyContent: 'center',
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
    alignItems: 'center',
    padding: 25,
    paddingBottom: 10,
    zIndex: 20,
    marginTop: 30,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3D50EB',
    letterSpacing: 0.5,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
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
    fontSize: 16,
    color: '#343A40',
    backgroundColor: 'transparent',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: '#5E72EB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  footerLinks: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 16,
    color: '#5E72EB',
    fontWeight: '500',
  },
});
