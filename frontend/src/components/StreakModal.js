// frontend/src/components/StreakModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const STREAK_LEVELS = [
  {
    min: 1,
    max: 10,
    icon: 'local-fire-department',
    name: 'Beginner Flame',
    color: '#FF6B6B',
  },
  {
    min: 10,
    max: 50,
    icon: 'flash-on',
    name: 'Intermediate Master',
    color: '#FFD93D',
  },
  {
    min: 50,
    max: 100,
    icon: 'diamond',
    name: 'Advanced Speaker',
    color: '#6BCB77',
  },
  {
    min: 100,
    max: 200,
    icon: 'emoji-events',
    name: 'Proficient Legend',
    color: '#4D96FF',
  },
  {
    min: 200,
    max: Infinity,
    icon: 'stars',
    name: 'Native Immortal',
    color: '#9D4EDD',
  },
];

const getStreakLevel = streak => {
  return (
    STREAK_LEVELS.find(level => streak >= level.min && streak < level.max) ||
    STREAK_LEVELS[0]
  );
};

export default function StreakModal({ visible, onClose, streakData }) {
  if (!streakData) return null;

  const currentLevel = getStreakLevel(streakData.current_streak);
  const { practiced_today, time_left, current_streak, streak_freeze_count } =
    streakData;

  const getStatusMessage = () => {
    // Trường hợp 1: Đã luyện hôm nay
    if (practiced_today) {
      return {
        text: 'Chúc mừng! Streak của bạn đã an toàn hôm nay ✓',
        icon: 'check-circle',
        color: '#6BCB77',
      };
    }

    // Trường hợp 2: Streak = 1 và chưa luyện
    if (current_streak === 1) {
      // Nếu chưa có last_practice_date = chưa luyện lần nào
      const { last_practice_date } = streakData;
      if (!last_practice_date) {
        return {
          text: 'Luyện đọc hôm nay để bắt đầu streak nào!',
          icon: 'play-circle-outline',
          color: '#5E72EB',
        };
      }
      // Nếu đã có last_practice_date = đã luyện rồi nhưng chưa luyện hôm nay
      return {
        text: `Còn ${time_left.hours} giờ ${time_left.minutes} phút nữa là mất streak 1 ngày của bạn đấy!`,
        icon: 'timer',
        color: '#FF6B6B',
      };
    }

    // Trường hợp 3: Streak >= 2 và chưa luyện (cảnh báo mất streak)
    return {
      text: `Còn ${time_left.hours} giờ ${time_left.minutes} phút nữa là mất streak ${current_streak} ngày của bạn đấy!`,
      icon: 'timer',
      color: '#FF6B6B',
    };
  };

  const status = getStatusMessage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FF']}
              style={styles.modalContent}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>

              {/* Streak display */}
              <View style={styles.streakHeader}>
                <Text style={styles.streakLabel}>Streak hiện tại</Text>
                <View style={styles.streakBadge}>
                  <Icon
                    name={currentLevel.icon}
                    size={40}
                    color={practiced_today ? currentLevel.color : '#BDBDBD'}
                  />
                  <Text
                    style={[
                      styles.streakNumber,
                      !practiced_today && styles.streakNumberGray,
                    ]}
                  >
                    {current_streak}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.levelName,
                    { color: practiced_today ? currentLevel.color : '#BDBDBD' },
                  ]}
                >
                  {currentLevel.name}
                </Text>
              </View>

              {/* Status message */}
              <View
                style={[styles.statusCard, { borderLeftColor: status.color }]}
              >
                <Icon name={status.icon} size={24} color={status.color} />
                <Text style={styles.statusText}>{status.text}</Text>
              </View>

              {/* Freeze count */}
              {current_streak >= 2 && (
                <View style={styles.freezeInfo}>
                  <Icon name="ac-unit" size={20} color="#4D96FF" />
                  <Text style={styles.freezeText}>
                    Còn {streak_freeze_count}/3 lần phục hồi trong tháng
                  </Text>
                </View>
              )}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Info tip */}
              <View style={styles.infoTip}>
                <Icon name="info-outline" size={20} color="#5E72EB" />
                <Text style={styles.infoText}>
                  Luyện đọc hàng ngày để duy trì Streak
                </Text>
              </View>

              {/* Streak levels */}
              <Text style={styles.levelsTitle}>Các cấp độ Streak</Text>
              {STREAK_LEVELS.map((level, index) => (
                <View
                  key={index}
                  style={[
                    styles.levelItem,
                    current_streak >= level.min &&
                      current_streak < level.max &&
                      styles.levelItemActive,
                  ]}
                >
                  <Icon name={level.icon} size={28} color={level.color} />
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelRange}>
                      {level.min}–{level.max === Infinity ? '∞' : level.max}{' '}
                      ngày
                    </Text>
                    <Text
                      style={[styles.levelNameSmall, { color: level.color }]}
                    >
                      {level.name}
                    </Text>
                  </View>
                  {current_streak >= level.min &&
                    current_streak < level.max && (
                      <Icon name="check-circle" size={20} color={level.color} />
                    )}
                </View>
              ))}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  streakHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  streakNumberGray: {
    color: '#BDBDBD',
  },
  levelName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 15,
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  freezeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  freezeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4D96FF',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  infoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#5E72EB',
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#5E72EB',
    fontWeight: '500',
    flex: 1,
  },
  levelsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  levelItemActive: {
    borderColor: '#5E72EB',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },

  levelInfo: {
    flex: 1,
  },
  levelRange: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  levelNameSmall: {
    fontSize: 15,
    fontWeight: '600',
  },
});
