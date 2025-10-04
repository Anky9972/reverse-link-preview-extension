import React from 'react';
import ReactDOM from 'react-dom/client';
import { LinkPreview } from './components/content/LinkPreview';
import { PreferenceProvider } from './context/PreferenceContext';
import { PreviewProvider } from './context/PreviewContext';
import './content.css';

// Shared URL validator (duplicated here since we can't import in content script context)
const urlValidator = {
  isValid(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const parsed = new URL(url);
      
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      ) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }
};

// Prevent multiple initializations
if (window.reverseLinkPreviewInitialized) {
  console.log('🔗 Reverse Link Preview: Already initialized, skipping...');
} else {
  window.reverseLinkPreviewInitialized = true;
  
  // Create a container for our React app that uses Shadow DOM
  const setupShadowContainer = async () => {
    const container = document.createElement('div');
    container.id = 'reverse-link-preview-container';
    container.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
    document.body.appendChild(container);
    
    // Create shadow root for style isolation
    const shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Create containers for the app and for styles
    const appContainer = document.createElement('div');
    appContainer.id = 'rlp-app-container';
    
    // Fetch and inject CSS with comprehensive fallback
    const styleContainer = document.createElement('style');
    try {
      const cssUrl = chrome.runtime.getURL('content.css');
      const response = await fetch(cssUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS: ${response.status}`);
      }
      
      const css = await response.text();
      styleContainer.textContent = css;
    } catch (error) {
      console.error('Failed to load CSS, using fallback styles:', error);
      
      // Comprehensive fallback styles to ensure basic functionality
      styleContainer.textContent = `
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                       Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Preview Modal Base Styles */
        .preview-modal {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 
                      0 0 0 1px rgba(0, 0, 0, 0.1);
          padding: 16px;
          max-width: 400px;
          min-width: 280px;
          transition: all 0.3s ease;
        }
        
        .preview-modal:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2),
                      0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        
        /* Loading State */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          color: #666;
        }
        
        /* Error State */
        .error {
          color: #dc2626;
          padding: 16px;
          background: #fee;
          border-radius: 4px;
        }
        
        /* Preview Content */
        .preview-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        
        .preview-description {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        
        .preview-image {
          width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 12px 0;
        }
        
        /* Button Styles */
        button {
          cursor: pointer;
          border: none;
          background: none;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        button:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        /* Progress Indicator */
        .progress-indicator {
          position: fixed;
          width: 32px;
          height: 32px;
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Utility Classes */
        .hidden {
          display: none !important;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
    }
    
    shadowRoot.appendChild(styleContainer);
    shadowRoot.appendChild(appContainer);

    return appContainer;
  };

  // Improved debounce utility with cancel method
  const debounce = (func, wait) => {
    let timeout;
    
    const executedFunction = function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
    
    executedFunction.cancel = function() {
      clearTimeout(timeout);
    };
    
    return executedFunction;
  };

  // Initialize the app
  const initApp = async () => {
    try {
      const container = await setupShadowContainer();
      
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <PreferenceProvider>
            <PreviewProvider>
              <LinkPreview />
            </PreviewProvider>
          </PreferenceProvider>
        </React.StrictMode>
      );
      
      // Set up link hover listeners
      setupLinkListeners();
      
      // Notify background script that we're loaded and ready
      try {
        await chrome.runtime.sendMessage({ 
          action: 'contentScriptReady' 
        });
      } catch (err) {
        console.error('Failed to send ready notification:', err);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  };

  // Track active hover
  let currentHoveredLink = null;
  let hoverTimeout = null;
  let debouncedHover = null;

  // Set up listeners for all links on the page
  const setupLinkListeners = () => {
    // Function to handle link hovering with debounce
    debouncedHover = debounce((event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      
      // Skip if same link
      if (currentHoveredLink === link.href) return;
      
      currentHoveredLink = link.href;
      
      // Validate URL using shared validator
      if (!urlValidator.isValid(link.href)) {
        console.warn('LinkPreview: Invalid URL detected:', link.href);
        return;
      }
      
      // Get link text, fallback to href
      const linkText = link.textContent.trim() || 
                      link.getAttribute('aria-label') || 
                      link.href;
      
      // Dispatch custom event that our React app will listen for
      const customEvent = new CustomEvent('rlp-link-hover', {
        detail: {
          url: link.href,
          text: linkText,
          position: {
            x: event.clientX,
            y: event.clientY
          },
          linkElement: {
            rect: link.getBoundingClientRect(),
            tagName: link.tagName
          }
        }
      });
      
      document.dispatchEvent(customEvent);
    }, 100);
    
    // Function to handle link mouseout
    const handleLinkMouseOut = (event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      
      // Clear current hovered link
      if (currentHoveredLink === link.href) {
        currentHoveredLink = null;
      }
      
      document.dispatchEvent(new CustomEvent('rlp-link-mouseout', {
        detail: {
          url: link.href
        }
      }));
    };
    
    // Add hover listeners
    document.addEventListener('mouseover', debouncedHover, { passive: true });
    document.addEventListener('mouseout', handleLinkMouseOut, { passive: true });
    
    // Handle keyboard events for shortcuts
    const handleKeyDown = (event) => {
      document.dispatchEvent(new CustomEvent('rlp-keydown', {
        detail: {
          key: event.key,
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      }));
    };
    
    const handleKeyUp = (event) => {
      document.dispatchEvent(new CustomEvent('rlp-keyup', {
        detail: {
          key: event.key,
          shift: event.shiftKey,
          ctrl: event.ctrlKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      }));
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Listen for manual preview requests from context menu
    document.addEventListener('rlp-manual-preview', (event) => {
      console.log('Manual preview requested:', event.detail);
      // Dispatch the same event type that the hover listener uses
      document.dispatchEvent(new CustomEvent('rlp-link-hover', {
        detail: {
          ...event.detail,
          manual: true
        }
      }));
    });
    
    // Handle dynamic content (mutation observer)
    const observer = new MutationObserver((mutations) => {
      // Check if new links were added
      let hasNewLinks = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'A' || node.querySelector('a')) {
                hasNewLinks = true;
                break;
              }
            }
          }
        }
        if (hasNewLinks) break;
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Store cleanup function
    window.reverseLinkPreviewCleanup = () => {
      // Cancel any pending debounced calls
      if (debouncedHover && typeof debouncedHover.cancel === 'function') {
        debouncedHover.cancel();
      }
      
      // Clear hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      // Remove event listeners
      if (debouncedHover) {
        document.removeEventListener('mouseover', debouncedHover);
      }
      document.removeEventListener('mouseout', handleLinkMouseOut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Disconnect observer
      observer.disconnect();
      
      // Remove container
      const container = document.getElementById('reverse-link-preview-container');
      if (container) {
        container.remove();
      }
      
      // Clear references
      currentHoveredLink = null;
      debouncedHover = null;
      
      // Clear initialization flag
      window.reverseLinkPreviewInitialized = false;
    };
  };

  // Initialize the app when the content script loads
  console.log('🔗 Reverse Link Preview: Initializing extension...');
  initApp().then(() => {
    console.log('🔗 Reverse Link Preview: Extension loaded successfully!');
  }).catch(error => {
    console.error('🔗 Reverse Link Preview: Failed to initialize:', error);
  });

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    if (window.reverseLinkPreviewCleanup) {
      window.reverseLinkPreviewCleanup();
    }
  });
}