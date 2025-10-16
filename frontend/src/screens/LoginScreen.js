//frontend/src/screens/LoginScreen.js
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
  Image,
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
  const { login } = useContext(AuthContext);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      const res = await apiLogin({ email, password });
      console.log('🎯 API login response:', res.data);
      const { token, user } = res.data;

      await login(token, user);
      await setupFCM();
    } catch (err) {
      console.log('❌ Login failed error:', err?.response?.data || err.message);
      Alert.alert('Đăng nhập thất bại', err.response?.data?.message || 'Lỗi');
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Đăng nhập tài khoản</Text>
        <Text style={styles.subtitle}>
          Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Icon
            name="email"
            size={20}
            color="#5E72EB"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Icon
            name="lock"
            size={20}
            color="#5E72EB"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#888"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: loginButtonScale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(loginButtonScale)}
            onPressOut={() => handlePressOut(loginButtonScale)}
            onPress={handleLogin}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.linkButton}
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
    padding: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#343A40',
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
  linkText: {
    fontSize: 16,
    color: '#5E72EB',
    fontWeight: '500',
  },
});
