import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import './timerButtons.css';
import './settings.css';
import './quote.css';
import timersound from "./sounds/timer-complete.mp3";
import axios from 'axios';
import backgroundImageDay from './images/background.gif';
import backgroundImageNight from './images/background-night-optimized.gif';
import Login from './Login';
import { userManager } from './userManager';
import { notificationManager } from './notificationManager';
import NotificationPanel from './NotificationPanel';
import Store from './Store';
import ScreenEffects from './ScreenEffects';

function DailyQuote({ isDarkMode }) {
  const [quote, setQuote] = useState('');

  const fetchQuote = useCallback(() => {
    const category = 'happiness';
    const apiKey = 'x';

    axios.get(`https://api.api-ninjas.com/v1/quotes?category=${category}`, {
      headers: {
        'X-Api-Key': apiKey
      }
    })
      .then(response => {
        const quoteData = response.data;
        if (quoteData.length > 0) {
          const maxLength = 100;
          const currentQuote = quoteData[0].quote;

          if (currentQuote.length <= maxLength) {
            setQuote("\"" + currentQuote + "\"");
          } else {
            fetchQuote();
          }
        }
      })
      .catch(error => {
        console.error('Request failed:', error);
      });
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <div className={`quote-component ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="quote-container">
        <p className="quote">{quote}</p>
      </div>
    </div>
  );
}

function Timer({pomodoro, longBreak, shortBreak, setActiveTimer, activeTimer, currentUser, isDarkMode, onPulsarPointsEarned}) {
  const timerRef = useRef(null);
  const [timer, setTimer] = useState('25:00');
  const [isRunning, setIsRunning] = useState(false);
  const [isElapsed, setIsElapsed] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const alert = useMemo(() => new Audio(timersound), []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
  };

  // Load timer state from user data on component mount
  useEffect(() => {
    if (currentUser) {
      const timerData = userManager.getTimerData(currentUser.username);
      if (timerData && timerData.endTime) {
        const remainingTime = userManager.calculateRemainingTime(timerData.endTime);
        
        if (remainingTime > 0 && timerData.isRunning) {
          // Timer is still running in background
          setTimer(formatTime(remainingTime));
          setEndTime(timerData.endTime);
          setIsRunning(true);
          setActiveTimer(timerData.activeTimer);
        } else if (timerData.isRunning && remainingTime <= 0) {
          // Timer has elapsed while user was away
          setIsElapsed(true);
          setIsRunning(false);
          setTimer('00:00');
          setActiveTimer(timerData.activeTimer);
          alert.play();
          
          // Broadcast timer completion event
          const eventType = timerData.activeTimer === 'pomodoro' 
            ? notificationManager.EVENT_TYPES.POMODORO_COMPLETED 
            : notificationManager.EVENT_TYPES.BREAK_COMPLETED;
          
          notificationManager.broadcastEvent(eventType, currentUser.username, timerData.activeTimer);
          
          // Clear the timer data
          userManager.saveTimerData(currentUser.username, {
            endTime: null,
            isRunning: false
          });
        } else {
          // Load the saved timer type
          setActiveTimer(timerData.activeTimer);
          // Initialize timer with saved type
          let timeValue = 0;
          switch (timerData.activeTimer) {
            case 'pomodoro':
              timeValue = pomodoro;
              break;
            case 'longBreak':
              timeValue = longBreak;
              break;
            case 'shortBreak':
              timeValue = shortBreak;
              break;
            default:
              timeValue = pomodoro;
              break;
          }
          setTimer(formatTime(timeValue * 60));
        }
      }
    }
  }, [currentUser, pomodoro, longBreak, shortBreak, alert, setActiveTimer]);

  const setTimerState = (timerType) => {
    let timeValue = 0;
  
    switch (timerType) {
      case 'pomodoro':
        timeValue = pomodoro;
        break;
      case 'longBreak':
        timeValue = longBreak;
        break;
      case 'shortBreak':
        timeValue = shortBreak;
        break;
      default:
        break;
    }
    
    const newEndTime = Date.now() + timeValue * 60 * 1000;
    setTimer(formatTime(timeValue * 60));
    setEndTime(newEndTime);
    setActiveTimer(timerType);

    // Save timer state to user data
    if (currentUser) {
      userManager.saveTimerData(currentUser.username, {
        activeTimer: timerType,
        endTime: newEndTime,
        isRunning: false
      });
    }
  };

  const cycleTimer = () => {
    let nextTimer;
    
    switch (activeTimer) {
      case 'pomodoro':
        nextTimer = 'longBreak';
        break;
      case 'longBreak':
        nextTimer = 'shortBreak';
        break;
      case 'shortBreak':
        nextTimer = 'pomodoro';
        break;
      default:
        nextTimer = 'pomodoro';
        break;
    }

    setIsElapsed(false);
    setTimerState(nextTimer);
  };

  const resetTimer = () => {
    setIsElapsed(false);
    setTimerState(activeTimer);
  };

  const toggleTimer = () => {
    if (isRunning) {
      // Pause timer
      setIsRunning(false);
      if (currentUser) {
        userManager.saveTimerData(currentUser.username, {
          isRunning: false,
          endTime: null
        });
      }
    } else {
      if (isElapsed) {
        resetTimer();
      } else {
        // Start timer
        const currentTime = Number(timer.split(':')[0]) * 60 + Number(timer.split(':')[1]);
        const newEndTime = Date.now() + currentTime * 1000;
        setEndTime(newEndTime);
        setIsRunning(true);
        
        // Save timer state to user data
        if (currentUser) {
          userManager.saveTimerData(currentUser.username, {
            endTime: newEndTime,
            isRunning: true,
            activeTimer: activeTimer
          });
        }
      }
    }
  };

  useEffect(() => {
    if (isRunning) {
      const tick = () => {
        const remainingTime = (endTime - Date.now()) / 1000;
        if (remainingTime > 0) {
          setTimer(formatTime(Math.floor(remainingTime)));
          timerRef.current = setTimeout(tick, 1000);
        } else {
          alert.play();
          setIsElapsed(true);
          setIsRunning(false);
          setTimer('00:00');
          
            // Broadcast timer completion event and award points
            if (currentUser) {
              const eventType = activeTimer === 'pomodoro' 
                ? notificationManager.EVENT_TYPES.POMODORO_COMPLETED 
                : notificationManager.EVENT_TYPES.BREAK_COMPLETED;
              
              notificationManager.broadcastEvent(eventType, currentUser.username, activeTimer);
              
              // Award Pulsar Points for completing timers
              let pointsEarned = 0;
              if (activeTimer === 'pomodoro') {
                pointsEarned = 2000; // 10 points for completing a pomodoro
              } else {
                pointsEarned = 5; // 5 points for completing a break
              }
              
              const newPoints = userManager.addPulsarPoints(currentUser.username, pointsEarned);
              if (onPulsarPointsEarned) {
                onPulsarPointsEarned(newPoints, pointsEarned);
              }
              
              // Clear timer data from user storage
              userManager.saveTimerData(currentUser.username, {
                endTime: null,
                isRunning: false
              });
            }
        }
      };
      tick();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, endTime, currentUser, activeTimer, alert]);

  const timerLabels = {
    'pomodoro': 'P',
    'longBreak': 'L',
    'shortBreak': 'S',
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <p className={`timer ${isDarkMode ? 'dark-mode' : ''}`}>{timer}</p>
      <div className="play-pause-container">
        <button className="timer-button" style={{ "--clr": "#f0bccc" }} onClick={toggleTimer}>
          <span>{isElapsed ? 'Reset' : isRunning ? 'Pause' : 'Play'}</span>
          <div className="animation"></div>
        </button>
        <button className="timer-button" style={{"--clr": "#f0bccc"}} onClick={() => cycleTimer()}>
          <span>{timerLabels[activeTimer]}</span>
          <div className="animation"></div>
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isQuoteVis, setIsQuoteVis] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [activeTimer, setActiveTimer] = useState('pomodoro');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showStore, setShowStore] = useState(false);
  const [pulsarPoints, setPulsarPoints] = useState(0);
  const [screenEffectsActive, setScreenEffectsActive] = useState(false);

  // Check for logged in user on app start
  useEffect(() => {
    const user = userManager.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Load user settings
      if (user.timerData && user.timerData.settings) {
        const settings = user.timerData.settings;
        setPomodoro(settings.pomodoro || 25);
        setShortBreak(settings.shortBreak || 5);
        setLongBreak(settings.longBreak || 15);
        setNotificationsEnabled(settings.notificationsEnabled !== undefined ? settings.notificationsEnabled : true);
      }
      // Load Pulsar Points
      const points = userManager.getPulsarPoints(user.username);
      setPulsarPoints(points);
    } else {
      setShowLogin(true);
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (currentUser) {
      userManager.saveUserSettings(currentUser.username, {
        pomodoro,
        shortBreak,
        longBreak,
        notificationsEnabled
      });
    }
  }, [pomodoro, shortBreak, longBreak, notificationsEnabled, currentUser]);

  const handleLogin = (username, password) => {
    const result = userManager.loginUser(username, password);
    if (result.success) {
      const user = userManager.getCurrentUser();
      setCurrentUser(user);
      setShowLogin(false);
      setLoginError('');
      
      // Load user settings
      if (user.timerData && user.timerData.settings) {
        const settings = user.timerData.settings;
        setPomodoro(settings.pomodoro || 25);
        setShortBreak(settings.shortBreak || 5);
        setLongBreak(settings.longBreak || 15);
      }
    } else {
      setLoginError(result.error);
    }
  };

  const handleRegister = (username, password) => {
    const result = userManager.registerUser(username, password);
    if (result.success) {
      // Auto-login after registration
      handleLogin(username, password);
    } else {
      setLoginError(result.error);
    }
  };

  const handleLogout = () => {
    userManager.logoutUser();
    setCurrentUser(null);
    setShowLogin(true);
    // Reset to default settings
    setPomodoro(25);
    setShortBreak(5);
    setLongBreak(15);
    setActiveTimer('pomodoro');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const backgroundImage = isDarkMode ? backgroundImageNight : backgroundImageDay;

  const handleChangePomodoro = event => {
    setPomodoro(Number(event.target.value));
  };
  
  const handleChangeShortBreak = event => {
    setShortBreak(Number(event.target.value));
  };
  
  const handleChangeLongBreak = event => {
    setLongBreak(Number(event.target.value));
  };

  const handleChangeQuoteVis = event => {
    setIsQuoteVis(!isQuoteVis);
  };

  const handleChangeNotifications = event => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleSettingsPanel = () => {
    setShowSettingsPanel(!showSettingsPanel);
  };

  // Store functionality
  const toggleStore = () => {
    setShowStore(!showStore);
  };

  const handlePulsarPointsEarned = (newTotal, pointsEarned) => {
    setPulsarPoints(newTotal);
  };

  const handleStorePointsUpdate = (newTotal) => {
    setPulsarPoints(newTotal);
  };

  // Store event handlers
  useEffect(() => {
    if (!currentUser || !notificationsEnabled) return;

    const handleStoreEvent = (event) => {
      // Don't handle events from the current user
      if (event.username === currentUser.username) {
        return;
      }

      switch (event.type) {
        case notificationManager.EVENT_TYPES.SCREEN_EFFECTS:
          setScreenEffectsActive(true);
          setTimeout(() => {
            setScreenEffectsActive(false);
          }, event.duration || 30000);
          break;
        
        case notificationManager.EVENT_TYPES.CUSTOM_ANNOUNCEMENT:
          // Custom announcements are handled by NotificationPanel
          break;
        
        case notificationManager.EVENT_TYPES.FIRE_EMOJI_ACTIVATED:
          // Fire emoji effects are handled by username display
          break;
        
        default:
          break;
      }
    };

    const cleanup = notificationManager.addStorageListener(handleStoreEvent);
    return cleanup;
  }, [currentUser, notificationsEnabled]);

  // Apply background and dark mode styles
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : '';
    document.body.style = `
      background-image: url('${backgroundImage}');
      background-size: cover;
      background-repeat: no-repeat;
      background-attachment: fixed;
      background-position: center;
      filter: ${isDarkMode ? 'brightness(0.6)' : 'brightness(1)'};
    `;
  }, [backgroundImage, isDarkMode]);

  if (showLogin) {
    return (
      <div className={isDarkMode ? 'dark-mode' : ''}>
        <Login
          onLogin={handleLogin}
          onRegister={handleRegister}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          error={loginError}
        />
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark-mode' : ''}>
      <div className='quote-container'>
        {isQuoteVis ? <DailyQuote isDarkMode={isDarkMode} /> : ''}
      </div>
      <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* User info and controls */}
        <div className="user-controls">
          <span className={`username-display ${isDarkMode ? 'dark-mode' : ''}`}>
            Welcome, {currentUser?.username} {userManager.hasFireEmoji(currentUser?.username) ? '🔥' : ''}
          </span>
          <div className="pulsar-points-display">
            <span className="points-icon">⭐</span>
            <span className="points-text">{pulsarPoints} PP</span>
          </div>
          <button
            className="store-button"
            onClick={toggleStore}
            title="Open Pulsar Store"
          >
            🛍️
          </button>
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Notification Panel */}
        <NotificationPanel 
          currentUser={currentUser} 
          isEnabled={notificationsEnabled}
        />

        <button
          className={'settingsbutton settings-icon'}
          onClick={toggleSettingsPanel}
        ></button>
        
        <header className="App-header">
          {activeTimer === 'pomodoro' && <p className={`retro-shadow ${isDarkMode ? 'dark-mode' : ''}`}>Pomodoro</p>}
          {activeTimer === 'shortBreak' && <p className={`retro-shadow ${isDarkMode ? 'dark-mode' : ''}`}>Short Break</p>}
          {activeTimer === 'longBreak' && <p className={`retro-shadow ${isDarkMode ? 'dark-mode' : ''}`}>Long Break</p>}
          <Timer 
            pomodoro={pomodoro} 
            longBreak={longBreak} 
            shortBreak={shortBreak} 
            setActiveTimer={setActiveTimer} 
            activeTimer={activeTimer}
            currentUser={currentUser}
            isDarkMode={isDarkMode}
            onPulsarPointsEarned={handlePulsarPointsEarned}
          />
        </header>
        
        <div className={`settings-panel ${showSettingsPanel ? 'show' : ''} ${isDarkMode ? 'dark-mode' : ''}`}>
          <div className={`settings-modal ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="settings-content">
              <div>
                <label htmlFor="pomodoro">Pomodoro </label>
                <input
                  type="number"
                  id="pomodoro"
                  name="pomodoro"
                  max="99"
                  min="1"
                  onChange={handleChangePomodoro}
                  value={pomodoro}
                  autoComplete="off"
                />
              </div>
              <div>
                <label htmlFor="longBreak">Long Break </label>
                <input
                  type="number"
                  id="longBreak"
                  name="longBreak"
                  onChange={handleChangeLongBreak}
                  value={longBreak}
                  autoComplete="off"
                  max="99"
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="shortBreak">Short Break </label>
                <input
                  type="number"
                  id="shortBreak"
                  name="shortBreak"
                  onChange={handleChangeShortBreak}
                  value={shortBreak}
                  autoComplete="off"
                  max="99"
                  min="1"
                />
              </div>
              <div>
                <label>Daily Quote</label>
                <input 
                  type="checkbox"
                  id="quoteCheckbox"
                  name="quoteCheckbox"
                  onChange={handleChangeQuoteVis}
                  checked={isQuoteVis}
                />
              </div>
              <div>
                <label>Real-time Notifications</label>
                <input 
                  type="checkbox"
                  id="notificationsCheckbox"
                  name="notificationsCheckbox"
                  onChange={handleChangeNotifications}
                  checked={notificationsEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Modal */}
        <Store
          currentUser={currentUser}
          isOpen={showStore}
          onClose={toggleStore}
          onPointsUpdate={handleStorePointsUpdate}
        />

        {/* Screen Effects */}
        <ScreenEffects
          isActive={screenEffectsActive}
          duration={30000}
        />
      </div>
    </div>
  );
}

export default App;
