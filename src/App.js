import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './timerButtons.css';
import './settings.css';
import timersound from "./sounds/timer-complete.mp3";
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
          const maxLength = 80;
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
    <div className = "App">
      <p className = "quote">{quote}</p>
    </div>
  );
}

function Timer({pomodoro, longBreak, shortBreak, setActiveTimer, activeTimer}) {
  const timerRef = useRef(null);
  const [timer, setTimer] = useState('45:00');
  const [isRunning, setIsRunning] = useState(false);
  const [isElapsed, setIsElapsed] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const alert = new Audio(timersound);

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
    
    setTimer(formatTime(timeValue * 60));
    setEndTime(Date.now() + timeValue * 60 * 1000);
    setActiveTimer(timerType);
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
        break;
    }

    setTimerState(nextTimer);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      const currentTime = Number(timer.split(':')[0]) * 60 + Number(timer.split(':')[1]);
      const newEndTime = Date.now() + currentTime * 1000;
      setEndTime(newEndTime);
      setIsRunning(true);
    }
  };

  useEffect(() => {
    setTimerState(activeTimer);
  }, [activeTimer]);
  
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
        }
      };
      tick();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, endTime]);

  const timerLabels = {
    'pomodoro': 'P',
    'longBreak': 'L',
    'shortBreak': 'S',
  };

  return (
    <div className="App">
      <p className="timer">{timer}</p>
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
  const [isQuoteVis, setIsQuoteVis] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsPanel] = useState(false);
  const [pomodoro, setPomodoro] = useState('40');
  const [setIsPomodoro] = useState(false);
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
  const handleChangeQuoteVis = event => {
    setIsQuoteVis(!isQuoteVis);
  }

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
    <div className={"App"}>
      {isQuoteVis ? <DailyQuote></DailyQuote> : ''}
      <button
        className={'settingsbutton settings-icon'}
        onClick={toggleSettingsPanel}
      ></button>
      <header className="App-header">
        {activeTimer === 'pomodoro' && <p className = "retro-shadow">Pomodoro</p>}
        {activeTimer === 'shortBreak' && <p className = "retro-shadow">Short Break</p>}
        {activeTimer === 'longBreak' && <p className = "retro-shadow">Long Break</p>}
        <Timer pomodoro={pomodoro} longBreak={longBreak} shortBreak={shortBreak} setActiveTimer={setActiveTimer} activeTimer={activeTimer}></Timer>
      </header>
      <div className={`settings-panel ${showSettingsPanel ? 'show' : ''}`}>
        <div className="settings-modal">
          <div className="settings-content">
            <div>
              <label htmlFor="shortBreak">Pomodoro </label>
              <input
              type="number"
              id="pomodoaro"
              name="pomodoro"
              max="99"
              onChange={handleChangePomodoro}
              value={pomodoro}
              autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="shortBreak">Long Break </label>
              <input
              type="number"
              id="longBreak"
              name="longBreak"
              onChange={handleChangeLongBreak}
              value={longBreak}
              autoComplete="off"
              max = "99"
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
              max = "99"
              />
            </div>
            <div>
            <label>Daily Quote</label>
            <input 
            type = "checkbox"
            id="quoteCheckbox"
            name="quoteCheckbox"
            onChange={handleChangeQuoteVis}
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;