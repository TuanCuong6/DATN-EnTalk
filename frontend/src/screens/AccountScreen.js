//frontend/src/screens/AccountScreen.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../api/account';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Easing } from 'react-native';

export default function AccountScreen() {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      getProfile()
        .then(res => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []),
  );

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

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#F0F7FF', '#E6FCFF']}
          style={styles.background}
        />
        <ActivityIndicator size="large" color="#5E72EB" />
      </View>
    );
  }

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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>EnTalk</Text>
        </View>

        <View style={styles.userInfo}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={20} color="#5E72EB" />
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarFrame}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.profileAvatar}
              />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Icon name="person" size={50} color="#5E72EB" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>
            {profile?.name || 'Người dùng EnTalk'}
          </Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
        </View>

        <View style={styles.card}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigation.navigate('EditProfile')}
              style={styles.actionButton}
            >
              <Icon
                name="edit"
                size={24}
                color="#5E72EB"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigation.navigate('ChangePassword')}
              style={styles.actionButton}
            >
              <Icon
                name="lock"
                size={24}
                color="#5E72EB"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => navigation.navigate('Feedback')}
              style={styles.actionButton}
            >
              <Icon
                name="feedback"
                size={24}
                color="#5E72EB"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Góp ý / Báo lỗi</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={logout}
              style={[styles.actionButton, styles.logoutButton]}
            >
              <Icon
                name="logout"
                size={24}
                color="#FF4C4C"
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, styles.logoutText]}>
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 25,
    paddingBottom: 10,
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
  content: {
    padding: 25,
    paddingTop: 10,
    zIndex: 10,
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarFrame: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 80,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.2)',
    marginBottom: 15,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  profileAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#495057',
    textAlign: 'center',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.1)',
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 114, 235, 0.1)',
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#5E72EB',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderLeftColor: '#FF4C4C',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  logoutText: {
    color: '#FF4C4C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
