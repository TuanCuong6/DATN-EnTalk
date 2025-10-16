//frontend/src/screens/NotificationScreen.js
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getNotificationList,
  markNotificationAsRead,
} from '../api/notification';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { navigate, navigationRef } from '../utils/RootNavigation';
import { NotificationContext } from '../context/NotificationContext';
import { CommonActions } from '@react-navigation/native';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { fetchUnreadCount, shouldReload } = useContext(NotificationContext);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationList();
      setNotifications(res.data);
    } catch (err) {
      console.log('❌ Lỗi lấy danh sách thông báo:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Khi vào lại màn hình từ ngoài (focus effect)
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  // Khi có FCM mới đến (trigger reload)
  useEffect(() => {
    fetchNotifications();
  }, [shouldReload]);

  // Khi ấn lại vào tab icon
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      onRefresh();
    });
    return unsubscribe;
  }, [navigation]);

  const handlePress = async item => {
    try {
      await markNotificationAsRead(item.id);
      fetchUnreadCount();
    } catch (err) {
      console.log('⚠️ Không thể đánh dấu đã đọc:', err.message);
    }

    if (item.record_id) {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: 'RecordDetailScreen',
          params: { recordId: item.record_id },
        }),
      );
    } else if (item.reading_id) {
      navigate('ReadingPractice', { readingId: item.reading_id });
    } else if (item.custom_text) {
      navigate('CustomReadingScreen', { customText: item.custom_text });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: item.is_read ? '#f8f9ff' : '#fffbe6',
          borderColor: item.is_read ? 'rgba(94, 114, 235, 0.2)' : '#FFD700',
        },
      ]}
      onPress={() => handlePress(item)}
    >
      <View style={styles.itemHeader}>
        <Icon
          name={getIconForType(item)}
          size={24}
          color="#5E72EB"
          style={styles.itemIcon}
        />
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.body}>{item.body}</Text>
      <View style={styles.itemFooter}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        {!item.is_read && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>Mới</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const getIconForType = item => {
    if (item.record_id) return 'mic';
    if (item.reading_id) return 'menu-book';
    if (item.custom_text) return 'create';
    return 'notifications';
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
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={styles.background}
      />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>

        <Text style={styles.screenTitle}>Thông Báo</Text>

        <View style={styles.userInfo}>
          <Icon name="notifications" size={24} color="#5E72EB" />
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off" size={60} color="#A0A7E0" />
          <Text style={styles.emptyText}>📭 Chưa có thông báo nào</Text>
          <Text style={styles.emptySubText}>
            Chúng tôi sẽ thông báo khi có hoạt động mới
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#5E72EB']}
              tintColor="#5E72EB"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
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
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5E72EB',
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
  },
  listContent: {
    padding: 15,
    paddingTop: 10,
  },
  item: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    marginRight: 12,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#343A40',
    flex: 1,
  },
  body: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 15,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6C757D',
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#343A40',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5E72EB',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 10,
    textAlign: 'center',
  },
});
