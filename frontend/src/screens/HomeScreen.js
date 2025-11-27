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
import { getStreak } from '../api/streak';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import StreakModal from '../components/StreakModal';

const chatbotImage = require('../assets/chatbot.png');
const topicImage = require('../assets/topic.png');
const editImage = require('../assets/edit.png');
const youtubeImage = require('../assets/youtube.png');

const STREAK_LEVELS = [
  {
    min: 1,
    max: 10,
    icon: 'local-fire-department',
    color: '#FF6B6B',
    name: 'Beginner Flame',
  },
  {
    min: 10,
    max: 50,
    icon: 'flash-on',
    color: '#FFD93D',
    name: 'Intermediate Master',
  },
  {
    min: 50,
    max: 100,
    icon: 'diamond',
    color: '#6BCB77',
    name: 'Advanced Speaker',
  },
  {
    min: 100,
    max: 200,
    icon: 'emoji-events',
    color: '#4D96FF',
    name: 'Proficient Legend',
  },
  {
    min: 200,
    max: Infinity,
    icon: 'stars',
    color: '#9D4EDD',
    name: 'Native Immortal',
  },
];

const getStreakLevel = streak => {
  return (
    STREAK_LEVELS.find(level => streak >= level.min && streak < level.max) ||
    STREAK_LEVELS[0]
  );
};

// Hàm rút gọn tên hiển thị
const getDisplayName = fullName => {
  if (!fullName) return '';
  const trimmedName = fullName.trim();
  if (trimmedName.length <= 12) {
    return trimmedName;
  }
  const words = trimmedName.split(/\s+/);
  if (words.length > 2) {
    const lastTwoWords = words.slice(-2).join(' ');
    if (lastTwoWords.length > 12) {
      const lastName = words[words.length - 1];
      return lastName.length > 10
        ? lastName.substring(0, 10) + '...'
        : lastName;
    }
    return lastTwoWords;
  }

  if (words.length === 1 || words.length === 2) {
    const displayText = words.join(' ');
    return displayText.length > 10
      ? displayText.substring(0, 10) + '...'
      : displayText;
  }

  return trimmedName.substring(0, 10) + '...';
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const button3Scale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));
    getStreak()
      .then(data => {
        console.log('✅ Streak data:', data);
        setStreakData(data);
      })
      .catch(err => {
        console.log('❌ Streak error:', err);
        console.log('❌ Error details:', err.response?.data);
      });

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(streakPulse, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(streakPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

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
      getStreak()
        .then(data => {
          console.log('✅ Streak data (focus):', data);
          setStreakData(data);
        })
        .catch(err => {
          console.log('❌ Streak error (focus):', err);
        });
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
            <Image
              source={require('../assets/logo_entalk.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerRight}>
            {/* Streak button */}
            {streakData && (
              <Animated.View style={{ transform: [{ scale: streakPulse }] }}>
                <TouchableOpacity
                  style={[
                    styles.streakButton,
                    !streakData.practiced_today &&
                      (streakData.current_streak >= 2 ||
                        (streakData.current_streak === 1 &&
                          streakData.last_practice_date)) &&
                      styles.streakButtonWarning,
                  ]}
                  onPress={() => setShowStreakModal(true)}
                >
                  <Icon
                    name={getStreakLevel(streakData.current_streak).icon}
                    size={24}
                    color={
                      streakData.practiced_today
                        ? getStreakLevel(streakData.current_streak).color
                        : '#BDBDBD'
                    }
                  />
                  <Text
                    style={[
                      styles.streakText,
                      !streakData.practiced_today && styles.streakTextGray,
                    ]}
                  >
                    {streakData.current_streak}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {profile && (
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => navigation.navigate('Account')}
              >
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
                <Text style={styles.name} numberOfLines={1}>
                  {getDisplayName(profile.name)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Lời chào */}
        <View style={styles.greetingContainer}>
          <Text style={styles.appName}>EnTalk</Text>
          <Text style={styles.subtitle}>Luyện đọc tiếng Anh hiệu quả</Text>
          <View style={styles.divider} />
        </View>

        {/* Nút chức năng - Grid 2x2 */}
        <View style={styles.buttonGrid}>
          <Animated.View
            style={[styles.gridItem, { transform: [{ scale: button1Scale }] }]}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(button1Scale)}
              onPressOut={() => handlePressOut(button1Scale)}
              onPress={() => navigation.navigate('TopicList')}
              style={styles.gridButton}
            >
              <View style={[styles.gridButtonContent, styles.button1]}>
                <Image source={topicImage} style={styles.buttonIconImage} />
                <Text style={styles.gridButtonTitle}>Bài đọc theo chủ đề</Text>
                <Text style={styles.gridButtonSubtitle}>Khám phá chủ đề</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[styles.gridItem, { transform: [{ scale: button2Scale }] }]}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(button2Scale)}
              onPressOut={() => handlePressOut(button2Scale)}
              onPress={() => navigation.navigate('CustomContentChoiceScreen')}
              style={styles.gridButton}
            >
              <View style={[styles.gridButtonContent, styles.button2]}>
                <Image source={editImage} style={styles.buttonIconImage} />
                <Text style={styles.gridButtonTitle}>Nội dung tùy chỉnh</Text>
                <Text style={styles.gridButtonSubtitle}>Nội dung của bạn</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[styles.gridItem, { transform: [{ scale: button3Scale }] }]}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(button3Scale)}
              onPressOut={() => handlePressOut(button3Scale)}
              onPress={() => navigation.navigate('YoutubeReadingScreen')}
              style={styles.gridButton}
            >
              <View style={[styles.gridButtonContent, styles.button3]}>
                <Image source={youtubeImage} style={styles.buttonIconImage} />
                <Text style={styles.gridButtonTitle}>Bài đọc từ YouTube</Text>
                <Text style={styles.gridButtonSubtitle}>Học từ video</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[styles.gridItem, { transform: [{ scale: button1Scale }] }]}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(button1Scale)}
              onPressOut={() => handlePressOut(button1Scale)}
              onPress={() => navigation.navigate('ChatbotScreen')}
              style={styles.gridButton}
            >
              <View style={[styles.gridButtonContent, styles.button4]}>
                <Image source={chatbotImage} style={styles.chatbotIconImage} />
                <Text style={styles.gridButtonTitle}>Trợ lý AI</Text>
                <Text style={styles.gridButtonSubtitle}>Hỏi đáp tiếng Anh</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Streak Modal */}
      <StreakModal
        visible={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakData={streakData}
      />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'rgba(94, 114, 235, 0.3)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  streakButtonWarning: {
    borderColor: 'rgba(255, 107, 107, 0.5)',
    shadowColor: '#FF6B6B',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  streakTextGray: {
    color: '#BDBDBD',
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  logoImage: {
    width: 40,
    height: 40,
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    marginBottom: 15,
  },

  gridButton: {
    width: '100%',
  },
  gridButtonContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  button1: {
    borderTopWidth: 4,
    borderTopColor: '#5E72EB',
  },
  button2: {
    borderTopWidth: 4,
    borderTopColor: '#FF6B6B',
  },
  button3: {
    borderTopWidth: 4,
    borderTopColor: '#9D4EDD',
  },
  button4: {
    borderTopWidth: 4,
    borderTopColor: '#6BCB77',
  },
  gridButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
    marginTop: 12,
    textAlign: 'center',
  },
  gridButtonSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  chatbotIconImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonIconImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
