import React, { useState, useEffect } from 'react';

export const HoverProgressIndicator = ({ delay, isActive, position }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    const interval = 50; // Update every 50ms for smooth animation
    const steps = delay / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [delay, isActive]);

  if (!isActive || delay < 200) {
    return null; // Don't show for very short delays
  }

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 50,
        pointerEvents: 'none',
        top: `${position.y + 20}px`,
        left: `${position.x - 25}px`,
      }}
    >
      <div style={{
        background: 'rgba(0, 0, 0, 0.75)',
        color: 'white',
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '48px',
          height: '4px',
          background: '#d1d5db',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              height: '100%',
              background: '#60a5fa',
              transition: 'width 75ms ease-out',
              borderRadius: '4px',
              width: `${progress}%`
            }}
          />
        </div>
        <span style={{ fontSize: '12px' }}>Loading...</span>
      </div>
    </div>
  );
};