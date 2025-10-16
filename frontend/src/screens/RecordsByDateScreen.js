// frontend/src/screens/RecordsByDateScreen.js
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchRecordsByDate } from '../api/history';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function RecordsByDateScreen({ route, navigation }) {
  const { date } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      const res = await fetchRecordsByDate(date);
      setRecords(res.data);
    } catch (err) {
      console.error('❌ Lỗi fetch record theo ngày:', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu luyện tập của ngày này');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [date]),
  );

  useEffect(() => {
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

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Rotate animation interpolation
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() =>
        navigation.navigate('RecordDetailScreen', { recordId: item.id })
      }
    >
      <View style={styles.recordHeader}>
        <Icon name="access-time" size={20} color="#5E72EB" />
        <Text style={styles.recordTime}>{item.created_at.slice(11, 16)}</Text>
        <View style={styles.scoreBadge}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.scoreText}>{item.score_overall?.toFixed(2)}</Text>
        </View>
      </View>
      <Text style={styles.topicText}>
        {item.topic_name || (item.is_community_post ? 'Tự nhập' : 'Không rõ')}
      </Text>
      <Text numberOfLines={2} style={styles.contentText}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

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

      <View style={styles.content}>
        <Text style={styles.screenTitle}>📅 Bài luyện ngày {date}</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#5E72EB"
            style={styles.loader}
          />
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="info-outline" size={40} color="#5E72EB" />
            <Text style={styles.emptyText}>
              Không có dữ liệu luyện trong ngày này
            </Text>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#5E72EB']}
                tintColor="#5E72EB"
              />
            }
          />
        )}
      </View>
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
    flex: 1,
    padding: 25,
    paddingTop: 10,
    zIndex: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5E72EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#495057',
    marginTop: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 8,
    marginRight: 15,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5E72EB',
    marginLeft: 5,
  },
  topicText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6C757D',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    color: '#343A40',
    lineHeight: 22,
  },
});
