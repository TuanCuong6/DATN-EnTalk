// frontend/src/screens/HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';

// Giả định bạn có ảnh chatbot trong assets
const chatbotImage = require('../assets/chatbot.png');

export default function HomeScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Floating animation for chatbot
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotate animation for logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getProfile().then(res => setProfile(res.data));
    });
    return unsubscribe;
  }, [navigation]);

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

  // Floating animation interpolation
  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={styles.background}
      />

      {/* Decorative elements */}
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

      <Animated.View style={styles.content}>
        {/* Header: Logo + Avatar + Tên */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Text style={styles.logo}>EnTalk</Text>
            </View>
            <Icon
              name="language"
              size={24}
              color="#5E72EB"
              style={styles.cableCar}
            />
          </View>

          {profile && (
            <View style={styles.userInfo}>
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="person" size={20} color="#5E72EB" />
                </View>
              )}
              <Text style={styles.name}>{profile.name}</Text>
            </View>
          )}
        </View>

        {/* Lời chào */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Chào mừng bạn đến với</Text>
          <Text style={styles.appName}>EnTalk</Text>
          <Text style={styles.subtitle}>Luyện đọc tiếng Anh hiệu quả</Text>
          <View style={styles.divider} />
        </View>

        {/* Nút chức năng */}
        <Animated.View style={{ transform: [{ scale: button1Scale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(button1Scale)}
            onPressOut={() => handlePressOut(button1Scale)}
            onPress={() => navigation.navigate('TopicList')}
          >
            <View style={[styles.button, styles.button1]}>
              <Icon
                name="folder"
                size={28}
                color="#5E72EB"
                style={styles.buttonIcon}
              />
              <View>
                <Text style={styles.buttonTitle}>Bài đọc theo chủ đề</Text>
                <Text style={styles.buttonSubtitle}>
                  Khám phá các chủ đề thú vị
                </Text>
              </View>
              <Icon
                name="arrow-forward"
                size={24}
                color="#5E72EB"
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(button2Scale)}
            onPressOut={() => handlePressOut(button2Scale)}
            onPress={() => navigation.navigate('CustomReadingScreen')}
          >
            <View style={[styles.button, styles.button2]}>
              <Icon
                name="edit"
                size={28}
                color="#FF6B6B"
                style={styles.buttonIcon}
              />
              <View>
                <Text style={styles.buttonTitle}>Nhập nội dung tùy chỉnh</Text>
                <Text style={styles.buttonSubtitle}>
                  Luyện tập với nội dung của bạn
                </Text>
              </View>
              <Icon
                name="arrow-forward"
                size={24}
                color="#FF6B6B"
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Chatbot với hiệu ứng nổi */}
        <Animated.View
          style={[
            styles.chatbotContainer,
            { transform: [{ translateY: floatInterpolation }] },
          ]}
        >
          <TouchableOpacity
            style={styles.chatbotButton}
            onPress={() => navigation.navigate('ChatbotScreen')}
          >
            <BlurView
              style={styles.chatbotBlur}
              blurType="light"
              blurAmount={10}
            />
            <Image source={chatbotImage} style={styles.chatbotImage} />
            <Text style={styles.chatbotText}>
              Hỏi mình bất cứ điều gì về tiếng Anh nhé!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
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
    flex: 1,
    padding: 25,
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
    marginBottom: 40,
    marginTop: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3D50EB',
    letterSpacing: 0.5,
  },
  cableCar: {
    marginLeft: 10,
    transform: [{ rotate: '90deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 8,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  name: {
    marginLeft: 10,
    fontSize: 16,
    color: '#5E72EB',
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
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
  greetingContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    color: '#343A40',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#343A40',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 15,
  },
  divider: {
    height: 4,
    width: 80,
    backgroundColor: '#5E72EB',
    borderRadius: 2,
    opacity: 0.5,
  },
  button: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  button1: {
    borderLeftWidth: 5,
    borderLeftColor: '#5E72EB',
  },
  button2: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF6B6B',
  },
  buttonIcon: {
    marginRight: 15,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    padding: 10,
    borderRadius: 12,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 3,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
  chatbotContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  chatbotButton: {
    alignItems: 'center',
    position: 'relative',
  },
  chatbotBlur: {
    position: 'absolute',
    width: 250,
    height: 100,
    borderRadius: 25,
    overflow: 'hidden',
  },
  chatbotImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: 10,
  },
  chatbotText: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    color: '#5E72EB',
    fontWeight: '500',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
});
