//frontend/src/screens/ChatbotScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { askChatbot, fetchChatHistory } from '../api/chat';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatbotScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await fetchChatHistory();
      const rows = res.data;

      const formatted = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].role === 'user') {
          const userMsg = rows[i];
          const assistantMsg =
            rows[i + 1]?.role === 'assistant' ? rows[i + 1] : null;
          formatted.push({
            question: userMsg.message,
            answer: assistantMsg?.message || null,
            id: i,
          });
          i++;
        }
      }

      setMessages(formatted);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử chat:', err.message);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = { question, answer: null, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    Keyboard.dismiss();
    setLoading(true);

    try {
      const res = await askChatbot({ message: question });
      const updated = { ...userMessage, answer: res.data.reply };
      setMessages(prev =>
        prev.map(m => (m.id === userMessage.id ? updated : m)),
      );
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = text => {
    if (!text) return '';
    return text
      .trim()
      .replace(/\n{2,}/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/•/g, '• ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/^- /gm, '• ')
      .replace(/^\d+\. /gm, '• ');
  };

  const renderItem = ({ item }) => (
    <>
      <View style={[styles.chatBlock, styles.alignRight]}>
        <Text style={styles.userText}>🧑‍🎓 {item.question}</Text>
      </View>
      {item.answer && (
        <View style={[styles.chatBlock, styles.alignLeft]}>
          <Text style={styles.botText}>🤖 {formatAnswer(item.answer)}</Text>
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <LinearGradient
        colors={['#F0F7FF', '#E6FCFF']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>🤖 Hỏi EnTalk về tiếng Anh</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListFooterComponent={<View style={{ height: 20 }} />} 
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi liên quan đến tiếng Anh"
          value={question}
          onChangeText={setQuestion}
          placeholderTextColor="#888"
          multiline
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5E72EB',
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  chatBlock: {
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  alignLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
  },
  alignRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#DDE9FF',
    borderTopRightRadius: 4,
  },
  userText: {
    fontWeight: '600',
    color: '#2C3E50',
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: '#2C3E50',
    fontSize: 15,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    backgroundColor: '#5E72EB',
    borderRadius: 24,
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
