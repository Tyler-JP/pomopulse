import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import './timerButtons.css';
import * as MUI from '@mui/material';


function AlertComponent(props) {
    return (
        <MUI.Alert severity="error">
            <MUI.AlertTitle>Error</MUI.AlertTitle>
            This is an error alert - <strong>check it out!</strong>
        </MUI.Alert>
    );
}

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
  
    const resetTimer = () => {
      setRemainingTime(60000);
      setTimer('01:00');
    };
  
    const toggleTimer = () => {
      setIsRunning((prevIsRunning) => !prevIsRunning);
    };
  
    return (
        <div className="App">
            <button className="timer-button" style={{ "--clr": "#0e7a04" }} onClick={resetTimer}>
              <span>Reset!</span>
              <div className="animation"></div>
            </button>
          <p className="timer">{timer}</p>
          <div className="play-pause-container">
            <button className="timer-button" style={{ "--clr": "#0e7a04" }} onClick={toggleTimer}>
              <span>{isRunning ? 'Pause' : 'Play'}</span>
              <div className="animation"></div>
            </button>
          </div>
        </div>
      );
           
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Timer></Timer>
      </header>
    </div>
  );
}

export default App;
