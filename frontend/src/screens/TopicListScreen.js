import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fetchAllTopics } from '../api/reading';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TopicListScreen() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const updateIntervalRef = useRef(null);

  const loadTopics = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      console.log('Loading topics...');
      const res = await fetchAllTopics();
      console.log('Topics loaded:', res.data.length);
      setTopics(res.data);
    } catch (err) {
      console.error('Error loading topics:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tính năng 2: Tự động cập nhật dữ liệu định kỳ
  const startAutoUpdate = () => {
    // Cập nhật mỗi 30 giây
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      console.log('Auto-updating topics data...');
      loadTopics();
    }, 30000); // 30 giây
  };

  // Sửa lại useFocusEffect để tránh re-render không cần thiết
  useFocusEffect(
    React.useCallback(() => {
      console.log('TopicListScreen focused');

      let isActive = true;

      const initScreen = async () => {
        await loadTopics();

        if (isActive) {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();

          // Pulsing animation for header icon
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

          // Bắt đầu tự động cập nhật
          startAutoUpdate();
        }
      };

      initScreen();

      return () => {
        console.log('TopicListScreen unfocused');
        isActive = false;
        // Dọn dẹp interval khi rời màn hình
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      };
    }, []),
  );

  // Tính năng 1: Vuốt xuống để load lại
  const onRefresh = () => {
    setRefreshing(true);
    loadTopics(true);
    // Reset interval sau khi refresh
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    startAutoUpdate();
  };

  const getImageForTopic = topic => {
    if (topic.image_url) {
      return { uri: topic.image_url };
    }
    return require('../assets/topics/hoctapvatruonghoc.png');
  };

  const getCompletionColor = percentage => {
    if (percentage >= 80) return '#4ECDC4';
    if (percentage >= 50) return '#FFB347';
    if (percentage >= 20) return '#FF6B35';
    return '#FFD93D';
  };

  const renderTopicCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TopicReadings', { topic: item })}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Image Container */}
        <View style={styles.imageWrapper}>
          <Image
            source={getImageForTopic(item)}
            style={styles.topicImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Topic Info */}
        <View style={styles.cardContent}>
          <Text style={styles.topicName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Progress Indicator */}
          {item.total_readings > 0 && (
            <View style={styles.progressWrapper}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressPercentage}>
                  {Math.round(item.completion_percentage)}%
                </Text>
                <Text style={styles.progressCount}>
                  {item.completed_readings}/{item.total_readings} bài
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${item.completion_percentage}%`,
                      backgroundColor: getCompletionColor(
                        item.completion_percentage,
                      ),
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('TopicReadings', { topic: item })}
        >
          <Icon name="play-arrow" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && topics.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E72EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#F8FAFF', '#E6F3FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Icon name="library-books" size={24} color="#5E72EB" />
          </Animated.View>
          <Text style={styles.title}>Chủ đề học tập</Text>
        </View>

        {/* Đã bỏ icon filter */}
      </Animated.View>

      {/* Stats Overview */}
      {topics.length > 0 && (
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFF']}
            style={styles.statsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{topics.length}</Text>
              <Text style={styles.statLabel}>Chủ đề</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {topics.reduce(
                  (total, topic) => total + topic.total_readings,
                  0,
                )}
              </Text>
              <Text style={styles.statLabel}>Bài đọc</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Topics List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <FlatList
          data={topics}
          keyExtractor={item => `topic-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderTopicCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-off" size={60} color="#C5C5D3" />
              <Text style={styles.emptyText}>Không có chủ đề nào</Text>
            </View>
          }
          extraData={topics}
          // TÍNH NĂNG 1: Thêm refresh control cho pull-to-refresh
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#5E72EB']}
              tintColor="#5E72EB"
            />
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Thay đổi từ 'space-between' thành 'center'
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    position: 'absolute', // Đặt vị trí absolute
    left: 20, // Căn trái
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A2980',
    letterSpacing: 0.5,
  },
  // Đã xoá styles.filterButton
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5E72EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(94, 114, 235, 0.2)',
    marginHorizontal: 20,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    minHeight: 200,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: (width - 40) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    position: 'relative',
  },
  imageWrapper: {
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    margin: 10,
    marginBottom: 0,
  },
  topicImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 41, 128, 0.1)',
  },
  cardContent: {
    padding: 15,
    paddingTop: 10,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2980',
    marginBottom: 12,
    lineHeight: 22,
    minHeight: 44,
  },
  progressWrapper: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5E72EB',
  },
  progressCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  startButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5E72EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
