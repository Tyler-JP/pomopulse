import React, { useEffect, useState } from 'react';
import './ScreenEffects.css';

const ScreenEffects = ({ isActive, duration = 30000 }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setSparkles([]);
      return;
    }

    const createSparkle = () => {
      const id = Math.random().toString(36).substr(2, 9);
      const sparkle = {
        id,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 10,
        duration: Math.random() * 2000 + 1000,
        delay: Math.random() * 500
      };
      
      setSparkles(prev => [...prev, sparkle]);
      
      // Remove sparkle after its duration
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== id));
      }, sparkle.duration + sparkle.delay);
    };

    // Create initial burst of sparkles
    for (let i = 0; i < 20; i++) {
      setTimeout(createSparkle, i * 100);
    }

    // Continue creating sparkles during the effect duration
    const interval = setInterval(createSparkle, 300);

    // Stop creating new sparkles after duration
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, duration]);

  if (!isActive) return null;

  return (
    <div className="screen-effects">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}ms`,
            animationDuration: `${sparkle.duration}ms`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export default ScreenEffects;
