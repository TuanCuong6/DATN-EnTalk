//frontend/src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import ReadingPracticeScreen from '../screens/ReadingPracticeScreen';
import CustomReadingScreen from '../screens/CustomReadingScreen';
import CustomContentChoiceScreen from '../screens/CustomContentChoiceScreen';
import AIGenerateReadingScreen from '../screens/AIGenerateReadingScreen';
import PracticeCustomReadingScreen from '../screens/PracticeCustomReadingScreen';
import TopicListScreen from '../screens/TopicListScreen';
import TopicReadingsScreen from '../screens/TopicReadingScreen';
import RecordsByDateScreen from '../screens/RecordsByDateScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ScanTextScreen from '../screens/ScanTextScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import YoutubeReadingScreen from '../screens/YoutubeReadingScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="ReadingPractice" component={ReadingPracticeScreen} />
      <Stack.Screen
        name="CustomContentChoiceScreen"
        component={CustomContentChoiceScreen}
        options={{ title: 'Nội dung tùy chỉnh' }}
      />
      <Stack.Screen
        name="CustomReadingScreen"
        component={CustomReadingScreen}
        options={{ title: 'Nhập nội dung tùy chỉnh' }}
      />
      <Stack.Screen
        name="AIGenerateReadingScreen"
        component={AIGenerateReadingScreen}
        options={{ title: 'AI Tạo Bài Đọc' }}
      />
      <Stack.Screen
        name="PracticeCustomReadingScreen"
        component={PracticeCustomReadingScreen}
        options={{ title: 'Luyện Đọc' }}
      />
      <Stack.Screen name="TopicList" component={TopicListScreen} />
      <Stack.Screen name="TopicReadings" component={TopicReadingsScreen} />
      <Stack.Screen
        name="RecordsByDateScreen"
        component={RecordsByDateScreen}
      />
      <Stack.Screen name="RecordDetailScreen" component={RecordDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
      <Stack.Screen name="ScanTextScreen" component={ScanTextScreen} />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: 'Góp ý / Báo lỗi' }}
      />
      <Stack.Screen
        name="YoutubeReadingScreen"
        component={YoutubeReadingScreen}
        options={{ title: 'Bài đọc từ YouTube' }}
      />
    </Stack.Navigator>
  );
}
