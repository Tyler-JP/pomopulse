import React, { Component, useState, useEffect, useRef, useCallback } from 'react';
import { render } from 'react-dom';
import './App.css';
import './nightdaybuttons.css'
import './timerButtons.css';
import './settings.css';

function Timer() {
    const Ref = useRef(null);
    const [timer, setTimer] = useState('01:00');
    const [isRunning, setIsRunning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(60000);
  
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
  
    return (
        <div className="App">
          <p className="timer">{timer}</p>
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
  const [message, setMessage] = useState('');

  const handleChange = event => {
    setMessage(event.target.value);

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
        <Timer></Timer>
      </header>
      <div className={`settings-panel ${showSettingsPanel ? 'show' : ''}`}>
        <div className="settings-modal">
          <div className="settings-content">
          <button onClick={setShortBreakTimer}>Save</button>
          <InputNumber/>
          <button onClick={setLongBreakTimer}>Save</button>
          <input
          type="number"
          id="message"
          name="message"
          onChange={handleChange}
          value={message}
          autoComplete="off"
          />
          <button onClick={setPomodoroTimer}>Save</button>
          <input
          type="number"
          id="message"
          name="message"
          onChange={handleChange}
          value={message}
          autoComplete="off"
          />
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;
