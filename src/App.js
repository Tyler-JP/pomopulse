import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './nightdaybuttons.css'
import './timerButtons.css';
import './settings.css';
import axios from 'axios';
import backgroundImageDay from './images/background.gif';
import backgroundImageNight from './images/background-night-optimized.gif';

function DailyQuote() {
  const [quote, setQuote] = useState('');

  const fetchQuote = useCallback(() => {
    const category = 'happiness';
    const apiKey = 'PPUGDmR2acLHPAQ9aCIJyQ==4ReaEuj7mtZx5Rm6';

    axios.get(`https://api.api-ninjas.com/v1/quotes?category=${category}`, {
      headers: {
        'X-Api-Key': apiKey
      }
    })
      .then(response => {
        const quoteData = response.data;
        if (quoteData.length > 0) {
          const maxLength = 120; // Max length
          const currentQuote = quoteData[0].quote;

          if (currentQuote.length <= maxLength) {
            setQuote(currentQuote);
          } else {
            fetchQuote(); // Retry fetching the quote
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
    <div className = "App">
      <p className = "quote">{quote}</p>
    </div>
  );
}

function Timer({pomodoro, longBreak, shortBreak, setActiveTimer}) {
  const timerRef = useRef(null);
  const [timer, setTimer] = useState('45:00');
  const [isRunning, setIsRunning] = useState(false);
  const [endTime, setEndTime] = useState(null);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes > 9 ? minutes : '0' + minutes}:${seconds > 9 ? seconds : '0' + seconds}`;
  };

  const setPomodoro = () => {
    setTimer(formatTime(pomodoro * 60));
    setEndTime(Date.now() + pomodoro * 60 * 1000);
    setActiveTimer('pomodoro');
  };

  const setLongBreak = () => {
    setTimer(formatTime(longBreak * 60));
    setEndTime(Date.now() + longBreak * 60 * 1000);
    setActiveTimer('longBreak');
  };

  const setShortBreak = () => {
    setTimer(formatTime(shortBreak * 60));
    setEndTime(Date.now() + shortBreak * 60 * 1000);
    setActiveTimer('shortBreak');
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning && endTime) {
      const tick = () => {
        const remainingTime = Math.floor((endTime - Date.now()) / 1000);
        if (remainingTime > 0) {
          setTimer(formatTime(remainingTime));
          timerRef.current = setTimeout(tick, 1000);
        } else {
          setIsRunning(false);
        }
      };
      tick();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, endTime]);

  return (
    <div className="App">
      <p className="timer">{timer}</p>
      <div className="timer-config-container">
        <button className="timer-button" style={{"--clr": "#f0bccc"}} onClick={setPomodoro}>
          <span>Pomodoro</span>
          <div className="animation"></div>
        </button>
        <button className="timer-button" style={{"--clr": "#f0bccc"}} onClick={setLongBreak}>
          <span>Long Break</span>
          <div className="animation"></div>
        </button>
        <button className="timer-button" style={{"--clr": "#f0bccc"}} onClick={setShortBreak}>
          <span>Short Break</span>
          <div className="animation"></div>
        </button>
      </div>
      <div className="play-pause-container">
        <button className="timer-button" style={{ "--clr": "#f0bccc" }} onClick={toggleTimer}>
          <span>{isRunning ? 'Pause' : 'Play'}</span>
          <div className="animation"></div>
        </button>
      </div>
    </div>
  );
}

export function InputNumber({ steps = 1, onChange }) {
  const [value, setValue] = useState(0);
  const [mouseDownDirection, setMouseDownDirection] = useState(null);
  const max = (num) => (num < 0 ? 4 : 3);

  const handleChange = ({ currentTarget: { value } }) => {
      setValue(curr => {
          if (!Boolean(value)) { return 0; }
          const numeric = parseInt(value, 10);
          const maxLength = max(numeric);

          if (value.length > maxLength) {
              return curr;
          }

          return (value.length <= maxLength ? numeric : curr);
      });
  };

  const handleButtonChange = (direction) => {
      setValue(curr => {
          let next;

          switch (direction) {
              case "up":
                  next = curr + (steps || 1);
                  break;
              case "down":
                  next = curr - (steps || 1);
                  break;
              default:
                  next = curr;
                  break;
          }

          return `${next}`.length <= max(curr) ? next : curr;
      });
  };

  useEffect(() => {
      if(onChange) {
          onChange(value);
      }
  }, [value, onChange]);

  return (
      <div className="input-number">
          <button
              className="input-number-button"
              onClick={() => handleButtonChange("down")}
              onMouseDown={() => setMouseDownDirection("down")}
              onMouseOut={() => setMouseDownDirection(null)}
              onMouseUp={() => setMouseDownDirection(null)}
          >-</button>
          <input 
              className="input-number-input"
              type="number" 
              step={steps} 
              value={value} 
              onChange={handleChange} 
          />
          <button
              className="input-number-button"
              onClick={() => handleButtonChange("up")}
              onMouseDown={() => setMouseDownDirection("up")}
              onMouseUp={() => setMouseDownDirection(null)}
              onMouseOut={() => setMouseDownDirection(null)}
          >+</button>
      </div>
  );
}





function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsPanel] = useState(false);
  const [pomodoro, setPomodoro] = useState('40');
  const [, setIsPomodoro] = useState(false);
  const [shortBreak, setShortBreak] = useState('5');
  const [setIsShortBreak] = useState(false);
  const [longBreak, setLongBreak] = useState('15');
  const [setIsLongBreak] = useState(false);
  const [activeTimer, setActiveTimer] = useState('pomodoro');
  const backgroundImage = isDarkMode ? backgroundImageNight : backgroundImageDay;


  const handleChangePomodoro = event => {
    setPomodoro(event.target.value);
    setIsPomodoro(true); 
    setIsShortBreak(false); 
    setIsLongBreak(false);
    console.log('value is:', event.target.value);
  };
  const handleChangeShortBreak = event => {
    setShortBreak(event.target.value);
    setIsShortBreak(true);
    setIsPomodoro(false);
    setIsLongBreak(false);
    console.log('value is:', event.target.value);
  };
  const handleChangeLongBreak = event => {
    setLongBreak(event.target.value);
    setIsLongBreak(true);
    setIsPomodoro(false);
    setIsShortBreak(false);
    console.log('value is:', event.target.value);
  };

  const handleClick = () =>  {
    setIsDarkMode(!isDarkMode);
  }

  const toggleSettingsPanel = () => {
    const settingsModal = document.querySelector('.settings-modal');
    settingsModal.classList.toggle('show');
  };

  window.addEventListener('click', function(event) {
    if (event.target.id === 'settingsButton') {
      toggleSettingsPanel();
    }
  });

  document.body.style = `
    background-image: url('${backgroundImage}');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: center;
  `;


  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <DailyQuote></DailyQuote>
      <button
        className={`nightdaybutton ${isDarkMode ? 'day-icon' : 'night-icon'}`}
        onClick={handleClick}
      ></button>
      <button
        className={'settingsbutton settings-icon'}
        onClick={toggleSettingsPanel}
      ></button>
      <header className="App-header">
        {activeTimer === 'pomodoro' && <p className = "retro-shadow">Pomodoro</p>}
        {activeTimer === 'shortBreak' && <p className = "retro-shadow">Short Break</p>}
        {activeTimer === 'longBreak' && <p className = "retro-shadow">Long Break</p>}
        <Timer pomodoro={pomodoro} longBreak={longBreak} shortBreak={shortBreak} setActiveTimer={setActiveTimer}></Timer>
      </header>
      <div className={`settings-panel ${showSettingsPanel ? 'show' : ''}`}>
        <div className="settings-modal">
          <div className="settings-content">
          <label htmlFor="shortBreak">Pomodoro:</label>
          <input
          type="number"
          id="pomodoro"
          name="pomodoro"
          max="180"
          onChange={handleChangePomodoro}
          value={pomodoro}
          autoComplete="off"
          />
          <label htmlFor="shortBreak">Long Break:</label>
          <input
          type="number"
          id="longBreak"
          name="longBreak"
          onChange={handleChangeLongBreak}
          value={longBreak}
          autoComplete="off"
          max = "180"
          />
          <label htmlFor="shortBreak">Short Break:</label>
          <input
          type="number"
          id="shortBreak"
          name="shortBreak"
          onChange={handleChangeShortBreak}
          value={shortBreak}
          autoComplete="off"
          max = "60"
          />
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;