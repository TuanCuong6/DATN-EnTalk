//frontend/src/components/AudioReorder.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AudioRecorder({ onFinish, onSubmit, resetTrigger }) {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(null);

  // Reset khi resetTrigger thay đổi
  useEffect(() => {
    if (resetTrigger) {
      handleReset();
    }
  }, [resetTrigger]);

  useEffect(() => {
    const init = async () => {
      await requestPermissions();

      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        wavFile: 'record.wav',
      });

      setIsReady(true);
    };

    init();

    return () => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, [sound]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);

      const allGranted = Object.values(granted).every(val => val === 'granted');
      if (!allGranted) {
        Alert.alert('Thiếu quyền', 'Vui lòng cấp đầy đủ quyền để ghi âm');
      }
    }
  };

  const startRecording = () => {
    if (!isReady) {
      Alert.alert('Hệ thống chưa sẵn sàng ghi âm');
      return;
    }

    AudioRecord.start();
    setRecording(true);
    setAudioFile(null);
  };

  const stopRecording = async () => {
    const filePath = await AudioRecord.stop();
    setRecording(false);
    setAudioFile(filePath);
    
    // Cleanup sound cũ nếu có
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }
    setPlaying(false);
    setPaused(false);
    
    onFinish?.(filePath);
  };

  const togglePlayPause = () => {
    if (!audioFile) return;

    // Nếu đang phát, pause lại
    if (playing && sound && !paused) {
      sound.pause();
      setPlaying(false);
      setPaused(true);
      return;
    }

    // Nếu đang pause, resume
    if (paused && sound) {
      sound.play(success => {
        if (success) {
          console.log('✅ Playback finished');
        }
        setPlaying(false);
        setPaused(false);
        sound.release();
        setSound(null);
      });
      setPlaying(true);
      setPaused(false);
      return;
    }

    // Nếu chưa có sound, tạo mới và phát
    const newSound = new Sound(audioFile, '', error => {
      if (error) {
        Alert.alert('Lỗi khi phát', error.message);
        return;
      }
      
      newSound.play(success => {
        if (success) {
          console.log('✅ Playback finished');
        }
        setPlaying(false);
        setPaused(false);
        newSound.release();
        setSound(null);
      });
      
      setPlaying(true);
      setPaused(false);
      setSound(newSound);
    });
  };

  const handleSubmit = () => {
    if (!audioFile) return;
    onSubmit?.(audioFile);
  };

  const handleReset = () => {
    // Dừng và cleanup sound nếu đang phát
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }
    
    // Reset tất cả states về ban đầu
    setRecording(false);
    setAudioFile(null);
    setPlaying(false);
    setPaused(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Icon name="headset" size={20} color="#333" />
        <Text style={styles.title}>Ghi âm bài đọc</Text>
      </View>

      {/* Nếu chưa ghi hoặc đang ghi: hiển thị 1 nút full width */}
      {!audioFile || recording ? (
        <TouchableOpacity
          style={[
            styles.button,
            recording ? styles.stopButton : styles.startButton,
          ]}
          onPress={recording ? stopRecording : startRecording}
        >
          <Icon name={recording ? 'stop' : 'mic'} size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {recording ? 'Dừng ghi' : 'Bắt đầu ghi'}
          </Text>
        </TouchableOpacity>
      ) : (
        /* Sau khi ghi xong: hiển thị 2 nút ngang nhau */
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.halfButton, styles.startButton]}
              onPress={startRecording}
            >
              <Icon name="refresh" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Ghi lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.halfButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Icon name="check-circle" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Chấm điểm</Text>
            </TouchableOpacity>
          </View>

          {/* Nút nghe lại ở dưới */}
          <TouchableOpacity
            style={[
              styles.button,
              playing ? styles.pauseButton : styles.playButton,
            ]}
            onPress={togglePlayPause}
          >
            <Icon name={playing ? 'pause' : 'play-arrow'} size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>
              {playing ? 'Tạm dừng' : paused ? 'Tiếp tục' : 'Nghe lại'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    margin: 10,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  halfButton: {
    width: '48%',
    marginVertical: 0,
  },
  startButton: {
    backgroundColor: '#4caf50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  playButton: {
    backgroundColor: '#2196f3',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  submitButton: {
    backgroundColor: '#4CD964',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
