import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { PreviewModal } from './PreviewModal';
import { PreviewQueue } from './PreviewQueue';
import { PreviewPositioner } from './PreviewPositioner';
import { HoverProgressIndicator } from '../ui/HoverProgressIndicator';
import { usePreview } from '../../context/PreviewContext';
import { usePreferences } from '../../context/PreferenceContext';
import { ContentExtractor } from './ContentExtractor';


export const LinkPreview = () => {
  const { 
    queue, 
    currentPreview, 
    loading, 
    addToQueue, 
    removeFromQueue, 
    setCurrentPreview, 
    startLoading, 
    setError,
    clearPreview 
  } = usePreview();
  
  const { preferences } = usePreferences();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [showProgressIndicator, setShowProgressIndicator] = useState(false);
  const [isModalHovered, setIsModalHovered] = useState(false);
  
  const hoverTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const contentExtractorRef = useRef(null);
  const currentUrlRef = useRef(null);
  const modalAreaRef = useRef(null);

  // Validate URL format
  const isValidUrl = useCallback((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }, []);

  // Handle link hover event
  const handleLinkHover = useCallback((event) => {
    // Validate event detail
    if (!event.detail || !event.detail.url) {
      console.warn('LinkPreview: Invalid hover event detail', event.detail);
      return;
    }
    
    const { url, text, position: pos, linkElement } = event.detail;
    
    // Validate URL
    if (!isValidUrl(url)) {
      console.warn('LinkPreview: Invalid URL format:', url);
      return;
    }
    
    // Clear any existing timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    currentUrlRef.current = url;

    // Show progress indicator for longer delays
    if (preferences.previewDelay > 200) {
      setShowProgressIndicator(true);
      setPosition(pos);
    }

    // Set a timer to show the preview after the delay
    hoverTimerRef.current = setTimeout(() => {
      // Check if we're already showing a preview for this URL
      if (currentPreview?.url === url) return;
      
      // Hide progress indicator
      setShowProgressIndicator(false);
      setIsVisible(true);
      
      // Add to queue if not already at max size
      if (queue.length < preferences.maxQueueSize) {
        addToQueue({ url, text, element: linkElement });
      }
      
      // Set position
      setPosition(pos);
      
      // Start loading
      startLoading();
      
      // Extract content
      if (contentExtractorRef.current) {
        contentExtractorRef.current.extract(url, text, linkElement);
      } else {
        console.error('ContentExtractor not initialized');
        setError('Preview system not ready');
      }
    }, preferences.previewDelay);
  }, [
    addToQueue, 
    currentPreview, 
    preferences, 
    queue.length, 
    startLoading, 
    setError,
    isValidUrl
  ]);

  // Handle link mouseout event
  const handleLinkMouseout = useCallback((event) => {
    // Validate event detail
    if (!event.detail || !event.detail.url) {
      console.warn('LinkPreview: Invalid mouseout event detail', event.detail);
      return;
    }
    
    const { url } = event.detail;
    
    // Clear hover timer and progress indicator
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowProgressIndicator(false);

    // Clear current URL if it matches
    if (currentUrlRef.current === url) {
      currentUrlRef.current = null;
    }

    // Clear any existing hide timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // Delay hiding to allow moving to preview
    hideTimerRef.current = setTimeout(() => {
      console.log('🖱️ Link mouseout - checking if should hide modal');
      
      // Check multiple ways if modal is being hovered
      let modalElement = null;
      try {
        modalElement = document.querySelector('[data-preview-modal]');
      } catch (e) {
        console.warn('Error selecting modal element:', e);
      }
      
      const modalArea = modalAreaRef.current;
      
      let shouldKeepOpen = false;
      
      // Method 1: Check CSS :hover pseudo-class
      if (modalElement && modalElement instanceof Element && typeof modalElement.matches === 'function') {
        try {
          if (modalElement.matches(':hover')) {
            shouldKeepOpen = true;
            console.log('🖱️ Modal has CSS :hover - keeping open');
          }
        } catch (e) {
          console.warn('Error checking :hover state:', e);
        }
      }
      
      // Method 2: Check if modal area is hovered using our state
      if (isModalHovered) {
        shouldKeepOpen = true;
        console.log('🖱️ Modal hover state is true - keeping open');
      }
      
      // Method 3: Check if modal area contains hovered element
      if (modalArea && modalArea instanceof Element && typeof modalArea.querySelector === 'function') {
        try {
          if (modalArea.querySelector(':hover')) {
            shouldKeepOpen = true;
            console.log('🖱️ Modal area contains hovered element - keeping open');
          }
        } catch (e) {
          console.warn('Error checking modalArea hover:', e);
        }
      }
      
      if (shouldKeepOpen) {
        console.log('🖱️ Keeping modal open');
        return;
      }
      
      console.log('🖱️ Hiding modal');
      removeFromQueue({ url });
      
      // Hide if currently showing this preview
      if (currentPreview?.url === url) {
        setIsVisible(false);
        
        // Clear after animation
        setTimeout(() => {
          clearPreview();
        }, 300);
      }
    }, 800); // Increased delay even more for easier mouse movement
  }, [clearPreview, currentPreview, removeFromQueue, isModalHovered]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event) => {
    if (!event.detail) return;
    
    const { key, shift } = event.detail;
    
    if (shift && key.toLowerCase() === preferences.keyboardShortcuts.detailedPreview?.toLowerCase()) {
      setIsDetailedMode(true);
    }
  }, [preferences.keyboardShortcuts.detailedPreview]);

  const handleKeyUp = useCallback((event) => {
    if (!event.detail) return;
    
    const { key } = event.detail;
    
    if (key.toLowerCase() === preferences.keyboardShortcuts.detailedPreview?.toLowerCase()) {
      setIsDetailedMode(false);
    }
  }, [preferences.keyboardShortcuts.detailedPreview]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('rlp-link-hover', handleLinkHover);
    document.addEventListener('rlp-link-mouseout', handleLinkMouseout);
    document.addEventListener('rlp-keydown', handleKeyDown);
    document.addEventListener('rlp-keyup', handleKeyUp);
    
    // Add global mousemove listener to detect hover over modal area
    const handleGlobalMouseMove = (event) => {
      if (isVisible && modalAreaRef.current) {
        const rect = modalAreaRef.current.getBoundingClientRect();
        const isOverModal = event.clientX >= rect.left && 
                          event.clientX <= rect.right && 
                          event.clientY >= rect.top && 
                          event.clientY <= rect.bottom;
        
        if (isOverModal && !isModalHovered) {
          console.log('🖱️ Mouse detected over modal area');
          setIsModalHovered(true);
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
        } else if (!isOverModal && isModalHovered) {
          console.log('🖱️ Mouse left modal area');
          setIsModalHovered(false);
        }
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    
    return () => {
      document.removeEventListener('rlp-link-hover', handleLinkHover);
      document.removeEventListener('rlp-link-mouseout', handleLinkMouseout);
      document.removeEventListener('rlp-keydown', handleKeyDown);
      document.removeEventListener('rlp-keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      
      // Cleanup timers on unmount
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [handleLinkHover, handleLinkMouseout, handleKeyDown, handleKeyUp, isVisible, isModalHovered]);

  // Show preview when data is loaded
  useEffect(() => {
    if (currentPreview && !loading) {
      setIsVisible(true);
    }
  }, [currentPreview, loading]);

  // Handle modal mouse enter
  const handleModalMouseEnter = useCallback(() => {
    console.log('🖱️ Modal mouse enter - keeping modal open');
    setIsModalHovered(true);
    // Clear any pending hide timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Handle modal mouse leave
  const handleModalMouseLeave = useCallback((event) => {
    console.log('🖱️ Modal mouse leave - starting hide timer');
    setIsModalHovered(false);
    
    // Check if we're moving to a related element (child) - safely
    const relatedTarget = event.relatedTarget;
    const modalElement = event.currentTarget;
    
    // Safely check if relatedTarget is a Node and if modalElement contains it
    if (relatedTarget && 
        modalElement && 
        relatedTarget instanceof Node && 
        modalElement instanceof Element &&
        typeof modalElement.contains === 'function' &&
        modalElement.contains(relatedTarget)) {
      console.log('🖱️ Moving to child element, keeping modal open');
      return;
    }
    
    // Start hide timer when leaving modal
    hideTimerRef.current = setTimeout(() => {
      // Double check that we're not hovering over the modal
      let finalCheck = true;
      try {
        const hoveredModal = document.querySelector('[data-preview-modal]:hover');
        if (hoveredModal) {
          finalCheck = false;
        }
      } catch (e) {
        console.warn('Error in final hover check:', e);
      }
      
      if (finalCheck) {
        console.log('🖱️ Hiding modal after leave timeout');
        setIsVisible(false);
        setTimeout(() => {
          clearPreview();
        }, 300);
      } else {
        console.log('🖱️ Modal still hovered, keeping open');
      }
    }, 300);
  }, [clearPreview]);

  // Close preview manually
  const handleClose = useCallback(() => {
    setIsVisible(false);
    currentUrlRef.current = null;
    setIsModalHovered(false);
    
    // Clear timers
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    
    setTimeout(() => {
      clearPreview();
    }, 300);
  }, [clearPreview]);

  return (
    <>
      <ContentExtractor 
        ref={contentExtractorRef}
        onExtracted={setCurrentPreview}
      />
      
      {showProgressIndicator && (
        <HoverProgressIndicator 
          delay={preferences.previewDelay}
          isActive={showProgressIndicator}
          position={position}
        />
      )}
      
      {isVisible && currentPreview && (
        <PreviewPositioner 
          position={position}
          isVisible={isVisible}
        >
          <div 
            ref={modalAreaRef}
            onMouseEnter={handleModalMouseEnter}
            onMouseLeave={handleModalMouseLeave}
            style={{
              padding: '15px', // Add padding to create a larger hover area
              margin: '-15px', // Negative margin to offset the padding
              pointerEvents: 'auto', // Ensure pointer events work
              position: 'relative',
              zIndex: 1,
            }}
          >
            <PreviewModal 
              preview={currentPreview}
              loading={loading}
              isVisible={isVisible}
              isDetailedMode={isDetailedMode}
              onClose={handleClose}
            />
          </div>
        </PreviewPositioner>
      )}
      
      {queue.length > 0 && (
        <PreviewQueue 
          queue={queue}
          onSelect={(item) => {
            setCurrentPreview(item);
            setIsVisible(true);
          }}
        />
      )}
    </>
  );
};