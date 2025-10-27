//frontend/src/context/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getNotificationList } from '../api/notification';

// Context tạo để chia sẻ unreadCount + trigger reload
export const NotificationContext = createContext();

// Biến và hàm để dùng toàn cục
let _fetchUnreadCount = () => {};
let _triggerReload = () => {};
export const getGlobalFetchUnreadCount = () => _fetchUnreadCount;
export const triggerNotificationReload = () => _triggerReload?.();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldReload, setShouldReload] = useState(false);

  // Gán hàm ra ngoài cho nơi khác gọi được
  const fetchUnreadCount = async () => {
    try {
      const res = await getNotificationList();
      const unread = res.data.filter(item => !item.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log('⚠️ Lỗi lấy badge thông báo:', err.message);
    }
  };

  const reloadNotificationList = () => {
    setShouldReload(prev => !prev); // toggle để kích reload
  };

  useEffect(() => {
    _fetchUnreadCount = fetchUnreadCount;
    _triggerReload = reloadNotificationList;
    fetchUnreadCount();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, fetchUnreadCount, shouldReload }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
