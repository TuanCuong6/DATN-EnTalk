//frontend/src/screens/CustomContentChoiceScreen.js
import React, { useRef, useEffect, useState } from 'react';
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

export default function CustomContentChoiceScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  // Animation values
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

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
          <Text style={styles.title}>Nội dung tùy chỉnh</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.subtitle}>Chọn cách bạn muốn tạo bài đọc</Text>

        {/* Option 1: Nhập nội dung tùy chỉnh */}
        <Animated.View style={{ transform: [{ scale: button1Scale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(button1Scale)}
            onPressOut={() => handlePressOut(button1Scale)}
            onPress={() => navigation.navigate('CustomReadingScreen')}
          >
            <View style={[styles.optionCard, styles.option1]}>
              <View style={styles.iconContainer}>
                <Icon name="edit" size={40} color="#5E72EB" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Nhập nội dung tùy chỉnh</Text>
                <Text style={styles.optionDescription}>
                  Nhập văn bản hoặc quét ảnh để luyện đọc
                </Text>
              </View>
              <Icon name="arrow-forward" size={28} color="#5E72EB" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Option 2: Tạo bài đọc từ AI */}
        <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
          <TouchableOpacity
            onPressIn={() => handlePressIn(button2Scale)}
            onPressOut={() => handlePressOut(button2Scale)}
            onPress={() => navigation.navigate('AIGenerateReadingScreen')}
          >
            <View style={[styles.optionCard, styles.option2]}>
              <View style={styles.iconContainer}>
                <Icon name="auto-awesome" size={40} color="#FF6B6B" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Tạo bài đọc từ AI</Text>
                <Text style={styles.optionDescription}>
                  AI tạo bài đọc theo chủ đề bạn chọn
                </Text>
              </View>
              <Icon name="arrow-forward" size={28} color="#FF6B6B" />
            </View>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  option1: {
    borderColor: '#5E72EB',
  },
  option2: {
    borderColor: '#FF6B6B',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
});
