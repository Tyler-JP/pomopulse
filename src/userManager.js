// User management utilities for localStorage
export const userManager = {
  // Get all users from localStorage
  getUsers: () => {
    const users = localStorage.getItem('pomopulse_users');
    return users ? JSON.parse(users) : {};
  },

  // Save users to localStorage
  saveUsers: (users) => {
    localStorage.setItem('pomopulse_users', JSON.stringify(users));
  },

  // Register a new user
  registerUser: (username, password) => {
    const users = userManager.getUsers();
    
    if (users[username]) {
      return { success: false, error: 'Username already exists' };
    }

    users[username] = {
      password: password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      timerData: {
        currentTimer: null,
        startTime: null,
        endTime: null,
        isRunning: false,
        activeTimer: 'pomodoro',
        settings: {
          pomodoro: 25,
          shortBreak: 5,
          longBreak: 15,
          notificationsEnabled: true
        }
      }
    };

    userManager.saveUsers(users);
    return { success: true };
  },

  // Login user
  loginUser: (username, password) => {
    const users = userManager.getUsers();
    
    if (!users[username]) {
      return { success: false, error: 'User not found' };
    }

    if (users[username].password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Set current user in localStorage
    localStorage.setItem('pomopulse_current_user', username);
    return { success: true, user: users[username] };
  },

  // Get current logged in user
  getCurrentUser: () => {
    const username = localStorage.getItem('pomopulse_current_user');
    if (!username) return null;

    const users = userManager.getUsers();
    return users[username] ? { username, ...users[username] } : null;
  },

  // Logout user
  logoutUser: () => {
    localStorage.removeItem('pomopulse_current_user');
  },

  // Save timer data for current user
  saveTimerData: (username, timerData) => {
    const users = userManager.getUsers();
    if (users[username]) {
      users[username].timerData = { ...users[username].timerData, ...timerData };
      userManager.saveUsers(users);
    }
  },

  // Get timer data for current user
  getTimerData: (username) => {
    const users = userManager.getUsers();
    return users[username] ? users[username].timerData : null;
  },

  // Save user settings
  saveUserSettings: (username, settings) => {
    const users = userManager.getUsers();
    if (users[username]) {
      users[username].timerData.settings = { ...users[username].timerData.settings, ...settings };
      userManager.saveUsers(users);
    }
  },

  // Calculate remaining time for background timer
  calculateRemainingTime: (endTime) => {
    if (!endTime) return 0;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return remaining;
  }
};
