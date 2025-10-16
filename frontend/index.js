//frontend/index.js
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Nhận thông báo khi app đang chạy ở background hoặc bị kill (Android)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📥 [Background] Push Notification:', remoteMessage);
});
AppRegistry.registerComponent(appName, () => App);
