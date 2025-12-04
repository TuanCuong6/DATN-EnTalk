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
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import { getStreak } from '../api/streak';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StreakModal from '../components/StreakModal';

const { width } = Dimensions.get('window');
const chatbotImage = require('../assets/chatbot.png');
const topicImage = require('../assets/topic.png');
const editImage = require('../assets/edit.png');
const youtubeImage = require('../assets/youtube.png');

const STREAK_LEVELS = [
  {
    min: 1,
    max: 10,
    icon: 'local-fire-department',
    color: '#FF6B35',
    name: 'Người mới bắt đầu',
  },
  {
    min: 10,
    max: 50,
    icon: 'flash-on',
    color: '#FFB347',
    name: 'Người học trung cấp',
  },
  {
    min: 50,
    max: 100,
    icon: 'diamond',
    color: '#4ECDC4',
    name: 'Người nói nâng cao',
  },
  {
    min: 100,
    max: 200,
    icon: 'emoji-events',
    color: '#45B7D1',
    name: 'Chuyên gia',
  },
  {
    min: 200,
    max: Infinity,
    icon: 'stars',
    color: '#96CEB4',
    name: 'Bậc thầy',
  },
];

const getStreakLevel = streak => {
  return (
    STREAK_LEVELS.find(level => streak >= level.min && streak < level.max) ||
    STREAK_LEVELS[0]
  );
};

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const button3Scale = useRef(new Animated.Value(1)).current;
  const button4Scale = useRef(new Animated.Value(1)).current;
  const streakPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));
    getStreak()
      .then(data => {
        setStreakData(data);
      })
      .catch(err => {
        console.log('Lỗi streak:', err);
      });

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
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getProfile().then(res => setProfile(res.data));
      getStreak()
        .then(data => {
          setStreakData(data);
        })
        .catch(err => {
          console.log('Lỗi streak:', err);
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A2980', '#26D0CE']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="school" size={32} color="#FFFFFF" />
              <Text style={styles.appTitle}>EnTalk</Text>
            </View>

            <View style={styles.headerRight}>
              {streakData && (
                <Animated.View style={{ transform: [{ scale: streakPulse }] }}>
                  <TouchableOpacity
                    style={[
                      styles.streakContainer,
                      !streakData.practiced_today && styles.streakWarning,
                    ]}
                    onPress={() => setShowStreakModal(true)}
                  >
                    <Icon
                      name={getStreakLevel(streakData.current_streak).icon}
                      size={22}
                      color={streakData.practiced_today ? '#FFFFFF' : '#FFD93D'}
                    />
                    <Text
                      style={[
                        styles.streakCount,
                        !streakData.practiced_today && styles.streakWarningText,
                      ]}
                    >
                      {streakData.current_streak}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {profile && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Account')}
                  style={styles.avatarContainer}
                >
                  {profile.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="person" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>
              Xin chào, {profile ? getDisplayName(profile.name) : 'bạn'}!
            </Text>
            <Text style={styles.subtitle}>
              Cùng luyện đọc tiếng Anh ngay hôm nay
            </Text>
          </View>

          {/* Main Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.gridRow}>
              <Animated.View
                style={[
                  styles.featureCardContainer,
                  { transform: [{ scale: button1Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button1Scale)}
                  onPressOut={() => handlePressOut(button1Scale)}
                  onPress={() => navigation.navigate('TopicList')}
                  style={[styles.featureCard, styles.cardBlue]}
                  activeOpacity={0.8}
                >
                  <Image source={topicImage} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Bài đọc theo chủ đề</Text>
                  <Text style={styles.cardSubtitle}>Khám phá chủ đề</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={[
                  styles.featureCardContainer,
                  { transform: [{ scale: button2Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button2Scale)}
                  onPressOut={() => handlePressOut(button2Scale)}
                  onPress={() =>
                    navigation.navigate('CustomContentChoiceScreen')
                  }
                  style={[styles.featureCard, styles.cardOrange]}
                  activeOpacity={0.8}
                >
                  <Image source={editImage} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Nội dung tùy chỉnh</Text>
                  <Text style={styles.cardSubtitle}>Nội dung của bạn</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.gridRow}>
              <Animated.View
                style={[
                  styles.featureCardContainer,
                  { transform: [{ scale: button3Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button3Scale)}
                  onPressOut={() => handlePressOut(button3Scale)}
                  onPress={() => navigation.navigate('YoutubeReadingScreen')}
                  style={[styles.featureCard, styles.cardPurple]}
                  activeOpacity={0.8}
                >
                  <Image source={youtubeImage} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Bài đọc từ YouTube</Text>
                  <Text style={styles.cardSubtitle}>Học từ video</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={[
                  styles.featureCardContainer,
                  { transform: [{ scale: button4Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button4Scale)}
                  onPressOut={() => handlePressOut(button4Scale)}
                  onPress={() => navigation.navigate('ChatbotScreen')}
                  style={[styles.featureCard, styles.cardTeal]}
                  activeOpacity={0.8}
                >
                  <Image source={chatbotImage} style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Trợ lý AI</Text>
                  <Text style={styles.cardSubtitle}>Hỏi đáp tiếng Anh</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {/* Tip Section */}
          <View style={styles.tipContainer}>
            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Icon name="lightbulb" size={24} color="#FFB347" />
              </View>
              <Text style={styles.tipText}>
                Mỗi ngày luyện đọc 15 phút sẽ giúp cải thiện phát âm đáng kể
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

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
    backgroundColor: '#F8FAFF',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  streakWarning: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  streakWarningText: {
    color: '#FFD93D',
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingBottom: 35,
    marginTop: 10,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  featuresGrid: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureCardContainer: {
    width: (width - 56) / 2, // Tính toán kích thước bằng nhau
  },
  featureCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderTopWidth: 4,
    height: 180, // Chiều cao cố định để tất cả thẻ bằng nhau
    justifyContent: 'center',
  },
  cardBlue: {
    borderTopColor: '#5E72EB',
  },
  cardOrange: {
    borderTopColor: '#FF6B35',
  },
  cardPurple: {
    borderTopColor: '#9D4EDD',
  },
  cardTeal: {
    borderTopColor: '#4ECDC4',
  },
  cardIcon: {
    width: 60, // Tăng kích thước icon
    height: 60,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16, // Tăng kích thước chữ
    fontWeight: '700',
    color: '#1A2980',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 14, // Tăng kích thước chữ
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  tipContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    gap: 15,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 179, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
});
