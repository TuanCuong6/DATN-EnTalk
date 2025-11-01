// frontend/src/screens/VerifyEmailScreen.js
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
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { verifyEmail, resendVerificationCode } from '../api/auth';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function VerifyEmailScreen({ route }) {
  const navigation = useNavigation();
  const { name, email, password } = route.params;
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const resendButtonScale = useRef(new Animated.Value(1)).current;
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

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handleVerify = async () => {
    // Chặn spam
    if (isVerifying) return;

    if (!code || code.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác nhận 6 chữ số');
      return;
    }

    try {
      setIsVerifying(true);
      Keyboard.dismiss();

      await verifyEmail({ email, code, name, password });
      Alert.alert('Thành công', 'Tài khoản đã được xác minh!');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Xác minh thất bại');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    // Chặn spam và đảm bảo countdown đã hết
    if (isResending || countdown > 0) return;

    try {
      setIsResending(true);

      await resendVerificationCode({ email });
      Alert.alert(
        'Thành công',
        'Mã xác nhận mới đã được gửi đến email của bạn',
      );

      // Set countdown 60 giây
      setCountdown(60);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Gửi lại mã thất bại');
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

      {/* Header: Logo + Back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={isVerifying}
        >
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Icon
          name="mark-email-read"
          size={80}
          color="#5E72EB"
          style={styles.icon}
        />
        <Text style={styles.screenTitle}>Xác Minh Email</Text>
        <Text style={styles.description}>
          Chúng tôi đã gửi mã xác nhận đến:
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🔢 Mã xác nhận</Text>
          <TextInput
            placeholder="Nhập mã 6 chữ số"
            placeholderTextColor="#888"
            value={code}
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isVerifying}
            caretHidden={false}
          />
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPressIn={() => !isVerifying && handlePressIn(buttonScale)}
            onPressOut={() => !isVerifying && handlePressOut(buttonScale)}
            onPress={handleVerify}
            style={[
              styles.actionButton,
              styles.verifyButton,
              isVerifying && styles.buttonDisabled,
            ]}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon
                  name="verified"
                  size={24}
                  color="#FFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Xác Minh Tài Khoản</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendDescription}>Không nhận được mã?</Text>

          <Animated.View style={{ transform: [{ scale: resendButtonScale }] }}>
            <TouchableOpacity
              onPressIn={() =>
                !isResending &&
                countdown === 0 &&
                handlePressIn(resendButtonScale)
              }
              onPressOut={() =>
                !isResending &&
                countdown === 0 &&
                handlePressOut(resendButtonScale)
              }
              onPress={handleResendCode}
              style={[
                styles.resendButton,
                (isResending || countdown > 0) && styles.resendButtonDisabled,
              ]}
              disabled={isResending || countdown > 0}
            >
              {isResending ? (
                <ActivityIndicator size="small" color="#5E72EB" />
              ) : (
                <Text style={styles.resendButtonText}>
                  {countdown > 0
                    ? `Gửi lại sau ${formatCountdown(countdown)}`
                    : 'Gửi lại mã'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {countdown > 0 && (
          <Text style={styles.countdownNote}>
            Vui lòng đợi hết thời gian trước khi gửi lại mã mới
          </Text>
        )}
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
    paddingTop: 30,
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
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
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
    fontSize: 16,
    color: '#343A40',
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
  verifyButton: {
    backgroundColor: '#4CAF50',
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
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 10,
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5E72EB',
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
  },
  resendButtonDisabled: {
    opacity: 0.5,
    borderColor: '#6C757D',
  },
  resendButtonText: {
    color: '#5E72EB',
    fontWeight: '600',
    fontSize: 14,
  },
  countdownNote: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
