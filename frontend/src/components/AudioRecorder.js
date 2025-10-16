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

export default function AudioRecorder({ onFinish }) {
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);

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
  }, []);

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
    onFinish?.(filePath);
  };

  const play = () => {
    if (!audioFile) return;
    const sound = new Sound(audioFile, '', error => {
      if (error) {
        Alert.alert('Lỗi khi phát', error.message);
        return;
      }
      sound.play();
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Ghi âm bài đọc</Text>

      <TouchableOpacity
        style={[
          styles.button,
          recording ? styles.stopButton : styles.startButton,
        ]}
        onPress={recording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {recording ? '⏹️ Dừng ghi' : '🎤 Bắt đầu ghi'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          !audioFile ? styles.disabledButton : styles.playButton,
        ]}
        onPress={play}
        disabled={!audioFile}
      >
        <Text style={styles.buttonText}>▶️ Nghe lại</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
