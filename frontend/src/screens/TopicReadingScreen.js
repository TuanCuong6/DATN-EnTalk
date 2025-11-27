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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { fetchReadingsByTopic } from '../api/reading';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';
import { getLevelText } from '../utils/levelHelper';

// Mapping ảnh chủ đề
// const topicImages = {
//   thamhiem: require('../assets/topics/thamhiem.png'),
//   dulich: require('../assets/topics/dulich.png'),
//   khoahoc: require('../assets/topics/khoahoc.png'),
//   tintuc: require('../assets/topics/tintuc.png'),
//   suckhoevadoisong: require('../assets/topics/suckhoevadoisong.png'),
//   khampha: require('../assets/topics/khampha.png'),
//   hoctapvatruonghoc: require('../assets/topics/hoctapvatruonghoc.png'),
//   giadinhvabanbe: require('../assets/topics/giadinhvabanbe.png'),
// };

// Hàm chuẩn hoá tên chủ đề
// const removeVietnameseTones = str => {
//   return str
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/đ/g, 'd')
//     .replace(/Đ/g, 'D')
//     .replace(/\s+/g, '')
//     .toLowerCase();
// };

// const getImageForTopic = topic => {
//   const key = removeVietnameseTones(topic.name);
//   return topicImages[key] || require('../assets/topics/default.png');
// };

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

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const itemScale = useRef(new Animated.Value(1)).current;

  const levelOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'A1', label: 'Dễ' },
    { value: 'B1', label: 'Vừa' },
    { value: 'C1', label: 'Khó' },
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
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

  // Auto refresh khi quay lại màn hình
  useFocusEffect(
    React.useCallback(() => {
      loadReadings();
    }, [topic.id])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadReadings(true);
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePressIn = () => {
    Animated.spring(itemScale, {
      toValue: 0.98,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(itemScale, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#F0F7FF', '#E6FCFF']}
          style={styles.background}
        />
        <ActivityIndicator size="large" color="#5E72EB" />
      </View>
    );
  }

  const renderReadingItem = ({ item }) => (
    <Animated.View style={{ transform: [{ scale: itemScale }] }}>
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          navigation.navigate('ReadingPractice', { reading: item })
        }
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.itemContent}>
          <Icon
            name="article"
            size={24}
            color="#5E72EB"
            style={styles.itemIcon}
          />
          <View style={styles.itemTextContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.itemText} numberOfLines={2}>
                {item.title || item.content.slice(0, 100) + '...'}
              </Text>
              {/* Hiển thị level */}
              <View
                style={[
                  styles.levelBadge,
                  item.level === 'A1' && styles.levelEasy,
                  item.level === 'B1' && styles.levelMedium,
                  item.level === 'C1' && styles.levelHard,
                ]}>
                <Text style={styles.levelText}>
                  {getLevelText(item.level)}
                </Text>
              </View>
            </View>
            {/* Hiển thị điểm cao nhất và trạng thái */}
            {item.best_score !== null && (
              <View style={styles.scoreContainer}>
                <Icon name="star" size={14} color="#FFB800" />
                <Text style={styles.scoreText}>
                  Điểm cao nhất: {item.best_score.toFixed(1)}/10
                </Text>
                {item.is_completed && (
                  <View style={styles.completedBadge}>
                    <Icon name="check-circle" size={14} color="#28A745" />
                    <Text style={styles.completedText}>Hoàn thành</Text>
                  </View>
                )}
              </View>
            )}
            {item.practice_count > 0 && (
              <Text style={styles.practiceCount}>
                Đã luyện {item.practice_count} lần
              </Text>
            )}
          </View>
          <Icon name="chevron-right" size={24} color="#888" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={styles.background}
      />

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

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={28} color="#5E72EB" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Danh sách bài đọc</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5E72EB']}
            tintColor="#5E72EB"
          />
        }
      >
        <View style={styles.topicHeader}>
          <View style={styles.topicImageContainer}>
            {/* <Image
              source={getImageForTopic(topic)}
              style={styles.topicImage}
              resizeMode="cover"
            /> */}
            <Image
              source={
                topic.image_url
                  ? { uri: topic.image_url }
                  : require('../assets/topics/hoctapvatruonghoc.png')
              }
              style={styles.topicImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.screenTitleRow}>
            <Icon name="folder" size={24} color="#5E72EB" />
            <Text style={styles.screenTitle}>{topic.name}</Text>
          </View>
          
          {/* Filter row with count and level dropdown */}
          <View style={styles.filterRow}>
            <Text style={styles.subtitle}>{readings.length} bài đọc có sẵn</Text>
            
            <View>
              <TouchableOpacity 
                style={styles.levelDropdown}
                onPress={() => setShowLevelPicker(!showLevelPicker)}
              >
                <Text style={styles.levelDropdownText}>
                  {levelOptions.find(opt => opt.value === selectedLevel)?.label}
                </Text>
                <Icon name={showLevelPicker ? "arrow-drop-up" : "arrow-drop-down"} size={20} color="#5E72EB" />
              </TouchableOpacity>
              
              {/* Dropdown menu */}
              {showLevelPicker && (
                <View style={styles.dropdownMenu}>
                  {levelOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownOption,
                        selectedLevel === option.value && styles.dropdownOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedLevel(option.value);
                        setShowLevelPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        selectedLevel === option.value && styles.dropdownOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {filteredReadings.length > 0 ? (
          <FlatList
            data={filteredReadings}
            keyExtractor={item => item.id.toString()}
            renderItem={renderReadingItem}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="info" size={40} color="#5E72EB" />
            <Text style={styles.emptyText}>
              {readings.length === 0 
                ? 'Chưa có bài đọc nào trong chủ đề này'
                : 'Không có bài đọc nào ở cấp độ này'}
            </Text>
          </View>
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
    paddingTop: 20,
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
  topicHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  topicImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  topicImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  screenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    gap: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  levelDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  levelDropdownText: {
    fontSize: 14,
    color: '#5E72EB',
    fontWeight: '600',
    marginRight: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    zIndex: 1000,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#E7EBFF',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  dropdownOptionTextSelected: {
    color: '#5E72EB',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 30,
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.1)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelEasy: {
    backgroundColor: '#D4EDDA',
  },
  levelMedium: {
    backgroundColor: '#FFF3CD',
  },
  levelHard: {
    backgroundColor: '#F8D7DA',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  scoreText: {
    fontSize: 13,
    color: '#6C757D',
    marginLeft: 4,
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 11,
    color: '#28A745',
    marginLeft: 3,
    fontWeight: '600',
  },
  practiceCount: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.1)',
  },
  emptyText: {
    fontSize: 18,
    color: '#5E72EB',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
});
