import React, { useState, useEffect, useRef } from 'react';

export const PreviewPositioner = ({ position, isVisible, children }) => {
  const [calculatedPosition, setCalculatedPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  // Calculate optimal position for the preview
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const calculateOptimalPosition = () => {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // Content not yet rendered, try again
        requestAnimationFrame(calculateOptimalPosition);
        return { top: 0, left: 0 };
      }
      
      const { x, y } = position;
      const margin = 20; // Minimum margin from viewport edges
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get scroll positions
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate available space in each direction from cursor
      const spaceRight = viewportWidth - (x - scrollX);
      const spaceLeft = x - scrollX;
      const spaceBottom = viewportHeight - (y - scrollY);
      const spaceTop = y - scrollY;

      let top = y + 15; // Start below cursor
      let left = x + 15; // Start to the right of cursor

      // Smart horizontal positioning with better edge detection
      if (spaceRight >= rect.width + margin + 50) {
        // Enough space on right, position to right of cursor
        left = x + 10;
      } else if (spaceLeft >= rect.width + margin + 50) {
        // Not enough space on right, position to left of cursor
        left = x - rect.width - 10;
      } else {
        // Not enough space on either side, center horizontally with margin
        const centerX = viewportWidth / 2 + scrollX;
        left = Math.max(margin + scrollX, Math.min(
          viewportWidth + scrollX - rect.width - margin,
          centerX - rect.width / 2
        ));
      }

      // Smart vertical positioning with improved edge detection
      if (spaceBottom >= rect.height + margin + 30) {
        // Enough space below, position below cursor
        top = y + 10;
      } else if (spaceTop >= rect.height + margin + 30) {
        // Not enough space below, position above cursor
        top = y - rect.height - 10;
      } else {
        // Not enough space above or below, center vertically with margin
        const centerY = viewportHeight / 2 + scrollY;
        top = Math.max(margin + scrollY, Math.min(
          viewportHeight + scrollY - rect.height - margin,
          centerY - rect.height / 2
        ));
      }

      // Final boundary checks with enhanced constraints
      const minLeft = margin + scrollX;
      const maxLeft = viewportWidth + scrollX - rect.width - margin;
      const minTop = margin + scrollY;
      const maxTop = viewportHeight + scrollY - rect.height - margin;
      
      left = Math.max(minLeft, Math.min(left, maxLeft));
      top = Math.max(minTop, Math.min(top, maxTop));
      
      // Additional safety check for very small screens
      if (rect.width > viewportWidth - 2 * margin) {
        left = scrollX + margin;
      }
      if (rect.height > viewportHeight - 2 * margin) {
        top = scrollY + margin;
      }

      return { top: Math.round(top), left: Math.round(left) };
    };

    // Calculate optimal position
    const newPosition = calculateOptimalPosition();
    setCalculatedPosition(newPosition);
    requestAnimationFrame(calculateOptimalPosition);
  }, [position, isVisible]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        zIndex: 2147483647, // Maximum z-index to ensure it's on top
        top: `${calculatedPosition.top}px`,
        left: `${calculatedPosition.left}px`,
        willChange: 'transform, opacity',
        pointerEvents: isVisible ? 'auto' : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'scale(1) translateY(0px)' 
          : 'scale(0.95) translateY(4px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};