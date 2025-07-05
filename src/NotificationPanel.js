import React, { useState, useEffect, useRef } from 'react';
import { notificationManager } from './notificationManager';
import { userManager } from './userManager';
import './NotificationPanel.css';

const NotificationPanel = ({ currentUser, isEnabled }) => {
  const [notifications, setNotifications] = useState([]);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!isEnabled || !currentUser) {
      return;
    }

    // Handle new notifications from other tabs
    const handleNewNotification = (event) => {
      // Don't show notifications from the current user
      if (event.username === currentUser.username) {
        return;
      }

      const notification = {
        id: event.id,
        message: notificationManager.formatNotificationMessage(event),
        timestamp: event.timestamp,
        isNew: true,
        username: event.username
      };

      setNotifications(prev => {
        // Add new notification and keep only last 10
        const updated = [notification, ...prev].slice(0, 10);
        return updated;
      });

      // Mark as not new after 3 seconds
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isNew: false } : n)
        );
      }, 3000);

      // Remove notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    // Set up storage listener
    cleanupRef.current = notificationManager.addStorageListener(handleNewNotification);

    // Clean up old events periodically
    const cleanupInterval = setInterval(() => {
      notificationManager.clearOldEvents();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      clearInterval(cleanupInterval);
    };
  }, [currentUser, isEnabled]);

  if (!isEnabled || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-panel">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-item ${notification.isNew ? 'new' : ''}`}
        >
          <div className="notification-message">
            {notification.message}
          </div>
          <div className="notification-time">
            {new Date(notification.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
