// frontend/src/components/TextToSpeechPlayer.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'react-native-blob-util';
import { BASE_URL } from '../api/baseURL';

const API_URL = `${BASE_URL}/tts`;

export default function TextToSpeechPlayer({ text, readingId, style }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    };
  }, [sound]);

  const togglePlayPause = async () => {
    if (!text.trim()) {
      Alert.alert('Lỗi', 'Không có nội dung để phát');
      return;
    }

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
          console.log('✅ Audio playback finished');
        } else {
          console.log('❌ Audio playback failed');
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
    if (!sound) {
      await generateAndPlayAudio();
    }
  };

  const generateAndPlayAudio = async () => {

    setLoading(true);
    try {
      console.log('🎯 Generating audio for:', text.substring(0, 50) + '...');
      console.log('📡 API URL:', `${API_URL}/synthesize`);

      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'mp3',
        timeout: 60000,
      }).fetch(
        'POST',
        `${API_URL}/synthesize`,
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({ text, readingId }),
      );

      const status = response.info().status;
      console.log('📥 Response status:', status);

      if (status !== 200) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server error: ${status} - ${errorText}`);
      }

      const audioPath = response.path();
      console.log('✅ Audio downloaded to:', audioPath);

      // Kiểm tra file tồn tại
      const fileExists = await RNFetchBlob.fs.exists(audioPath);
      console.log('📁 File exists:', fileExists);

      if (!fileExists) {
        throw new Error('File audio không tồn tại sau khi download');
      }

      // Tạo và phát sound - sử dụng đường dẫn đầy đủ
      console.log('🎵 Creating Sound object...');
      const newSound = new Sound(audioPath, '', error => {
        console.log('🎵 Sound callback triggered');
        console.log('🎵 Error object:', error);
        console.log('🎵 Error type:', typeof error);

        setLoading(false);

        if (error) {
          console.error('❌ Sound loading error:', error);
          console.error('❌ Error keys:', Object.keys(error || {}));
          const errorMsg =
            error?.message ||
            error?.toString() ||
            JSON.stringify(error) ||
            'Lỗi không xác định';
          Alert.alert('Lỗi', 'Không thể tải audio: ' + errorMsg);
          return;
        }

        console.log('🔊 Playing audio...');
        console.log('🔊 Sound duration:', newSound.getDuration());
        newSound.play(success => {
          if (success) {
            console.log('✅ Audio playback finished');
          } else {
            console.log('❌ Audio playback failed');
          }
          setPlaying(false);
          setPaused(false);
          newSound.release();
          setSound(null);

          // Cleanup file
          RNFetchBlob.fs.unlink(audioPath).catch(err => {
            console.log('⚠️ Failed to delete temp file:', err);
          });
        });

        setPlaying(true);
        setPaused(false);
        setSound(newSound);
      });
    } catch (error) {
      setLoading(false);
      console.error('❌ Audio generation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      const errorMsg =
        error?.message || error?.toString() || 'Lỗi không xác định';
      let errorMessage = 'Không thể tạo audio.\n\n';

      if (
        errorMsg.includes('Network request failed') ||
        errorMsg.includes('ECONNREFUSED')
      ) {
        errorMessage +=
          '❌ Không kết nối được backend.\n\nKiểm tra:\n1. Backend đang chạy (port 3000)\n2. Piper server đang chạy (port 5001)\n3. URL đúng: ' +
          API_URL;
      } else if (errorMsg.includes('503')) {
        errorMessage +=
          '❌ Piper server chưa khởi động.\n\nVui lòng chạy:\ncd piper\nstart_server.bat';
      } else if (
        errorMsg.includes('timeout') ||
        errorMsg.includes('timed out') ||
        errorMsg.includes('504')
      ) {
        errorMessage +=
          '⏱️ Yêu cầu quá lâu.\n\nCó thể do:\n1. Văn bản quá dài\n2. Server đang xử lý nhiều yêu cầu\n3. Kết nối mạng chậm\n\nThử lại hoặc rút ngắn văn bản.';
      } else {
        errorMessage += errorMsg;
      }

      Alert.alert('Lỗi TTS', errorMessage);
    }
  };

  const stopAudio = () => {
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }
    setPlaying(false);
    setPaused(false);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          (playing || paused) ? styles.pauseButton : styles.playButton,
          loading && styles.disabledButton,
        ]}
        onPress={togglePlayPause}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Icon
            name={playing ? 'pause' : 'play-arrow'}
            size={24}
            color="#FFF"
            style={styles.icon}
          />
        )}
        <Text style={styles.buttonText}>
          {loading
            ? 'Đang tạo...'
            : playing
            ? 'Tạm dừng'
            : paused
            ? 'Tiếp tục'
            : 'Nghe bài đọc'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButton: {
    backgroundColor: '#5E72EB',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
