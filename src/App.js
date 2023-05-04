import React, { useState, useEffect, useRef, useCallback } from 'react';
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

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleClick = () =>  {
    setIsDarkMode(!isDarkMode);
  }


  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <button
        className={`nightdaybutton ${isDarkMode ? 'day-icon' : 'night-icon'}`}
        onClick={handleClick}
      ></button>
      <button
        className={'settingsbutton settings-icon'}
      ></button>
      <header className="App-header">
        <Timer></Timer>
      </header>
    </div>
  );
}

export default App;
