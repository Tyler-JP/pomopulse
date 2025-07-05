// Real-time notification manager using localStorage for cross-tab communication
export const notificationManager = {
  // Event types
  EVENT_TYPES: {
    POMODORO_COMPLETED: 'pomodoro_completed',
    BREAK_COMPLETED: 'break_completed',
    SCREEN_EFFECTS: 'screen_effects',
    CUSTOM_ANNOUNCEMENT: 'custom_announcement',
    FIRE_EMOJI_ACTIVATED: 'fire_emoji_activated'
  },

  // Generate unique event ID
  generateEventId: () => {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Broadcast event to all tabs
  broadcastEvent: (eventType, username, timerType, additionalData = {}) => {
    const event = {
      id: notificationManager.generateEventId(),
      type: eventType,
      username: username,
      timerType: timerType,
      timestamp: Date.now(),
      ...additionalData
    };

    // Get existing events
    const events = notificationManager.getEvents();
    
    // Add new event
    events.push(event);
    
    // Keep only last 50 events to prevent localStorage bloat
    const recentEvents = events.slice(-50);
    
    // Save to localStorage
    localStorage.setItem('pomopulse_events', JSON.stringify(recentEvents));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'pomopulse_events',
      newValue: JSON.stringify(recentEvents),
      oldValue: JSON.stringify(events.slice(0, -1))
    }));

    return event.id;
  },

  // Get all events
  getEvents: () => {
    const events = localStorage.getItem('pomopulse_events');
    return events ? JSON.parse(events) : [];
  },

  // Get events newer than timestamp
  getEventsAfter: (timestamp) => {
    const events = notificationManager.getEvents();
    return events.filter(event => event.timestamp > timestamp);
  },

  // Clear old events (older than 1 hour)
  clearOldEvents: () => {
    const events = notificationManager.getEvents();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentEvents = events.filter(event => event.timestamp > oneHourAgo);
    localStorage.setItem('pomopulse_events', JSON.stringify(recentEvents));
  },

  // Listen for storage events (cross-tab communication)
  addStorageListener: (callback) => {
    const handleStorageChange = (e) => {
      if (e.key === 'pomopulse_events' && e.newValue) {
        const newEvents = JSON.parse(e.newValue);
        const oldEvents = e.oldValue ? JSON.parse(e.oldValue) : [];
        
        // Find new events
        const addedEvents = newEvents.filter(newEvent => 
          !oldEvents.some(oldEvent => oldEvent.id === newEvent.id)
        );
        
        // Call callback for each new event
        addedEvents.forEach(callback);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  },

  // Format notification message
  formatNotificationMessage: (event) => {
    const { username, timerType, type, message } = event;
    
    // Import userManager here to avoid circular dependency
    const { userManager } = require('./userManager');
    
    // Add fire emoji if user has it active
    const displayName = userManager.hasFireEmoji(username) ? `${username} 🔥` : username;
    
    switch (type) {
      case notificationManager.EVENT_TYPES.POMODORO_COMPLETED:
        return `${displayName} just finished a pomodoro timer!`;
      case notificationManager.EVENT_TYPES.BREAK_COMPLETED:
        if (timerType === 'shortBreak') {
          return `${displayName} finished a short break!`;
        } else if (timerType === 'longBreak') {
          return `${displayName} finished a long break!`;
        }
        return `${displayName} finished a break!`;
      case notificationManager.EVENT_TYPES.SCREEN_EFFECTS:
        return `${displayName} activated screen effects! ✨`;
      case notificationManager.EVENT_TYPES.CUSTOM_ANNOUNCEMENT:
        return `${displayName}: ${message}`;
      case notificationManager.EVENT_TYPES.FIRE_EMOJI_ACTIVATED:
        return `${displayName} is on fire! 🔥`;
      default:
        return `${displayName} completed a timer!`;
    }
  }
};
