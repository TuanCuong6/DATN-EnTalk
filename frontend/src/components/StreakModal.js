// frontend/src/components/StreakModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

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
        <View style={styles.modalContainer} pointerEvents="box-none">
          <TouchableOpacity activeOpacity={1}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FF']}
              style={styles.modalContent}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={22} color="#666" />
              </TouchableOpacity>

              <View style={styles.content}>
                {/* Streak display */}
                <View style={styles.streakHeader}>
                  <View style={styles.streakBadge}>
                    <Icon
                      name={currentLevel.icon}
                      size={32}
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
                  <Icon name={status.icon} size={18} color={status.color} />
                  <Text style={styles.statusText}>{status.text}</Text>
                </View>

                {/* Freeze count */}
                {current_streak >= 2 && (
                  <View style={styles.freezeInfo}>
                    <Icon name="ac-unit" size={16} color="#4D96FF" />
                    <Text style={styles.freezeText}>
                      {streak_freeze_count}/3 lần phục hồi
                    </Text>
                  </View>
                )}

                {/* Info tip */}
                <View style={styles.infoTip}>
                  <Icon name="info-outline" size={16} color="#5E72EB" />
                  <Text style={styles.infoText}>
                    Luyện đọc hàng ngày để duy trì Streak
                  </Text>
                </View>

                {/* Streak levels - Grid 2 columns */}
                <Text style={styles.levelsTitle}>Các cấp độ</Text>
                <View style={styles.levelsGrid}>
                  {STREAK_LEVELS.map((level, index) => {
                    const isActive = current_streak >= level.min && current_streak < level.max;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.levelCard,
                          isActive && styles.levelCardActive,
                        ]}
                      >
                        <Icon name={level.icon} size={20} color={level.color} />
                        <View style={styles.levelCardInfo}>
                          <Text style={styles.levelCardRange}>
                            {level.min}–{level.max === Infinity ? '∞' : level.max}
                          </Text>
                          <Text
                            style={[styles.levelCardName, { color: level.color }]}
                            numberOfLines={1}
                          >
                            {level.name}
                          </Text>
                        </View>
                        {isActive && (
                          <Icon name="check-circle" size={16} color={level.color} style={styles.checkIcon} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
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
    maxHeight: height * 0.85,
  },
  modalContent: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: 20,
    paddingTop: 45,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
  },
  streakHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 6,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  streakNumberGray: {
    color: '#BDBDBD',
  },
  levelName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  statusText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  freezeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  freezeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4D96FF',
    fontWeight: '500',
  },
  infoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#5E72EB',
  },
  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#5E72EB',
    fontWeight: '500',
    flex: 1,
  },
  levelsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  levelCardActive: {
    borderColor: '#5E72EB',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },
  levelCardInfo: {
    flex: 1,
    marginLeft: 8,
  },
  levelCardRange: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  levelCardName: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
