// frontend/src/screens/CustomContentChoiceScreen.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProfile } from '../api/account';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function CustomContentChoiceScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const button1Scale = useRef(new Animated.Value(1)).current;
  const button2Scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    getProfile().then(res => setProfile(res.data));

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
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

  return (
    <View style={styles.container}>
      {/* Background gradient - khác với HomeScreen để phân biệt */}
      <LinearGradient
        colors={['#2C3E50', '#4A6491']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Nội dung tùy chỉnh</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.description}>
              Tạo nội dung phù hợp với nhu cầu học tập cá nhân
            </Text>

            {/* Options Container */}
            <View style={styles.optionsContainer}>
              {/* Option 1 */}
              <Animated.View
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale: button1Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button1Scale)}
                  onPressOut={() => handlePressOut(button1Scale)}
                  onPress={() => navigation.navigate('CustomReadingScreen')}
                  style={[styles.optionCard, styles.optionCard1]}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.iconCircle,
                      styles.iconCircle1,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <Icon name="edit" size={40} color="#FFFFFF" />
                  </Animated.View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Nhập nội dung</Text>
                    <Text style={styles.optionDescription}>
                      Văn bản hoặc quét ảnh
                    </Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Icon name="arrow-forward" size={24} color="#5E72EB" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Option 2 */}
              <Animated.View
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale: button2Scale }] },
                ]}
              >
                <TouchableOpacity
                  onPressIn={() => handlePressIn(button2Scale)}
                  onPressOut={() => handlePressOut(button2Scale)}
                  onPress={() => navigation.navigate('AIGenerateReadingScreen')}
                  style={[styles.optionCard, styles.optionCard2]}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.iconCircle,
                      styles.iconCircle2,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <Icon name="auto-awesome" size={40} color="#FFFFFF" />
                  </Animated.View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Tạo từ AI</Text>
                    <Text style={styles.optionDescription}>AI tạo bài đọc</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Icon name="arrow-forward" size={24} color="#FF6B35" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
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
    height: 220,
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  mainContent: {
    paddingHorizontal: 24,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  optionWrapper: {
    marginBottom: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionCard1: {
    borderColor: '#5E72EB',
    borderTopWidth: 4,
  },
  optionCard2: {
    borderColor: '#FF6B35',
    borderTopWidth: 4,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconCircle1: {
    backgroundColor: '#5E72EB',
  },
  iconCircle2: {
    backgroundColor: '#FF6B35',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2980',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  arrowContainer: {
    padding: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
