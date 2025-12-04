//frontend/src/screens/TopicReadingScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { fetchReadingsByTopic } from '../api/reading';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import { getLevelText } from '../utils/levelHelper';

export default function TopicReadingsScreen() {
  const [readings, setReadings] = useState([]);
  const [filteredReadings, setFilteredReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { topic } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const levelOptions = [
    { value: 'all', label: 'Tất cả', icon: 'list' },
    { value: 'A1', label: 'Dễ', icon: 'trending-up' },
    { value: 'B1', label: 'Vừa', icon: 'equalizer' },
    { value: 'C1', label: 'Khó', icon: 'whatshot' },
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadReadings = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const res = await fetchReadingsByTopic(topic.id);
      setReadings(res.data);
      filterReadings(res.data, selectedLevel);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải bài đọc');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterReadings = (readingsList, level) => {
    if (level === 'all') {
      setFilteredReadings(readingsList);
    } else {
      const filtered = readingsList.filter(reading => reading.level === level);
      setFilteredReadings(filtered);
    }
  };

  useEffect(() => {
    filterReadings(readings, selectedLevel);
  }, [selectedLevel]);

  useFocusEffect(
    React.useCallback(() => {
      loadReadings();
    }, [topic.id]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReadings(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F7FF', '#E6FCFF']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#5E72EB" />
      </View>
    );
  }

  const renderReadingItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate('ReadingPractice', { reading: item })
        }
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={styles.itemNumber}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title || item.content.slice(0, 100) + '...'}
            </Text>
            <View style={styles.itemMeta}>
              <View style={[styles.levelBadge, styles[`level${item.level}`]]}>
                <Text style={styles.levelText}>{getLevelText(item.level)}</Text>
              </View>

              {item.best_score !== null && (
                <View style={styles.scoreBadge}>
                  <Icon name="star" size={12} color="#FFB800" />
                  <Text style={styles.scoreText}>
                    Điểm cao nhất: {item.best_score.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.secondaryMeta}>
              {item.practice_count > 0 && (
                <View style={styles.practiceBadge}>
                  <Icon name="repeat" size={12} color="#6C757D" />
                  <Text style={styles.practiceText}>
                    Số lần luyện: {item.practice_count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.itemRight}>
          {item.is_completed && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={22} color="#28A745" />
            </View>
          )}
          <Icon name="chevron-right" size={20} color="#CED4DA" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={24} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Danh sách bài đọc</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5E72EB']}
            tintColor="#5E72EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Info */}
        <View style={styles.topicCard}>
          <View style={styles.topicImageWrapper}>
            <Image
              source={
                topic.image_url
                  ? { uri: topic.image_url }
                  : require('../assets/topics/hoctapvatruonghoc.png')
              }
              style={styles.topicImage}
              resizeMode="cover"
            />
            <View style={styles.topicOverlay} />
          </View>

          <View style={styles.topicInfo}>
            <Text style={styles.topicName}>{topic.name}</Text>
            <Text style={styles.readingCount}>{readings.length} bài đọc</Text>
          </View>
        </View>

        {/* Filter and Count Row */}
        <View style={styles.filterRow}>
          <Text style={styles.countText}>
            {filteredReadings.length} bài đọc
            {selectedLevel !== 'all' && ` (${getLevelText(selectedLevel)})`}
          </Text>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowLevelPicker(!showLevelPicker)}
            >
              <Icon
                name={
                  levelOptions.find(opt => opt.value === selectedLevel)?.icon ||
                  'filter-list'
                }
                size={20}
                color="#5E72EB"
              />
              <Text style={styles.filterButtonText}>
                {levelOptions.find(opt => opt.value === selectedLevel)?.label}
              </Text>
              <Icon
                name={showLevelPicker ? 'expand-less' : 'expand-more'}
                size={20}
                color="#5E72EB"
              />
            </TouchableOpacity>

            {showLevelPicker && (
              <View style={styles.filterDropdown}>
                {levelOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      selectedLevel === option.value &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedLevel(option.value);
                      setShowLevelPicker(false);
                    }}
                  >
                    <Icon
                      name={option.icon}
                      size={18}
                      color={
                        selectedLevel === option.value ? '#5E72EB' : '#6C757D'
                      }
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedLevel === option.value &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Readings List */}
        <View style={styles.listSection}>
          {filteredReadings.length > 0 ? (
            <FlatList
              data={filteredReadings}
              keyExtractor={item => item.id.toString()}
              renderItem={renderReadingItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Icon name="auto-stories" size={48} color="#ADB5BD" />
              </View>
              <Text style={styles.emptyTitle}>
                {readings.length === 0
                  ? 'Chưa có bài đọc nào'
                  : 'Không tìm thấy bài đọc'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {readings.length === 0
                  ? 'Chủ đề này hiện chưa có bài đọc nào'
                  : `Không có bài đọc nào ở cấp độ ${getLevelText(
                      selectedLevel,
                    )}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#5E72EB',
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },

  // Topic Card
  topicCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  topicImageWrapper: {
    height: 120,
    position: 'relative',
  },
  topicImage: {
    width: '100%',
    height: '100%',
  },
  topicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
  },
  topicInfo: {
    padding: 20,
  },
  topicName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 4,
  },
  readingCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },

  // Filter Row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
  },
  filterContainer: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5E72EB',
    marginLeft: 6,
    marginRight: 4,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1000,
    overflow: 'hidden',
    minWidth: 120,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.05)',
  },
  filterOptionActive: {
    backgroundColor: 'rgba(94, 114, 235, 0.05)',
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 8,
  },
  filterOptionTextActive: {
    color: '#5E72EB',
    fontWeight: '600',
  },

  // List Section
  listSection: {
    marginHorizontal: 16,
  },
  separator: {
    height: 12,
  },

  // Reading Item
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5E72EB',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 10,
    lineHeight: 22,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  secondaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  levelA1: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  levelB1: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  levelC1: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#495057',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFB800',
  },
  practiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  practiceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C757D',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedBadge: {
    padding: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(173, 181, 189, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 30,
  },
});
