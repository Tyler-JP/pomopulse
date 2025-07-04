// Real-time notification manager using localStorage for cross-tab communication
export const notificationManager = {
  // Event types
  EVENT_TYPES: {
    POMODORO_COMPLETED: 'pomodoro_completed',
    BREAK_COMPLETED: 'break_completed'
  },

  // Generate unique event ID
  generateEventId: () => {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Broadcast event to all tabs
  broadcastEvent: (eventType, username, timerType) => {
    const event = {
      id: notificationManager.generateEventId(),
      type: eventType,
      username: username,
      timerType: timerType,
      timestamp: Date.now()
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
    const { username, timerType, type } = event;
    
    switch (type) {
      case notificationManager.EVENT_TYPES.POMODORO_COMPLETED:
        return `${username} just finished a pomodoro timer!`;
      case notificationManager.EVENT_TYPES.BREAK_COMPLETED:
        if (timerType === 'shortBreak') {
          return `${username} finished a short break!`;
        } else if (timerType === 'longBreak') {
          return `${username} finished a long break!`;
        }
        return `${username} finished a break!`;
      default:
        return `${username} completed a timer!`;
    }
  }
};
