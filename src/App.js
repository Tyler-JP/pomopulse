import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import { render } from 'react-dom';
import './App.css';
import './nightdaybuttons.css'
import './timerButtons.css';
import './settings.css';

function Timer({pomodoro, longBreak, shortBreak}) {
    const Ref = useRef(null);
    const [timer, setTimer] = useState('45:00');
    const [isRunning, setIsRunning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(45 * 60 * 1000);
  
    const getTimeRemaining = (time) => {
      const total = time;
      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      return {
        total,
        minutes,
        seconds,
      };
    };
  
    const startTimer = useCallback(() => {
      let { total, minutes, seconds } = getTimeRemaining(remainingTime);
      if (total >= 0) {
        setTimer(
            (minutes > 9 ? minutes : '0' + minutes) +
            ':' +
            (seconds > 9 ? seconds : '0' + seconds)
        );
        if (isRunning) {
          Ref.current = setTimeout(() => {
            setRemainingTime((prevRemainingTime) => prevRemainingTime - 1000);
            startTimer();
          }, 1000);
        }
      }
    }, [remainingTime, isRunning]);
  
    useEffect(() => {
      if (isRunning) {
        if (Ref.current) clearTimeout(Ref.current);
        startTimer();
        return () => clearTimeout(Ref.current);
      }
    }, [isRunning, startTimer]);
  
    const toggleTimer = () => {
      setIsRunning((prevIsRunning) => !prevIsRunning);
    };

    const setPomodoro = () => {
      setTimer(`${pomodoro}:00`);
      setRemainingTime(pomodoro * 60 * 1000);
    };

    const setLongBreak = () => {
      setTimer(`${longBreak}:00`);
      setRemainingTime(longBreak * 60 * 1000);
    };
    
    const setShortBreak = () => {
      setTimer(`${shortBreak}:00`);
      setRemainingTime(shortBreak * 60 * 1000);
    };

  
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
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const settingsPanelRef = useRef(null);
  const [pomodoro, setPomodoro] = useState('40');
  const [shortBreak, setShortBreak] = useState('5');
  const [longBreak, setLongBreak] = useState('15');

  const handleChangePomodoro = event => {
    setPomodoro(event.target.value);
    console.log('value is:', event.target.value);
  };
  const handleChangeShortBreak = event => {
    setShortBreak(event.target.value);
    console.log('value is:', event.target.value);
  };
  const handleChangeLongBreak = event => {
    setLongBreak(event.target.value);
    console.log('value is:', event.target.value);
  };

  const handleClick = () =>  {
    setIsDarkMode(!isDarkMode);
  }

  const setShortBreakTimer = () =>  {
    setIsDarkMode(!isDarkMode);
  }

  const setLongBreakTimer = () =>  {
    setIsDarkMode(!isDarkMode);
  }

  const setPomodoroTimer = () =>  {
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


  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <button
        className={`nightdaybutton ${isDarkMode ? 'day-icon' : 'night-icon'}`}
        onClick={handleClick}
      ></button>
      <button
        className={'settingsbutton settings-icon'}
        onClick={toggleSettingsPanel}
      ></button>
      <header className="App-header">
        <Timer pomodoro={pomodoro} longBreak={longBreak} shortBreak={shortBreak}></Timer>
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