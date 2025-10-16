//frontend/src/screens/RecordDetailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { getRecordDetail } from '../api/history';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function RecordDetailScreen({ route }) {
  const navigation = useNavigation();
  const { recordId } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const res = await getRecordDetail(recordId);
        setDetail(res.data);
      } catch (err) {
        console.error('❌ Lỗi lấy chi tiết record:', err);
        Alert.alert(
          '⛔ Thông báo',
          'Bản ghi đã bị xóa hoặc không còn tồn tại.',
        );
      } finally {
        setLoading(false);
      }
    })();

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

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRetry = () => {
    if (detail.is_community_post) {
      navigation.navigate('CustomReadingScreen', {
        customText: detail.reading_content,
      });
    } else {
      navigation.navigate('ReadingPractice', {
        reading: {
          id: detail.reading_id,
          title: detail.topic_name || 'Không rõ',
          level: 'A1',
          content: detail.reading_content,
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F7FF', '#E6FCFF']}
          style={styles.background}
        />
        <ActivityIndicator
          size="large"
          color="#5E72EB"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  if (!detail) return null;

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

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Chi tiết bản ghi</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Nội dung đã đọc:</Text>
          <Text style={styles.sectionText}>{detail.reading_content}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗣 Transcript:</Text>
          <Text style={styles.sectionText}>{detail.transcript}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Điểm số:</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Tổng thể:</Text>
              <Text style={styles.scoreValue}>
                {detail.score_overall?.toFixed(2)}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Phát âm:</Text>
              <Text style={styles.scoreValue}>
                {detail.score_pronunciation}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Trôi chảy:</Text>
              <Text style={styles.scoreValue}>{detail.score_fluency}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Ngữ điệu:</Text>
              <Text style={styles.scoreValue}>{detail.score_intonation}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Tốc độ:</Text>
              <Text style={styles.scoreValue}>{detail.score_speed}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Nhận xét:</Text>
          <Text style={styles.sectionText}>{detail.comment}</Text>
        </View>

        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Icon
            name="replay"
            size={24}
            color="#FFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.retryButtonText}>🔁 Luyện lại</Text>
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
  content: {
    padding: 25,
    paddingTop: 10,
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
    paddingBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
  },
  scoreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scoreItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.1)',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#495057',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5E72EB',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#5E72EB',
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
});
