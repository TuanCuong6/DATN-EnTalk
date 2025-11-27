// frontend/src/components/WordAnalysisDisplay.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TextToSpeechPlayer from './TextToSpeechPlayer';

export default function WordAnalysisDisplay({ originalText, transcript, wordAnalysis }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!originalText || !wordAnalysis || wordAnalysis.length === 0) {
    return null;
  }

  const handleWordPress = (wordInfo) => {
    setSelectedWord(wordInfo);
    setShowDetailModal(true);
  };

  return (
    <View style={styles.outerContainer}>
      {/* Original Text Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Icon name="article" size={20} color="#495057" />
          <Text style={styles.sectionTitle}>Văn bản gốc:</Text>
        </View>
        <Text style={styles.sectionText}>
          {wordAnalysis.map((wordInfo, index) => (
            <Text key={index}>
              <TouchableOpacity onPress={() => handleWordPress(wordInfo)}>
                <Text style={styles.wordInline}>{wordInfo.word}</Text>
              </TouchableOpacity>
              <Text style={styles.wordInline}> </Text>
            </Text>
          ))}
        </Text>
        <View style={styles.hintRow}>
          <Icon name="lightbulb-outline" size={14} color="#6C757D" />
          <Text style={styles.hint}>Nhấn vào từ để xem chi tiết</Text>
        </View>
      </View>

      {/* Transcript Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Icon name="record-voice-over" size={20} color="#495057" />
          <Text style={styles.sectionTitle}>Bạn đã đọc:</Text>
        </View>
        <Text style={styles.sectionText}>{transcript || 'Không có transcript'}</Text>
      </View>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWord && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Chi tiết: "{selectedWord?.word}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDetailModal(false)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="#5E72EB" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedWord && (
                    <>
                      {/* Word */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Từ:</Text>
                        <Text style={styles.wordDisplay}>{selectedWord.word}</Text>
                        {selectedWord.wordType && (
                          <Text style={styles.wordType}>({selectedWord.wordType})</Text>
                        )}
                      </View>

                      {/* IPA */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Phát âm (IPA):</Text>
                        <View style={styles.ipaContainer}>
                          <Text style={styles.ipaText}>{selectedWord.ipa}</Text>
                          <TextToSpeechPlayer
                            text={selectedWord.word}
                            style={styles.miniPlayer}
                          />
                        </View>
                      </View>

                      {/* Meaning */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Nghĩa:</Text>
                        <Text style={styles.wordMeaning}>{selectedWord.meaning}</Text>
                      </View>

                      {/* Tip */}
                      <View style={styles.tipBox}>
                        <Icon name="lightbulb-outline" size={20} color="#5E72EB" />
                        <Text style={styles.tipText}>
                          Nhấn vào icon loa để nghe phát âm chuẩn của từ này.
                        </Text>
                      </View>
                    </>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: 0,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 114, 235, 0.3)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 114, 235, 0.2)',
    paddingBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#343A40',
  },
  wordInline: {
    fontSize: 16,
    lineHeight: 24,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  hint: {
    fontSize: 12,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  wordDisplay: {
    fontSize: 24,
    color: '#343A40',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  wordMeaning: {
    fontSize: 16,
    color: '#6C757D',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    fontStyle: 'italic',
  },
  ipaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
  },
  ipaText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#5E72EB',
    fontWeight: '600',
  },
  miniPlayer: {
    marginLeft: 10,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5E72EB',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#1A73E8',
    marginLeft: 10,
    lineHeight: 20,
  },
  wordType: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
});
