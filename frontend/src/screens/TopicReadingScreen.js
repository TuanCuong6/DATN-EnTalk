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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchReadingsByTopic } from '../api/reading';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

// Mapping ảnh chủ đề
const topicImages = {
  thamhiem: require('../assets/topics/thamhiem.png'),
  dulich: require('../assets/topics/dulich.png'),
  khoahoc: require('../assets/topics/khoahoc.png'),
  tintuc: require('../assets/topics/tintuc.png'),
  suckhoevadoisong: require('../assets/topics/suckhoevadoisong.png'),
  khampha: require('../assets/topics/khampha.png'),
  hoctapvatruonghoc: require('../assets/topics/hoctapvatruonghoc.png'),
  giadinhvabanbe: require('../assets/topics/giadinhvabanbe.png'),
};

// Hàm chuẩn hoá tên chủ đề
const removeVietnameseTones = str => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '')
    .toLowerCase();
};

const getImageForTopic = topic => {
  const key = removeVietnameseTones(topic.name);
  return topicImages[key] || require('../assets/topics/default.png');
};

export default function TopicReadingsScreen() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { topic } = route.params;

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const itemScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const load = async () => {
      try {
        const res = await fetchReadingsByTopic(topic.id);
        setReadings(res.data);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải bài đọc');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topic]);

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
          <Text style={styles.itemText} numberOfLines={2}>
            {item.title || item.content.slice(0, 100) + '...'}
          </Text>
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

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>

        <View style={styles.userInfo}>
          <Icon name="menu-book" size={24} color="#5E72EB" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topicHeader}>
          <View style={styles.topicImageContainer}>
            <Image
              source={getImageForTopic(topic)}
              style={styles.topicImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.screenTitle}>📂 {topic.name}</Text>
          <Text style={styles.subtitle}>{readings.length} bài đọc có sẵn</Text>
        </View>

        {readings.length > 0 ? (
          <FlatList
            data={readings}
            keyExtractor={item => item.id.toString()}
            renderItem={renderReadingItem}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="info" size={40} color="#5E72EB" />
            <Text style={styles.emptyText}>
              Chưa có bài đọc nào trong chủ đề này
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
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
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
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#343A40',
    fontWeight: '500',
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
