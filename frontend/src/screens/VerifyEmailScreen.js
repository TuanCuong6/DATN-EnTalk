//frontend/src/screens/VerifyEmailScreen.js
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
} from 'react-native';
import { verifyEmail } from '../api/auth';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function VerifyEmailScreen({ route }) {
  const navigation = useNavigation();
  const { name, email, password } = route.params;
  const [code, setCode] = useState('');
  const buttonScale = useRef(new Animated.Value(1)).current;
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

  const handleVerify = async () => {
    try {
      await verifyEmail({ email, code, name, password });
      Alert.alert('Thành công', 'Tài khoản đã được xác minh!');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Xác minh thất bại');
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

      {/* Header: Logo + Back button */}
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
          />
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleVerify}
            style={[styles.actionButton, styles.verifyButton]}
          >
            <Icon
              name="verified"
              size={24}
              color="#FFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Xác Minh Tài Khoản</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.resendLink}>
          <Text style={styles.resendText}>Không nhận được mã? Gửi lại</Text>
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
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#5E72EB',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
